// script.js

let recognition;
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');

document.addEventListener('DOMContentLoaded', initSpeechRecognition);

function initSpeechRecognition() {
    recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';

    recognition.onresult = function (event) {
        const result = event.results[event.resultIndex][0].transcript;
        userInput.value = result;

        // Automatically send the voice input for processing
        sendMessage();
    };
}

function startSpeechRecognition() {
    console.log('Starting speech recognition');
    if (!recognition) {
        initSpeechRecognition();
    }
    recognition.start();
}

function stopSpeechRecognition() {
    console.log('Stopping speech recognition');
    if (recognition) {
        recognition.stop();
    }
}

async function sendMessage() {
    const userMessage = userInput.value.trim().toLowerCase();

    if (userMessage !== '') {
        appendMessage('User', userMessage);

        // Process and respond to userMessage
        const response = await generateResponse(userMessage);
        speak(response);

        userInput.value = '';
    }
}

async function generateResponse(userMessage) {
    console.log('userMessage:', userMessage);
    if (userMessage.includes('hello') || userMessage.includes('hi')) {
        return 'Hello! It\'s great to see you here. How can I support you today?';
    } else if (userMessage.includes('thank')) {
        return 'You\'re welcome! I\'m here to help and support you.';
    } else if (userMessage.includes('how are you')) {
        return 'Thank you for asking! I\'m just a program, but I\'m here and ready to assist you.';
    } else if (userMessage.includes('drugs') || userMessage.includes('substance')) {
        return 'I understand that you might have concerns about substances. Let\'s focus on positive topics and how I can support your well-being. What are your interests or hobbies?';
    } else if (userMessage.includes('help') || userMessage.includes('support')) {
        return 'I\'m here to offer support and encouragement. If you have specific concerns or questions, feel free to share, and we can discuss them together.';
    } else {
        return 'That\'s great to hear! Is there anything specific you would like to talk about or share today?';
    }
}

function appendMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = sender.toLowerCase();
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function speak(text) {
    try {
        const apiKey = 'YOUR_GOOGLE_API_KEY';
        const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: { text },
                voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D', ssmlGender: 'NEUTRAL' },
                audioConfig: { audioEncoding: 'LINEAR16' },
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch audio from Google Text-to-Speech API');
        }

        const data = await response.json();
        const audioData = data.audioContent;

        // Convert base64 audio to ArrayBuffer
        const buffer = new Uint8Array(atob(audioData).split('').map(char => char.charCodeAt(0))).buffer;

        // Create an audio buffer and play it
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(buffer);
        const audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(audioContext.destination);
        audioSource.start();
    } catch (error) {
        console.error(error);
    }
}
