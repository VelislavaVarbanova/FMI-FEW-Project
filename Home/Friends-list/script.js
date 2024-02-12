import { auth, onAuthChanged, database, refDatabase } from "../../firebase.js";
import { get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";


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
          // Friend found, add to friends list
          const friendsToAdd = {};
          friendsToAdd[friendId] = true;
            // Update the '/friends' node in the database
            set(refDatabase('friends/' + currentUserId + '/' + friendId),true)
                .then(() => {
                    alert("Friend added successfully!");
                    // Refresh friends list after adding new friend
                    displayFriends(user);
                }).catch((error) => {
                    console.error("Error adding friend: ", error);
                    alert('Failed');
                });
    } else {
    console.log("Friend not found. func add");
    }
  });
}      

function displayFriends(user) {
    const currentUserId = user.uid;
    if (currentUserId) {
    
      // Get reference to user's friends node in the database
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

document.addEventListener('DOMContentLoaded', function () {
    onAuthChanged((user) => {

        displayFriends(user);
        document.querySelector('.add-friends').addEventListener('click', () => addFriends(user));

    })
});
    
