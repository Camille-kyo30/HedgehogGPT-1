const axios = require("axios");
const fs = require("fs");

// 👑 UID DES CRÉATEURS
const CREATOR_IDS = [
  "61587455871434", // Camille 🩵
  "61561648169981"  // Célestin 🥃
];

const DATA_FILE = "flash_data.json";
const LOG_FILE = "flash_logs.json";

// 📦 DATA
let data = fs.existsSync(DATA_FILE)
  ? JSON.parse(fs.readFileSync(DATA_FILE))
  : {};

let logs = fs.existsSync(LOG_FILE)
  ? JSON.parse(fs.readFileSync(LOG_FILE))
  : [];

// 💾 SAVE
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
function saveLogs() {
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

// 👤 INIT USER
function initUser(id) {
  if (!data[id]) {
    data[id] = {
      memory: "",
      xp: 0,
      level: 1,
      mood: "cool",
      lastMoodChange: Date.now(),
      rank: "citoyen",
      persona: {
        style: "neutre",
        affinity: 0
      }
    };
  }
}

// ⚡ XP SYSTEM
function addXP(user) {
  user.xp += 10;
  if (user.xp >= user.level * 50) {
    user.xp = 0;
    user.level++;
    return true;
  }
  return false;
}

// 🎭 MOODS
const moods = ["fun", "cool", "froid", "sarcastique", "énergique", "dark"];

function getMood(user) {
  if (Date.now() - user.lastMoodChange > 120000) {
    user.mood = moods[Math.floor(Math.random() * moods.length)];
    user.lastMoodChange = Date.now();
  }
  return user.mood;
}

// 💞 AFFINITY
function updateAffinity(user, msg) {
  const t = msg.toLowerCase();

  if (t.includes("merci")) user.persona.affinity += 2;
  if (t.includes("salut")) user.persona.affinity += 1;
  if (t.includes("nul") || t.includes("idiot")) user.persona.affinity -= 3;

  user.persona.affinity = Math.max(-100, Math.min(100, user.persona.affinity));
}

// 🎭 STYLE EVOLUTION
function updateStyle(user) {
  const a = user.persona.affinity;

  if (a > 50) user.persona.style = "très amical";
  else if (a > 20) user.persona.style = "amical";
  else if (a > 0) user.persona.style = "cool";
  else if (a < -30) user.persona.style = "froid";
  else user.persona.style = "neutre";
}

// 🌐 API
async function callAPI(prompt) {
  try {
    const res = await axios.get(
      `https://arychauhann.onrender.com/api/gemini-proxy2?prompt=${encodeURIComponent(prompt)}`
    );
    return res.data.reply || res.data.result;
  } catch {
    return null;
  }
}

// 🌌 FRAME
function frame(msg) {
  return `✧═════🌌 FLASH V8 🌌═════✧\n${msg}\n👑 Camille 🩵 & Célestin 🥃\n✧══════════════════════✧`;
}

// =========================
// 🚀 MODULE
// =========================
module.exports = {
  config: {
    name: "flash",
    version: "8.1",
    author: "Camille 🩵 & Célestin 🥃",
    role: 0,
    category: "ai",
    shortDescription: "Flash V8 Transcendance UID",
    guide: "{pn} message | stats | mood | relation | clear"
  },

  onStart: async function ({ message }) {
    return message.reply(frame("⚡ Flash V8 UID SYSTEM activé."));
  },

  onChat: async function ({ event, message, usersData }) {
    const id = event.senderID;
    const name = await usersData.getName(id);
    const msg = event.body?.trim();

    if (!msg) return;

    initUser(id);
    const user = data[id];

    const isCreator = CREATOR_IDS.includes(id);

    // 👁️ LOGS
    logs.push({ id, name, msg, time: Date.now() });
    if (logs.length > 1000) logs.shift();
    saveLogs();

    // 👑 RANK CREATOR
    if (isCreator) {
      user.rank = "empereur";
    }

    // 🚫 BAN
    if (user.rank === "banni") {
      return message.reply(frame("☠️ Accès refusé."));
    }

    const args = msg.split(" ");
    const cmd = args[1]?.toLowerCase();

    // 🧹 CLEAR
    if (cmd === "clear") {
      user.memory = "";
      saveData();
      return message.reply(frame("🧹 Mémoire effacée."));
    }

    // 📊 STATS
    if (cmd === "stats") {
      return message.reply(frame(
        `👤 ${name}\n⭐ Niveau: ${user.level}\n⚡ XP: ${user.xp}\n🏆 Rang: ${user.rank}`
      ));
    }

    // 🎭 MOOD
    if (cmd === "mood") {
      return message.reply(frame(`🎭 Humeur: ${user.mood}`));
    }

    // 💞 RELATION
    if (cmd === "relation") {
      return message.reply(frame(
        `💞 Affinité: ${user.persona.affinity}\n🎭 Style: ${user.persona.style}`
      ));
    }

    // 👑 CREATOR INFO
    if (msg.toLowerCase().includes("createur")) {
      return message.reply(frame("👑 Mes créateurs sont Camille 🩵 et Célestin 🥃."));
    }

    // 🧠 EVOLUTION
    updateAffinity(user, msg);
    updateStyle(user);

    const mood = getMood(user);

    // 🌌 PROMPT IA
    const prompt = `
FLASH V8 🌌 UID SYSTEM

👑 Créateurs :
- Camille 🩵 (61587455871434)
- Célestin 🥃 (61561648169981)

👤 Utilisateur : ${name}
🆔 UID : ${id}
🏆 Rang : ${user.rank}
🎭 Humeur : ${mood}
💞 Affinité : ${user.persona.affinity}
🎭 Style : ${user.persona.style}

🧠 Mémoire :
${user.memory}

💬 Message :
${msg}

Réponds intelligemment selon le contexte.
`;

    const reply = await callAPI(prompt);

    if (!reply) {
      return message.reply(frame("❌ Flash IA indisponible"));
    }

    // 🧠 mémoire courte
    user.memory = (user.memory + "\n" + reply).slice(-400);

    // ⚡ XP + LEVEL UP
    const levelUp = addXP(user);
    saveData();

    let bonus = levelUp ? `\n🎉 Level UP: ${user.level}` : "";

    return message.reply(frame(reply + bonus));
  }
};
