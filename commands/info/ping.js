module.exports = {
  name: "ping",
  description: "Sends bot latency",
  run: async(client, i) => {
  i.reply(`${client.ws.ping} ms`)
  }
}
