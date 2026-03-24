const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "ban",
    version: "2.1",
    author: "Camille 🩵",
    countDown: 5,
    role: 1,
    category: "blue lock"
  },

  langs: {
    fr: {
      notFoundTarget: `⚠️ [ERREUR DE SCOUTING] ⚽

👁️ Aucun joueur sélectionné…
Tu veux bannir qui ? Un fantôme ? 👻

━━━━━━━━━━━━━━━
⚡ Reprends ta sélection, sinon Ego te regardera 😈`,
      cantSelfBan: `🤣 [AUTO-DESTRUCTION REFUSÉE]  

👁️ Tu veux te bannir toi-même ?  
Même Ego pense que c’est trop facile… ⚡`,
      cantBanAdmin: `👑 [CIBLE IMPOSSIBLE]  

👁️ Les administrateurs ne se bannissent pas.  
Tu n’es pas au niveau pour toucher ce joueur 🏆`,
      existedBan: `💀 [DÉJÀ ÉLIMINÉ]  

👁️ Ce joueur est déjà hors du terrain.  
Trop tard… ⚡`,
      bannedSuccess: `🔥 [ÉLIMINATION] ⚽

👁️ %1 vient d’être expulsé du terrain !

━━━━━━━━━━━━━━━
💀 Trop faible  
⚡ Trop lent  
😈 Pas assez dangereux  

Ego valide la décision`,
      noReason: `🤷 [RAISON INEXISTANTE]  

👁️ Aucun motif… tu bannis juste parce que tu peux ? 😏`,
      unbanSuccess: `🟢 [RETOUR DANS LE JEU] ⚽  

👁️ %1 revient sur le terrain.  
Mais attention… tu viens peut-être de libérer un monstre 😈`,
      notFoundTargetUnban: `⚠️ [ÉCHEC DE RÉANIMATION]  

👁️ Aucun joueur trouvé…  
Même Ego ne peut sauver un joueur inexistant 💀`,
      userNotBanned: `😂 [BUG DU SYSTÈME]  

👁️ %1 n’a jamais été banni.  
Tu bannis dans ta tête ou quoi ? 🤨`,
      noData: `📑 [VIDE]  

👁️ Aucun joueur éliminé.  
Le terrain est trop propre… pour l’instant ⚡`,
      needAdmin: `⚠️ [PERMISSION REQUISE]  

👁️ Le bot n’est pas assez puissant.  
Donne-moi le pouvoir… et je ferai le nettoyage 🏆`,
      listBanned: `⚽👑 [LISTE DES ÉLIMINÉS] 👑⚽  

👁️ Voici les joueurs hors du terrain :

%1

━━━━━━━━━━━━━━━
💀 Le terrain se vide…  
Mais les meilleurs arrivent toujours 😈`,
      content: `%1. ⚽ %2 (%3)
💬 Raison : %4
🕒 Exclusion : %5

━━━━━━━━━━━━━━━`,
      needAdminToKick: `⚠️ [BUG CRITIQUE]  

👁️ %1 est banni…  
Mais je ne peux pas l’expulser.  
Donne-moi le pouvoir… ou accepte le chaos ⚡`,
      bannedKick: `💀⚽ [AUTO-KICK ACTIVÉ]  

👁️ %1 (%2)  
💬 Raison : %3  
🕒 %4

Le système ne tolère pas les faibles.  

━━━━━━━━━━━━━━━
⚡ Expulsé automatiquement`
    }
  },

  onStart: async function ({ message, event, args, threadsData, getLang, usersData, api }) {
    const dataBanned = await threadsData.get(event.threadID, 'data.banned_ban', []);
    const { senderID } = event;
    let target;
    let reason;

    // UNBAN
    if (args[0] === "unban") {
      if (!isNaN(args[1])) target = args[1];
      else if (args[1]?.startsWith("https")) target = await findUid(args[1]);
      else if (event.mentions) target = Object.keys(event.mentions)[0];
      else return message.reply(getLang("notFoundTargetUnban"));

      const index = dataBanned.findIndex(u => u.id == target);
      if (index === -1) return message.reply(getLang("userNotBanned"));

      dataBanned.splice(index, 1);
      await threadsData.set(event.threadID, dataBanned, 'data.banned_ban');

      const name = await usersData.getName(target);
      return message.reply(getLang("unbanSuccess", name));
    }

    // LIST
    if (args[0] === "list") {
      if (!dataBanned.length) return message.reply(getLang("noData"));

      let msg = "";
      for (let i = 0; i < dataBanned.length; i++) {
        const u = dataBanned[i];
        const name = await usersData.getName(u.id);
        msg += `🟦 #${i + 1} ⚽ ${name} (${u.id})\n💬 ${u.reason}\n🕒 ${u.time}\n\n`;
      }
      return message.reply(getLang("listBanned", msg));
    }

    // TARGET
    if (event.messageReply?.senderID) target = event.messageReply.senderID;
    else if (event.mentions) target = Object.keys(event.mentions)[0];
    else if (!isNaN(args[0])) target = args[0];
    else if (args[0]?.startsWith("https")) target = await findUid(args[0]);

    reason = args.slice(1).join(" ");

    if (!target) return message.reply(getLang("notFoundTarget"));
    if (target == senderID) return message.reply(getLang("cantSelfBan"));

    const threadData = await threadsData.get(event.threadID);
    if (threadData.adminIDs.includes(target)) return message.reply(getLang("cantBanAdmin"));

    if (dataBanned.find(u => u.id == target)) return message.reply(getLang("existedBan"));

    const name = await usersData.getName(target);
    const time = moment().tz("Africa/Douala").format("HH:mm:ss DD/MM/YYYY");

    const data = {
      id: target,
      reason: reason || getLang("noReason"),
      time
    };

    dataBanned.push(data);
    await threadsData.set(event.threadID, dataBanned, 'data.banned_ban');

    message.reply(getLang("bannedSuccess", name), () => {
      if (threadData.adminIDs.includes(api.getCurrentUserID())) {
        api.removeUserFromGroup(target, event.threadID);
      } else {
        message.reply(getLang("needAdmin"));
      }
    });
  }
};
