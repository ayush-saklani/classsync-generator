import fs from 'fs';
let no_of_timetable = 20;

//  structure of timetable as template
let timetablestructure = [
    [{ "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }],
    [{ "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }],
    [{ "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }],
    [{ "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }],
    [{ "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }],
    [{ "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }],
    [{ "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }]
];

//  room data
let room = JSON.parse(fs.readFileSync('room.json', 'utf8'));

let max = 60; // 6 days * 10 hours mon to sat 8am to 6pm

let alltimetable = JSON.parse(fs.readFileSync('data.json', 'utf8'));

const validate_timetable_slot = (alltimetable, j, k,teacherid) => {
    // 8am to 6pm
    let temp = {}
    if (alltimetable.length == 0) { return true; }
    for (let i = 0; i < alltimetable.length; i++) {        // all timetables
        if (alltimetable[i]['timetable'][j][k].teacherid) {         // if class is empty
            if (temp[("teacher" + alltimetable[i]['timetable'][j][k].teacherid)]) {
                return false;
            } else {
                temp[("teacher" + alltimetable[i]['timetable'][j][k].teacherid)] = true;         // teacher is not required now 
            }
        }
    }
    if (temp[("teacher" + teacherid)]) {
        return false;
    } else{
        return true;
    }
}

let flag = 0;   // flag to check the number of conflicts in the timetable generation
let number_of_sections = 5;     // number of timetable to generate
for (let i = 0; i < alltimetable.length; i++) {
    console.log("Generating Timetables for Section " + i);
    let subjects = JSON.parse(JSON.stringify(alltimetable[i].subjects));  // deep copy of subjects
    let timetable = JSON.parse(JSON.stringify(timetablestructure)); // deep copy of timetablestructure
    while (subjects.length > 0) {
        let tempsubjectindex = (Math.floor(Math.random() * subjects.length));   // randomly choose subject\
        // console.log(subjects);

        if (subjects[tempsubjectindex]) {
            let temp = Math.floor(Math.random() * max);
            // console.log(temp + " || " + (Math.floor(temp / 10)) + " || " + (Math.floor((temp % 10))));
            if (timetable[(Math.floor(temp / 10))][(Math.floor(temp % 10))].teacherid == "" ) {
                if(validate_timetable_slot(alltimetable, (Math.floor(temp / 10)), (Math.floor(temp % 10)), subjects[tempsubjectindex].teacherid)){
                    timetable[(Math.floor(temp / 10))][(Math.floor(temp % 10))].teacherid = subjects[tempsubjectindex].teacherid;
                    subjects[tempsubjectindex].weekly_hrs--;
                    if (subjects[tempsubjectindex].weekly_hrs == 0) {
                        subjects.splice(tempsubjectindex, 1); // remove subject from list and 
                    }
                }else{
                    flag++;
                    // console.log(flag);
                } 
            }
        }
    }
    console.log("===========================================================");
    alltimetable[i].timetable = timetable;
}

fs.writeFileSync('data2.json', JSON.stringify(alltimetable), 'utf8');


//      Timtable in 2D-array
//  0  1  2  3  4  5  6  7  8  9
// 10 11 12 13 14 15 16 17 18 19
// 20 21 22 23 24 25 26 27 28 29
// 30 31 32 33 34 35 36 37 38 39
// 40 41 42 43 44 45 46 47 48 49
// 50 51 52 53 54 55 56 57 58 59
//              |
//             \/
//           index = [5,4] in 2D array
