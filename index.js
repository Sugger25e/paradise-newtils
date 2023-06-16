const { Client, Collection, GatewayIntentBits, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, AttachmentBuilder } = require("discord.js")

const client = new Client({
  intents: Object.keys(GatewayIntentBits).map((a)=>{
    return GatewayIntentBits[a]
  }),
});

client.embed = EmbedBuilder
client.file = AttachmentBuilder
client.row = ActionRowBuilder
client.button = ButtonBuilder
client.menu = StringSelectMenuBuilder
client.modal = ModalBuilder
client.input = TextInputBuilder
client.cap = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

client.notif = async (msg, int, eph=false) => {
  let em = new EmbedBuilder()
   .setTitle("<:notification:1117278481915576411> Notification")
   .setDescription(`${msg}`)
   .setColor("Blue")
  
  if(int.user) {
   if(int.replied || int.deferred) {
     return int.followUp({
       embeds: [em],
       ephemeral: eph
     })
   } else {
    return int.reply({
      embeds: [em],
      ephemeral: eph
    }) 
   }
  } else {
    return int.channel.send({
      embeds: [em]
    })
   }
  }


client.error = async (msg, int, eph=false) => {
  let em = new EmbedBuilder()
   .setTitle("Error")
   .setDescription(msg)
   .setColor("Red")
  
  if(int.user) {
   if(int.replied || int.deferred) {
     return int.followUp({
       embeds: [em],
       ephemeral: eph
     })
   } else {
    return int.reply({
      embeds: [em],
      ephemeral: eph
    }) 
   }
  } else {
    return int.channel.send({
      embeds: [em]
    })
   }
  }

global.pgc = 0;
client.commands = new Collection();
client.config = require("./config");
client.msToDur = (ms) => {
   let sec = Math.floor(ms / 1000);
  let hrs = Math.floor(sec / 3600);
  sec -= hrs * 3600;
  let min = Math.floor(sec / 60);
  sec -= min * 60;

  sec = '' + sec;
  sec = ('00' + sec).substring(sec.length);

  if (hrs > 0) {
    min = '' + min;
    min = ('00' + min).substring(min.length);
    return hrs + ":" + min + ":" + sec;
  }
  else {
    return min + ":" + sec;
  }
}

const InvitesTracker = require('@androz2091/discord-invites-tracker');
const tracker = InvitesTracker.init(client, {
    fetchGuilds: true,
    fetchVanity: true,
    fetchAuditLogs: true
});

tracker.on('guildMemberAdd', async(member, type, invite) => {

    const ch = await member.guild.channels.cache.get('962857961296916520')
    const embed = (inv) => new EmbedBuilder()
    .setTitle('<:join:976262489383764008> __User Joined__')
    .setDescription(`<:green:976262251671617576> • ${member.user.tag}\n<:green:976262251671617576> • Check out <#1005013690568949761>\n<:green:976262251671617576> • Invited by ${inv}`)
    .setColor('Green')
    .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
    .setFooter({
      text: `We now have ${member.guild.members.cache.size} members`,
      iconURL: member.guild.iconURL({dynamic: true})
    })


      ch.send({
        embeds: [embed(`${type === 'normal' ? `${invite.inviter.tag}` : type === 'vanity' ? 'Vanity URL' : 'Unknown'}`)]
      })
});


global.type = require("./types")

require("./handler")(client)

module.exports = client;
client.login(client.config.token)