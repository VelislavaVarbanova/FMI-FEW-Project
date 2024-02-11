import { signIn, database, auth } from "../firebase.js";

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
        const database_ref = database.ref();
        const user_data = {
            last_login : Date.now()
        };
        database_ref.child('users/' + user.uid).update(user_data);
        alert('User Logged in!'); 
        
    })
    .catch(function(error) {
        const error_code = error_code;
        const error_message = error_message;
        alert(error_message);
    });
    window.location.href = "./Home/index.html";
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