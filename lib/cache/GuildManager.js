import APIManager from "../APIManager"
import GatewayConnection from "../GatewayConnection"
import Cache from "./Cache"

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
        var guild = data;
        this.items.set(guild.id, guild)
      })
      con.on("GUILD_UPDATE", data => {
        var guild = data
        this.items.set(guild.id, guild)
      })
      con.on("GUILD_DELETE", data => {
        this.items.delete(data.id)
      })
    }
  }
  async fetchItem(id) {
    return await (await this.api.sendRequest({
      endpoint: `/guilds/${id}`,
      method: "GET"
    })).json()
  }
}