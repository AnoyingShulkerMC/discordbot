const emojiRegex = /^<a?:(.+):(\d+)>$/
import isEmoji from "is-emoji"
const messageURLTestRegex = /^https:\/\/discord.com\/channels\/([0-9]+)\/([0-9]+)\/([0-9]+)$/
var messageURLRegex = /https:\/\/discord.com\/channels\/([0-9]+)\/([0-9]+)\/([0-9]+)/
export default async function (interaction, options, { api, con, guilds, database }) {
  messageURLRegex.lastIndex = 0
  console.log(options)
  switch (options.subCmdInvoked) {
    case "set":
      console.log(emojiRegex.test(options.options.emoji))
      if (!messageURLTestRegex.test(options.options.message)) return interaction.respond(4, { content: "Message URL is not valid" })
      if (!emojiRegex.test(options.options.emoji) && !isEmoji(options.options.emoji)) return interaction.respond(4, { content: "This is not a valid emoji" })
      var matches = messageURLRegex.exec(options.options.message)
      console.log(matches, options.options.message)
      var guildID = matches[1]
      if (guildID !== interaction.guild_id) return interaction.respond(4, { content: "The message must be in the same guild." })
      var channelID = matches[2]
      if (!await (await guilds.get(interaction.guild_id)).channels.get(channelID)) return interaction.respond(4, { content: "The channel is nonexistent" })
      var msgID = matches[3]
      var emoji = getEmoji(options.options.emoji)
      var guildData = await database.get(interaction.guild_id) || {}
      guildData.reactRoles = guildData.reactRoles || []
      guildData.reactRoles = guildData.reactRoles.filter(a => a.msgID !== msgID || a.id !== emoji.id || a.name !== emoji.name)
      guildData.reactRoles.push({
        msgID,
        role: options.options.role.id,
        ...emoji
      })
      database.set(interaction.guild_id, guildData)
      interaction.respond(4, { content: "Done!" })
      try {
        await api.sendRequest({
          endpoint: `/channels/${channelID}/messages/${msgID}/reactions/${emoji.id ? `${emoji.name}%3A${emoji.id}` : encodeURIComponent(emoji.name)}/@me`,
          method: "PUT"
        })
      } catch { interaction.createFollowup({ content: "The emoji is not available for me" }) }
      break;
    case "remove":
      if (!messageURLTestRegex.test(options.options.message)) return interaction.respond(4, { content: "Message URL is not valid" })
      if (!emojiRegex.test(options.options.emoji) && !isEmoji(options.options.emoji)) return interaction.respond(4, { content: "This is not a valid emoji" })
      var matches = messageURLRegex.exec(options.options.message)
      var guildID = matches[1]
      if (guildID !== interaction.guild_id) return interaction.respond(4, { content: "The message must be in the same guild." })
      var channelID = matches[2]
      if (!await (await guilds.get(interaction.guild_id)).channels.get(channelID)) return interaction.respond(4, { content: "The channel is nonexistent" })
      var msgID = matches[3]
      var guildData = await database.get(interaction.guild_id) || {}
      guildData.reactRoles = guildData.reactRoles || []
      var emoji = getEmoji(options.options.emoji)
      guildData.reactRoles = guildData.reactRoles.filter(a => a.msgID !== msgID || a.id !== emoji.id || a.name !== emoji.name)
      database.set(interaction.guild_id, guildData)
      interaction.respond(4, { content: "Done!" })
      try {
        console.log("requesting")
        await api.sendRequest({
          endpoint: `/channels/${channelID}/messages/${msgID}/reactions/${emoji.id ? `${emoji.name}%3A${emoji.id}` : encodeURIComponent(emoji.name)}/@me`,
          method: "DELETE"
        })
      } catch { }
      break;
    case "reassign":
      if (!messageURLTestRegex.test(options.options.message)) return interaction.respond(4, { content: "Message URL is not valid" })
      if (!emojiRegex.test(options.options.emoji) && !isEmoji(options.options.emoji)) return interaction.respond(4, { content: "This is not a valid emoji" })
      var matches = messageURLRegex.exec(options.options.message)
      var guildID = matches[1]
      if (guildID !== interaction.guild_id) return interaction.respond(4, { content: "The message must be in the same guild." })
      var channelID = matches[2]
      if (!await (await guilds.get(interaction.guild_id)).channels.get(channelID)) return interaction.respond(4, { content: "The channel is nonexistent" })
      var msgID = matches[3]
      var emoji = getEmoji(options.options.emoji)
      var guildData = await database.get(interaction.guild_id) || {}
      var reactions = await (await api.sendRequest({
        endpoint: `/channels/${channelID}/messages/${msgID}/reactions/${emoji.id ? `${emoji.name}%3A${emoji.id}` : encodeURIComponent(emoji.name)}?limit=100`,
        method: "GET"
      })).json()
      var reactionRoles = guildData.reactRoles || []
      var reactionRole = reactionRoles.find(a => a.msgID == msgID && a.id == emoji.id && a.name == emoji.name)
      if(reactionRole == undefined) return interaction.respond("That reactionRole does not exist")
      for (var user of reactions) {
        if(user.id == con.applicationID) continue 
        api.sendRequest({
          endpoint: `/guilds/${guildID}/members/${user.id}/roles/${reactionRole.role}`,
          method: "PUT",
          additionalHeaders: {
            "x-audit-log-reason": `Reaction Role for MessageID ${msgID}`
          }
        })
      }
      interaction.respond(4, {content: "Done!"})
  }
}
function getEmoji(str) {
  if (!emojiRegex.test(str)) { // It is prob a unicode character
    return {name: str, id: null}
  }
  var results = emojiRegex.exec(str)
  return {name: results[1], id: results[2]}
}