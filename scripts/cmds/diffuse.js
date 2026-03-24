module.exports = {
  config: {
    name: "diffuse",
    version: "BLUE LOCK ⚽",
    author: "Camille 💙",
    shortDescription: "Diffusion globale style Blue Lock",
    longDescription: "Diffuse un message avec une énergie de match intense dans tous les groupes.",
    category: "admin",
    guide: "{p}diffuse ton message ici"
  },

  onStart: async function ({ api, event, args, threadsData }) {
    const adminUID = "61582667524413";

    const senderID = event.senderID;

    if (senderID !== adminUID) {
      return api.sendMessage("🚫 Tu n’as pas le niveau pour lancer ce match.", event.threadID);
    }

    const message = args.join(" ");
    if (!message) {
      return api.sendMessage("⚽ Entre un message… le match ne peut pas commencer sans stratégie.", event.threadID);
    }

    const allThreads = await threadsData.getAll();
    let count = 0;

    // 🎙️ STYLE COMMENTATEUR BLUE LOCK
    const messageToSend = `
━━━━━━━━━━━━━━━━━━━━━━━
⚽ MATCH GLOBAL DÉCLENCHÉ ⚽
━━━━━━━━━━━━━━━━━━━━━━━

🎙️ "Mesdames et messieurs… le jeu commence !"

🔥 MESSAGE DU MAÎTRE DU TERRAIN :
${message}

💀 "Sur ce terrain… seuls les ego survivent."

━━━━━━━━━━━━━━━━━━━━━━━
⚡ Chaque groupe devient un terrain de jeu.
⚡ Chaque message est une action décisive.
⚡ L’ego… est le seul vrai moteur.
━━━━━━━━━━━━━━━━━━━━━━━
`;

    for (const thread of allThreads) {
      if (thread.isGroup) {
        try {
          await api.sendMessage(messageToSend, thread.threadID);
          count++;

          // 🎬 effet dramatique
          await new Promise(res => setTimeout(res, 300));

        } catch (e) {
          console.log(`❌ Erreur sur le terrain ${thread.threadID}`);
        }
      }
    }

    return api.sendMessage(
      `🏆 FIN DU MATCH\n⚽ Groupes touchés : ${count}\n💀 Le monde a entendu ton ego.`,
      event.threadID
    );
  }
};
