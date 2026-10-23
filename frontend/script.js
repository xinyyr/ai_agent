const input=document.getElementById("input");
const sendBtn=document.getElementById("sendBtn");
const chatbox=document.getElementById("chatbox");
const uploadBtn=document.getElementById("uploadBtn");
const fileInput=document.getElementById("fileInput");

const sessionId = "s" + Date.now() + Math.random();

function appendMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = "message " + sender;
    const avatar = document.createElement("img");
    avatar.className = "avatar";
    avatar.src = sender === "user" ? "user-icon.png" : "bot.png";
    const bubble = document.createElement("div");
    bubble.className = "bubble";

    if (sender === "user") bubble.textContent = text; // user text as plain text
    else bubble.innerHTML = text; // bot text as HTML

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    chatbox.appendChild(msg);
    chatbox.scrollTop = chatbox.scrollHeight;
}

async function callServer(path, options) {
    const res = await fetch("http://localhost:5000" + path, options);
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || "Greška na serveru");
    return data;
}

async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;
    input.value = "";
    appendMessage("user", message);
    try {
        const data = await callServer("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message, session_id: sessionId })
        });
        appendMessage("bot", data.response);
    } catch (error) {
        console.error("CHAT ERROR:", error);
        appendMessage("bot", "Greška: " + error.message);
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
        appendMessage("bot", "Dokument uspješno učitan: " + data.filename);
    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        appendMessage("bot", "Greška:" + error.message);
    }
    fileInput.value = ""; // reset file input so the same file can be uploaded again if needed
}

input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
});
sendBtn.addEventListener("click", sendMessage);
uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", uploadFile);