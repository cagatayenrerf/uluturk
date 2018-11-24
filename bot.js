const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const fs = require('fs');
const Jimp = require('jimp');
const db = require("quick.db");
const moment = require('moment');
require('./util/eventLoader')(client);


var prefix = ayarlar.prefix;

const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});


client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

const opus = require('opusscript');
const { GOOGLE_API_KEY } = require('./config.json');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(GOOGLE_API_KEY);
const ytdl = require('ytdl-core')

const queue = new Map();
 
client.on('warn', console.warn);
 
client.on('error', console.error);
 
client.on('ready', () => console.log('Bot artık hazır!'));
 
client.on('disconnect', () => console.log('Bağlantım kesildi, bildiğinizden emin olun, şimdi tekrar bağlanacağım...'));
 
client.on('reconnecting', () => console.log('Tekrar bağlanıyorum!'));

client.on('message', async msg => { // eslint-disable-line
  let prefix = "."
        if (msg.author.bot) return undefined;
        if (!msg.content.startsWith(prefix)) return undefined;
 
        const args = msg.content.split(' ');
        const searchString = args.slice(1).join(' ');
        const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
        const serverQueue = queue.get(msg.guild.id);
 
        let command = msg.content.toLowerCase().split(' ')[0];
        command = command.slice(prefix.length)
 
 
 
        if (command === 'çal') {
    if (!msg.guild) {
      const ozelmesajuyari = new Discord.RichEmbed()
      .setDescription(`You can not use commands here.`)
      return msg.author.sendEmbed(ozelmesajuyari); }
                const voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' ❎ | İlk olarak sesli bir kanala giriş yapmanız gerek.'));
                const permissions = voiceChannel.permissionsFor(msg.client.user);
                if (!permissions.has('CONNECT')) {
      return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setColor('RANDOM')
      .setDescription('🚫 | Şuanda olduğunuz kanala girmek için gerekli izinlere sahip değilim.'));
                }
                if (!permissions.has('SPEAK')) {
      return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setColor('RANDOM')
      .setDescription('🚫 | Şarkı başlatılamıyor. Lütfen mikrofonumu açınız.'));
                }
 
                if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
                        const playlist = await youtube.getPlaylist(url);
                        const videos = await playlist.getVideos();
                        for (const video of Object.values(videos)) {
                                const video2 = await youtube.getVideoByID(video.id); // ehehehehu videomuzu bulalım
                                await handleVideo(video2, msg, voiceChannel, true); // ve gönderelim
                        }
      return msg.channel.sendEmbed(new Discord.RichEmbed)
      .setDescription(`✔ | Playlist ➢ **${playlist.title}** has been added to the queue!`);
                } else {
                        try {
                                var video = await youtube.getVideo(url);
                        } catch (error) {
                                try {
                                        var videos = await youtube.searchVideos(searchString, 10);
                                        let index = 0;
                                        msg.channel.sendEmbed(new Discord.RichEmbed()
                                .setTitle('Şarkı Seçimi')
      .setDescription(`${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}`)
       .setFooter('Lütfen 1-10 arasında bir rakam seçiniz 30 saniye içinde liste iptal edilecektir.')
          .setColor('RANDOM'));
                                        // en fazla 5 tane
                                        try {
                                                var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
                                                        maxMatches: 1,
                                                        time: 10000,
                                                        errors: ['time']
                                                });
                                        } catch (err) {
                                                console.error(err);
            return msg.channel.sendEmbed(new Discord.RichEmbed()
            .setColor('RANDOM')
            .setDescription('❎ | Şarkı seçimi iptal edildi. '));
                                        }
                                        const videoIndex = parseInt(response.first().content);
                                        var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                                } catch (err) {
                                        console.error(err);
          return msg.channel.sendEmbed(new Discord.RichEmbed()
          .setColor('RANDOM')
          .setDescription(' ❎ | Herhangi bir arama sonucu elde edemedim.'));
                                }
                        }
                        return handleVideo(video, msg, voiceChannel);
                }
        } else if (command === 'geç') {
    if (!msg.guild) {
      const ozelmesajuyari = new Discord.RichEmbed()
      .setDescription(`You can not use commands here.`)
      return msg.author.sendEmbed(ozelmesajuyari); }
    if (!msg.member.voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' ❎ | Önce sesli kanal sonra ben.'));
                if (!serverQueue) return msg.channel.send(' ❎ | Kuyruk boş olduğu için geçemiyorum. ');
                serverQueue.connection.dispatcher.end('Geç komudu kullanıldı.');
                return undefined;
        } else if (command === 'kapat') {
    if (!msg.guild) {
      const ozelmesajuyari = new Discord.RichEmbed()
      .setDescription(`You can not use commands here.`)
      return msg.author.sendEmbed(ozelmesajuyari); }
    if (!msg.member.voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' ❎ | Önce sesli kanal sonra ben.'));
    if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' ❎ | Şu anda herhangi bir şarkı çalmıyorum.'));
                serverQueue.songs = [];
                serverQueue.connection.dispatcher.end('Kapat komutu kullanıldı!');
                return undefined;
        } else if (command === 'ses') {
      if (!msg.guild) {
        const ozelmesajuyari = new Discord.RichEmbed()
        .setDescription(`You can not use commands here.`)
        return msg.author.sendEmbed(ozelmesajuyari); }
    if (!msg.member.voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
  .setDescription(' ❎ | Önce ses kanalı sonra ben.'));
    if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
   .setDescription(' ❎ | Şu anda herhangi bir şarkı çalmıyorum.'));
    if (!args[1]) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(` 🔊 | Ses seviyesi: **${serverQueue.volume}**`));
                serverQueue.volume = args[1];
        if (args[1] > 10) return msg.channel.send({
            embed: {
                title: "",
                color: 0xE50000,
                description: "Lütfen 10'dan az yada 10 olarak bir sayı belirtin."
            }
        });
                serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
    return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
   .setDescription('Ses Seviyesi ' + `**${args[1]}**` + ' Olarak Ayarlandı.'));
        } else if (command === 'çalınan') {
   
   
    if (!msg.guild) {
      const ozelmesajuyari = new Discord.RichEmbed()
      .setDescription(`❕ | Müzik çalmıyor ki`)
      return msg.author.sendEmbed(ozelmesajuyari); }
    if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(':x: | Müzik çalmıyor ki'));
    return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .addField('Başlık', `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})`, true)
    .addField("Süre", `${serverQueue.songs[0].durationm}:${serverQueue.songs[0].durations}`, true))
        } else if (command === 'kuyruk') {
                if (!serverQueue) return msg.channel.send('❎ | Müzik çalmıyor ki. ');
                return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
     .setTitle('Şarkı Kuyruğu')
    .setDescription(`${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}`))
    .addField('Şu anda çalınan: ' + `${serverQueue.songs[0].title}`);
        } else if (command === 'durdur') {
    if (!msg.guild) {
      const ozelmesajuyari = new Discord.RichEmbed()
      .setDescription(`You can not use commands here.`)
      return msg.author.sendEmbed(ozelmesajuyari); }
                if (serverQueue && serverQueue.playing) {
                        serverQueue.playing = false;
                        serverQueue.connection.dispatcher.pause();
      return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setDescription('⏸ | Müzik durduruldu.')
      .setColor('RANDOM'));
                }
                return msg.channel.send('🚫 | Şu anda hiçbir şey çalmıyorum.');
        } else if (command === 'devam') {
    if (!msg.guild) {
      const ozelmesajuyari = new Discord.RichEmbed()
      .setDescription(`Burada komutu kullanamazsınız.`)
      return msg.author.sendEmbed(ozelmesajuyari); }
                if (serverQueue && !serverQueue.playing) {
                        serverQueue.playing = true;
                        serverQueue.connection.dispatcher.resume();
      return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setColor('RANDOM')
      .setDescription('▶ | Müzik devam ediyor.'));
                }
                return msg.channel.send('❎ | Şu anda hiçbir şey çalmıyorum.');
  }
 
        return undefined;
});
 
