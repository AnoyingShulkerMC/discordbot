import APIManager from "../APIManager.js"
import GatewayConnection from "../GatewayConnection.js"
import Cache from "./Cache.js"

export default class RoleManager extends Cache {
  /**
   * 
   * @param {GatewayConnection} con
   * @param {APIManager} api
   * @param {string} guild_id
   */
  constructor(con, api, guild_id) {
    super()
    this.con = con
    this.api = api
    this.guild_id = guild_id
    con.on("ROLE_CREATE", data => {
      if (data.guild_id !== this.guild_id) return
      this.set(data.role.id, data.role)
    })
    con.on("ROLE_UPDATE", data => {
      if (data.guild_id !== this.guild_id) return
      this.set(data.role.id, data.role)
    })
    con.on("ROLE_DELETE", data => {
      if (data.guild_id !== this.guild_id) return
      this.delete(data,role_id)
    })
  }
  async fetchItem(id) {
    var roles = await (await this.api.sendRequest({
      endpoint: `/guilds/${this.guild_id}/roles`,
      method: "GET"
    }))
    for (const i in roles) {
      this.items.set(i.id, i)
    }
    var retValue = roles.find(a => a.id == id)
    if (retValue == undefined) throw new Error(`Role "${id}" does not exist`)
    return retValue
  }
  /**
   * 
   * @param {AddRoleParams} options
   */
  async add(options) {
    return await (await this.api.sendRequest({
      endpoint: `/guilds/${this.guild_id}/roles`,
      method: "POST",
      payload: JSON.stringify(options)
    })).json()
  }
  /**
   * 
   * @param {sstring} id
   */
  async delete(id) {
    return await this.api.sendRequest({
      endpoint: `/guilds/${this.guild_id}/roles/${id}`,
      method: "DELETE"
    })
  }
  /**
   * 
   * @param {string} id
   * @param {AddRoleParams} options
   */
  async set(id, options) {
    return await this.api.sendRequest({
      endpoint: `/guilds/${this.guild_id}/roles/${id}`,
      method: "PATCH",
      payload: JSON.stringify(options)
    })
  }
}
/**
 * @typedef {Object} AddRoleParams
 * @property {string} name name of the role
 * @property {string} permissions The permissions of the role
 * @property {number} color The hex color value
 * @property {boolean} hoist Whether to hoist the role.
 * @property {string} icon The image of the role
 * @property {stirng} emoji The unicode emoji of the role
 * @property {boolean} mentionable Whether the role can be metioned
 */