// assets/script.js
// Modern Gemini client with Client-side Authentication and User-bound API Key Management

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const STORAGE_KEYS = {
  USERS: "mkpro_users",
  CURRENT_USER: "mkpro_current_user",
  KEY_PREFIX: "mkpro_key_"
};

// Application State
let currentUser = null; // Username string or null
let currentApiKey = null; // Key string or null

// --- Data Layer Helpers ---
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || {};
  } catch (e) {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getUserApiKey(username) {
  if (!username) return null;
  return localStorage.getItem(STORAGE_KEYS.KEY_PREFIX + username) || null;
}

function saveUserApiKey(username, key) {
  if (!username) return;
  if (key) {
    localStorage.setItem(STORAGE_KEYS.KEY_PREFIX + username, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.KEY_PREFIX + username);
  }
}

function removeUserApiKey(username) {
  if (!username) return;
  localStorage.removeItem(STORAGE_KEYS.KEY_PREFIX + username);
}

// Simple string hash for demonstration client-side auth password check
function hashPassword(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16);
}

// --- Auth System ---
const Auth = {
  init() {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const users = getUsers();
    if (savedUser && users[savedUser]) {
      currentUser = savedUser;
      currentApiKey = getUserApiKey(currentUser);
    } else {
      currentUser = null;
      currentApiKey = null;
    }
    updateUIState();
  },

  signup(username, password, apiKey) {
    username = username.trim();
    if (!username || !password) {
      throw new Error("아이디와 비밀번호를 모두 입력하세요.");
    }
    if (username.length < 3) {
      throw new Error("아이디는 3자 이상이어야 합니다.");
    }
    if (password.length < 4) {
      throw new Error("비밀번호는 4자 이상이어야 합니다.");
    }

    const users = getUsers();
    if (users[username]) {
      throw new Error("이미 존재하는 아이디입니다.");
    }

    users[username] = {
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };
    saveUsers(users);

    if (apiKey && apiKey.trim()) {
      saveUserApiKey(username, apiKey.trim());
    }

    // Auto login
    this.login(username, password);
  },

  login(username, password) {
    username = username.trim();
    const users = getUsers();
    const user = users[username];

    if (!user || user.passwordHash !== hashPassword(password)) {
      throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
    }

    currentUser = username;
    currentApiKey = getUserApiKey(currentUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, currentUser);

    updateUIState();
    closeAuthModal();
    addSystemMessage(`👋 환영합니다, ${currentUser}님!`);

    if (!currentApiKey) {
      openKeyModal();
    }
  },

  logout() {
    const prevUser = currentUser;
    currentUser = null;
    currentApiKey = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    updateUIState();
    clearChatWindow();
    addSystemMessage(`🔒 ${prevUser || '사용자'}님이 로그아웃하셨습니다.`);
  }
};

// --- UI State Management ---
function updateUIState() {
  const userInfo = document.getElementById("user-info");
  const guestInfo = document.getElementById("guest-info");
  const usernameDisplay = document.getElementById("username-display");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const footerStatus = document.getElementById("footer-status-text");

  if (currentUser) {
    userInfo.classList.remove("hidden");
    guestInfo.classList.add("hidden");
    usernameDisplay.textContent = `👤 ${currentUser}`;

    if (currentApiKey) {
      userInput.disabled = false;
      sendBtn.disabled = false;
      userInput.placeholder = "Gemini에게 질문을 입력하세요...";
      footerStatus.textContent = `🔑 로그인: ${currentUser} | API Key가 정상 연동되었습니다.`;
    } else {
      userInput.disabled = true;
      sendBtn.disabled = true;
      userInput.placeholder = "Gemini API Key를 등록하면 대화를 시작할 수 있습니다.";
      footerStatus.textContent = `⚠️ 로그인: ${currentUser} | 상단 [🔑 API Key] 버튼을 클릭해 API Key를 등록하세요.`;
    }
  } else {
    userInfo.classList.add("hidden");
    guestInfo.classList.remove("hidden");
    userInput.disabled = true;
    sendBtn.disabled = true;
    userInput.placeholder = "로그인 후 대화를 시작할 수 있습니다.";
    footerStatus.textContent = "🔒 서비스를 이용하려면 먼저 로그인하고 Gemini API Key를 연동하세요.";
  }
}

// --- Chat Window Helpers ---
function clearChatWindow() {
  const chat = document.getElementById("chat");
  chat.innerHTML = "";
}

function addSystemMessage(text) {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.className = "message system-msg";
  msg.textContent = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function addMessage(content, from = "user") {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.className = `message ${from}`;
  msg.textContent = content;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

// --- Gemini API Call ---
async function callGemini(prompt) {
  if (!currentUser) {
    openAuthModal();
    throw new Error("로그인이 필요합니다.");
  }
  if (!currentApiKey) {
    openKeyModal();
    throw new Error("API Key 연동이 필요합니다.");
  }

  const response = await fetch(`${ENDPOINT}?key=${currentApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini API 오류 (${response.status})`);
  }

  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text.trim();
  }
  throw new Error("Gemini로부터 올바른 응답을 받지 못했습니다.");
}