async function handleVideo(video, msg, voiceChannel, playlist = false) {
        const serverQueue = queue.get(msg.guild.id);
        console.log("hazır");
        const song = {
                id: video.id,
                title: video.title,
                url: `https://www.youtube.com/watch?v=${video.id}`,
    durationh: video.duration.hours,
    durationm: video.duration.minutes,
                durations: video.duration.seconds,
    views: video.views,
        };
        if (!serverQueue) {
                const queueConstruct = {
                        textChannel: msg.channel,
                        voiceChannel: voiceChannel,
                        connection: null,
                        songs: [],
                        volume: 3,
                        playing: true
                };
                queue.set(msg.guild.id, queueConstruct);
 
                queueConstruct.songs.push(song);
 
                try {
                        var connection = await voiceChannel.join();
                        queueConstruct.connection = connection;
                        play(msg.guild, queueConstruct.songs[0]);
                } catch (error) {
                        console.error(`I could not join the voice channel: ${error}`);
                        queue.delete(msg.guild.id);
                        return msg.channel.send(`HATA | Ses kanalına katılamadım: ${error}`);
                }
        } else {
                serverQueue.songs.push(song);
                console.log("hazır");
                if (playlist) return undefined;
    else return msg.channel.sendEmbed(new Discord.RichEmbed()
  .setDescription(`✔ | **${song.title}** adlı şarkı başarıyla kuyruğa eklendi.`)
  .setColor('RANDOM'));
        }
 
        return undefined;
}
 
