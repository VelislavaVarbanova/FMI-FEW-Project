import { signIn, auth, refDatabase } from "../firebase.js";
import { update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function login(event, email, password) {
    event.preventDefault();
    
    if (!EMAIL_PATTERN.test(email)) {
        document.querySelector(".register-error").textContent = "Invalid email format";
        document.querySelector('.login-email').classList.add("invalid-field");
        return;
    }

    signIn(email, password)
    .then(function() {
        const user = auth.currentUser;
        const user_data = {
            last_login : Date.now()
        };
        update(refDatabase('users/' + user.uid), user_data);
        window.location.href = "./Home/index.html";
    })
    .catch(function(error) {
        alert(error.message);
    });
    
}

document.querySelector(".login-btn").addEventListener(
    "click", 
    (event) => {
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