const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "admin",
		version: "2.1",
		author: "Camille 🩵"
		countDown: 5,
		role: 2,
		description: {
			fr: "Gestion des admins version Blue Lock"
		},
		category: "box chat"
	},

	langs: {
		fr: {
			added:
`⚽✨ [POWER UP ACTIVÉ] ✨⚽

👁️ BOOM !! %1 joueur(s) viennent d’évoluer :

%2

━━━━━━━━━━━━━━━
🔥 Vous êtes maintenant dans l’élite.
Mais ne vous enflammez pas trop…

Ego regarde déjà vos erreurs 😏`,

			alreadyAdmin:
`\n😂 [DÉJÀ TROP FORT]

%1 joueur(s) étaient déjà au sommet :

%2

👁️ Tu voulais améliorer la perfection ?`,

			missingIdAdd:
`⚠️ [BUG DU SYSTÈME]

👁️ Aucun joueur détecté…
Tu recrutes des fantômes maintenant ? 👻`,

			removed:
`💀⚽ [GAME OVER] ⚽💀

BOUM !! %1 joueur(s) viennent de chuter :

%2

━━━━━━━━━━━━━━━
🔥 Trop lents… trop faibles…
Ego ne garde que les monstres.`,

			notAdmin:
`\n🤣 [ILLUSION]

%1 joueur(s) n’ont JAMAIS été dans l’élite :

%2

👁️ Ils rêvaient juste un peu trop.`,

			missingIdRemove:
`⚠️ [CIBLE INTROUVABLE]

👁️ Tu veux éliminer qui exactement ?
Sois précis… ou reste sur le banc 🪑`,

			listAdmin:
`⚽👑 [TOP ÉLITE BLUE LOCK] 👑⚽

👁️ Voici les monstres du terrain :

%1

━━━━━━━━━━━━━━━
🔥 Respecte-les…
ou dépasse-les 😈`
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {

		switch (args[0]) {

			case "add":
			case "-a": {
				if (!args[1])
					return message.reply(getLang("missingIdAdd"));

				let uids = [];

				if (Object.keys(event.mentions).length > 0)
					uids = Object.keys(event.mentions);
				else if (event.messageReply)
					uids.push(event.messageReply.senderID);
				else
					uids = args.filter(arg => !isNaN(arg));

				const notAdminIds = [];
				const adminIds = [];

				for (const uid of uids) {
					if (config.adminBot.includes(uid))
						adminIds.push(uid);
					else
						notAdminIds.push(uid);
				}

				config.adminBot.push(...notAdminIds);

				const getNames = await Promise.all(
					uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
				);

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				return message.reply(
					(notAdminIds.length > 0
						? getLang("added", notAdminIds.length,
							getNames.map(({ uid, name }) => `👤 ${name} (${uid})`).join("\n"))
						: "") +
					(adminIds.length > 0
						? getLang("alreadyAdmin", adminIds.length,
							adminIds.map(uid => `• ${uid}`).join("\n"))
						: "")
				);
			}

			case "remove":
			case "-r": {
				if (!args[1])
					return message.reply(getLang("missingIdRemove"));

				let uids = [];

				if (Object.keys(event.mentions).length > 0)
					uids = Object.keys(event.mentions);
				else
					uids = args.filter(arg => !isNaN(arg));

				const notAdminIds = [];
				const adminIds = [];

				for (const uid of uids) {
					if (config.adminBot.includes(uid))
						adminIds.push(uid);
					else
						notAdminIds.push(uid);
				}

				for (const uid of adminIds)
					config.adminBot.splice(config.adminBot.indexOf(uid), 1);

				const getNames = await Promise.all(
					adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
				);

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				return message.reply(
					(adminIds.length > 0
						? getLang("removed", adminIds.length,
							getNames.map(({ uid, name }) => `👤 ${name} (${uid})`).join("\n"))
						: "") +
					(notAdminIds.length > 0
						? getLang("notAdmin", notAdminIds.length,
							notAdminIds.map(uid => `• ${uid}`).join("\n"))
						: "")
				);
			}

			case "list":
			case "-l": {
				const getNames = await Promise.all(
					config.adminBot.map(uid =>
						usersData.getName(uid).then(name => ({ uid, name }))
					)
				);

				return message.reply(
					getLang("listAdmin",
						getNames.map(({ uid, name }) => `👤 ${name} (${uid})`).join("\n")
					)
				);
			}

			default:
				return message.SyntaxError();
		}
	}
};