function play(guild, song) {
        const serverQueue = queue.get(guild.id);
 
        if (!song) {
                serverQueue.voiceChannel.leave();
                queue.delete(guild.id);
                return;
        }
        console.log("hazır");
 
        const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
                .on('end', reason => {
                        if (reason === 'Akış yeterince hızlı diğil.') console.log('Şarkı Durduruldu.');
                        else console.log("sebep");
                        serverQueue.songs.shift();
                        play(guild, serverQueue.songs[0]);
                })
                .on('error', error => console.error(error));
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
 
   serverQueue.textChannel.sendEmbed(new Discord.RichEmbed()
  .setAuthor(`Şarkı Çalınıyor`, `https://images.vexels.com/media/users/3/137425/isolated/preview/f2ea1ded4d037633f687ee389a571086-youtube-icon-logo-by-vexels.png`)
  .setThumbnail(`https://i.ytimg.com/vi/${song.id}/default.jpg?width=80&height=60`)
  .addField('Başlık', `[${song.title}](${song.url})`, true)
  .addField("Süre", `${song.durationm}:${song.durations}`, true)
  .addField("Ses Seviyesi", `${serverQueue.volume}%`, true)
  .setColor('#FFFFFF'));
}

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'sa') {
    msg.reply('**__Aleyküm Selam ! Hoşgeldin ! Nasılsın ? İnşallah İyisindir !__**');
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'davet') {
    msg.reply('https://discord.gg/WBVursn');
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === '.davet') {
    msg.reply('https://discord.gg/WBVursn');
  }
});

client.on("message", async message => {
    let sayac = JSON.parse(fs.readFileSync("./ayarlar/sayac.json", "utf8"));
    if(sayac[message.guild.id]) {
        if(sayac[message.guild.id].sayi <= message.guild.members.size) {
            const embed = new Discord.RichEmbed()
                .setDescription(`**Tebrikler ${message.guild.name} ! Başarıyla ${sayac[message.guild.id].sayi} Kullanıcıya Ulaştık ! Sayaç Sıfırlandı !**`)
                 .setColor(0x36393F)
                .setTimestamp()
            message.channel.send({embed})
            delete sayac[message.guild.id].sayi;
            delete sayac[message.guild.id];
            fs.writeFile("./ayarlar/sayac.json", JSON.stringify(sayac), (err) => {
                console.log(err)
            })
        }
    }
})

client.on("guildMemberAdd", async member => {
    let sayac = await db.fetch(`sayac_${member.guild.id}`);
    let skanal9 = await db.fetch(`sayacK_${member.guild.id}`);
  if (!skanal9) return;
  const skanal31 = member.guild.channels.find('name', skanal9)
    skanal31.send(`:inbox_tray:**| [__${member.user.tag}__] Katıldı - \`${sayac}\` Olmamıza Son \`${sayac - member.guild.members.size}\` Üye Kaldı ! |**:inbox_tray:`)
});

