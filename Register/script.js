import { set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { createUser, database, refDatabase } from "../firebase.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*0-9])(?=.{8,})\S+$/;
console.log(database);
document.querySelector(".back-img").addEventListener("click", (_event) => window.location.href = "../index.html");

document.querySelector(".register-btn").addEventListener(
    "click" , 
    (event) =>
        register(
            event, 
            document.getElementById("register-email").value, 
            document.getElementById("register-password").value
        )
)

let isRegisterBlocked = true;

const repeatPasswordInput = document.getElementById("repeat-password");
repeatPasswordInput.addEventListener(
    "input", 
    (event) => {
        const password = document.getElementById("register-password").value;
        if (repeatPasswordInput.value !== password) {
            document.getElementById("repeat-password").classList.add("invalid-field");
            isRegisterBlocked = true;
        }
        else {
            document.getElementById("repeat-password").classList.remove("invalid-field");
            isRegisterBlocked = false;
        }
});

function register(event, email, password) {
    event.preventDefault();

    if (!EMAIL_PATTERN.test(email)) {
        document.querySelector(".register-error").textContent = "Invalid email format";
        document.getElementById("register-email").classList.add("invalid-field");
        return;
    }

    const full_name = document.getElementById('full-name').value;
    const date_of_birth = document.getElementById('date').value;

    createUser(email, password)
    .then((userCredential) => {
        // Use userCredential to get the user object
        const user = userCredential.user;
        
        // Define user data
        const user_data = {
            email: email,
            full_name: full_name,
            date_of_birth: date_of_birth,
            last_login: Date.now()
        };
        
        // Set the user data at the specified database path
        set(refDatabase('users/' + user.uid), user_data)
            .then(() => {
                alert('User created and data added to database!');
            }).catch((error) => {
                // Handle errors in setting data to the database
                console.error("Error saving user data to the database", error);
                alert('Failed to add user data to database.');
            });
    })
    .catch(function(error) {
        if (error.code === 'auth/email-already-in-use') {
            return alert('The email address is already registered. Try signing in.');
        }
        alert('Something went wrong');
        console.log(error);
    })
    if (!PASSWORD_PATTERN.test(password)) {
        document.querySelector(".register-error").textContent = "Invalid password format";
        document.getElementById('register-password').classList.add("invalid-field");
        return; 
    }

    if (!isRegisterBlocked) {
        //  window.location.href = "../Home/index.html";
    }

}