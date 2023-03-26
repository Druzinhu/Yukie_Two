const { search, player } = require('../../utils/music/player');

module.exports = {
  aliases: 'p tocar',
  async execute(yukie, message, args, data) {
    if (yukie.interval.get(`${message.guild.id}_play`)) return;

    const memberVoiceChannel = message.member.voice.channel;
    const meVoiceChannel = message.guild.me.voice.channel;
    
    if (!memberVoiceChannel) return message.yukieReply("not_connected");
    if (meVoiceChannel && memberVoiceChannel.id !== meVoiceChannel.id && meVoiceChannel.members.filter(m => !m.user.bot).size > 0)
      return message.yukieReply("different_connection");

    if (!args.join(' ')) return message.yukieReply('blocked', 'Insira alguma palavra para efetuar a pesquisa.');

    const permissions = memberVoiceChannel.permissionsFor(yukie.user.id);
    if (!permissions.has(['CONNECT']) && !permissions.has(['SPEAK'])) return message.yukieReply('x', 'Eu não tenho permissão para **conectar** e **falar** nesse canal de voz!');
    else if (!permissions.has(['CONNECT'])) return message.yukieReply('x', 'Eu não tenho permissão para **conectar** nesse canal de voz!');
    else if (!permissions.has(['SPEAK'])) return message.yukieReply('x', 'Eu não tenho permissão para **falar** nesse canal de voz!');

    try {
      const song = await search(yukie, message, args.join(' '));
      if (!song) return;
      let queue = yukie.queues.get(message.guild.id);

      if (queue && (!message.guild.me.voice.channel || message.guild.me.voice.channel.members.filter(m => !m.user.bot).size === 0)) {
        await message.member.voice.channel.join();
        queue.dispatcher.resume();
      }

      // P L A Y L I S T
      if (song.playlist) {
        let songs;
        if (!queue) {
          yukie.interval.set(`${message.guild.id}_play`, true);
          await player(yukie, message, song.videos[0]);
          songs = true;
        }
        if (yukie.queues.get(message.guild.id)) {
          let n = songs ? 1 : 0;
          song.videos.slice(n).map(v => yukie.queues.get(message.guild.id).songs.push(v));
        }
      }

      // V I D E O S
      else if (queue) {      
        queue.songs.push(song);
      } else {
        yukie.interval.set(`${message.guild.id}_play`, true);
        player(yukie, message, song);
      }
    }
    catch (err) {
      console.error(err);
      message.channel.send(`<emoji> Desculpe, ocorreu um erro ao reproduzir a música: \`${err}\``);
    }
  }
}

module.exports.help = {
  category: 'music',
  description: 'Reproduz uma música ou uma playlist em um canal de voz',
  usage: `<nome ou url>`
}