client.on("guildMemberRemove", async member => {
    let sayac = await db.fetch(`sayac_${member.guild.id}`);
  let skanal9 = await db.fetch(`sayacK_${member.guild.id}`);
  if (!skanal9) return;
  const skanal31 = member.guild.channels.find('name', skanal9)
    skanal31.send(`:outbox_tray:**| [__${member.user.tag}__] Ayrıldı - \`${sayac}\` Olmamıza Son \`${sayac - member.guild.members.size}\` Üye Kaldı ! |**:outbox_tray:`)
});
client.on("guildMemberAdd", member => {

  if (db.has(`otoR_${member.guild.id}`) === false) return;
  var rol = member.guild.roles.get(db.fetch(`otoR_${member.guild.id}`));
  if (!rol) return;
  
  member.addRole(rol)
  
})
client.on('message', msg => {
  const reason = msg.content.split(" ").slice(1).join(" ");
  if (msg.channel.name== 'destek') { 
    const hatay = new Discord.RichEmbed()
    .addField("☡ Hata ☡", `Bu Sunucuda \`Destek\` Adında Bir Rol Yok!`)
    .setColor(0x36393F)
    
    if (!msg.guild.roles.exists("name", "Destek")) return msg.author.send(hatay) + msg.guild.owner.send(`${msg.guild.name} Adlı Sunucunda, \`Destek\` Adlı Bir Rol Olmadığı İçin, Hiçkimse Destek Talebi Açamıyor!`);
    if(msg.guild.channels.find('name', 'Talepler')) {
      msg.guild.createChannel(`destek-${msg.author.id}`, "text").then(c => {
      const category = msg.guild.channels.find('name', 'Talepler')
      c.setParent(category.id)
      let role = msg.guild.roles.find("name", "Destek");
      let role2 = msg.guild.roles.find("name", "@everyone");
      c.overwritePermissions(role, {
          SEND_MESSAGES: true,
          READ_MESSAGES: true
      });
      c.overwritePermissions(role2, {
          SEND_MESSAGES: false,
          READ_MESSAGES: false
      });
      c.overwritePermissions(msg.author, {
          SEND_MESSAGES: true,
          READ_MESSAGES: true
      });

      const embed = new Discord.RichEmbed()
     .setColor(0x36393F)
      .setAuthor(`${client.user.username} | Destek Sistemi`)
      .addField(`Merhaba ${msg.author.username}!`, `Destek Yetkilileri burada seninle ilgilenecektir. \nDestek talebini kapatmak için \`${prefix}kapat\` yazabilirsin.`)
      .addField(`» Talep Konusu/Sebebi:`, `${msg.content}`, true)
      .addField(`» Kullanıcı:`, `<@${msg.author.id}>`, true)
      .setFooter(`${client.user.username} | Destek Sistemi`)
      .setTimestamp()
      c.send({ embed: embed });
      c.send(`<@${msg.author.id}> Adlı kullanıcı "\`${msg.content}\`" sebebi ile destek talebi açtı! Lütfen Destek Ekibini bekle, @here`)
      msg.delete()
      }).catch(console.error);
    }
  }

  if (msg.channel.name== 'destek') { 
    const hatay1 = new Discord.RichEmbed()
    .addField(":x: Hata :x:", `Bu Sunucuda \`Destek\` Adında Bir Rol Yok!`)
  .setColor(0x36393F)
    
    if (!msg.guild.roles.exists("name", "Destek")) return msg.author.send(hatay1) + msg.guild.owner.send(hatay1);
    if(!msg.guild.channels.find('name', 'Destek')) {
      msg.guild.createChannel(`Destek`, 'category').then(category => {
      category.setPosition(1)
        let every = msg.guild.roles.find("name", "@everyone");
      category.overwritePermissions(every, {
        VIEW_CHANNEL: false,
        SEND_MESSAGES: false,
        READ_MESSAGE_HISTORY: false
      })
      msg.guild.createChannel(`destek-${msg.author.id}`, "text").then(c => {
      c.setParent(category.id)
      let role = msg.guild.roles.find("name", "Destek");
      let role2 = msg.guild.roles.find("name", "@everyone");
      c.overwritePermissions(role, {
          SEND_MESSAGES: true,
          READ_MESSAGES: true
      });
      c.overwritePermissions(role2, {
          SEND_MESSAGES: false,
          READ_MESSAGES: false
      });
      c.overwritePermissions(msg.author, {
          SEND_MESSAGES: true,
          READ_MESSAGES: true
      });

      const embed = new Discord.RichEmbed()
      .setColor(0x36393F)
      .setAuthor(`${client.user.username} | Destek Sistemi`)
      .addField(`Merhaba ${msg.author.username}!`, `Destek Yetkilileri burada seninle ilgilenecektir. \nDestek talebini kapatmak için \`${prefix}kapat\` yazabilirsin.`)
      .addField(`» Talep Konusu/Sebebi:`, `${msg.content}`, true)
      .addField(`» Kullanıcı:`, `<@${msg.author.id}>`, true)
      .setFooter(`${client.user.username} | Destek Sistemi`)
      .setTimestamp();
      c.send({ embed: embed });
      c.send(`<@${msg.author.id}> Adlı kullanıcı "\`${msg.content}\`" sebebi ile destek talebi açtı! Lütfen Destek Ekibini bekle, @here`)
      msg.delete()
      }).catch(console.error);
    })
  }
}
});
client.on("message", message => {

var i = db.fetch(`prefix_${message.guild.id}`)
    // let sunucuyaözelayarlarPrefix = JSON.parse(fs.readFileSync("./sunucuözelayarlar/prefix.json", "utf8"));

  
    let afk_kullanici = message.mentions.users.first() || message.author;
    if(message.content.startsWith(i || ayarlar.prefix+"afk")) return; //! yazan yeri kendi botunuzun prefixi ile değiştirin.
  if (message.author.bot === true) return;
   

    //let afk_kullanici = message.mentions.users.first() || message.author;
   //var p = denetim[member.guild.id] ? denetim[member.guild.id].prefix : "*"
   //if (!denetim[member.guild.id]) return;
  //  if(message.content.startsWith(p+"afk")) return; //! yazan yeri kendi botunuzun prefixi ile değiştirin.
  //if (message.author.bot === true) return;
     if(message.content.includes(`<@${afk_kullanici.id}>`))
         if(db.has(`afks_${afk_kullanici.id}`)) {
             const afksuan = new Discord.RichEmbed()
                     .setColor("RANDOM")
                     .setDescription(`**${client.users.get(afk_kullanici.id).tag}** adlı kullanıcı şuanda AFK! \n**Sebep:** \n${db.fetch(`afks_${afk_kullanici.id}`)}`)
                     message.channel.send(afksuan)
                 //message.channel.send(`**${bot.users.get(afk_kullanici.id).tag}** adlı kullanıcı şuanda AFK! \n**Sebep:** \n${db.fetch(`afks_${afk_kullanici.id}`)}`)
         }
   
         if(db.has(`afks_${message.author.id}`)) {
             const basarili = new Discord.RichEmbed()
                 .setColor("RANDOM")
                 .setDescription("<@"+`${message.author.id}`+">"+"Başarıyla AFK modundan çıktın")
                 //message.reply("başarıyla AFK modundan çıktın!")
                message.channel.send(basarili)
             db.delete(`afks_${message.author.id}`)
         } 

       });

  