async function handleSend() {
  const input = document.getElementById("user-input");
  const prompt = input.value.trim();
  if (!prompt) return;

  addMessage(prompt, "user");
  input.value = "";
  
  // Bot thinking placeholder
  addMessage("생각 중...", "bot");
  const lastBotMsg = document.querySelector(".message.bot:last-child");

  try {
    const answer = await callGemini(prompt);
    lastBotMsg.textContent = answer;
  } catch (e) {
    lastBotMsg.textContent = `⚠️ 오류: ${e.message}`;
    lastBotMsg.classList.add("error");
  }
}

// --- Modal Handlers ---
function openAuthModal() {
  document.getElementById("auth-modal").classList.remove("hidden");
  switchAuthTab("login");
}

function closeAuthModal() {
  document.getElementById("auth-modal").classList.add("hidden");
  document.getElementById("login-error").classList.add("hidden");
  document.getElementById("signup-error").classList.add("hidden");
}

function switchAuthTab(tab) {
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (tab === "login") {
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    document.getElementById("login-username").focus();
  } else {
    tabSignup.classList.add("active");
    tabLogin.classList.remove("active");
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    document.getElementById("signup-username").focus();
  }
}

function openKeyModal() {
  if (!currentUser) {
    openAuthModal();
    return;
  }
  const modal = document.getElementById("api-key-modal");
  const usernameLabel = document.getElementById("key-modal-username");
  const keyInput = document.getElementById("api-key-input");
  const statusMsg = document.getElementById("key-status-msg");

  usernameLabel.textContent = currentUser;
  keyInput.value = currentApiKey || "";
  statusMsg.textContent = "";
  statusMsg.className = "form-status";
  modal.classList.remove("hidden");
  keyInput.focus();
}

function closeKeyModal() {
  document.getElementById("api-key-modal").classList.add("hidden");
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
  // Auth Modal Buttons
  document.getElementById("open-auth-btn").addEventListener("click", openAuthModal);
  document.querySelectorAll(".close-auth-btn").forEach(btn => {
    btn.addEventListener("click", closeAuthModal);
  });
  document.getElementById("tab-login").addEventListener("click", () => switchAuthTab("login"));
  document.getElementById("tab-signup").addEventListener("click", () => switchAuthTab("signup"));

  // Login Form Submit
  document.getElementById("login-form").addEventListener("submit", e => {
    e.preventDefault();
    const u = document.getElementById("login-username").value;
    const p = document.getElementById("login-password").value;
    const errBox = document.getElementById("login-error");
    try {
      errBox.classList.add("hidden");
      Auth.login(u, p);
      document.getElementById("login-form").reset();
    } catch (err) {
      errBox.textContent = err.message;
      errBox.classList.remove("hidden");
    }
  });

  // Signup Form Submit
  document.getElementById("signup-form").addEventListener("submit", e => {
    e.preventDefault();
    const u = document.getElementById("signup-username").value;
    const p = document.getElementById("signup-password").value;
    const k = document.getElementById("signup-key").value;
    const errBox = document.getElementById("signup-error");
    try {
      errBox.classList.add("hidden");
      Auth.signup(u, p, k);
      document.getElementById("signup-form").reset();
    } catch (err) {
      errBox.textContent = err.message;
      errBox.classList.remove("hidden");
    }
  });

  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());

  // API Key Modal Buttons
  document.getElementById("key-settings-btn").addEventListener("click", openKeyModal);
  document.getElementById("close-key-btn").addEventListener("click", closeKeyModal);

  document.getElementById("save-key-btn").addEventListener("click", () => {
    const key = document.getElementById("api-key-input").value.trim();
    const statusMsg = document.getElementById("key-status-msg");
    if (!key) {
      statusMsg.textContent = "API Key를 입력하세요.";
      statusMsg.className = "form-status error";
      return;
    }
    saveUserApiKey(currentUser, key);
    currentApiKey = key;
    updateUIState();
    statusMsg.textContent = "✅ API Key가 성공적으로 저장되었습니다!";
    statusMsg.className = "form-status success";
    setTimeout(closeKeyModal, 800);
  });

  document.getElementById("remove-key-btn").addEventListener("click", () => {
    removeUserApiKey(currentUser);
    currentApiKey = null;
    document.getElementById("api-key-input").value = "";
    updateUIState();
    const statusMsg = document.getElementById("key-status-msg");
    statusMsg.textContent = "🗑️ API Key가 삭제되었습니다.";
    statusMsg.className = "form-status error";
    setTimeout(closeKeyModal, 800);
  });

  // Chat Send
  document.getElementById("send-btn").addEventListener("click", handleSend);
  document.getElementById("user-input").addEventListener("keypress", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Init Auth
  Auth.init();
});

