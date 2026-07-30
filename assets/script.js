// assets/script.js
// Simple Gemini client – API key is stored in localStorage.
let API_KEY = null; // will be loaded from localStorage
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Load API key from localStorage; if missing, show modal
function loadApiKey() {
  const stored = localStorage.getItem("gemini_api_key");
  if (stored) {
    API_KEY = stored;
    return true;
  }
  // show modal to ask for key
  openKeyModal();
  return false;
}

function openKeyModal() {
  document.getElementById("api-key-modal").classList.remove("hidden");
  document.getElementById("api-key-input").focus();
}

function closeKeyModal() {
  document.getElementById("api-key-modal").classList.add("hidden");
}

function saveApiKey() {
  const key = document.getElementById("api-key-input").value.trim();
  if (key) {
    localStorage.setItem("gemini_api_key", key);
    API_KEY = key;
    closeKeyModal();
  } else {
    alert("API key cannot be empty.");
  }
}

// Settings button opens modal
document.getElementById("settings-btn").addEventListener("click", openKeyModal);
// Modal action buttons
document.getElementById("save-key-btn").addEventListener("click", saveApiKey);
document.getElementById("close-key-btn").addEventListener("click", closeKeyModal);

async function callGemini(prompt) {
  if (!API_KEY) {
    loadApiKey();
    throw new Error("API Key required");
  }
  const response = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
    })
  });
  const data = await response.json();
  if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
    return data.candidates[0].content.parts[0].text.trim();
  }
  throw new Error(data.error?.message || "Unknown Gemini error");
}

function addMessage(content, from = "user") {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.className = `message ${from}`;
  msg.textContent = content;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

async function handleSend() {
  const input = document.getElementById("user-input");
  const prompt = input.value.trim();
  if (!prompt) return;
  addMessage(prompt, "user");
  input.value = "";
  // placeholder while waiting
  addMessage("…", "bot");
  try {
    const answer = await callGemini(prompt);
    const placeholder = document.querySelector(".message.bot:last-child");
    placeholder.textContent = answer;
    placeholder.classList.add("typed");
  } catch (e) {
    const placeholder = document.querySelector(".message.bot:last-child");
    placeholder.textContent = `⚠️ 오류: ${e.message}`;
    placeholder.classList.add("error");
  }
}

document.getElementById("send-btn").addEventListener("click", handleSend);

document.getElementById("user-input").addEventListener("keypress", e => {
  if (e.key === "Enter") handleSend();
});

// Initialize: try loading key; if not present modal will appear
loadApiKey();