client.on("message", message => {
if (message.content.toLowerCase().startsWith(prefix + `kapat`)) {
    if (!message.channel.name.startsWith(`destek`)) return message.channel.send(`Bu komut sadece Destek Talebi kanallarında kullanılablir!`);

    var deneme = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setAuthor(`Destek Talebi Kapatma İşlemi`)
    .setDescription(`Destek talebini kapatmayı onaylamak için, \n10 saniye içinde \`evet\` yazınız.`)
    .setFooter(`${client.user.username} | Destek Sistemi`)
    message.channel.send(deneme)
    .then((m) => {
      message.channel.awaitMessages(response => response.content === 'evet', {
        max: 1,
        time: 10000,
        errors: ['time'],
      })
      .then((collected) => {
          message.channel.delete();
        })
        .catch(() => {
          m.edit('Destek Talebi kapatma isteğin zaman aşımına uğradı!').then(m2 => {
              m2.delete();
          }, 3000);
        });
    });
}
});

//client.on("messageDelete", async msg  => {
  //  if (msg.attachments.size > 0) {
    //    msg.guild.channels.find(c => c.name == "valley-log").send(`**#${msg.channel.name} Kanalında \`${msg.author.tag}\` (\`${msg.author.id}\`) Tarafından Gönderilen Bir Dosya Silinidi :**`, {
           // file: msg.attachments.first().url
      //  })
    //}
//})
/*client.on("ready", async () => {
const hookembed = new Discord.RichEmbed()
.setTitle('Bot Başlatıldı')
.setDescription(`Suan Sunucu Sayısı: **${client.guilds.size}**\n \nSuan Kanal Sayısı: **${client.channels.size.toLocaleString()}**\n \nSuanki Kullanıcı Sayısı: **${client.users.size}**`)
 .setColor(0x36393F)
.setTimestamp()
  let channel = client.channels.get("493472446507122689")
  client.user.setActivity(".yardım | .linkler | " + client.guilds.size + " Sunucu", {type: "WATCHING"});
  client.user.setStatus("online");
  channel.send(hookembed)
});*/

