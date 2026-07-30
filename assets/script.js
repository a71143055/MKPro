// assets/script.js
// Simple Gemini client – replace YOUR_GEMINI_API_KEY_HERE with your key.
const API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // <<< edit before publishing
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function callGemini(prompt) {
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
