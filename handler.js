const fs = require("fs").promises;
const path = require("path");
const mongoose = require("mongoose");

module.exports = async (client) => {
    const eventFiles = await fs.readdir(path.join(process.cwd(), "events"));
    for (const file of eventFiles) {
      const event = require(path.join(process.cwd(), "events", file));
      if (!event.name) {
        require(path.join(process.cwd(), "events", file));
      } else {
        client.on(event.name, event.run.bind(null, client));
      }
    }

    const commandFolders = await fs.readdir(path.join(process.cwd(), "commands"));
    const arrs = [];
    for (const folder of commandFolders) {
      const commandFiles = await fs.readdir(path.join(process.cwd(), "commands", folder));
      for (const file of commandFiles) {
        const command = require(path.join(process.cwd(), "commands", folder, file));
        if (!command.name) continue;
        client.commands.set(command.name, command);
        if (["MESSAGE", "USER"].includes(command.type)) delete command.description;
        arrs.push(command);
      }
    }

    client.on("ready", async () => {
      const guild = await client.guilds.cache.get(client.config.guild);

      guild.commands.cache.forEach((command) => {
        guild.commands.delete(command.id);
      });

      client.config.global
        ? await client.application.commands.set(arrs)
        : await guild.commands.set(arrs);
    });

    await mongoose.connect(client.config.mongo, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("Connected to DB");
  
};
