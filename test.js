import fs from 'fs';
import initialize_population from "./plot_timetables.js";
import { all } from 'mathjs';
let showstats = true;                                                   //  show the stats of the timetable generation

let min = 0; // if 10 then start from 10 (tuesday 9am)   
let max = 50; // it 60 then end at 59  (saturday 6pm) (60 is not included)
let temp = []

for(let i = 0; i < 100; i++){
    let alltimetable = JSON.parse(fs.readFileSync('data.json', 'utf8'));    //  timetable data with subjects and teachers already assigned
    let room = JSON.parse(fs.readFileSync('room.json', 'utf8'));            //  (capacity is not implemented in this code right now)
    temp.push(initialize_population(alltimetable, room, min, max, false));
    if(temp[i].fitness >100){
        fs.writeFileSync('data2.json', JSON.stringify(temp[i], null, 4), 'utf8');
    }
}