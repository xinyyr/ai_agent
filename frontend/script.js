
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const chatbox = document.getElementById("chatbox");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

const sessionId = "s" + Date.now() + Math.random();

let isSending = false;

function appendMessage(sender, text, showDetailsButton = false) {
    const msg = document.createElement("div");
    msg.className = "message " + sender;

    const avatar = document.createElement("img");
    avatar.className = "avatar";
    avatar.src = sender === "user" ? "user-icon.png" : "bot.png";

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    const content = document.createElement("div");
    content.className = "message-content";

    if (sender === "user") {
        content.textContent = text;
    } else {
        content.innerHTML = text;
    }

    bubble.appendChild(content);

    if (sender === "bot" && showDetailsButton) {
        const detailsBtn = document.createElement("button");
        detailsBtn.className = "details-btn";
        detailsBtn.textContent = "Prikaži detaljnije";

        detailsBtn.addEventListener("click", async () => {
            if (isSending) return;

            detailsBtn.disabled = true;
            detailsBtn.textContent = "Učitavanje...";

            const success = await sendMessage(
                "Detaljno objasni prethodni odgovor.",
                true
            );

            if (success) {
                detailsBtn.textContent = "Detalji prikazani";
            } else {
                detailsBtn.disabled = false;
                detailsBtn.textContent = "Prikaži detaljnije";
            }
        });

        bubble.appendChild(detailsBtn);
    }

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    chatbox.appendChild(msg);

    chatbox.scrollTop = chatbox.scrollHeight;
}

async function callServer(path, options) {
    const res = await fetch("http://localhost:5000" + path, options);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Greška na serveru");
    }

    return data;
}

async function sendMessage(customMessage = null, detailed = false) {
    if (isSending) return false;

    const message = typeof customMessage === "string"
        ? customMessage
        : input.value.trim();

    if (!message.trim()) return false;

    isSending = true;
    sendBtn.disabled = true;

    if (customMessage === null) {
        input.value = "";
    }

    appendMessage("user", message);

    try {
        const data = await callServer("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                session_id: sessionId,
                detailed: detailed
            })
        });

        appendMessage(
            "bot",
            data.reply,
            data.show_details_button === true
        );

        return true;

    } catch (error) {
        console.error("CHAT ERROR:", error);
        appendMessage("bot", "Greška: " + error.message);
        return false;

    } finally {
        isSending = false;
        sendBtn.disabled = false;
        input.focus();
    }
}

async function uploadFile() {
    const file = fileInput.files[0];

    if (!file) return;

    appendMessage("user", "📎 " + file.name);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("session_id", sessionId);

    try {
        const data = await callServer("/upload", {
            method: "POST",
            body: formData
        });

        appendMessage("bot", data.message);

    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        appendMessage("bot", "Greška: " + error.message);

    } finally {
        fileInput.value = "";
    }
}

input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener("click", () => sendMessage());

uploadBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", uploadFile);
