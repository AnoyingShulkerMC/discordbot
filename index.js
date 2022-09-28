import GatewayConnection from "./lib/GatewayConnection.js"
import APIManager from "./lib/APIManager.js"
import Interaction from "./lib/types/Interaction.js"
import { createWriteStream } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
const token = (await import("./token.js")).default
const api = new APIManager(token)
const con = new GatewayConnection(token, { intents: [GatewayConnection.INTENT_FLAGS.GUILD_MESSAGE_REACTIONS] })
const log = createWriteStream(join(dirname(fileURLToPath(import.meta.url)), `./logs/${Date.now()}.log`))
var componentListeners = []
var modalListeners = []
con.on("INTERACTION_CREATE", async data => {
  var interaction = Interaction(data, { api, con })
  switch (interaction.type) {
    case 2:
      var options = {};
      options = parseCommandOptions(interaction.data.options == undefined ? [] : interaction.data.options, interaction.data.resolved);
      var cmd = await import(`./applicationCommands/${interaction.data.name}.js`)
      cmd.default(interaction, options, { api, con, addComponentListener, addModalListener })
      break;
    case 3:
      
      componentListeners.forEach((h,v) => {
        if (h.message_id == interaction.message.id && h.component_id == interaction.data.custom_id) {
          if (h.ttl !== Infinity) {
            clearTimeout(h.ttlTimeout)
            h.ttlTimeout = setTimeout(() => {
              h.onRemove()
              componentListeners = componentListeners.filter((a) => a.message_id !== h.message_id || a.component_id !== h.component_id)
            }, h.ttl).unref()
          }
          return h.listener(interaction)
        }
      })
      break;
    case 4:
      var options = {}
      options = parseCommandOptions(interaction.data.options == undefined ? [] : interaction.data.options, interaction.data.resolved);
      var cmd = await import(`./autocompleteCommands/${interaction.data.name}.js`)
      cmd.default(interaction, options, { api, con, addComponentListener, addModalListener })
      break;
    case 5:
      modalListeners.forEach(h => {
        if (h.component_id == interaction.data.custom_id) {
          return h.listener(interaction, parseModalValues(interaction.data.components))
        }
      })
      break;
  }
})
function addComponentListener(message_id, component_id, listener, { ttl = 60000, onRemove = () => { } } = {}) {
  var ttlTimeout = null;
  if (ttl !== Infinity)  {
    ttlTimeout = setTimeout(() => {
      onRemove()
      componentListeners = componentListeners.filter((a) => a.message_id !== message_id || a.component_id !== component_id)
    }, ttl).unref()
  }
  componentListeners.push({ message_id, component_id, listener, ttlTimeout, ttl, onRemove })
}
function addModalListener(component_id, listener) {
  modalListeners.push({ component_id, listener })
}
function parseModalValues(components) {
  var options = {}
  components.forEach(r => {
    switch (r.type) {
      case 1:
        options = {...options, ...(parseModalValues(r.components))}
        break;
      case 4:
        options[r.custom_id] = r.value
        break;
    }
  })
  return options
}
function parseCommandOptions(options, resolved) {
  var subCmdInvoked = ""
  var subCmdGroupInvoked = ""
  var options1 = {}
  options.forEach(option => {
    switch (option.type) {
      case 1:
        subCmdInvoked = option.name
        options = parseCommandOptions(option.options).options
        break
      case 2:
        subCmdGroupInvoked = option.name
        var result = parseCommandOptions()
        subCmdInvoked = result.subCmdInvoked
      case 3:
        options1[option.name] = option.value
        break
      case 4:
        options1[option.name] = option.value
        break
      case 5:
        options1[option.name] = option.value
        break
      case 6:
        options1[option.name] = resolved.users[option.value]
        break
      case 7:
        options1[option.name] = resolved.channels[option.value]
        break
      case 8:
        options1[option.name] = resolved.roles[option.value]
        break
      case 9:
        options1[option.name] = resolved.users ? resolved.users[option.value] : resolved.roles[option.value]
        break
      case 10:
        options1[option.name] = option.value
        break
      case 11:
        options1[option.name] = option.value
        break
    }
  })
  return {subCmdInvoked, subCmdGroupInvoked, options: options1}
}
con.on("debug", e => log.write("[GATEWAY] " + e + "\n"))
api.on("debug", e => log.write("[API]     " + e + "\n"))
con.connect()