import APIManager from "../APIManager"
import GatewayConnection from "../GatewayConnection"
import Cache from "./Cache"

export default class ChannelManager extends Cache {
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
    con.on("CHANNEL_CREATE", data => {
      this.items.set(data.id, data)
    })
    con.on("CHANNEL_UPDATE", data => {
      this.items.set(data.id, data)
    })
    con.on("CHANNEL_DELETE", data => {
      this.items.delete(data.id)
    })
  }
  async fetchItem(id) {
    /** @type {Array} */
    var channels = await (await this.api.sendRequest({
      endpoint: `/guilds/${guild_id}/channels`,
      method: "GET"
    })).json()
    for (let channel of channels) {
      this.set(channel.id, channel)
    }
    var retValue = channels.find(v => v.id == id)
    if (retValue == undefined) throw new Error("The channel does not exist")
    return retValue
  }
  /**
   * Adds a channel
   * @param {AddChannelParams} channel
   */
  async add(options) {
    var channel = await (await this.api.sendRequest({
      endpoint: `/guilds/${guild_id}/channels`,
      method: "POST",
      payload: JSON.stringify(options)
    })).json()
    this.items.set(channel.id, channel)
    return channel
  }
  async delete(id) {
    return await this.api.sendRequest({
      endpoint: `/channels/${id}`,
      method: "DELETE"
    })
  }
  async set(id, params) {
    return await this.api.sendRequest({
      endpoint: `/channels/${id}`,
      method: "PATCH",
      payload: JSON.stringify(params)
    })
  } 
}
/**
 * @typedef {Object} AddChannelParams
 * @property {string} name The Name of the channel
 * @property {number} type The type of channel
 * @property {string} topic The topic of the channel
 * @property {number} bitrate For voice channels, the bitrate of the channel (min 8000; max 128K for Boost lvl 1, 256K for lvl 2, 384K for lvl 3, 64K for stage channels.)
 * @property {number} user_limit The user limit of the voice channel
 * @property {number} rate_limit_per_user Channel slowmode (0-216K)
 * @property {number} position The position of the channel
 * @property {PermissionOverwrite} permission_overwrites Ther permission overwrites of the channel.
 * @property {string} parent_id The category the channel falls under
 * @property {boolean} nsfw Whether the channel is NSFW
 * @property {?string} rtc_region The voice region of the voice channel. Null = automatic
 * 
 */
/**
 * @typedef {Object} PermissionOverwrite
 * @property {string} id Role or user id
 * @property {number} type The type of the overwrite (0 for role and 1 for user)
 * @property {string} allow The permissions to allow
 * @property {string} deny The permissions to deny
 */