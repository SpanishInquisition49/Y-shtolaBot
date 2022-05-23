import { MessageEmbed, MessageEmbedAuthor } from 'discord.js';
import menu from '../menu.json';
import { randomIntFromInterval } from './utility';


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

export let dishMenu: Dish[] = [];

export function getDailyMenu() {
    dishMenu = [];
    console.log('New Daily Menu :)')
    for(let type in DishType){
        dishMenu.push(getRandomDish(type as DishType))
    }
}

export function filterMenu(type: DishType): Dish[] {
    return menu.filter((e) => e.type === type) as Dish[];
}

export function getRandomDish(type: DishType): Dish {
    let tmp = filterMenu(type);
    return tmp[randomIntFromInterval(0, tmp.length-1)];
}

export function dailyMenuToString():string {
    let res = ''
    for(let i = 0; i<dishMenu.length; i++)
        res += dishMenu[i].name + '\n';
    return res;
}

export function getEmbedMessage(): MessageEmbed {
    let reply: MessageEmbed = new MessageEmbed();
    let a: MessageEmbedAuthor = { name: "Lahabrea" };
    reply.author = a;
    reply.description = dailyMenuToString();
    reply.title = "~ Menu del Giorno ~";
    reply.setColor("RANDOM");
    return reply;
  }