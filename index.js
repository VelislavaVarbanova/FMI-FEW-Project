const USERS = [
    {email: "bluesunshine92@example.com", password: "Sparkle789!"},
    {email: "greenleaf45@example.com" , password: "Nature2022!"},
    {email: "silvermoon77@example.com" , password: "LunaMagic#1"},
    {email: "crimsonsky33@example.com" , password: "SunsetDreams!22"},
    {email: "azurewave19@example.com" , password: "OceanBreeze123!"}
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


function login(event, email, password) {
    event.preventDefault();
    
    if (!EMAIL_PATTERN.test(email)) {
        document.querySelector(".register-error").textContent = "Invalid email format";
        document.querySelector('.login-email').classList.add("invalid-field");
        return;
    }

    const user = USERS.find((user) => user.email === email);

    if (!user) {
        document.querySelector(".register-error").textContent = "There is no registered user with that email";
        document.querySelector('.login-email').classList.add("invalid-field");
        return;
    }

    if (user.password !== password) {
        document.querySelector(".register-error").textContent = "Wrong password";
        document.querySelector('.login-password').classList.add("invalid-field");
        return;
    }

    window.location.href = "./home.html";

}

document.querySelector(".login-btn").addEventListener(
    "click", 
    (event) => 
        login(
            event, 
            document.querySelector(".login-email").value, 
            document.querySelector(".login-password").value
        )
);

document.querySelector(".create-account button").addEventListener(
    "click",
    (_event) => {     
        window.location.href = "./register.html";
    },
);