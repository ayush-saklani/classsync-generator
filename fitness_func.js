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
            for (let i = 0; i < alltimetable['data'].length; i++) {        // all timetables
                if (alltimetable['data'][i]['timetable'][j][k].teacherid && alltimetable['data'][i]['timetable'][j][k].classid) {
                    // if class is empty or teacher is empty then skip
                    if (alltimetable['data'][i]['timetable'][j][k].classid == "" || alltimetable['data'][i]['timetable'][j][k].teacherid == "") continue;

                    if (temp[("teacher" + alltimetable['data'][i]['timetable'][j][k].teacherid)] || temp[("class" + alltimetable['data'][i]['timetable'][j][k].classid)]) {
                        if (temp[("teacher" + alltimetable['data'][i]['timetable'][j][k].teacherid)]) count_teacher_conflicts++;
                        if (temp[("class" + alltimetable['data'][i]['timetable'][j][k].classid)]) count_room_conflicts++;
                    } else {
                        temp[("class" + alltimetable['data'][i]['timetable'][j][k].classid)] = true;
                        temp[("teacher" + alltimetable['data'][i]['timetable'][j][k].teacherid)] = true;
                        temp[(("class" + alltimetable['data'][i]['timetable'][j][k].classid) + ";" + ("teacher" + alltimetable['data'][i]['timetable'][j][k].teacherid))] = true;
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
    for (let i = 0; i < alltimetable['data'].length; i++) {
        let timetable = alltimetable['data'][i].timetable;
        for (let j = 0; j < timetable.length; j++) {
            for (let k = 0; k < timetable[j].length; k++) {
                if (timetable[j][k].teacherid == "") continue;
                let curr_teacher_mark = j + ";" + k + ";" + timetable[j][k].teacherid;
                overload_teacher_map[curr_teacher_mark] = 1;
            }
        }
    }
    for (let i = 0; i < alltimetable['data'].length; i++) {
        let timetable = alltimetable['data'][i].timetable;
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
                                // console.log("Streak: " + streak);
                                overload_penalty += streak;
                            }
                            break;
                        }
                        let check_curr_teacher_mark = j + ";" + z + ";" + timetable[j][k].teacherid;
                        if (overload_teacher_map[check_curr_teacher_mark]) {
                            streak++;
                        } else {
                            if (streak > 2) {
                                // console.log("Streak: " + streak + " " + check_curr_teacher_mark);
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
    let overload_penalty_student_arr = [];
    let active_day_count_arr = [];
    for (let i = 0; i < alltimetable['data'].length; i++) {
        let overload_penalty_student = 0;
        let active_day_count = 0;

        let timetable = alltimetable['data'][i].timetable;
        for (let j = 0; j < timetable.length; j++) {
            let streak = 0;
            let active = false;
            for (let k = 0; k < timetable[j].length; k++) {
                if (timetable[j][k].teacherid == "") {
                    if (streak > 3) {
                        overload_penalty_student += streak - 3;
                    }
                    streak = 0;
                } else {
                    streak++;
                    active = true;
                }
            }
            if (active) {
                active_day_count++;
            }
        }
        overload_penalty_student_arr.push(overload_penalty_student);
        active_day_count_arr.push(active_day_count);
        alltimetable['data'][i].local_fitness = 100 - (overload_penalty_student * 5);
        alltimetable['data'][i].local_fitness += (active_day_count == 4 || active_day_count == 5) ? 20 : -20;
    }
    let total_overload_penalty_student = (overload_penalty_student_arr.reduce((a, b) => a + b, 0)).toFixed(2);;
    let avg_active_day_count = (active_day_count_arr.reduce((a, b) => a + b, 0)) / active_day_count_arr.length;


    console.log("Student Overload Penalty       ======== " + overload_penalty_student_arr);
    console.log("Total Student Overload Penalty ======== " + total_overload_penalty_student);
    console.log("Active Day Count               ======== " + active_day_count_arr);
    console.log("Average Active Day Count       ======== " + avg_active_day_count);
    // ================== Student Overload calculation [experiment ends] ==================
    // ====================================================================================

    let real_fitness_score = 100 - (count_teacher_conflicts * 20) - (count_room_conflicts * 15) - (overload_penalty * 10) - (total_overload_penalty_student * 5);
    real_fitness_score += (avg_active_day_count == 4 || avg_active_day_count == 5) ? 20 : -20;
    alltimetable['fitness'] = real_fitness_score;
    fs.writeFileSync('data2.json', JSON.stringify(alltimetable, null, 4), 'utf8');

    return ({ fitness_score: real_fitness_score });
};
console.log(fitness_func(alltimetable));

export default fitness_func;