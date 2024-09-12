

let chatbox = document.getElementById("mainChatBox");
let messageInputEl = document.getElementById("messageInput");
let sendButtonEl = document.getElementById("sendButton");
const chatId = crypto.randomUUID();


let receivingMessage = false;
const systemPromptEl = "You are an advanced AI chat bot designed to provide helpful and knowledgeable responses to the user's inquiries.";

function createMessageElement(text, alignment) {
    const messageElement = document.createElement("div");
    console.log(alignment)
    let iconEl = document.createElement("i")

    messageElement.classList.add("message-box");
    alignment === "left" ? messageElement.classList.add("messageElement-text-left") : messageElement.classList.add("messageElement-text-right");
    messageElement.textContent = text;
    return messageElement;
}

function connectWebSocket(message) {
    receivingMessage = true;
    const url = "wss://backend.buildpicoapps.com/api/chatbot/chat";
    const websocket = new WebSocket(url);

    websocket.addEventListener("open", () => {
        websocket.send(
            JSON.stringify({
                chatId: chatId,
                appId: "public-kitchen",
                systemPrompt: systemPromptEl,
                message: message,
            })
        );
    });

    const messageElement = createMessageElement("", "left");
    messageElement.classList.add("messageElement-text-left")
    chatbox.appendChild(messageElement);

    websocket.onmessage = (event) => {
        messageElement.innerText += event.data;
        chatbox.scrollTop = chatbox.scrollHeight;
    };

    websocket.onclose = (event) => {
        if (event.code === 1000) {
            receivingMessage = false;
        } else {
            messageElement.textContent += " Error getting response from server. Refresh the page and try again.";
            chatbox.scrollTop = chatbox.scrollHeight;
            receivingMessage = false;
        }
    };
}

sendButtonEl.addEventListener("click", () => {
    if (!receivingMessage && messageInputEl.value.trim() !== "") {
        const messageText = messageInputEl.value.trim();

        messageInputEl.value = "";
        const messageElement = createMessageElement(messageText, "right");
        messageElement.classList.add("messageElement-text-right")
        chatbox.appendChild(messageElement);
        chatbox.scrollTop = chatbox.scrollHeight;

        connectWebSocket(messageText);
    }
});

messageInputEl.addEventListener("keydown", (event) => {
    if (
        event.key === "Enter" &&
        !receivingMessage &&
        messageInputEl.value.trim() !== ""
    ) {
        event.preventDefault();
        sendButtonEl.click();
    }
});