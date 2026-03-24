const axios = require("axios");
const { getTime } = global.utils;

module.exports = {
 config: {
  name: "leave",
  version: "3.0",
  author: "Camille 🩵",
  category: "events"
 },

 langs: {
  fr: {
   session1: "matin",
   session2: "midi",
   session3: "après-midi",
   session4: "nuit",
   leaveType1: "a abandonné",
   leaveType2: "a été éliminé",
   defaultLeaveMessage: 
`╔══════════════════╗
     ⚽ BLUE LOCK ⚽
╚══════════════════╝

👁️ {userName} {type}

Tu quittes le terrain "{threadName}"...

Mais dis-moi...
As-tu seulement existé ici ?

━━━━━━━━━━━━━━━
🕒 {time}h • {session}

🔥 Ici, seuls les égoïstes survivent.
💀 Les autres… disparaissent sans bruit.

━━━━━━━━━━━━━━━
🎯 Verdict : REJETÉ
━━━━━━━━━━━━━━━

👁️ Projet dirigé par Ego`
  }
 },

 onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
  if (event.logMessageType == "log:unsubscribe")
   return async function () {

    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    if (!threadData.settings.sendLeaveMessage)
     return;

    const { leftParticipantFbId } = event.logMessageData;
    if (leftParticipantFbId == api.getCurrentUserID())
     return;

    const hours = getTime("HH");
    const threadName = threadData.threadName;
    const userName = await usersData.getName(leftParticipantFbId);

    let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;

    leaveMessage = leaveMessage
     .replace(/\{userName\}/g, userName)
     .replace(/\{type\}/g, leftParticipantFbId == event.author ? getLang("leaveType1") : getLang("leaveType2"))
     .replace(/\{threadName\}|\{boxName\}/g, threadName)
     .replace(/\{time\}/g, hours)
     .replace(/\{session\}/g, hours <= 10 ?
      getLang("session1") :
      hours <= 12 ?
       getLang("session2") :
       hours <= 18 ?
        getLang("session3") :
        getLang("session4")
     );

    const imageURL = "https://i.ibb.co/h1DVQDWt/653715042-1279490000913371-323513778418250008-n-jpg-stp-dst-jpg-s480x480-tt6-nc-cat-108-ccb-1-7-nc.jpg";
    const imageStream = (await axios.get(imageURL, { responseType: "stream" })).data;

    message.send({
      body: leaveMessage,
      attachment: imageStream
    });
   };
 }
};
