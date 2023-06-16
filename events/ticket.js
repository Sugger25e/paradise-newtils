const suser = require('../models/ticket-user')
const sguild = require('../models/ticket-guild')

const rperms = {
    realm: '965043865272860762',
    patner: '965012076143734825'
}

module.exports = {
    name: 'interactionCreate',
    run: async (client, i) => {
        if (!i.customId?.startsWith('tc-')) return;

        let dbu = await suser.findOne({
            guild: i.guild.id,
            user: i.user.id
        })

        if (!dbu) dbu = await suser.create({
            guild: i.guild.id,
            user: i.user.id
        })

        const dbg = await sguild.findOne({
            guild: i.guild.id
        })

        if (!dbg) dbg = await sguild.create({
            guild: i.guild.id
        })

        const log = await i.guild.channels.cache.get('1010348266644308028')

        if(i.isModalSubmit()) {
        	if(i.customId !== 'tc-realmin') return;
        	const input = i.fields.getTextInputValue('tc-issue')

        	log.send({
                embeds: [new client.embed()
                    .setTitle(`Ticket Created`)
                    .setDescription(`**Ticket type**: Realm\n**Ticket by:** ${i.user.tag}`)
                    .setTimestamp()
                    .setColor('Green')
                ]
            })

            const ch = await i.guild.channels.create({
            	 name: `realm-${i.user.username.toLowerCase()}`,
                topic: `Realm ticket for ${i.user.tag}`,
                parent: dbg.category,
                permissionOverwrites: [{
                        id: i.guild.id,
                        deny: ['ViewChannel']
                    },
                    {
                        id: i.user.id,
                        allow: ['ViewChannel']
                    },
                    {
                        id: rperms.realm,
                        allow: ['ViewChannel']
                    }
                ]
            })

            dbu.types.push(`realm`)
            dbu.realm_channel = ch.id;
            await dbu.save()

            i.reply({
                content: `You just opened a **realm ticket**! Please check out ${ch} and wait for few minutes for a staff to reach you out.`,
                ephemeral: true
            })

            const cp = new client.row()
                .addComponents(
                    new client.button()
                    .setStyle('Danger')
                    .setLabel('Close')
                    .setEmoji('🗑️')
                    .setCustomId('tc-close'),
                    new client.button()
                    .setStyle('Success')
                    .setLabel('Claim')
                    .setEmoji('✊')
                    .setCustomId('tc-claim')
                )

            ch.send({
                content: '@everyoe',
                embeds: [new client.embed()
                    .setTitle(`Realm Ticket for ${i.user.tag}`)
                    .setDescription(`\nHello, **${i.user.username}**! Welcome to your ticket. A member of our support team will be with you shortly. Tickets are used according to your chosen type, it may be concerns, support, or donation. Please note that using tickets incorrectly can result in a ban from the discord.`)
                    .setColor('#2f3136')
                    .setThumbnail(i.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({
                        text: `UID: ${i.user.id}`
                    })
                    .setTimestamp(),
                    new client.embed()
                    .setTitle('Issue')
                    .setDescription(`${input}`)
                    .setColor('Red')
                ],
                components: [cp]
            })

            i.message.edit({
                components: [
                    new client.row()
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
                ]
            })

        }

        if (i.isButton()) {
        	const val = i.message.embeds[0].title.toLowerCase().split(' ')[0]

            if (i.customId === 'tc-claim') {
                if (i.member.permissions.has('Administrator') || i.member.roles.cache.has(rperms[val])) {
                    client.notif(`Ticket was claimed by **${i.user.tag}**`, i, false)

                    if (val !== 'donate') {
                    i.channel.permissionOverwrites.create(i.user.id, { ViewChannel: true })
					i.channel.permissionOverwrites.edit(rperms[val], { ViewChannel: false }) 
					}


                    i.message.edit({
                        components: [
                            new client.row()
                            .addComponents(
                                new client.button()
                                .setStyle('Danger')
                                .setLabel('Close')
                                .setEmoji('🗑️')
                                .setCustomId('tc-close')
                            )
                        ]
                    })
                } else {
                	return client.error(`Only administrators ${val !== 'donate' ? `and <@&${rperms[val]}>` : ''} can claim tickets`, i, true)
                }
            }
            if (i.customId === 'tc-close') {
                const uid = i.message.embeds[0].footer.text.slice(5)

                let dbuc = await suser.findOne({
                    guild: i.guild.id,
                    user: uid
                })

                if (!dbuc) return;
                const val = i.channel.name.split('-')[0]
                if (i.member.permissions.has('Administrator') || i.member.roles.cache.has(rperms[val])) {
                    dbuc.types.splice(dbuc.types.indexOf(`${val}`), 1)
                    dbuc[`${val}_channel`] = null;
                    await dbuc.save()



                    i.channel.delete()
                    log.send({
                        embeds: [new client.embed()
                            .setTitle(`Ticket Deleted`)
                            .setDescription(`**Ticket type**: ${client.cap(val)}\n${val === 'realm' ? `**Issue:** ${i.message.embeds[1].description}\n` : '\n'}**Ticket by:** ${i.guild.members.cache.get(uid).user.tag}\n\n**Ticket deleted by:** ${i.user.tag}`)
                            .setTimestamp()
                            .setColor('Red')
                        ]
                    })
                } else if (i.user.id === uid) {
                    return client.notif(`${i.user.id} is requesting to close the ticket`, i, false)
                }
            }
        }

        if (i.isStringSelectMenu()) {
            if (i.member.permissions.has('Administrator') || i.member.permissions.has('ManageMessages') || i.member.roles.cache.some((role) => ['965043865272860762', '965012076143734825'].includes(role))) {
                return client.error(`Only members can use this ticket panel.`, i, true)
            }
            const val = i.values[0].slice(3)

            if (dbu.types.includes(val)) return i.reply({
                content: `You currently have an open ticket for **${val}** at <#${dbu[`${val}_channel`]}>. You can't create one unless you delete your current ticket.`,
                ephemeral: true
            })

            if(val === 'realm') {
            	const modal = new client.modal()
            	.setCustomId('tc-realmin')
            	.setTitle('Create Ticket')
            	.addComponents(
					new client.row()
            	.addComponents(
            		new client.input()
            		.setCustomId('tc-issue')
            		.setLabel('Issue')
            		.setStyle('Paragraph')
            		.setMaxLength(1000)
            		.setMinLength(10)
            		.setRequired(true)
            		.setPlaceholder('Write your concern...')
            		))

            	return i.showModal(modal)
            }

            log.send({
                embeds: [new client.embed()
                    .setTitle(`Ticket Created`)
                    .setDescription(`**Ticket type**: ${client.cap(val)}\n**Ticket by:** ${i.user.tag}`)
                    .setTimestamp()
                    .setColor('Green')
                ]
            })

            let cho = {
            	 name: `${val}-${i.user.username.toLowerCase()}`,
                topic: `${client.cap(val)} ticket for ${i.user.tag}`,
                parent: dbg.category,
                permissionOverwrites: [{
                        id: i.guild.id,
                        deny: ['ViewChannel']
                    },
                    {
                        id: i.user.id,
                        allow: ['ViewChannel']
                    }
                ]
            }

            if(rperms[val]) cho = {
            	 name: `${val}-${i.user.username.toLowerCase()}`,
                topic: `${client.cap(val)} ticket for ${i.user.tag}`,
                parent: dbg.category,
                permissionOverwrites: [{
                        id: i.guild.id,
                        deny: ['ViewChannel']
                    },
                    {
                        id: i.user.id,
                        allow: ['ViewChannel']
                    },
                    {
                        id: rperms[val],
                        allow: ['ViewChannel']
                    }
                ]
            }

            const ch = await i.guild.channels.create(cho)

            dbu.types.push(`${val}`)
            dbu[`${val}_channel`] = ch.id;
            await dbu.save()

            i.reply({
                content: `You just opened a **${val} ticket**! Please check out ${ch} and wait for few minutes for a staff to reach you out.`,
                ephemeral: true
            })

            const cp = new client.row()
                .addComponents(
                    new client.button()
                    .setStyle('Danger')
                    .setLabel('Close')
                    .setEmoji('🗑️')
                    .setCustomId('tc-close'),
                    new client.button()
                    .setStyle('Success')
                    .setLabel('Claim')
                    .setEmoji('✊')
                    .setCustomId('tc-claim')
                )

            ch.send({
                content: '@everyoe',
                embeds: [new client.embed()
                    .setTitle(`${client.cap(val)} Ticket for ${i.user.tag}`)
                    .setDescription(`\nHello, **${i.user.username}**! Welcome to your ticket. A member of our support team will be with you shortly. Tickets are used according to your chosen type, it may be concerns, support, or donation. Please note that using tickets incorrectly can result in a ban from the discord.`)
                    .setColor('#2f3136')
                    .setThumbnail(i.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({
                        text: `UID: ${i.user.id}`
                    })
                    .setTimestamp()
                ],
                components: [cp]
            })

            i.message.edit({
                components: [
                    new client.row()
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
                ]
            })
        }
    }
}