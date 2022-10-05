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
	await sleep(1000) // Wait for guilds to resolve
	var db = new Database()
	db.set("713917232580919376", JSON.stringify({ reactRoles: [ { msgID: "1023638692268613652", role: "730168714313596929", name: "true", id: "866138928959717377" }] })).then(() => { });
	con.on("MESSAGE_REACTION_ADD", async (react) => {
		var dbEntry = JSON.parse(await db.get(react.guild_id))
		if (dbEntry == null || dbEntry.reactRoles == undefined) return
		var reactRoles = dbEntry.reactRoles
		for (var i of reactRoles) {
			if (react.message_id !== i.msgID) continue
			if (react.emoji.name !== i.name || react.emoji.id !== i.id) return
			var guild = await guilds.get(react.guild_id)
			var role = await guild.roles.get(i.role)
			var member = (await guild.members.get(con.applicationID))
			var highestRole = member.roles.map(a => guild.roles.items.get(a)).sort((a, b) => b.position - a.position)[0]
			if (!(member.permissions & (1 << 28)) || role.position >= highestRole.position) return
			api.sendRequest({
				endpoint: `/guilds/${guild.id}/members/${react.user_id}/roles/${i.role}`,
				method: "DELETE",
				additionalHeaders: {
					"x-audit-log-reason": `Reaction Role for MessageID ${react.message_id}`
				}
			})
		}
	})
	con.on("MESSAGE_REACTION_REMOVE", async (react) => { 
		var dbEntry = JSON.parse(await db.get(react.guild_id))
		if (dbEntry == null || dbEntry.reactRoles == undefined) return
		var reactRoles = dbEntry.reactRoles
		for (var i of reactRoles) {
			if (react.message_id !== i.msgID) continue
			if (react.emoji.name !== i.name || react.emoji.id !== i.id) return
			var guild = await guilds.get(react.guild_id)
			var role = await guild.roles.get(i.role)
			var member = (await guild.members.get(con.applicationID))
			var highestRole = member.roles.map(a => guild.roles.items.get(a)).sort((a, b) => b.position - a.position)[0]
			if (!(member.permissions & (1 << 28)) || role.position >= highestRole.position) return
			api.sendRequest({
				endpoint: `/guilds/${guild.id}/members/${react.user_id}/roles/${i.role}`,
				method: "DELETE",
				additionalHeaders: {
					"x-audit-log-reason": `Reaction Role for MessageID ${react.message_id}`
				}
			})
		}
	})
}
function sleep(mils) {
	return new Promise(resolve => setTimeout(resolve, mils))
}