//const player = require("../../utils/music/player");

module.exports = {
    aliases: 'random aleatório r',
    async execute(yukie, message) {
        const queue = yukie.queues.get(message.guild.id);
        if (!queue) return message.yukieReply('no_queue');

        const songs = queue.songs;

        if (songs.length === 3) {
            [songs[2], songs[1]] = [songs[1], songs[2]];
        } else {
            for (let i = 1; i < songs.length; i++) {
                const n = Math.floor(Math.random() * (songs.length - 1) + 1);
                [songs[i], songs[n]] = [songs[n], songs[i]];
            }
        }
        message.channel.send(`**🔀 Músicas randomizadas**`);
    }
}

module.exports.help = {
    category: 'music',
    description: 'Ativa o modo aleatório das músicas',
    usage: ''
}
