
const Discord = require('discord.js');
const client = new Discord.Client();
const db = require("quick.db");

exports.run = (client, message, args) => {
      
      let sebep = args.slice(0).join(" ");
      if (!sebep) return message.reply("AFK olma nedenini yazmalısın!");

      db.set(`afks_${message.author.id}`, sebep)
                   const belirtec = new Discord.RichEmbed()
                     .setColor("RANDOM")
                     .setDescription("<@"+`${message.author.id}`+">"+"belirttiğin **"+`${sebep}`+"** sebebi ile AFK\'sın ")
                     message.channel.send(belirtec)
       // message.channel.send(`artık **${sebep}** sebebi ile AFK modundasın!`)
  //message.channel.send()
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ['away'],
  permLevel: 0
};

exports.help = {
  name: 'afk',
  description: 'AFK olursunuz. (Birisi sizi etiketlediğinde AFK olduğunuzu söyler.)',
  usage: 'afk <sebep>'
};