const input=document.getElementById("input");
const sendBtn=document.getElementById("sendBtn");
const chatbox=document.getElementById("chatbox");

function appendMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = "message " + sender;
    const avatar = document.createElement("img");
    avatar.className = "avatar";
    avatar.src = sender === "user" ? "user-icon.png" : "bot.png";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = text;
    msg.appendChild(avatar);
    msg.appendChild(bubble);
    chatbox.appendChild(msg);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function sendMessage() {
    const message = input.value.trim();
    if (!message) return;
    input.value = "";
    appendMessage("user", message);
    fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
    }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Greška na serveru");
        }
        return data;
    }).then((data) => {
        appendMessage("bot", data.reply);
    }).catch((error) => {
        console.error("CHAT ERROR:", error);
        appendMessage("bot", "Greška: " + error.message);
    });
}

input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
});
sendBtn.addEventListener("click", sendMessage);
