const schema = require('../../models/ticket-guild')
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
	name: 'ticket-setup',
	description: 'Setup ticket panel',
	default_member_permissions: PermissionFlagsBits.ManageGuild,
	options: [
	{
		name: 'channel',
		description: 'Set ticket panel channel',
		type: type.Channel,
		channelTypes: [type.GuildText]
	},
	{
		name: 'category',
		description: 'Set category for the tickets',
		type: type.Channel,
		channelTypes: [type.GuildCategory]
	}
		],
	run: async(client, i) => {
		const channel = i.options.getChannel('channel') || i.channel;
		const parent = i.options.getChannel('category').id;

		let db = await schema.findOne({
			guild: i.guild.id,
			user: i.user.id
		})

		if(!db) db = await schema.create({
			guild: i.guild.id,
			user: i.user.id
		})

		const em = new client.embed()
		.setTitle('Ticket Panel')
		.setDescription('To open a ticket, click the select menu below. These can be used for reporting a hacker or bug, getting help on questions, or a direct issue to our staff team. Please do not abuse this system, or else it can result in a ban fromthe server and maybe even in the realms!')
		.setColor('#2f3136')
		.setThumbnail(client.user.displayAvatarURL({dynamic: true}))

		const menu = new client.row()
		.addComponents(
			new client.menu()
			.setCustomId('tc-menu')
			.setPlaceholder('Open a ticket')
			.addOptions([{
				label: 'Realm',
				value: 'tc-realm',
				emoji: '<:portal:1117263906402992168>'
			},
			{
				label: 'Donations',
				value: 'tc-donate',
				emoji: '<:money:1117261625221709845>'
			},
			{
				label: 'Partnership',
				value: 'tc-partner',
				emoji: '🤝'
			}
			])
			)

	i.reply({
		content: `Ticket panel was successfully sent! Check out ${channel}`,
		ephemeral: true
	})

	db.category = parent;
	db.channel = channel.id;
	await db.save()

	channel.send({
		embeds: [em],
		components: [menu]
	})
	}
}