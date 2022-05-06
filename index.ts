import DiscordJS, { Guild, Intents, MessageEmbed, MessageEmbedAuthor, MessageReaction, TextChannel, User, VoiceState } from 'discord.js';
import dotenv from 'dotenv';
import menu from './menu.json';

enum DishType {
    Colazione = 'Colazione',
    Antipasto = 'Antipasto',
    Pane = 'Pane',
    Zuppe = 'Zuppe',
    Primo = 'Primo',
    Contorno = 'Contorno',
    Dessert = 'Dessert',
    Drink = 'Drink'
}

interface Dish {
    name:string;
    type:string;
}

dotenv.config();

const DEBUG = process.env.DEBUG == '1';
const spadellaId = process.env.SPADELLA_CHANNEL || '';
const spadellaLogId = process.env.SPADELLA_LOG_CHANNEL || '';
const lowLevelFCRole = process.env.LOW_FC_ROLE || '';
const guestRole = process.env.GUEST_ROLE || '';
const guildID = process.env.GUILD_ID || '';
const convalidationMessageID = process.env.CONVALIDATION_MSG_ID || '';
const donnolinaEmojiID = process.env.DONNOLINA_EMOJI_ID || '';

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
        Intents.FLAGS.GUILD_MEMBERS,
        //Intents.FLAGS.GUILD_PRESENCES
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});
let channel: TextChannel | undefined;
let spadellaCounter = Number(process.env.SPADELLA_COUNTER)
let dishMenu: Dish[] = [];
let guild: Guild

client.on('ready', async () => {
    guild = client.guilds.cache.find(g => g.id === guildID)
    channel = await client.channels.fetch(spadellaLogId) as TextChannel;
    getDailyMenu();
    setInterval(getDailyMenu, (24 * 60 * 60 * 1000))
    console.log('Discord Bot ready');
});

client.on('messageCreate', (message) => {
    let reply: string | MessageEmbed;
    switch(message.content){
        case 'y.help':
            reply = 'Aiutati da solo, io non so che dire...';
            break;
        case 'y.menu':
            reply = getEmbedMessage();
            break;
        case 'y.panlist':
            reply = 'La classifica dei più spadellati è ancora WIP';
            break;
        default: 
            return;
    }

    if(typeof reply === 'string')
        message.reply({
            content: reply,
        });
    else
        message.reply({
            embeds: [reply]
        })

});

client.on('voiceStateUpdate', async (oldState, newState) => {
    let nickname = newState.member?.nickname ? newState.member?.nickname : newState.member?.user.username;
    if(nickname === '' || nickname === null)
        return;
    if(DEBUG)
        logChannelMovement(oldState, newState, nickname!);
    //Qualcuno è stato Spadellato
    if(newState.channelId === spadellaId && channel && newState.channelId !== oldState.channelId){
        console.log(`${nickname} è stato spadellato`);
        await channel.send(`${nickname} è stato spadellato`)
        spadellaCounter++;
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    let lowLevelRole = reaction.message.guild.roles.cache.find(r => r.name.toLowerCase() === lowLevelFCRole);
    let guest_role = reaction.message.guild.roles.cache.find(r => r.name.toLowerCase() === guestRole);
    let member = guild.members.cache.find(m => m.id === user.id)
    if(reaction.message.id === convalidationMessageID && reaction.emoji.id === donnolinaEmojiID){
        member.roles.add(lowLevelRole);
        console.log(`${member.nickname ? member.nickname : member.user.username} ha ricevuto il ruolo Donnolina`);
    }
    else if(reaction.message.id === convalidationMessageID && reaction.emoji.name === '⛺'){
        member.roles.add(guest_role);
        console.log(`${member.nickname ? member.nickname : member.user.username} ha ricevuto il ruolo Vagabondo`);
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

function getDailyMenu() {
    console.log('New Daily Menu :)')
    for(let type in DishType){
        dishMenu.push(getRandomDish(type as DishType))
    }
}

function filterMenu(type: DishType): Dish[] {
    return menu.filter((e) => e.type === type) as Dish[];
}

function getRandomDish(type: DishType): Dish {
    let tmp = filterMenu(type);
    return tmp[randomIntFromInterval(0, tmp.length-1)];
}

function randomIntFromInterval(min: number, max: number): number { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min) 
}

function getEmbedMessage():MessageEmbed {
    let reply: MessageEmbed = new MessageEmbed();
    let a:MessageEmbedAuthor = {name: 'Lahabrea'};
    reply.author = a
    reply.description = dailyMenoToString();
    reply.title = '~ Menu del Giorno ~'
    reply.setColor("RANDOM");
    return reply;
}

function dailyMenoToString():string {
    let res = ''
    for(let i = 0; i<dishMenu.length; i++)
        res += dishMenu[i].name + '\n';
    return res;
}