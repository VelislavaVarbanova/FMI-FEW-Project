import { signIn, database, auth, refDatabase } from "../firebase.js";
import { update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function login(event, email, password) {
    event.preventDefault();
    
    if (!EMAIL_PATTERN.test(email)) {
        document.querySelector(".register-error").textContent = "Invalid email format";
        document.querySelector('.login-email').classList.add("invalid-field");
        return;
    }
    console.log('in func');

    signIn(email, password)
    .then(function() {
        console.log('sign in func');
        const user = auth.currentUser;
        const user_data = {
            last_login : Date.now()
        };
        update(refDatabase('users/' + user.uid), user_data);
        alert('User Logged in!'); 
        window.location.href = "./Home/index.html";
    })
    .catch(function(error) {
        alert(error.message);
    });
    
}

document.querySelector(".login-btn").addEventListener(
    "click", 
    (event) => {
        console.log("listener");
        login(
            event, 
            document.querySelector(".login-email").value, 
            document.querySelector(".login-password").value
        )}
);

document.querySelector(".create-account button").addEventListener(
    "click",
    (_event) => {     
        window.location.href = "./Register/index.html";
    },
);