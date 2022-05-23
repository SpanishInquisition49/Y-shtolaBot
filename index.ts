import DiscordJS, {
  Collection,
  Guild,
  GuildMember,
  Intents,
  Message,
  MessageEmbed,
  MessageEmbedAuthor,
  MessageReaction,
  TextChannel,
  User,
  VoiceState,
} from "discord.js";
import dotenv from "dotenv";

import { ultima } from "./modules/spell";
import { getDailyMenu, getEmbedMessage } from "./modules/chef";
import { getArgsFromMessage, getRandomFrom } from "./modules/utility";

dotenv.config();

const DEBUG = process.env.DEBUG == "1";
const spadellaId = process.env.SPADELLA_CHANNEL || "";
const spadellaLogId = process.env.SPADELLA_LOG_CHANNEL || "";
const lowLevelFCRole = process.env.LOW_FC_ROLE || "";
const guestRole = process.env.GUEST_ROLE || "";
const guildID = process.env.GUILD_ID || "";
const convalidationMessageID = process.env.CONVALIDATION_MSG_ID || "";
const donnolinaEmojiID = process.env.DONNOLINA_EMOJI_ID || "";
const godID = process.env.GOD_ID || "";
const vagabondoEmoji = process.env.VAGABONDO_EMOJI

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
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
let channel: TextChannel | undefined;
let guild: Guild;

client.on("ready", async () => {
  guild = client.guilds.cache.find((g) => g.id === guildID);
  channel = (await client.channels.fetch(spadellaLogId)) as TextChannel;
  getDailyMenu();
  setInterval(getDailyMenu, 24 * 60 * 60 * 1000);
  console.log("Discord Bot ready");
});

client.on("messageCreate", (message) => {
  message.author;
  let reply: string | MessageEmbed = commandMessage(message);
  
  if (typeof reply === "string")
    message.reply({
      content: reply,
    });
  else
    message.reply({
      embeds: [reply],
    });
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  let nickname = newState.member?.nickname
    ? newState.member?.nickname
    : newState.member?.user.username;
  if (nickname === "" || nickname === null) return;
  if (DEBUG) logChannelMovement(oldState, newState, nickname!);
  if (
    newState.channelId === spadellaId &&
    channel &&
    newState.channelId !== oldState.channelId
  ) {
    console.log(`${nickname} è stato spadellato`);
    await channel.send(`${nickname} è stato spadellato`);
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  let lowLevelRole = reaction.message.guild.roles.cache.find((r) => r.name.toLowerCase() === lowLevelFCRole);
  let guest_role = reaction.message.guild.roles.cache.find((r) => r.name.toLowerCase() === guestRole);
  let member = guild.members.cache.find((m) => m.id === user.id);
  if (
    reaction.message.id === convalidationMessageID &&
    reaction.emoji.id === donnolinaEmojiID
  ) {
    member.roles.add(lowLevelRole);
    console.log(`${member.nickname ? member.nickname : member.user.username} ha ricevuto il ruolo Donnolina`);
  } else if (
    reaction.message.id === convalidationMessageID &&
    reaction.emoji.name === vagabondoEmoji
  ) {
    member.roles.add(guest_role);
    console.log(`${member.nickname ? member.nickname : member.user.username} ha ricevuto il ruolo Vagabondo`);
  }
});

client.login(process.env.TOKEN);

function commandMessage(message: Message): string | MessageEmbed {
  if (message.content.includes("y.random"))
    return getRandomFrom(getArgsFromMessage(message, "y.random"));
  else
    switch (message.content) {
      case "y.help":
        return "Aiutati da solo, io non so che dire...";
      case "y.menu":
        return getEmbedMessage();
      case "y.panlist":
      case "y.ultima":
        if (message.author.id === godID) {
          ultima(guild, spadellaId);
          return "SUCH DEVASTATION WAS NOT MY INTENTIONS!";
        } else
          return "https://c.tenor.com/CsH6ZibQQbcAAAAC/vacagare-aldo-giovanni-e-giacomo.gif";
      default:
        return "";
    }
}
function logChannelMovement(oldState: DiscordJS.VoiceState, newState: DiscordJS.VoiceState, arg2: string) {
    throw new Error("Function not implemented.");
}

