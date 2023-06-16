module.exports = {
  name: "interactionCreate",
  run: async (client, interaction) => {
    if (interaction.isCommand()) {
     
        const cmd = client.commands.get(interaction.commandName);
     if (!cmd) return interaction.reply({ content: "An error has occured ", ephemeral: true })
  
  cmd.run(client, interaction);
}

 if (interaction.isContextMenuCommand()) {
        await interaction.deferReply({ ephemeral: false });
        const command = client.commands.get(interaction.commandName);
        
        if(command.permissions) {
         if(!i.member.permissions.has(command.permissions)) return i.reply({
           content: "***You don't have enough permissions to use this command.***",
           ephemeral: true
         })
        }
        
        if (command) command.run(client, interaction);
    }
    
 if(interaction.type === type.Autocomplete) {
   let cmd = await client.commands.get(interaction.commandName)
  if(!cmd) return;
  
  await cmd.autocomplete(client, interaction)
  
 }   
    
  }
}
