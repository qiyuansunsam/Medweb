document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const messageForm = document.getElementById("message-form");
	const textarea = document.querySelector("#message");
    const currentUsername = localStorage.getItem("username");
    const book = document.getElementById('sendData');
    const map = document.getElementById('map');
    const booking = document.getElementById('booking')
    if(book){
        book.addEventListener('click', function() {
            var btnValue = this.textContent;
            console.log(btnValue)
            fetch('/booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "val": btnValue,
                    "user": currentUsername
                })
            })
            
            window.location.href = "/vid";
        });
    }

    if (booking){

    }
    if(map) {
        let map;

        async function initMap() {
        // The location of Uluru
        const position = { lat: -25.344, lng: 131.031 };
        // Request needed libraries.
        //@ts-ignore
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        // The map, centered at Uluru
        map = new Map(document.getElementById("map"), {
            zoom: 4,
            center: position,
            mapId: "DEMO_MAP_ID",
        });

        // The marker, positioned at Uluru
        const marker = new AdvancedMarkerElement({
            map: map,
            position: position,
            title: "Uluru",
        });
        }

        initMap();
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            localStorage.setItem("username", username);

            // Send login data to the server
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({ username }),
            });

            const data = await response.json();
            if (data.status === "success") {
                window.location.href = data.redirect_url;
            } else {
                alert(data.message);
            }
        });
    }

    if (messageForm) {
        fetchMessageAndAppend("Hi, would you be comfortable sharing a bit about yourself and your symptons?", "message server");  // You should determine this based on your authentication status
        
        messageForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const message = document.getElementById("message").value;
            const username = localStorage.getItem("username");

            fetchMessageAndAppend(message, "message client");
            document.getElementById("message").value = ""
            textarea.style.height = "auto"; // Reset the height
            setLoading();
            // Send message to the server
            const response = await fetch("/send-message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message, username }),
            });
            if (response.ok) {
                const data = await response.json();
                fetchMessageAndAppend(data.message, "message server");
            }
            setLoading();
        });
        

        textarea.addEventListener("input", () => {
            textarea.style.height = "auto"; // Reset the height
            textarea.style.height = textarea.scrollHeight + "px";
        });
    }

    async function setLoading() {
        const loading = document.getElementById("loading");
        if (loading.style.display === "block") {
            loading.style.display = "none";
        } else {
            loading.style.display = "block";
        }
    }

    async function fetchMessageAndAppend(message, class_name) {
        const chatContainer = document.getElementById("chat-container");
        const newMessage = document.createElement("div");
        newMessage.className = class_name;

        const regex = /```([\s\S]*?)```/g;
        const outputString = message.replace(regex, '<span class="code-snippet">$1\n</span>');
        newMessage.innerHTML = outputString;
        const loadingMsg = chatContainer.lastElementChild;
        chatContainer.insertBefore(newMessage, loadingMsg);
    }
});
