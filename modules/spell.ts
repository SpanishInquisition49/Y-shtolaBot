import { Collection, Guild, GuildMember,} from 'discord.js';

export function ultima(guild: Guild, channelId: string):void {
    const channels = guild.channels.cache.filter(c => c.isVoice());
    for (const [channelID, channel] of channels) {
        for (const [memberID, member] of channel.members as Collection<string, GuildMember>) {
            try{
                member.voice.setChannel(channelID);
            }
            catch(e){
                console.log(e.message);
            }
        }
      }
}

export function gravity(guild: Guild, id: string, channelId: string):void {
    let members = guild.members.cache.filter(m => m.id === id)
    const channels = guild.channels.cache.filter(c => c.isVoice());
    setInterval(() => {
        for (const [channelID, channel] of channels) {
            for (const [memberID, member] of channel.members as Collection<string, GuildMember>) {
                try{
                    if(member.id === id)
                        member.voice.setChannel(channelID);
                }
                catch(e){
                    console.log(e.message);
                }
            }
          }
    }, 1);  
}

export function silence(user: GuildMember): void {
    user.voice.setMute();
}

export function doom(user:GuildMember, channelID: string){
    setTimeout(() => {
        user.voice.setChannel(channelID);
    }, 10000)
}