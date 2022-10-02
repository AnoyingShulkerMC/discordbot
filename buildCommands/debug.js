import APIManager from "../lib/APIManager.js"
import utils from "node:util"
const token = process.env.TOKEN
var api = new APIManager(token)
api.sendRequest({
  method: "POST",
  endpoint: "/applications/754203081838821376/guilds/713917232580919376/commands",
  payload: JSON.stringify({
    name: "debug",
    description: "Debugs code",
    options: [
      {
        type: 3,
        name: "statement",
        description: "The statement to execute",
        required: true
      }
    ]
  })
})