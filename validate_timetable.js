// this function will validate the array of timetable and flag out the room and teacher conflicts from that batch of timetables
import fs from 'fs';
const validate_timetable = (timetable) => {
    let day = ["Mon", "Tue", "Wedn", "Thu", "Fri", "Sat", "Sun"];
    let slot = ["08-09", "09-10", "10-11", "11-12", "12-01", "01-02", "02-03", "03-04", "04-05", "05-06"];
    for (let j = 0; j < 7; j++) {                               // monday to sunday
        for (let k = 0; k < 10; k++) {                          // 8am to 6pm
            let temp = {}
            for (let i = 0; i < timetable.length; i++) {        // all timetables
                if (timetable[i]['timetable'][j][k].teacherid) {         // if class is empty
                // if (timetable[i][j][k].classid != "") {         // if class is empty
                    if (temp[("teacher" + timetable[i]['timetable'][j][k].teacherid)]) {
                        process.stdout.write(temp[("class" + timetable[i]['timetable'][j][k].classid)] ? "class conflicts " : "class error safe");
                        process.stdout.write("    --------    ");
                        process.stdout.write(temp[("teacher" + timetable[i]['timetable'][j][k].teacherid)] ? "teacher conflicts " : "teacher error safe");
                        process.stdout.write("    --------    ");
                        process.stdout.write(i+" "+j+" "+k+" conflict at" + " Day : " + day[j] + " Period : " + slot[j] + " Class id : " + timetable[i]['timetable'][j][k].classid + " Teacher id : " + timetable[i]['timetable'][j][k].teacherid);
                        console.log("");
                        // return false;
                    } else {
                        // temp[("class" + timetable[i][j][k].classid)] = true;
                        temp[("teacher" + timetable[i]['timetable'][j][k].teacherid)] = true;
                    }
                }
            }    
        }
    }
    return true;
}
let timetable = JSON.parse(fs.readFileSync('data2.json', 'utf8'));
validate_timetable(timetable);
export default validate_timetable;
