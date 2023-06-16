module.exports = {
	name: 'guildMemberRemove',
	run: async(client, member) => {

		const embed = new client.embed()
		.setTitle('<:leave:976262780204224532> __User Left__')
		.setDescription(`<:RedArrow:976262764232314910> • ${member.user.tag}`)
		.setThumbnail(member.user.displayAvatarURL({dynamic: true}))
		.setFooter({
			text: `We now have ${member.guild.members.cache.size} members`,
			iconURL: member.guild.iconURL({dynamic: true})
		})
		.setColor('Red')

		const ch = await member.guild.channels.cache.get('962857961296916520')
		ch.send({
			embeds: [embed]
		})
	}
}