import { get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { signOut, onAuthChanged, refDatabase } from "../../firebase.js";

document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout-button');
    const friendsButton = document.querySelector('.friends-box');
    const userNameDisplay = document.getElementById('user-name');
    const userEmailDisplay = document.getElementById('user-email');
    const userBirthDateDisplay = document.getElementById('user-date-of-birth');

    // Listen for authentication state changes
    onAuthChanged((user) => {
        if (user) {
            const userRef = refDatabase('users/' + user.uid);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const displayName = snapshot.val().full_name || 'User'; // Fallback to 'User' if the display name is not available
                    userNameDisplay.textContent = `${displayName}`;
                    const displayEmail = snapshot.val().email || 'Email';
                    userEmailDisplay.textContent = `Email: ${displayEmail}`;
                    const displayBirthDate = snapshot.val().date_of_birth || 'Birth date';
                    userBirthDateDisplay.textContent = `Birth Date: ${displayBirthDate}`;
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
    });

    logoutButton.addEventListener('click', function () {
        signOut().then(() => {
            console.log('User signed out.');
            window.location.href = "../../index.html";
        }).catch((error) => {
            console.error('Sign out error:', error);
        });
    });

    friendsButton.addEventListener('click', function() {
        window.location.href = '../Friends-list/index.html';
    })
});