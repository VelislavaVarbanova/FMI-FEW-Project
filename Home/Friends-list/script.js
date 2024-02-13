import { auth, onAuthChanged, refDatabase } from "../../firebase.js";
import { get, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";



function addFriends(user) {
    const friendFullName = document.getElementById('add-friends').value.trim();
    const currentUserId = user.uid;

    get(refDatabase('users'))
    .then(usersSnapshot => {
        let friendId;
        usersSnapshot.forEach(function(userSnapshot) {
        const userData = userSnapshot.val();
        if (userData && userData["full_name"] === friendFullName) {
            friendId = userSnapshot.key;
        }
        });
        if (friendId) {
          // Friend found, send friend request
          const friendRequestData = {
            status: "pending", 
            sender: currentUserId, 
            receiver: friendId 
        };

        push(refDatabase('friendRequests/' + friendId), friendRequestData)
            .then(() => {
                alert("Friend request sent successfully!");
            })
            .catch((error) => {
                console.error("Error sending friend request: ", error);
                alert('Failed to send friend request');
            });
    } else {
      console.log("Friend not found. func add");
    }
  }).catch((error) => {
    console.error("Error fetching users: ", error);
    alert('Failed to fetch users');
});
}     

function displayFriends(user) {
    const currentUserId = user.uid;
    if (currentUserId) {
    
      const friendsRef = refDatabase('friends/' + currentUserId);
      get(friendsRef)
      .then(snapshot => {
        const friends = snapshot.val();
        if (friends) {
            const friendsListElement = document.getElementById('friends-list');
            friendsListElement.innerHTML = ''; // Clear existing content
          
          for (const friendId in friends) {
            const friendRef = refDatabase('users/' + friendId);
            get(friendRef)
              .then(friendSnapshot => {
                const friendData = friendSnapshot.val();
                if (friendData) {
                    const fullName = friendData["full_name"];
                    const listItem = document.createElement('li');
                    // const iconElement = document.createElement('i');
                    // iconElement.classList.add('ri-user-3-line');
                    // listItem.appendChild(iconElement);
                    listItem.textContent = fullName;
                    friendsListElement.appendChild(listItem);
                }
              })
              .catch(error => {
                console.error("Error fetching friend data: ", error);
              });
          }
        } else {
          console.log("No friends found.");
        }
      })
      .catch(error => {
        console.error("Error fetching friends: ", error);
      });
  } else {
    console.log("No current user found.");
  }
}

function displayFriendRequests(user) {
  const currentUserId = user.uid;

  const friendRequestsRef = refDatabase('friendRequests/' + currentUserId);

  get(friendRequestsRef).then(friendRequestsSnapshot => {
      const friendRequests = friendRequestsSnapshot.val();

      const friendRequestsSection = document.querySelector('.friend-requests-section');
      friendRequestsSection.innerHTML = '';
      
      const requestsTitle = document.createElement('h4');
      requestsTitle.textContent = 'Friend Requests: ';
      requestsTitle.classList.add('friend-requests-title');
      friendRequestsSection.appendChild(requestsTitle);

      if (friendRequests) {
          for (const friendRequestId in friendRequests) {
              const friendRequestData = friendRequests[friendRequestId];

              if (friendRequestData.status === 'pending') {
                const senderId = friendRequestData.sender;
      
                const senderRef = refDatabase('users/' + senderId);
                get(senderRef).then(senderSnapshot => {
                  const senderData = senderSnapshot.val();
                  if (senderData) {
                    const listItem = document.createElement('li');
                    listItem.textContent = `Sender: ${senderData.full_name}, Status: ${friendRequestData.status}`;
                      
                    const acceptButton = document.createElement('button');
                    acceptButton.textContent = 'Accept';
                    const rejectButton = document.createElement('button');
                    rejectButton.textContent = 'Reject';
      
                    // Add event listeners to the accept and reject buttons
                    acceptButton.addEventListener('click', () => {
                      updateFriendRequestStatus(friendRequestId, 'accepted', currentUserId);
                    });
                    rejectButton.addEventListener('click', () => {
                      updateFriendRequestStatus(friendRequestId, 'rejected', currentUserId);
                    });
      
                    listItem.appendChild(acceptButton);
                    listItem.appendChild(rejectButton);
      
                    friendRequestsSection.appendChild(listItem);
                  }
              }).catch(error => {
                  console.error("Error fetching sender data: ", error);
              });
            }
          }
      } else {
          // If there are no friend requests, display a message
          const noRequestsMessage = document.createElement('p');
          noRequestsMessage.textContent = 'No friend requests';
          friendRequestsSection.appendChild(noRequestsMessage);
      }

  }).catch(error => {
      console.error("Error fetching friend requests: ", error);
  });
}

function updateFriendRequestStatus(friendRequestId, status, chatRequestId) {

    const friendRequestRef = refDatabase('friendRequests/' + chatRequestId + '/' + friendRequestId);

    get(friendRequestRef)
        .then(friendRequestSnapshot => {
            const friendRequestData = friendRequestSnapshot.val();
            if (friendRequestData) {
                const receiverId = friendRequestData.receiver;
                const senderId = friendRequestData.sender;

                const newFriendRequestData = {
                    receiver: receiverId,
                    sender: senderId,
                    status: status
                };

                set(friendRequestRef, newFriendRequestData)
                    .then(() => {
                        console.log("Friend request status updated successfully!");

                        if (status === 'accepted') {
                            const receiverFriendRef = refDatabase('friends/' + receiverId + '/' + senderId);
                            set(receiverFriendRef, true)
                                .then(() => {
                                    console.log("Friend added to receiver's friends list successfully!");
                                })
                                .catch(error => {
                                    console.error("Error adding friend to receiver's friends list: ", error);
                                });

                            const senderFriendRef = refDatabase('friends/' + senderId + '/' + receiverId);
                            set(senderFriendRef, true)
                                .then(() => {
                                    console.log("Receiver added to sender's friends list successfully!");
                                    // Refresh friend requests after updating status
                                    displayFriendRequests(auth.currentUser);
                                    displayFriends(user);
                                })
                                .catch(error => {
                                    console.error("Error adding receiver to sender's friends list: ", error);
                                });
                        } else {
                            displayFriendRequests(auth.currentUser);
                        }
                    })
                    .catch(error => {
                        console.error("Error updating friend request status: ", error);
                    });
            } else {
                console.error("Friend request data not found.");
            }
        })
        .catch(error => {
            console.error("Error fetching friend request data: ", error);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    onAuthChanged((user) => {

        displayFriends(user);
        document.querySelector('.ri-user-add-line').addEventListener('click', () => addFriends(user));
        document.querySelector('.friends-requests').addEventListener('click', () => displayFriendRequests(user));
    })
});
    