client.on('message', async msg => {

	if (msg.author.bot) return undefined;
	if (!msg.content.startsWith(ayarlar.PREFIX)) return undefined;

	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);
	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(ayarlar.PREFIX.length)

	if (command === 'çal') {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setColor('RANDOM')
    .setDescription(' <:x:474973245477486612> | İlk Olarak Sesli Bir Kanala Giriş Yapmanız Gerek.'));
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle(' <:x:474973245477486612> | İlk Olarak Sesli Bir Kanala Giriş Yapmanız Gerek.'));
		}
		if (!permissions.has('SPEAK')) {
			 return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle(' <:x:474973245477486612> | Şarkı başlatılamıyor. Lütfen Mikrofonumu Açınız.'));
        }

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
			 return msg.channel.sendEmbed(new Discord.RichEmbed)
      .setTitle(`**✅ | Oynatma Listesi: **${playlist.title}** Kuyruğa Eklendi!**`)
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
          
				 msg.channel.sendEmbed(new Discord.RichEmbed()                  
         .setTitle('Slorı BOT | Şarkı Seçimi')
         .setDescription(`${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}`)
         .setFooter('Lütfen 1-10 arasında bir rakam seçiniz 10 saniye içinde liste iptal edilecektir.')
         .setColor('0x36393E'));
          msg.delete(5000)
					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						 return msg.channel.sendEmbed(new Discord.RichEmbed()
            .setColor('0x36393E')
            .setDescription('<:x:474973245477486612> | **Şarkı Değeri Belirtmediğiniz İçin Seçim İptal Edilmiştir**.'));
                    }
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return msg.channel.sendEmbed(new Discord.RichEmbed()
          .setColor('0x36393E')
          .setDescription('<:x:474973245477486612> | **Aradaım Fakat Hiç Bir Sonuç Çıkmadı**'));
                }
            }
			return handleVideo(video, msg, voiceChannel);
      
		}
	} else if (command === 'geç') {
		if (!msg.member.voiceChannel) if (!msg.member.voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' <:x:474973245477486612> | **Lütfen Öncelikle Sesli Bir Kanala Katılınız**.'));
		if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
     .setColor('RANDOM')
     .setTitle('<:x:474973245477486612> | **Hiç Bir Müzik Çalmamakta**'));                                              
		serverQueue.connection.dispatcher.end('**Müziği Geçtim!**');
		return undefined;
	} else if (command === 'durdur') {
		if (!msg.member.voiceChannel) if (!msg.member.voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription('**<:x:474973245477486612> | Lütfen Öncelikle Sesli Bir Kanala Katılınız.**'));
		if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
     .setColor('RANDOM')
     .setTitle('<:x:474973245477486612> **| Hiç Bir Müzik Çalmamakta**'));                                              
		msg.channel.send(`:stop_button: **${serverQueue.songs[0].title}** Adlı Müzik Durduruldu`);
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('**Müzik Bitti**');
		return undefined;
	} else if (command === 'ses') {
		if (!msg.member.voiceChannel) if (!msg.member.voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription('<:x:474973245477486612> **| Lütfen Öncelikle Sesli Bir Kanala Katılınız.**'));
		if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
     .setColor('RANDOM')
     .setTitle('<:x:474973245477486612> | **Hiç Bir Müzik Çalmamakta**'));                                              
		if (!args[1]) return msg.channel.sendEmbed(new Discord.RichEmbed()
   .setTitle(`:loud_sound: Şuanki Ses Seviyesi: **${serverQueue.volume}**`)
    .setColor('RANDOM'))
		serverQueue.volume = args[1];
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
		return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setTitle(`:loud_sound: Ses Seviyesi **${args[1]}** Olarak Ayarlandı.`)
    .setColor('RANDOM'));                             
	} else if (command === 'çalan') {
		if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setTitle("<:x:474973245477486612> | **Çalan Müzik Bulunmamakta**")
    .setColor('RANDOM'));
		return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle("Slorı BOT | Çalan")                            
    .addField('Başlık', `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})`, true)
    .addField("Süre", `${serverQueue.songs[0].durationm}:${serverQueue.songs[0].durations}`, true))
	} else if (command === 'sıra') {
    let index = 0;
		if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setTitle("<:x:474973245477486612> | **Sırada Müzik Bulunmamakta**")
    .setColor('RANDOM'));
		  return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
     .setTitle('Slorı BOT | Şarkı Kuyruğu')
    .setDescription(`${serverQueue.songs.map(song => `**${++index} -** ${song.title}`).join('\n')}`))
    .addField('Şu anda çalınan: ' + `${serverQueue.songs[0].title}`);
	} else if (command === 'duraklat') {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setTitle("**:pause_button: Müzik Senin İçin Durduruldu!**")
      .setColor('RANDOM'));
		}
		return msg.channel.send('<:x:474973245477486612> | **Çalan Müzik Bulunmamakta**');
	} else if (command === 'devam') {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setTitle("**:arrow_forward: Müzik Senin İçin Devam Etmekte!**")
      .setColor('RANDOM'));
		}
		return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setTitle("**<:x:474973245477486612> | Çalan Müzik Bulunmamakta.**")
    .setColor('RANDOM'));
	}
  

	return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
    const serverQueue = queue.get(msg.guild.id);
    console.log(video);
    const song = {
        id: video.id,
        title: video.title,
        url: `https://www.youtube.com/watch?v=${video.id}`,
    durationh: video.duration.hours,
    durationm: video.duration.minutes,
        durations: video.duration.seconds,
    views: video.views,
    };
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`<:x:474973245477486612> **Şarkı Sisteminde Problem Var Hata Nedeni: ${error}**`);
			queue.delete(msg.guild.id);
			return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setTitle(`<:x:474973245477486612> **Şarkı Sisteminde Problem Var Hata Nedeni: ${error}**`)
      .setColor('RANDOM'))
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setTitle(`<:white_check_mark:474982945304608769> **${song.title}** Adlı Müzik Kuyruğa Eklendi!`)
    .setColor('RANDOM'))
	}
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === '<:x:474973245477486612> | **Yayın Akış Hızı Yeterli Değil.**') console.log('Müzik Bitti.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	 serverQueue.textChannel.sendEmbed(new Discord.RichEmbed()                                   
  .setTitle("**Slorı BOT | 🎙 Müzik Başladı**",`https://cdn.discordapp.com/avatars/473974675194511361/6bb90de9efe9fb80081b185266bb94a6.png?size=2048`)
  .setThumbnail(`https://i.ytimg.com/vi/${song.id}/default.jpg?width=80&height=60`)
  .addField('\nBaşlık', `[${song.title}](${song.url})`, true)
  .addField("\nSes Seviyesi", `${serverQueue.volume}%`, true)
  .addField("Süre", `${song.durationm}:${song.durations}`, true)
  .setColor('RANDOM'));
}

client.on("guildMemberAdd", member => {

  if (db.has(`otoR_${member.guild.id}`) === false) return;
  var rol = member.guild.roles.get(db.fetch(`otoR_${member.guild.id}`));
  if (!rol) return;
  
  member.addRole(rol)
  
})

client.on("message", message => {

if (message.content === prefix + "ping") {
   message.channel.send('**__Geçikme Süresi Hesaplandı :__**').then(message => message.delete(3000));

    const pingozel = new Discord.RichEmbed()
    .setColor(0x36393F)
    .setAuthor(`Gecikme Süreleri`, client.user.avatarURL)
    .setDescription(`⏳ **| Normal Gecikme** : __[${client.ping}]__  \n📨 **| Mesaj Gecikmesi** : __[${new Date().getTime() - message.createdTimestamp}]__`)
    return message.channel.sendEmbed(pingozel);
}
});
const emojiArray = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰", "🇱", "🇲", "🇳", 
"🇴", "🇵", "🇶", "🇷", "🇸", "🇹", "🇺", "🇻", "🇼", "🇽", "🇾", "🇿"]

