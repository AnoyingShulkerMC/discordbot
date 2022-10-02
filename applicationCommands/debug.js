export default async function (interaction, { options }, context) {
  interaction.respond(4, {
    content: eval(options.statement)
  })
}