import GatewayConnection from "./GatewayConnection"
import events from "node:events"
import opus from "opusscript"
import dgram from "node:dgram"
import WebSocket from "./ws/WebsocketClient.js"


const OPCODES = {
  IDENTIFY: 0,
  SELECT_PROTOCOL: 1,
  READY: 2,
  HEARTBEAT: 3,
  SESSION_DESC: 4,
  SPEAING: 5,
  HEARTBEAT_ACK: 6,
  RESUME: 7,
  HELLO: 8,
  RESUMED: 9,
  CLIENT_DISCONNECT: 13
}
export default class VoiceConnection extends EventEmitter {
  /** @type {dgram.Socket} */
  udpConnection = null
  /** @type {WebSocket} */
  wsConnection = null
  heartbeatInterval = null
  heartBeatNonce = null
  heartbeatAckd = false
  resuming = false
  token = ""
  endpoint = ""
  ssrc = 0

  debug(e) {
    this.emit("debug", e)
  }
  setHeartbeatInterval(int) {
    clearInterval(this.heartbeatInterval)
    this.heartbeatInterval = setInterval(() => {
      if()
      this.heartBeatNonce = Date.now()
      this.send({
        op: OPCODES.HEARTBEAT,
        d: this.heartBeatNonce
      })
    }, int)
  }
  sendWS(msg) {
    this.wsConnection.send(JSON.stringify(msg))
  }
  /**
   * 
   * @param {GatewayConnection} con
   * @param {string} voice_channel_id
   */
  constructor(con, voice_channel_id, guild_id) {
    this.gatewayCon = con
    this.guild_id = guild_id
    this.channel_id = voice_channel_id
  }
  disconnect({ code = false, reconnect = false, resume = false } = {}) {
    this.wsConnection.close(code)
    this.resuming = resume
    if (reconnect) {
      this.connect()

    }
  }
  async connect({ self_mute = false, self_deaf = false }) {
    if (!this.resuming) {
      this.gatewayCon.sendMessage({
        op: 4,
        d: {
          guild_id: this.guild_id,
          channel_id: this.channel_id,
          self_mute,
          self_deaf
        }
      })
      var server = await onceCondition(this.gatewayCon, "VOICE_SERVER_UPDATE", e => e.guild_id == this.guild_id)
      this.debug(`[SERVER_UPDATE] Recieved Voice Server Update`)
      this.endpoint = server.endpoint
      this.token = server.token
    }
    this.debug("Connecting to: " + this.endpoint)
    this.wsConnection = new WebSocket(`wss://${this.endpoint}`)
    this.wsConnection.on("message", m => {
      this.debug(`[WS] >> ${m}`)
      var msg = JSON.parse(m.toString())
      switch (msg.op) {
        case OPCODES.READY:
          
      }
    })
  }
}

/**
 * 
 * @param {events.EventEmitter} emitter
 * @param {string} name
 * @param {Function} callback
 * @param {Function} condition
 */
async function onceCondition(emitter, name, condition) {
  var cont = new AbortController()
  for await (const e of events.on(emitter, name, {signal:cont.signal})) {
    if (condition(e)) {
      cont.abort()
      return e
    }
  }
}
async function filterListeners(listener, condition) {
  return e => {
    if(condition(e)) listener(e)
  }
}