const alphabet = ("abcdefghijklmnopqrstuvwxyz").toUpperCase().split("")

client.on('message', message => {
    //botun kendi mesajlarını görmesini engeller.
    if (message.author.bot) return;
    
    
    if(message.content.indexOf('-') === 0 ) { 

        
        if (message.member.hasPermission("MANAGE_CHANNELS") === true ){
            
            

      
        //komutları vesaire ayırır
        var args = message.content.slice(1).trim().split(/ +/g)
        const com = args.shift().toLowerCase()

      
        var argText = args.join(" ").split(",")

        //başlığı ilk argüman olarak ayarlıyoruz
        var title = argText[0]
        
        //komutları kontrol eder
        switch (com) {
            case "oylama":

                 if (argText[0] == "yardım") {
                    message.channel.send("``` Kullanımm Şekli; -oylama BAŞLIK,time,dakika,seçenek,seçenek,seçenek  şeklinde oluşturabilirsiniz, eğer ki süre yazmaz iseniz otomatik sistemin belirlediği süre geçerli olur.```");
                }

                //2 kez tekrar etmemek için gereken işlev
                function sendMSG(time) {
                    //kaç seçeneğin fazla olduğunu sayar.
                    var outCount = []
                    //oyları ve seçenekleri birleştirir.
                    var combined = []

                    //oy süresinden için dakika cinsinden süre
                    realTime = time * 1000 * 60

                    //aşağı kısımdan toplananları mesaj ile gönderir.
              
         var embed = new Discord.RichEmbed()
			.setTitle(title)
			.setDescription("\n" + out.join("") + "Time left: " + realTime/(1000*60) + " minutes")
			.setTimestamp()
            .setAuthor(message.author.username, message.author.displayAvatarURL)
            .setColor(0x00AE86) // Yeşil Yedek: 0x00AE86
			if (time) {
            embed.setFooter(`Oylama başlatıldı ve ${time} dakika(s) kadar sürecek`);
        }
                            message.channel.send({ embed })      
                    //yeni mesajları yanıtlar ve otomatik siler
                    .then((newMessage) => {
                        for (let k = 0; k < out.length; k++) {
                            setTimeout(() => {
                                newMessage.react(emojiArray[k])
                                outCount[k] = 1;
                            }, 1000 * k);
                        }
                        //oylama süresinden sonra oyları sayar ve sonuçlandırır.
                        setTimeout(() => {

                            //emoji miktarını sayar ve buna göre ekleme yapar
                            for (let index = 0; index < out.length; index++) {
                                outCount[index] = newMessage.reactions.find(reaction => reaction.emoji.name === emojiArray[index]).count - 1
                                combined[index] = out[index].split("\n").join("") + ": " + outCount[index] + "\n" }
                            //maksimum değeri alır
                            let x = Math.max(...outCount)
                            console.log(x)
                            //Hangisinin maksimum değere sahip olduğunu belirler (kontrol eder) ve ona şekil (stil) verir
                            for (let s = 0; s < outCount.length; s++) {
                                if (outCount[s] == x) {                                  
                                    combined[s] ="**"+ combined[s].split("\n").join("") + "**" +"\n" 
                                }
                                else {
                                    combined[s] = "~~"+ combined[s].split("\n").join("") + "~~" +"\n" 
                                }                   
                            }
                            //mesajı siler ve sonuçları gönderir
                            newMessage.delete();
       
        var embed = new Discord.RichEmbed() 
			.setTitle(title)
			.setDescription("\n" +combined.join(""))
			.setTimestamp()
            .setAuthor(message.author.username, message.author.displayAvatarURL)
            .setColor(0xD53C55) // Yeşil Yedek: 0x00AE86
			if (time) {
            embed.setFooter(`Oylama başlatıldı ve ${time} dakika(s) kadar sürecek`);
        }

                            message.channel.send({ embed })
                        }, realTime);
                    })
                }
                if (argText[1]) {
                    if (argText[1].trim() == "time") {
                        //süre ayarlandıysa çıkış	
                        var out = []
                        for(let i = 2; i < argText.slice(1).length; i++) {
                            out[i-2] = "__" + emojiArray[i-2]+ "__" + argText[i+1] + "\n"
                        }
                        sendMSG(argText[2].split("\""));
                    }
                    else{
                        //süre ayarlanmadıysa çıkış
                        var out = []
                        for(let i = 0; i < argText.slice(1).length; i++) {
                            out[i] = "__" + emojiArray[i] + "__" + argText[i+1] + "\n"
                        }
                        sendMSG(360)
                    }
                    message.delete();
                }
                break;
            default:
                break;
        }
        }
    }
})


client.on('message', message => {
    if (message.content.toLowerCase() === '.kedi') {
var request = require('request');

request('http://aws.random.cat/meow', function (error, response, body) {
    if (error) return console.log('Hata:', error);
    else if (!error) { 
        var info = JSON.parse(body);
  const foto = new Discord.RichEmbed()
  .setImage(info.file)
  .setColor(0x36393F)
      message.channel.send(foto)
    }
})
    }
});

