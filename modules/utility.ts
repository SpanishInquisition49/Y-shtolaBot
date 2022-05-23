import { Guild, GuildMember, Message, VoiceState } from "discord.js";

export function findMember(nameOrId: string, guild: Guild): GuildMember {
    let members = guild.members.cache.filter(
      (m) =>
        m.user.username === nameOrId ||
        m.nickname === nameOrId ||
        m.user.id === nameOrId
    );
    return members.first();
}

export function getArgsFromMessage(message: Message, command: string): string[] {
    return message.content.split(" ").filter((e) => e !== command);
}

export function getRandomFrom<T>(a: T[]): T {
    return a[randomIntFromInterval(0, a.length - 1)];
}

export function randomIntFromInterval(min: number, max: number): number { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min) 
}

function logChannelMovement(
    oldState: VoiceState,
    newState: VoiceState,
    nickname: string
  ): void {
    if (newState.channelId === null)
      //left
      console.log(`${nickname} left channel`, oldState.channel?.id);
    else if (oldState.channelId === null)
      // joined
      console.log(`${nickname} joined channel`, newState.channel?.id);
    // moved
    else
      console.log(
        `${nickname} moved channels`,
        oldState.channel?.id,
        newState.channel?.id
      );
  }
  