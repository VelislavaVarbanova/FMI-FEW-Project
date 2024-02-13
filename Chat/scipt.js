import { database, refDatabase, auth, onAuthChanged } from "../firebase.js";
import { get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

let params = new URLSearchParams(window.location.search);
let chatId = params.get('chatId');
console.log(chatId);

function displayUsers(chatId) {
  const chatsRef = refDatabase('chats/' + chatId);
  
  get(chatsRef)
  .then(chatsSnapshot => {
    const chatData = chatsSnapshot.val();
    if (chatData) {
      const user1Id = chatData.user1;
      const user2Id = chatData.user2;
      const user1Ref = refDatabase('users/' + user1Id);
      get(user1Ref)
      .then(user1Snapshot => {
        const user1Data = user1Snapshot.val();
        if (user1Data) {
          const user2Ref = refDatabase('users/' + user2Id);
          get(user2Ref)
          .then(user2Snapshot => {
            const user2Data = user2Snapshot.val();
            if (user2Data) {
              const usersContainer = document.querySelector('.users');
              usersContainer.innerHTML = `${user1Data.full_name} and ${user2Data.full_name} chat`;
            }
          })
          .catch(error => {
            console.error("Error fetching user2 data: ", error);
          });
        }
      })
      .catch(error => {
        console.error("Error fetching user1 data: ", error);
      });
    }
  })
  .catch(error => {
      console.error("Error fetching chat data: ", error);
  });
}

function sendMessage(e, user) {
    e.preventDefault();
  
    const timestamp = Date.now();
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value;
  
    messageInput.value = "";
  
    document
      .getElementById("messages")
      .scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
  
    push(refDatabase("messages/"),{
        userId: user.uid,
        message,
        timestamp,
        chatId: chatId
    });
}

document.addEventListener('DOMContentLoaded', function () {
  onAuthChanged((user) => {

    const fetchChat = refDatabase("messages/");
    onChildAdded(fetchChat, function(snapshot) {
      const messageData = snapshot.val();
      const userId = messageData.userId;
      const messageContent = messageData.message;
      const userRef = refDatabase('users/' + userId);
      get(userRef)
          .then(userSnapshot => {
              const userData = userSnapshot.val();
              if (userData) {
                  const fullName = userData.full_name;
                  const messageClass = user.uid === userId ? "sent" : "received";
                  const messageElement = `<li class="${messageClass}"><span>${fullName}: </span>${messageContent}</li>`;
                  document.getElementById("messages").innerHTML += messageElement;
              }
          })
          .catch(error => {
              console.error("Error fetching user data: ", error);
          });
    });

    displayUsers(chatId);
    document.querySelector("#back-icon").addEventListener("click", () => window.location.href = "../Home/index.html");
    document.querySelector('#message-btn').addEventListener("click", (event) => sendMessage(event, user));
  })
});