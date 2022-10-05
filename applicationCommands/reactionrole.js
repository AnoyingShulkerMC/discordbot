export default async function (interaction, options, { api, con }) {
  console.log(options)
  interaction.respond(4, {content: "test"})
}