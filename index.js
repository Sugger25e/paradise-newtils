require('dotenv').config()
const { Client, GatewayIntentBits, Collection } = require('discord.js')

const client = new Client({
	intents: [GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMembers, 
		GatewayIntentBits.GuildMessages ]
})


client.config = require('./config')
client.commands = new Collection()

require("./handlers/event")(client)

client.login(process.env.TOKEN)