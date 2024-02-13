import { get, push, set, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { signOut, onAuthChanged, refDatabase, auth } from "../firebase.js";

function sendChatRequest(user) {
    const recipientFullNames = document.getElementById('add-chat').value.trim().split(',');
    const currentUserId = user.uid;
    const chatId = push(refDatabase('chats')).key;

    recipientFullNames.forEach(recipientFullName => {
        recipientFullName = recipientFullName.trim();

    get(refDatabase('users'))
        .then(usersSnapshot => {
            let recipientId;
            usersSnapshot.forEach(userSnapshot => {
                const userData = userSnapshot.val();
                if (userData && userData["full_name"] === recipientFullName) {
                    recipientId = userSnapshot.key;
                }
            });
            if (recipientId) {
                const chatRequestData = {
                    sender: currentUserId,
                    recipient: recipientId,
                    status: "pending",
                    chatId: chatId
                };

                push(refDatabase('chatRequests/' + recipientId), chatRequestData)
                    .then(() => {
                        alert("Chat request sent successfully! " + recipientFullName);
                        console.log("Chat request sent successfully to: " + recipientFullName);
                    })
                    .catch(error => {
                        console.error("Error sending chat request to: " + recipientFullName, error);
                    });
            } else {
                console.log("Recipient not found: " + recipientFullName);
            }
        })
        .catch(error => {
            console.error("Error fetching users: ", error);
        });
    });
};

function displayChatRequests(user) {
    const currentUserId = user.uid;
    const chatRequestsRef = refDatabase('chatRequests/' + currentUserId);

    const chatRequestsList = document.getElementById('chat-requests');
    chatRequestsList.innerHTML = '';

    get(chatRequestsRef).then(chatRequestsSnapshot => {
        const chatRequests = chatRequestsSnapshot.val();

        if (chatRequests) {
            let hasRequests = false;
            for (const chatRequestId in chatRequests) {
                const chatRequestData = chatRequests[chatRequestId];

                if (chatRequestData.status === 'pending') {
                    hasRequests = true;
                    const senderRef = refDatabase('users/' + chatRequestData.sender);
                    get(senderRef)
                        .then(senderSnapshot => {
                            const senderData = senderSnapshot.val();
                            if (senderData) {
                                const listItem = document.createElement('li');
                                listItem.textContent = `From: ${senderData.full_name}`;

                                const acceptButton = document.createElement('button');
                                acceptButton.textContent = 'Accept';
                                const rejectButton = document.createElement('button');
                                rejectButton.textContent = 'Reject';

                                acceptButton.addEventListener('click', () => {
                                    handleChatRequestAction(chatRequestId, 'accepted', user);
                                });
                                rejectButton.addEventListener('click', () => {
                                    handleChatRequestAction(chatRequestId, 'rejected', user);
                                });

                                listItem.appendChild(acceptButton);
                                listItem.appendChild(rejectButton);
                                chatRequestsList.appendChild(listItem);
                            }
                        })
                        .catch(error => {
                            console.error("Error fetching sender data: ", error);
                        });
                }
            }
            // Display "No chat requests" message if there are no pending chat requests
            if (!hasRequests) {
                const noRequestsMessage = document.createElement('p');
                noRequestsMessage.textContent = 'No pending chat requests';
                chatRequestsList.appendChild(noRequestsMessage);
            }
        } else {
            // Display "No chat requests" message if there are no chat requests
            const noRequestsMessage = document.createElement('p');
            noRequestsMessage.textContent = 'No chat requests';
            chatRequestsList.appendChild(noRequestsMessage);
        }

    }).catch(error => {
        console.error("Error fetching chat requests: ", error);
    });
}

function handleChatRequestAction(chatRequestId, action, user) {
    const chatRequestRef = refDatabase('chatRequests/' + user.uid + '/' + chatRequestId);
    
    get(chatRequestRef)
        .then(chatRequestSnapshot => {
            const chatRequestData = chatRequestSnapshot.val();
            if (chatRequestData) {
                const senderId = chatRequestData.sender;
                const recipientId = chatRequestData.recipient;
                const chatId = chatRequestData.chatId;
                const status = chatRequestData.status;

                if (action === 'accepted' && chatId) {
                    const chatData = {
                        user1: senderId,
                        user2: recipientId
                    };

                    set(refDatabase('chats/' + chatId), chatData)
                        .then(() => {
                            console.log("Chat entry created successfully!");
                        })
                        .catch(error => {
                            console.error("Error creating chat entry: ", error);
                        });
                }
            } else {
                console.error("Chat request data not found.");
            }

            updateChatRequestStatus(chatRequestRef, action)
                .then(() => {
                    console.log("Chat request status updated successfully!");
                    displayChatRequests(user);
                    displayChats(user);
                })
                .catch(error => {
                    console.error("Error updating chat request status: ", error);
                });
        })
        .catch(error => {
            console.error("Error fetching chat request data: ", error);
        });
}

function updateChatRequestStatus(chatRequestRef, newStatus) {
    return update(chatRequestRef, { status: newStatus });
}

function displayChats(user) {
    const currentUserId = user.uid;
    const chatsRef = refDatabase('chats');
    
    const chatsList = document.getElementById('chats');
    chatsList.innerHTML = '';

    get(chatsRef)
        .then(chatsSnapshot => {
            const chats = chatsSnapshot.val();
            if (chats) {
                let hasChats = false;
                for (const chatId in chats) {
                    const chatData = chats[chatId];
                    // Check if the current user is part of this chat
                    if (currentUserId === chatData.user1 || currentUserId === chatData.user2) {
                        hasChats = true;
                        // Find the other user's ID in the chat
                        const otherUserId = Object.values(chatData).find(userId => userId !== currentUserId);
                        
                        if (otherUserId) {
                            const otherUserRef = refDatabase('users/' + otherUserId);
                            get(otherUserRef)
                                .then(otherUserSnapshot => {
                                    const otherUserData = otherUserSnapshot.val();
                                    if (otherUserData) {
                                        const listItem = document.createElement('li');
                                        listItem.setAttribute('id',`${chatId}`);
                                        listItem.innerHTML = `<span class="contact-name">${otherUserData.full_name}</span>`;

                                        // Get the last message in the chat
                                        const messagesRef = refDatabase('messages/' + chatId);
                                        get(messagesRef)
                                            .then(messagesSnapshot => {
                                                const messages = messagesSnapshot.val();
                                                if (messages) {
                                                    const lastMessageKey = Object.keys(messages).pop();
                                                    const lastMessage = messages[lastMessageKey];
                                                    listItem.innerHTML += `<span class="contact-message">${lastMessage.text}</span>`;
                                                    listItem.innerHTML += `<span class="contact-time">${lastMessage.time}</span>`;
                                                } else {
                                                    listItem.innerHTML += `<span class="contact-message">Start conversation</span>`;
                                                }

                                                chatsList.appendChild(listItem);

                                                const chatList = document.getElementById('chats');
                                                const chatItems = chatList.childNodes;
                                                chatItems.forEach(function(item) {
                                                    item.addEventListener('click', () => {
                                                        const chatId = item.getAttribute('id');
                                        
                                                        // Redirect the user to the chat page with the chat ID appended to the URL
                                                        window.location.href = `../Chat/Index.html?chatId=${chatId}`;
                                                    });
                                                });
                                            })
                                            .catch(error => {
                                                console.error("Error fetching messages: ", error);
                                            });
                                    }
                                })
                                .catch(error => {
                                    console.error("Error fetching other user data: ", error);
                                });
                        }
                    }
                }
                // Display "No chats available" message if the user is not part of any chats
                if (!hasChats) {
                    const noChatsMessage = document.createElement('p');
                    noChatsMessage.textContent = 'No chats available';
                    chatsList.appendChild(noChatsMessage);
                }
            } else {
                // Display "No chats available" message if there are no chats
                const noChatsMessage = document.createElement('p');
                noChatsMessage.textContent = 'No chats available';
                chatsList.appendChild(noChatsMessage);
            }
        })
        .catch(error => {
            console.error("Error fetching chats: ", error);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const userNameDisplay = document.getElementById('user-name');
    
    // Listen for authentication state changes
    onAuthChanged((user) => {
        if (user) {
            const userRef = refDatabase('users/' + user.uid);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const displayName = snapshot.val().full_name || 'User'; 
                    userNameDisplay.textContent = `Welcome, ${displayName}`;
                } else {
                    console.log("No data available");
                }
            }).catch((error) => {
                console.error(error);
            });
        } else {
            // User is signed out
            userNameDisplay.textContent = 'Not logged in';
        }

        displayChatRequests(user);
        displayChats(user);
        document.querySelector('.ri-chat-new-line').addEventListener('click', () => sendChatRequest(user));
    });   
});

const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', function () {
    console.log(123);
    signOut().then(() => {
        console.log('User signed out.');
        window.location.href = "../index.html";
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
});