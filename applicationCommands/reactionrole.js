import Database from "@replit/database"
const emojiRegex = /^<a?:([a-zA-Z]+):([0-9]+)>$/g
const unicodeEmojiRegex = /^[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}$]/ug
const messageURLRegex = /^https:\/\/discord.com\/channels\/([0-9]+)\/([0-9]+)\/([0-9]+)\/?$/g
export default async function (interaction, options, { api, con }) {
  var db = new Database()
  console.log(options)
  if (options.subCmdInvoked = "set") {
    if (!messageURLRegex.test(options.options.message)) return interaction.respond(4, { content: "Message URL is not valid" })
    if (!emojiRegex.test(options.options.emoji) && !unicodeEmojiRegex.test(options.options.emoji)) return interaction.respond(4, { content: "This is not a valid emoji" })
    var matches = [...options.options.message.matchAll(messageURLRegex)]
    console.log(options.options.message.matchAll(messageURLRegex), options.options.message)
    var guildID = matches[1]
    var channelID = matches[2]
    var msgID = matches[3]
    var emoji = getEmoji(options.options.emoji)
    var guildData = await db.get(interaction.guild_id) || {}
    guildData.reactRoles = guildData.reactRoles || []
    guildData.reactRoles = guildData.reactRoles.filter(a => a.msgID !== options.options.message && a.id !== emoji.id && a.name !== emoji.name)
    guildData.reactRoles.push({
      msgID,
      role: options.options.role.id,
      ...emoji
    })
    db.set(interaction.guild_id, guildData)
    interaction.respond(4, { content: "Done!" })
    api.sendRequest({
      endpoint: `/channels/${channelID}/messages/${msgID}/reactions/${emoji.id ? `${emoji.name}%3A${emoji.id}` : encodeURIComponent(emoji.name)}/@me`,
      method: "PUT"
    })
  }
}
function getEmoji(str) {
  if (!emojiRegex.test(str)) { // It is prob a unicode character
    return {name: str, id: null}
  }
  var results = emojiRegex.exec(str)
  return {name: results[1], id: results[2]}
}