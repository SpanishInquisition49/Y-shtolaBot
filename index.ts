import DiscordJS, { Intents, TextChannel, VoiceState } from 'discord.js';
import dotenv from 'dotenv';


dotenv.config();

const DEBUG = process.env.DEBUG == '1';
const SpadellaId = process.env.SPADELLA_CHANNEL || '';
const SpadellaLogId = process.env.SPADELLA_LOG_CHANNEL || '';

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});

let channel: TextChannel | undefined;
let spadellaCounter = Number(process.env.SPADELLA_COUNTER)


client.on('ready', async () => {
    console.log('Discord Bot ready');
    channel = await client.channels.fetch(SpadellaLogId) as TextChannel;
});

client.on('messageCreate', (message) => {
    let reply: string;
    switch(message.content){
        case 'y.help':
            reply = 'Aiutati da solo, io non so che dire...';
            break;
        case 'y.menu':
            reply = 'Il menu ddel giorno è ancora WIP';
            break;
        case 'y.panlist':
            reply = 'La classifica dei più spadellati è ancora WIP';
            break;
        default: 
            return;
    }

    message.reply({
        content: reply,
    });

});

client.on('voiceStateUpdate', async (oldState, newState) => {
    let nickname = newState.member?.nickname ? newState.member?.nickname : newState.member?.user.username;
    if(nickname === '' || nickname === null)
        return;
    if(DEBUG)
        logChannelMovement(oldState, newState, nickname!);
    //Qualcuno è stato Spadellato
    if(newState.channelId === SpadellaId && channel && newState.channelId !== oldState.channelId){
        console.log(`${nickname} è stato spadellato`);
        await channel.send(`${nickname} è stato spadellato`)
        spadellaCounter++;
    }
});

client.login(process.env.TOKEN);

function logChannelMovement(oldState: VoiceState, newState: VoiceState, nickname: string): void {
    if(newState.channelId === null) //left
    console.log(`${nickname} left channel`, oldState.channel?.id);
else if(oldState.channelId === null) // joined
    console.log(`${nickname} joined channel`, newState.channel?.id);
else // moved
    console.log(`${nickname} moved channels`, oldState.channel?.id, newState.channel?.id);
}
