import { get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { signOut, onAuthChanged, refDatabase } from "../firebase.js";

document.addEventListener('DOMContentLoaded', function () {
    const userNameDisplay = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-button');

    // Listen for authentication state changes
    onAuthChanged((user) => {
        console.log(user);
        if (user) {
            const userRef = refDatabase('users/' + user.uid);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const displayName = snapshot.val().full_name
         || 'User'; // Fallback to 'User' if the display name is not available
                    userNameDisplay.textContent = `Welcome, ${displayName}`;
                } else {
                    console.log("No data available");
                }
            }).catch((error) => {
                console.error(error);
            });
            console.log(user);
            // User is signed in, show the user's name
            const displayName = user.displayName || 'User'; // Fallback to 'User' if the display name is not available
            userNameDisplay.textContent = `Welcome, ${displayName}`;
        } else {
            // User is signed out
            userNameDisplay.textContent = 'Not logged in';
            // window.location.href = "../index.html";
        }
    });

    // Logout functionality
    logoutButton.addEventListener('click', function () {
        console.log(123);
        signOut().then(() => {
            console.log('User signed out.');
        }).catch((error) => {
            console.error('Sign out error:', error);
        });
    });
});

document.querySelector('.profile-button').addEventListener('mouseover', function(e) {
    e.preventDefault();
    this.parentElement.classList.toggle('active')
})

document.querySelector('.chat').addEventListener('click', function() {
    window.location.href = '../Chat';
})