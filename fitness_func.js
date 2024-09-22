import fs from 'fs';
let alltimetable = JSON.parse(fs.readFileSync('data2.json', 'utf8'));

const fitness_func = (alltimetable) => {
    // ====================================================================================
    // ================== Teacher and Room Conflicts [experiment starts] ==================
    let count_teacher_conflicts = 0;
    let count_room_conflicts = 0;
    for (let j = 0; j < 7; j++) {                               // monday to sunday
        for (let k = 0; k < 10; k++) {                          // 8am to 6pm
            let temp = {}
            for (let i = 0; i < alltimetable.length; i++) {        // all timetables
                if (alltimetable[i]['timetable'][j][k].teacherid && alltimetable[i]['timetable'][j][k].classid) {
                    // if class is empty or teacher is empty then skip
                    if (alltimetable[i]['timetable'][j][k].classid == "" || alltimetable[i]['timetable'][j][k].teacherid == "") continue;

                    if (temp[("teacher" + alltimetable[i]['timetable'][j][k].teacherid)] || temp[("class" + alltimetable[i]['timetable'][j][k].classid)]) {
                        if (temp[("teacher" + alltimetable[i]['timetable'][j][k].teacherid)]) count_teacher_conflicts++;
                        if (temp[("class" + alltimetable[i]['timetable'][j][k].classid)]) count_room_conflicts++;
                    } else {
                        temp[("class" + alltimetable[i]['timetable'][j][k].classid)] = true;
                        temp[("teacher" + alltimetable[i]['timetable'][j][k].teacherid)] = true;
                        temp[(("class" + alltimetable[i]['timetable'][j][k].classid) + ";" + ("teacher" + alltimetable[i]['timetable'][j][k].teacherid))] = true;
                    }
                }
            }
        }
    }
    if (count_teacher_conflicts > 0 || count_room_conflicts > 0) {
        console.log("Teacher Conflicts: " + count_teacher_conflicts);
        console.log("Room Conflicts: " + count_room_conflicts);
    }
    // ================== Teacher and Room Conflicts [experiment ends] ====================
    // ====================================================================================

    // ====================================================================================
    //================= Teacher Overload calculation [experiment starts]===================
    let overload_penalty = 0;
    let overload_teacher_map = {}
    for (let i = 0; i < alltimetable.length; i++) {
        let timetable = alltimetable[i].timetable;
        for (let j = 0; j < timetable.length; j++) {
            for (let k = 0; k < timetable[j].length; k++) {
                if (timetable[j][k].teacherid == "") continue;
                let curr_teacher_mark = j + ";" + k + ";" + timetable[j][k].teacherid;
                overload_teacher_map[curr_teacher_mark] = 1;
            }
        }
    }
    for (let i = 0; i < alltimetable.length; i++) {
        let timetable = alltimetable[i].timetable;
        for (let j = 0; j < timetable.length; j++) {
            for (let k = 0; k < timetable[j].length; k++) {
                if (timetable[j][k].teacherid == "") continue;
                let curr_teacher_mark = k + ";" + k + ";" + timetable[j][k].teacherid;
                if (overload_teacher_map[curr_teacher_mark] > 0) {
                    let z = k;
                    let streak = 0;
                    while (1) {
                        if (z >= timetable[j].length - 1) {
                            if (streak > 2) {
                                console.log("Streak: " + streak);
                                overload_penalty += streak;
                            }
                            break;
                        }
                        let check_curr_teacher_mark = j + ";" + z + ";" + timetable[j][k].teacherid;
                        if (overload_teacher_map[check_curr_teacher_mark]) {
                            streak++;
                        } else {
                            if (streak > 2) {
                                console.log("Streak: " + streak + " " + check_curr_teacher_mark);
                                overload_penalty += streak;
                            }
                            break;
                        }
                        z++;
                    }
                }
            }
        }
    }
    //================= Teacher Overload calculation [experiment ends]=====================
    // ====================================================================================


    // ====================================================================================
    // ================== Student Overload calculation [experiment starts] ================
    let overload_penalty_student = 0;
    // for (let i = 0; i < alltimetable.length; i++) {
    //     let timetable = alltimetable[i].timetable;
    //     for (let j = 0; j < timetable.length; j++) {
    //         for (let k = 0; k < timetable[j].length; k++) {
    //             if (timetable[j][k].teacherid == "") continue;
    //             let curr_teacher_mark = j + ";" + k + ";" + timetable[j][k].teacherid;
    //             overload_teacher_map[curr_teacher_mark] = 1;
    //         }
    //     }
    // }
    // check if continous 3 periods are there for a section then penalize it  
    // and if a day is off then it will be considered as as rest day hence rewarded by 10 marks

    // ================== Student Overload calculation [experiment ends] ==================
    // ====================================================================================

    
    let real_fitness_score = 100 - (count_teacher_conflicts * 20) - (count_room_conflicts * 15) - (overload_penalty * 10);
    return ({ fitness_score: real_fitness_score });
};
console.log(fitness_func(alltimetable));

export default fitness_func;