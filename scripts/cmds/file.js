const fs = require('fs');

module.exports = {
 config: {
 name: "file",
 aliases: ["file"],
 version: "1.0",
 author: "NZR",
 countDown: 5,
 role: 0,
 description: "extract file",
 category: "owner",
 guide: "{pn} Write a file name"
 },

 onStart: async function ({ message, args, api, event }) {
 const permission = ["61561648169981"];
 if (!permission.includes(event.senderID)) {
 // L'encadrement pour le refus (bien méchant)
 return api.sendMessage(
 "┏━━━━━━━ 🛑 ━━━━━━━┓\n" +
 "       𝗔𝗖𝗖𝗘̀𝗦 𝗥𝗘𝗙𝗨𝗦𝗘́      \n" +
 "┗━━━━━━━ 🛑 ━━━━━━━┛\n\n" +
 "Tchiééé l'enfant de quelqu'un ! ✋🏾\n" +
 "Faut quitter là-bas, ton grade n'est pas arrivé ici pour toucher ce bouton. 🏃🏾‍♂️💨\n\n" +
 "» 𝖲𝗍𝖺𝗍𝗎𝗍 : 𝖯𝖾𝗍𝗂𝗍 𝖬𝗈𝗀𝗈 🤡\n" +
 "» 𝖠𝗎𝗍𝗈𝗋𝗂𝗌𝖺𝗍𝗂𝗈𝗇 : 𝖹𝖾́𝗋𝗈 🚫", 
 event.threadID, event.messageID);
 }

 const fileName = args[0];
 if (!fileName) {
 return api.sendMessage(
 "╭─────────────╮\n" +
 "    ⚠️  𝗘𝗥𝗥𝗘𝗨𝗥  ⚠️\n" +
 "╰─────────────╯\n" +
 "Tu veux quoi même ? Mets le nom du fichier sinon on quitte ici ! 🙄", 
 event.threadID, event.messageID);
 }

 const filePath = __dirname + `/${fileName}.js`;
 if (!fs.existsSync(filePath)) {
 return api.sendMessage(
 "╔═════════════════╗\n" +
 "     𝖥𝖨𝖢𝖧𝖨𝖤𝖱 𝖨𝖭𝖳𝖱𝖮𝖴𝖵𝖠𝖡𝖫𝖤    \n" +
 "╚═════════════════╝\n" +
 "Ahiii ! Le fichier là n'existe que dans tes rêves ! 😲 Faut pas me bluffer.", 
 event.threadID, event.messageID);
 }

 const fileContent = fs.readFileSync(filePath, 'utf8');
 api.sendMessage(
 "╔╦═════════════════╦╗\n" +
 "   📄 𝖤𝖷𝖳𝖱𝖠𝖨𝖳 𝖣𝖴 𝖢𝖮𝖣𝖤    \n" +
 "╚╩═════════════════╩╝\n\n" +
 fileContent, 
 event.threadID);
 }
};
