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
            status: "pending", // Initial status of the friend request
            sender: currentUserId, // ID of the user sending the request
            receiver: friendId // ID of the user receiving the request
        };

        // Push the friend request data to the '/friendRequests' node in the database
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
      // Fetch user's friends from the database
      get(friendsRef)
      .then(snapshot => {
        const friends = snapshot.val();
        if (friends) {
            // Assuming you have a DOM element with id 'friends-list' to display the list of friends
            const friendsListElement = document.getElementById('friends-list');
            friendsListElement.innerHTML = ''; // Clear existing content
          
          for (const friendId in friends) {
            // Fetch friend's information from '/users' node in the database
            const friendRef = refDatabase('users/' + friendId);
            get(friendRef)
              .then(friendSnapshot => {
                const friendData = friendSnapshot.val();
                if (friendData) {
                  // Display friend's full name
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
      
                // Fetch sender's data from the database
                const senderRef = refDatabase('users/' + senderId);
                get(senderRef).then(senderSnapshot => {
                  const senderData = senderSnapshot.val();
                  if (senderData) {
                    // Create a list item to display the friend request
                    const listItem = document.createElement('li');
                    listItem.textContent = `Sender: ${senderData.full_name}, Status: ${friendRequestData.status}`;
                      
                    // Create buttons for accepting and rejecting the friend request
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
      
                    // Append buttons to the list item
                    listItem.appendChild(acceptButton);
                    listItem.appendChild(rejectButton);
      
                    // Append the list item to the friend requests section
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
    console.log("Friend Request ID:", friendRequestId);

    // Reference to the friend request node in the database
    const friendRequestRef = refDatabase('friendRequests/' + chatRequestId + '/' + friendRequestId);
    console.log("Friend Request Reference:", friendRequestRef.toString());

    // Fetch the friend request data
    get(friendRequestRef)
        .then(friendRequestSnapshot => {
            const friendRequestData = friendRequestSnapshot.val();
            console.log("Friend Request Snapshot:", friendRequestSnapshot.val());
            if (friendRequestData) {
                const receiverId = friendRequestData.receiver;
                const senderId = friendRequestData.sender;

                // Construct the new friend request data
                const newFriendRequestData = {
                    receiver: receiverId,
                    sender: senderId,
                    status: status
                };

                // Update the friend request node with the new data
                set(friendRequestRef, newFriendRequestData)
                    .then(() => {
                        console.log("Friend request status updated successfully!");

                        // If the friend request is accepted, add the users as friends
                        if (status === 'accepted') {
                            // Add the friend to the receiver's friends list
                            const receiverFriendRef = refDatabase('friends/' + receiverId + '/' + senderId);
                            set(receiverFriendRef, true)
                                .then(() => {
                                    console.log("Friend added to receiver's friends list successfully!");
                                    // Refresh friend requests after updating status
                                    // displayFriendRequests(auth.currentUser);
                                })
                                .catch(error => {
                                    console.error("Error adding friend to receiver's friends list: ", error);
                                });

                            // Add the receiver to the sender's friends list
                            const senderFriendRef = refDatabase('friends/' + senderId + '/' + receiverId);
                            set(senderFriendRef, true)
                                .then(() => {
                                    console.log("Receiver added to sender's friends list successfully!");
                                    // Refresh friend requests after updating status
                                    displayFriendRequests(auth.currentUser);
                                })
                                .catch(error => {
                                    console.error("Error adding receiver to sender's friends list: ", error);
                                });
                        } else {
                            // Refresh friend requests after updating status
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
        document.querySelector('.add-friends').addEventListener('click', () => addFriends(user));
        document.querySelector('.friends-requests').addEventListener('click', () => displayFriendRequests(user));
    })
});
    
