const schema = require('../../models/realm-warn')
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
name: 'realm',
description: 'Realm mod commands',
default_member_permissions: PermissionFlagsBits.ManageGuild,
options: [{
        name: 'warn',
        description: 'Warn a user for a realm issue',
        type: type.SubcommandGroup,
        options: [
        {
        	name: 'add',
        	description: 'Add warn to a user',
        	type: type.Subcommand,
        	options: [
        		{
                name: 'gamertag',
                description: "Gamertag of warned user",
                type: type.String,
                required: true
            },
            {
                name: 'reason',
                description: 'Reason of the warn',
                type: type.String,
                required: true
            },
            {
                name: 'proof',
                description: 'Video clip of the proof',
                type: type.String,
                required: true
            }
        	]
        },
        {
        	name: 'remove',
        	description: 'Remove warn from user',
        	type: type.Subcommand,
        	options: [
        	{
        		name: 'gamertag',
        		description: 'Select gamertag to remove',
        		type: type.String,
        		required: true,
        		autocomplete: true
        	}
        		]
        },
        {
        	name: 'check',
        	description: "Check user's warns",
        	type: type.Subcommand,
        	options: [
        	{
        		name: 'gamertag',
        		name: 'gamertag',
        		description: 'Select gamertag to remove',
        		type: type.String,
        		required: true,
        		autocomplete: true
        	}
        		]
        	}
        ]
    }
 ],
autocomplete: async(client, i) => {
	const focusedValue = i.options.getFocused();
		
		const users = await schema.find({})
  
  const gt = users.map(db => db.gamertag);
  const filtered = gt.filter(choice => choice.startsWith(focusedValue));
		await i.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
},
run: async(client, i) => {
	let subg = i.options.getSubcommandGroup()
	let sub = i.options.getSubcommand()

	if(subg === 'warn') {
	if(sub === 'add') {
	const gt = i.options.getString('gamertag')
	const reason = i.options.getString('reason')
	const proof = i.options.getString('proof')
	
	if(!proof.startsWith('https://')) return client.error('Video clip must be valid URL.', i, true)

	let dbr = await schema.findOne({
		gamertag: gt
	})

	if(!dbr) dbr = await schema.create({
		gamertag: gt
	})

		await dbr.save()

		if(dbr.warns.length >= 3) return client.error(`**${gt}** already reached maximum warns. Kindly do an action.`, i, true)

		const obj = {
			warned_by: i.user.tag,
			reason: reason,
			proof: proof,
			date: `<t:${Math.floor(Date.now() / 1000)}:f>`
		}

		dbr.warns.push(obj)
		await dbr.save()

	const em = new client.embed()
	.setTitle('Realm Warn')
	.setDescription(`**Gamertag:** ${gt}\n**Reason:** ${reason}\n**Issued by:** ${i.user.tag}\n**Proof:** [Click Here](${proof})`)
	.setColor('Red')
	.setFooter({
		text: `Warn Count: ${dbr.warns.length}/3`
	})
	.setTimestamp()

	const ch = await i.guild.channels.cache.get('962861991100284968')

	ch.send({
		content: `${dbr.warns.length >= 3 ? '<@& 965043865272860762>' : ' '}`,
		embeds: [em]
	})

	client.notif(`**${gt}** was successfully warned! They now have ${dbr.warns.length}/3 warns.`, i, true)
	}

	if(sub === 'remove') {
	const gt = i.options.getString('gamertag')

		let dbr = await schema.findOne({
		gamertag: gt
	})

	if(!dbr) return client.notif(`**${gt}** have 0 warns. You can't unwarn them.`, i, true)

	if(!dbr.warns.length) return client.error(`**${gt}** have 0 warns. You can't unwarn them.`, i, true)
	dbr.warns.pop()
	await dbr.save()

	client.notif(`**${gt}**'s warn has been removed. They now have ${dbr.warns.length}/3 warns.`, i, true)
	if(!dbr.warns.length) await schema.findOneAndDelete({
		gamertag: gt 
		})
	}

	if(sub === 'check') {
		const gt = i.options.getString('gamertag')

		let dbr = await schema.findOne({
		gamertag: gt
	})

	if(!dbr || !dbr?.warns.length) {
		await schema.findOneAndDelete({
		gamertag: gt 
		})
		return client.notif(`**${gt}** have 0 warns.`, i, true)
	}


	const em = new client.embed()
	.setTitle(`${gt}'s Warns`)
	.setDescription(dbr.warns.map((w) => {
		return `**Reason:** ${w.reason}\n**Issued by:** ${w.warned_by}\n**Proof:** [Click Here](${w.proof})\n**Date**: ${w.date}`
	}).join('\n\n'))
	.setColor('Random')
	.setFooter({
		text: `${dbr.warns.length}/3 Warns`
	})

	i.reply({
		embeds: [em]
	})
	}
}
}
}