client.on("guildMemberAdd", async member => {
  const channel = member.guild.channels.find('name', 'hesap-doğrulama');//log ismini ayarlıyacaksınız log adında kanal açın
  if (!channel) return;
        let username = member.user.username;
        if (channel === undefined || channel === null) return;
        if (channel.type === "text") {
          var role = member.guild.roles.find("name", "Yönetici");
	        if (!role) return;
         channel.send(member + " SUNUCMUZA HOŞGELDİN KAYDININ YAPILMASI İÇİN LÜTFEN "  +role+  " BEKLE");
            const bg = await Jimp.read("https://cdn.discordapp.com/attachments/450693709076365323/473184528148725780/guildAdd.png");
            const userimg = await Jimp.read(member.user.avatarURL);
            var font;
            if (member.user.tag.length < 15) font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
            else if (member.user.tag.length > 15) font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
            else font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
            await bg.print(font, 430, 170, member.user.tag);
            await userimg.resize(362, 362);
            await bg.composite(userimg, 43, 26).write("./img/"+ member.id + ".png");
              setTimeout(function () {
                    channel.send(new Discord.Attachment("./img/" + member.id + ".png"));
              }, 1000);
              setTimeout(function () {
                fs.unlink("./img/" + member.id + ".png");
              }, 10000);
        }
    })

client.on("guildMemberRemove", async member => {
  const channel = member.guild.channels.find('name', 'hesap-doğrulama');
  if (!channel) return;
        let username = member.user.username;
        if (channel === undefined || channel === null) return;
        if (channel.type === "text") {            
          const bg = await Jimp.read("https://cdn.discordapp.com/attachments/450693709076365323/473184546477572107/guildRemove.png");
 const userimg = await Jimp.read(member.user.avatarURL);
            var font;
            if (member.user.tag.length < 15) font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
            else if (member.user.tag.length > 15) font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
            else font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
            await bg.print(font, 430, 170, member.user.tag);
            await userimg.resize(362, 362);
            await bg.composite(userimg, 43, 26).write("./img/"+ member.id + ".png");
              setTimeout(function () {
                    channel.send(new Discord.Attachment("./img/" + member.id + ".png"));
              }, 1000);
              setTimeout(function () {
                fs.unlink("./img/" + member.id + ".png");
              }, 10000);
        }
    })

client.on('message', msg => {
  if (msg.content.toLowerCase() === prefix + 'kasaaç') {
    var sans = 
    ["[Çok şanslısın bilet kazandın]&https://i.resimyukle.xyz/J0OG4e.png",
    "[Güzel bir Ak-47 skini]&https://i.resimyukle.xyz/bcSNb3.png", 
    "[Lanet olsun dostum beni zarara sokuyorsun güzel bir skin]&https://i.resimyukle.xyz/5HK0MV.png", 
    "[Zengin oldun adamım]&https://i.resimyukle.xyz/TJc8L4.png",
    "[Maviiii]&https://i.resimyukle.xyz/x6PKHP.png", 
    "[Her seferinde en iyisini çıkarıyorsun beni zarara sokucaksin]&https://i.resimyukle.xyz/CyLNcd.png",
    "[Güzel]&https://i.resimyukle.xyz/OTGbRR.png", 
    "[Çok tatlı bir M416]&https://i.resimyukle.xyz/dKT8KQ.png", 
    "[Çok pahalııı]&https://i.resimyukle.xyz/fI5VQ6.png", 
    "[Ucuz ama kaliteli turunçgil]&https://i.resimyukle.xyz/0CL7U3.png",
    "[Aşık oldum]&https://i.resimyukle.xyz/LbeMHJ.png", 
    "[Tava Kazandın]&https://i.resimyukle.xyz/92b8TP.png"];
    
    var sonuc = sans[Math.floor((Math.random() * sans.length))];
     const attachment = new Discord.Attachment (sonuc.split("&")[1]);
   client.channels.get("505335975308689410").send(attachment);
    msg.reply(`Sana **${sonuc.split("&")[0]}** Çikti`)
  }
});

client.elevation = message => {
  if(!message.guild) {
	return; }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });
client.on("ready", async message => {
    var Activity = [
        
        "Yapımcım : @Enrerf/Çağatay Göksel Avcı 《18》#4755",
        ".yardım",
        ".çal",
  
    ];
  
    setInterval(function() {
  
        var random = Math.floor(Math.random()*(Activity.length-0+1)+0);
  
        client.user.setActivity(Activity[random], { type: 'WATCHING' });
        }, 6 * 3000);

        /*setInterval(() => {
            client.channels.get("505040248430919691").setName(`Sunucu: ${client.guilds.size}`)
            client.channels.get("504675825002741784").setName(`Kullanıcı: ${client.users.size}`)
            client.channels.get("505040248430919693").setName(`Kanal: ${client.channels.size}`)
          }, 3000 );*/
  })

client.login(ayarlar.token);