const USERS = [
    {email: "bluesunshine92@example.com", password: "Sparkle789!"},
    {email: "greenleaf45@example.com" , password: "Nature2022!"},
    {email: "silvermoon77@example.com" , password: "LunaMagic#1"},
    {email: "crimsonsky33@example.com" , password: "SunsetDreams!22"},
    {email: "azurewave19@example.com" , password: "OceanBreeze123!"}
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*0-9])(?=.{8,})\S+$/;


document.querySelector(".back-img").addEventListener("click", (_event) => window.location.href = "../index.html");
document.querySelector(".login-btn").addEventListener(
    "click" , 
    (event) =>
        register(
            event, 
            document.querySelector(".register-email").value, 
            document.querySelector(".register-password").value, 
            document.querySelector(".repeat-password").value
        )
)

let isRegisterBlocked = true;

const repeatPasswordInput = document.querySelector(".repeat-password");
repeatPasswordInput.addEventListener(
    "input", 
    (event) => {
        const password = document.querySelector(".register-password").value;
        if (repeatPasswordInput.value !== password) {
            document.querySelector('.repeat-password').classList.add("invalid-field");
            isRegisterBlocked = true;
        }
        else {
            document.querySelector('.repeat-password').classList.remove("invalid-field");
            isRegisterBlocked = false;
        }

});

function register(event, email, password, repeatPassword) {
    event.preventDefault();


    if (!EMAIL_PATTERN.test(email)) {
        document.querySelector(".register-error").textContent = "Invalid email format";
        document.querySelector('.register-email').classList.add("invalid-field");
        return;
    }

    const user = USERS.find((user) => user.email === email);

    if (user) {
        document.querySelector(".register-error").textContent = "Already registered email";
        document.querySelector('.register-email').classList.add("invalid-field");
        return;
    }

    if (!PASSWORD_PATTERN.test(password)) {
        document.querySelector(".register-error").textContent = "Invalid password format";
        document.querySelector('.register-password').classList.add("invalid-field");
        return; 
    }

    if (!isRegisterBlocked) {
        window.location.href = "../Home/home.html";
    }

}