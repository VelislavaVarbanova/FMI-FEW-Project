import { database, refDatabase, auth } from "../firebase.js";
import { get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

document.querySelector("#back-icon").addEventListener("click", (event) => window.location.href = "../Home");

document.querySelector('#message-btn').addEventListener("click", (event) => sendMessage(event));

function sendMessage(e) {
    e.preventDefault();
  
    // get values to be submitted
    const user = auth.currentUser;
    const timestamp = Date.now();
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value;
  
    // clear the input box
    messageInput.value = "";
  
    //auto scroll to bottom
    document
      .getElementById("messages")
      .scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
  
    // create db collection and send in the data
    push(refDatabase("messages/"),{
      // chatID
        userId: 1, // userId: user.uid, 
        message,
        timestamp
    });
}

const fetchChat = refDatabase("messages/");

onChildAdded(fetchChat, function (snapshot) {
  const messages = snapshot.val();
  const message = `<li class=${1 === messages.userId ? "sent" : "receive"}><span>${messages.userId}: </span>${messages.message}</li>`;
  // append the message on the page
  document.getElementById("messages").innerHTML += message;
});
