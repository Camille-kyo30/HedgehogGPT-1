const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "1.5",
    author: "void Zaraki",
    countDown: 5,
    role: 0,
    description: "Change the bot prefix in this chat or globally (admin only)",
    category: "system"
  },

  langs: {
    en: {
      reset: "⚡ Reset… the prefix returns to its origin: %1",
      onlyAdmin: "⛔ You are not worthy to alter the global flow.",
      confirmGlobal: "🗡️ React… and decide the fate of all chats.",
      confirmThisThread: "🗡️ React… and shape the destiny of this group.",
      successGlobal: "⚡ The global prefix has been rewritten: %1",
      successThisThread: "🗡️ This chat now obeys a new rule: %1"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) return message.SyntaxError();

    if (args[0] === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix,
      setGlobal: args[1] === "-g"
    };

    if (formSet.setGlobal && role < 2) {
      return message.reply(getLang("onlyAdmin"));
    }

    const confirmMessage = formSet.setGlobal
      ? getLang("confirmGlobal")
      : getLang("confirmThisThread");

    return message.reply(confirmMessage, (err, info) => {
      formSet.messageID = info.messageID;
      global.GoatBot.onReaction.set(info.messageID, formSet);
    });
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author) return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    }

    await threadsData.set(event.threadID, newPrefix, "data.prefix");
    return message.reply(getLang("successThisThread", newPrefix));
  },

  onChat: async function ({ event, message, threadsData, usersData }) {
    const globalPrefix = global.GoatBot.config.prefix;
    const threadPrefix = await threadsData.get(event.threadID, "data.prefix") || globalPrefix;

    if (event.body && event.body.toLowerCase() === "prefix") {
      const userName = await usersData.getName(event.senderID);

      return message.reply(
        `🖤 𝗬𝗼, ${userName}… tu oses me questionner ?\n` +
        `━━━━━━━━━━━━━━━\n` +
        `⚡ 𝗣𝗥𝗘𝗙𝗜𝗫 𝗚𝗟𝗢𝗕𝗔𝗟 : ${globalPrefix}\n` +
        `🗡️ 𝗣𝗥𝗘𝗙𝗜𝗫 𝗚𝗥𝗢𝗨𝗣𝗘 : ${threadPrefix}\n` +
        `━━━━━━━━━━━━━━━\n` +
        `🗡️ Je suis 𝙎𝙖𝙨𝙪𝙠𝙚…\n` +
        `et je ne me bats que pour atteindre mon objectif.\n` +
        `...ne t’interpose pas. ⚡`
      );
    }
  }
};
