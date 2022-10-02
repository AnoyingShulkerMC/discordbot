import APIManager from "../APIManager.js"
import GatewayConnection from "../GatewayConnection.js"
import Cache from "./Cache.js"
import GuildChannelManager from "./GuildChannelManager.js"

export default class GuildManager extends Cache {
  /**
   * 
   * @param {GatewayConnection} con
   * @param {APIManager} api
   */
  constructor(con, api) {
    super()
    this.con = con
    this.api = api
    if (con.intents.includes(GatewayConnection.INTENT_FLAGS.GUILDS)) {
      con.on("GUILD_CREATE", data => {
        var guild = Guild(data, this.con, this.api);
        this.items.set(guild.id, guild)
      })
      con.on("GUILD_UPDATE", data => {
        var guild = Guild(data, this.con, this.api);
        this.items.set(guild.id, guild)
      })
      con.on("GUILD_DELETE", data => {
        this.items.delete(data.id)
      })
    }
  }
  async fetchItem(id) {
    return Guild(await (await this.api.sendRequest({
      endpoint: `/guilds/${id}`,
      method: "GET"
    })).json(), this.con, this.api)
  }
}
function Guild(data, con, api) {
  var guild = data
  data.channels = new GuildChannelManager(con, api, data.id)
  return guild
}