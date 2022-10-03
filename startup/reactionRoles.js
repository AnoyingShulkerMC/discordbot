import Database from "@replit/database"
import APIManager from "../lib/APIManager.js"
import GuildManager from "../lib/cache/GuildManager.js"
import GatewayConnection from "../lib/GatewayConnection.js"
/**
 * 
 * @param {Object} context
 * @param {GuildManager} context.guilds
 * @param {APIManager} context.api
 * @param {GatewayConnection} context.con
 */
export default async function ({ api, con, guilds }) {
	var db = new Database()
	for (var [item, guild] of guilds.items) {
		var reactRoles = JSON.stringify(db.get(item)).reactRoles || []
		for (i of reactRoles) {
			con.on("MESSAGE_REACTION_ADD", async (react) => {
				if (react.message_id !== i.msg_id) return
				if (react.emoji.name !== i.name || react.emoji.id !== i.id) return
				var role = await guild.roles.get(i.role)

			})
		}
	}
}