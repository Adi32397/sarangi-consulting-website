(function () {
    const API_URL = `${API_BASE_URL}/api/chatbot`;

    const chatbotHTML = `
        <button class="sara-launcher" id="saraLauncher" aria-label="Open SARA Chat">
            <span class="sara-pulse"></span>
            <i class="fas fa-robot"></i>
        </button>

        <div class="sara-nudge" id="saraNudge">
            👋 Need help choosing the right plan?
            <strong>Ask SARA</strong>
        </div>

        <div class="sara-chat" id="saraChat">
            <div class="sara-header">
                <div class="sara-profile">
                    <div class="sara-avatar">S</div>
                    <div>
                        <h4>✨ SARA</h4>
                        <p class="sara-online">AI Business Consultant • Online</p>
                    </div>
                </div>

                <div class="sara-actions">
                    <button id="saraReset" title="Clear Chat">↻</button>
                    <button id="saraMinimize" title="Minimize">−</button>
                    <button id="saraClose" title="Close">×</button>
                </div>
            </div>

            <div class="sara-body" id="saraBody"></div>

            <div class="sara-input-area">
                <input id="saraInput" type="text" placeholder="Ask about your business..." />
                <button id="saraSend"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", chatbotHTML);

    const launcher = document.getElementById("saraLauncher");
    const nudge = document.getElementById("saraNudge");
    const chat = document.getElementById("saraChat");
    const closeBtn = document.getElementById("saraClose");
    const minimizeBtn = document.getElementById("saraMinimize");
    const resetBtn = document.getElementById("saraReset");
    const input = document.getElementById("saraInput");
    const sendBtn = document.getElementById("saraSend");
    const body = document.getElementById("saraBody");
    resetChat();

    setTimeout(() => {
        if (!chat.classList.contains("open")) {
            nudge.classList.add("show");
        }
    }, 4500);

    launcher.addEventListener("click", () => {
        chat.classList.toggle("open");
        nudge.classList.remove("show");
        setTimeout(() => input.focus(), 250);
    });

    nudge.addEventListener("click", () => {
        chat.classList.add("open");
        nudge.classList.remove("show");
        setTimeout(() => input.focus(), 250);
    });

    closeBtn.addEventListener("click", () => {
        chat.classList.remove("open");
    });

    minimizeBtn.addEventListener("click", () => {
        chat.classList.remove("open");
    });

    resetBtn.addEventListener("click", () => {
    resetChat();
    });


    sendBtn.addEventListener("click", () => {
        sendMessage(input.value);
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            sendMessage(input.value);
        }
    });

    function resetChat() {

    body.innerHTML = "";

    removeTyping();

    removeSuggestionGroups();

    addMessage(`
        👋 <strong>Welcome to Sarangi Consulting</strong><br><br>

        I'm <strong>SARA</strong>, your AI Business Consultant.

        <br><br>

        I can help you:

        <br><br>

        🚀 Startup Advisory<br>

        📈 Business Growth<br>

        ™ Branding & Trademark<br>

        💰 Pricing<br>

        📅 Book a Consultation

    `,"bot");

    addInitialSuggestions();

}

    function addInitialSuggestions() {
        removeSuggestionGroups();

        const suggestions = document.createElement("div");
        suggestions.className = "sara-suggestions sara-initial";

        suggestions.innerHTML = `
            <button class="sara-chip" data-msg="I want startup advisory">🚀 Start a Business</button>
            <button class="sara-chip" data-msg="I need help growing my business">📈 Grow Business</button>
            <button class="sara-chip" data-msg="I need branding and trademark help">™ Trademark</button>
            <button class="sara-chip" data-msg="I need company registration guidance">💼 Registration</button>
            <button class="sara-chip" data-msg="What are your pricing plans?">💰 Pricing</button>
            <button class="sara-chip" data-msg="How can I book a consultation?">📅 Book Call</button>
        `;

        body.appendChild(suggestions);
        bindSuggestionEvents(suggestions);
        body.scrollTop = body.scrollHeight;
    }

    function addFollowUps() {
        document.querySelectorAll(".sara-followup").forEach(el => el.remove());

        const followUp = document.createElement("div");
        followUp.className = "sara-suggestions sara-followup";

        followUp.innerHTML = `
            <button class="sara-chip" data-msg="What is the pricing?">💰 Pricing</button>
            <button class="sara-chip" data-msg="How can I book a call?">📅 Book Call</button>
            <button class="sara-chip" data-msg="I need branding and trademark help">™ Trademark</button>
            <button class="sara-chip" data-msg="I want startup advisory">🚀 Startup</button>
        `;

        body.appendChild(followUp);
        bindSuggestionEvents(followUp);
        body.scrollTop = body.scrollHeight;
    }

    function bindSuggestionEvents(container) {
        container.querySelectorAll(".sara-chip").forEach(chip => {
            chip.addEventListener("click", () => {
                sendMessage(chip.dataset.msg);
            });
        });
    }

    function removeSuggestionGroups() {
        document.querySelectorAll(".sara-initial, .sara-followup").forEach(el => el.remove());
    }

    async function sendMessage(message) {
        if (!message || !message.trim()) return;

        removeSuggestionGroups();

        addMessage(message, "user");
        input.value = "";

        showTyping();

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error("Chatbot API request failed");
            }

            const data = await response.json();

            setTimeout(() => {
                removeTyping();
                renderBotResponse(data);
            }, 700);

        } catch (error) {
            removeTyping();
            console.error("SARA error:", error);

            addMessage(
                "Sorry, I'm unable to connect to the server right now. Please make sure the backend is running.",
                "bot"
            );

            addFollowUps();
        }
    }

    function renderBotResponse(data) {
        if (data.type === "text") {
            addMessage(data.message, "bot");
            addFollowUps();
            return;
        }

        if (data.type === "question") {
            addMessage(`
                <strong>${data.message}</strong>
                <div class="sara-suggestions">
                    ${(data.options || []).map(option => `
                        <button class="sara-chip" data-msg="${option}">
                            ${option}
                        </button>
                    `).join("")}
                </div>
            `, "bot");

            document.querySelectorAll(".sara-chip").forEach(chip => {
                chip.onclick = () => sendMessage(chip.dataset.msg);
            });

            return;
        }

        if (data.type === "plan") {
            addMessage(`
                <div class="sara-card">
                    <div class="sara-badge">⭐ Recommended • ${data.rating || "4.9"}/5</div>

                    <h4>${data.title}</h4>

                    <p>${data.description}</p>

                    <ul>
                        ${(data.features || []).map(item => `<li>✔ ${item}</li>`).join("")}
                    </ul>

                    <div class="sara-card-price">${data.price}</div>

                    <div class="sara-card-actions">
                        <a class="sara-primary" href="startup-advisory.html">Book Now</a>
                        <a class="sara-secondary" href="services.html">View Details</a>
                    </div>
                </div>
            `, "bot");

            addFollowUps();
            return;
        }

        if (data.type === "button") {
            addMessage(`
                <div class="sara-card">
                    <h4>📅 Book a Consultation</h4>
                    <p>${data.message}</p>

                    <div class="sara-card-actions">
                        <a class="sara-primary" href="startup-advisory.html">Register Now</a>
                        <a class="sara-secondary" href="contact.html">Contact Us</a>
                    </div>
                </div>
            `, "bot");

            addFollowUps();
            return;
        }

        addMessage(
            "I can help with startup advisory, branding, pricing, registration and consultation booking.",
            "bot"
        );

        addFollowUps();
    }

    function addMessage(text, type) {
        const time = new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        });

        const message = document.createElement("div");
        message.className = `sara-message-wrap ${type === "user" ? "sara-user-wrap" : "sara-bot-wrap"}`;

        message.innerHTML = `
            <div class="sara-message ${type === "user" ? "sara-user" : "sara-bot"}">
                ${text}
            </div>
            <div class="sara-time">${time}</div>
        `;

        body.appendChild(message);
        body.scrollTop = body.scrollHeight;
    }

    function showTyping() {
        removeTyping();

        const typing = document.createElement("div");
        typing.className = "sara-message-wrap sara-bot-wrap";
        typing.id = "saraTyping";

        typing.innerHTML = `
            <div class="sara-message sara-bot">
                <div class="sara-typing-title">SARA is thinking...</div>
                <div class="sara-typing">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;

        body.appendChild(typing);
        body.scrollTop = body.scrollHeight;
    }

    function removeTyping() {
        const typing = document.getElementById("saraTyping");
        if (typing) typing.remove();
    }
})();