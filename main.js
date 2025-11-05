document.addEventListener("DOMContentLoaded", function() {
    const firebaseConfig = {
        apiKey: "AIzaSyCzRIRSuwYKPdbdIrYFUV3Yuqyl0hcU0Fk",
        authDomain: "confessapp-e1aff.firebaseapp.com",
        projectId: "confessapp-e1aff",
        storageBucket: "confessapp-e1aff.firebasestorage.app",
        messagingSenderId: "1036012328977",
        appId: "1:1036012328977:web:a9df29ebf930147fe979b0"
    };

    firebase.initializeApp(firebaseConfig);
    
    const db = firebase.firestore();

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    const sendMailContainer = document.getElementById('sendMailContainer');
    const checkReplyContainer = document.getElementById('checkReplyContainer');
    const promoContainer = document.getElementById('promoContainer');
    
    const sendButton = document.getElementById('sendButton');
    const aiButton = document.getElementById('aiButton');
    const aiButtonText = document.getElementById('aiButtonText');
    const aiButtonIcon = document.getElementById('aiButtonIcon');
    const aiButtonLoading = document.getElementById('aiButtonLoading');

    const messageText = document.getElementById('messageText');
    const clueText = document.getElementById('clueText');
    const replyPassword = document.getElementById('replyPassword');
    
    const checkButton = document.getElementById('checkButton');
    const checkPassword = document.getElementById('checkPassword');
    const replyDisplay = document.getElementById('replyDisplay');
    const replyText = document.getElementById('replyText');

    const messageBox = document.getElementById('messageBox');
    const messageBoxText = document.getElementById('messageBoxText');
    
    const letterHeader = document.getElementById('letterHeader');
    const headerText = document.getElementById('headerText');
    
    const adModal = document.getElementById('adModal');
    const adDownloadButton = document.getElementById('adDownloadButton');
    const adCloseButton = document.getElementById('adCloseButton');
    const showCheckReplyButton = document.getElementById('showCheckReplyButton');
    const showSendMailButton = document.getElementById('showSendMailButton');

    const receiptMessage = document.getElementById('receiptMessage');
    const copyUserLinkButton = document.getElementById('copyUserLinkButton');
    
    let currentHeaderText = 'tell me anything';
    let currentHeaderColor = '#ffb3c6';
    let currentTheme = 'default';
    
    if (userId) {
        sendMailContainer.classList.remove('hidden');
        promoContainer.classList.add('hidden');
        checkReplyContainer.classList.add('hidden');
        
        const linkRef = db.collection("publicLinks").doc(userId);
        const eventRef = db.collection("globalConfig").doc("events");

        Promise.all([linkRef.get(), eventRef.get()])
            .then(([linkDoc, eventDoc]) => {
                let finalTheme = 'default';
                let finalHeaderText = 'tell me anything';
                let finalHeaderColor = '#ffb3c6';

                let activeEvent = null;
                if (eventDoc.exists()) {
                    const events = eventDoc.data();
                    if (events.valentines) activeEvent = 'event_valentines';
                    else if (events.newyear) activeEvent = 'event_newyear';
                    else if (events.christmas) activeEvent = 'event_christmas';
                    else if (events.halloween) activeEvent = 'event_halloween';
                }

                let userTheme = 'default';
                let userHeader = 'tell me anything';
                let userColor = '#ffb3c6';
                if (linkDoc.exists) {
                    const data = linkDoc.data();
                    userTheme = data.theme || 'default';
                    userHeader = data.linkHeaderText || 'tell me anything';
                    userColor = data.linkHeaderColor || '#ffb3c6';
                }

                if (activeEvent) {
                    finalTheme = activeEvent;
                    const eventDetails = {
                        event_halloween: { text: 'SPOOKY TIME 👻', color: '#f38323' },
                        event_christmas: { text: 'MERRY MESSAGES 🎄', color: '#c41d34' },
                        event_newyear: { text: 'HAPPY NEW YEAR 🎆', color: '#111827' },
                        event_valentines: { text: 'BE MINE? ❤️', color: '#e11d48' }
                    };
                    finalHeaderText = eventDetails[activeEvent].text;
                    finalHeaderColor = eventDetails[activeEvent].color;
                } else {
                    finalTheme = userTheme;
                    finalHeaderText = userHeader;
                    finalHeaderColor = userColor;
                }
                
                currentTheme = finalTheme;
                currentHeaderText = finalHeaderText;
                currentHeaderColor = finalHeaderColor;

                headerText.innerText = currentHeaderText;
                letterHeader.style.backgroundColor = currentHeaderColor;
                
                document.body.classList.remove(
                    'event-halloween', 'event-christmas', 'event-newyear', 'event-valentines',
                    'theme-ocean', 'theme-cherry', 'theme-gamer', 'theme-gold'
                );
                if (currentTheme !== 'default') {
                    document.body.classList.add(currentTheme.replace('_', '-'));
                }

            })
            .catch((error) => {
                console.error("Error getting settings:", error);
            });
        
    } else {
        promoContainer.classList.remove('hidden');
        sendMailContainer.classList.add('hidden');
        checkReplyContainer.classList.add('hidden');
    }

    
    aiButton.onclick = async () => {
        aiButton.disabled = true;
        aiButtonText.innerText = "Generating...";
        aiButtonIcon.classList.add('hidden');
        aiButtonLoading.classList.remove('hidden');

        const apiKey = "AIzaSyC2IDYSpD4JZ45NZWbKuIQRP6RNvdQSAxg"; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
        
        const prompt = "Generate one, and only one, fun, flirty, or interesting anonymous question to ask a friend. It should be a single sentence. Do not include quotes. Examples: 'What's a secret you've never told anyone?', 'Do you have a crush on me?', 'Describe me in 3 words.'";

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    safetySettings: [
                        { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH" },
                        { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH" },
                        { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH" },
                        { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH" }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Gemini API Error Response:", errorData);
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.error.message}`);
            }

            const result = await response.json();
            
            if (!result.candidates || !result.candidates[0].content || !result.candidates[0].content.parts) {
                console.error("Invalid response structure from Gemini:", result);
                throw new Error("Invalid response structure from AI.");
            }

            const aiText = result.candidates[0].content.parts[0].text;
            
            messageText.value = aiText.trim();
            messageText.focus();

        } catch (error) {
            console.error("Gemini AI Error:", error.message);
            showMessage(`AI Error: ${error.message}. (Note: If this is a 403 error, check your API key restrictions in Google Cloud Console.)`, "error");
            
            messageText.value = "What's your honest opinion of me?";
        } finally {
            aiButton.disabled = false;
            aiButtonText.innerText = "Get AI Question";
            aiButtonIcon.classList.remove('hidden');
            aiButtonLoading.classList.add('hidden');
        }
    };

    sendButton.onclick = async () => {
        if (!userId) {
            showMessage("ERROR: No user ID found in the link.", "error");
            return;
        }
        const text = messageText.value.trim();
        const clue = clueText.value.trim();
        const password = replyPassword.value.trim();

        if (text === "") {
            showMessage("You can't send an empty message.", "error");
            return;
        }
        if (password === "") {
            showMessage("You must create a password to check for replies.", "error");
            return;
        }
        
        const replyId = CryptoJS.SHA256(password + userId).toString();

        sendButton.disabled = true;
        sendButton.innerText = "Sending...";
        
        try {
            const messagesRef = db.collection("users").doc(userId).collection("messages");
            let payload = {
                text: text, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false, hasClue: false, fromAi: false, 
                headerText: currentHeaderText, headerColor: currentHeaderColor, theme: currentTheme,
                replyId: replyId
            };
            if (clue !== "") {
                payload.hasClue = true;
                payload.clueText = clue;
            }
            
            await messagesRef.add(payload);
        
            const emoji = document.createElement('span');
            emoji.innerHTML = '💌';
            emoji.className = 'send-animation';
            sendMailContainer.appendChild(emoji);
            setTimeout(() => {
                emoji.remove();
            }, 2000);
            
            receiptMessage.innerText = `Your message: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
            adModal.classList.remove('hidden');

            messageText.value = "";
            clueText.value = "";
            replyPassword.value = "";
            
        } catch (error) {
            console.error("Error sending message: ", error);
            if (error.code === 'unauthenticated' || error.code === 'permission-denied') {
                showMessage("Security check failed. Please refresh the page.", "error");
            } else {
                showMessage("An error occurred. Please try again.", "error");
            }
        } finally {
            sendButton.disabled = false;
            sendButton.innerText = "Send Mail";
        }
    };
    
    checkButton.onclick = async () => {
        const password = checkPassword.value.trim();
        if (password === "") {
            showMessage("Please enter your secret password.", "error");
            return;
        }
        
        let checkingUserId = userId;
        if (!checkingUserId) {
            const params = new URLSearchParams(window.location.search);
            checkingUserId = params.get('id');
            if(!checkingUserId) {
                showMessage("Error: No user link found.", "error");
                return;
            }
        }
        
        const replyId = CryptoJS.SHA256(password + checkingUserId).toString();
        
        checkButton.disabled = true;
        checkButton.innerText = "Checking...";
        
        try {
            const replyRef = db.collection("replies").doc(replyId);
            const doc = await replyRef.get();
            
            if (doc.exists) {
                const data = doc.data();
                if (data.toUserId === checkingUserId) {
                    replyText.innerText = data.replyText;
                    replyDisplay.classList.remove('hidden');
                    showMessage("Reply found!", "success");
                } else {
                    showMessage("Password not found for this user.", "error");
                }
            } else {
                showMessage("No reply yet, or password was wrong.", "error");
            }
        } catch (e) {
            console.error("Error checking reply:", e);
            if (e.code === 'unauthenticated' || e.code === 'permission-denied') {
                showMessage("Security check failed. Please refresh the page.", "error");
            } else {
                showMessage("An error occurred.", "error");
            }
        } finally {
            checkButton.disabled = false;
            checkButton.innerText = "Check Mailbox";
        }
    };

    showCheckReplyButton.onclick = () => {
        sendMailContainer.classList.add('hidden');
        checkReplyContainer.classList.remove('hidden');
    };
    showSendMailButton.onclick = () => {
        checkReplyContainer.classList.add('hidden');
        sendMailContainer.classList.remove('hidden');
    };
    adCloseButton.onclick = () => {
        adModal.classList.add('hidden');
    };
    adDownloadButton.onclick = () => {
        window.location.href = 'https://expo.dev/artifacts/eas/gBuM44Et2bGXaRPfPtgWuG.apk';
    };

    copyUserLinkButton.onclick = () => {
        const userLink = `https://uwuuuu4.github.io/LIFEConfess/?id=${userId}`;
        navigator.clipboard.writeText(userLink).then(() => {
            showMessage("User's link copied to clipboard!", "success");
        }, (err) => {
            showMessage("Failed to copy link.", "error");
        });
    };

    function showMessage(text, type) {
        messageBoxText.innerText = text;
        if (type === "success") {
            messageBox.className = "fixed top-5 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg z-50 bg-green-100 text-green-800";
        } else {
            messageBox.className = "fixed top-5 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg z-50 bg-red-100 text-red-800";
        }
        messageBox.classList.remove('hidden');
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, 3000);
    }
});