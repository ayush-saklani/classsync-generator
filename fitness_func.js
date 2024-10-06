import fs from 'fs';
import config from './config.js';

const fitness_func = (alltimetable) => {
    // ============================================================================================
    // ====================== Teacher and Room Conflicts [experiment starts] ======================
    let count_teacher_conflicts = 0;
    let count_room_conflicts = 0;
    for (let j = 0; j < 7; j++) {                               // monday to sunday
        for (let k = 0; k < 10; k++) {                          // 8am to 6pm
            let temp = {}
            for (let i = 0; i < alltimetable['data'].length; i++) {        // all timetables
                if (alltimetable['data'][i]['timetable'][j][k].teacherid && alltimetable['data'][i]['timetable'][j][k].roomid) {
                    if (alltimetable['data'][i]['timetable'][j][k].roomid == "" || alltimetable['data'][i]['timetable'][j][k].teacherid == "") continue;

                    if (temp[("teacher" + alltimetable['data'][i]['timetable'][j][k].teacherid)] || temp[("class" + alltimetable['data'][i]['timetable'][j][k].roomid)]) {
                        if (temp[("teacher" + alltimetable['data'][i]['timetable'][j][k].teacherid)]) count_teacher_conflicts++;
                        if (temp[("class" + alltimetable['data'][i]['timetable'][j][k].roomid)]) count_room_conflicts++;
                    } else {
                        temp[("class" + alltimetable['data'][i]['timetable'][j][k].roomid)] = true;
                        temp[("teacher" + alltimetable['data'][i]['timetable'][j][k].teacherid)] = true;
                        temp[(("class" + alltimetable['data'][i]['timetable'][j][k].roomid) + ";" + ("teacher" + alltimetable['data'][i]['timetable'][j][k].teacherid))] = true;
                    }
                }
            }
        }
    }
    // ====================== Teacher and Room Conflicts [experiment ends] ========================
    // ============================================================================================


    // ============================================================================================
    //===================== Teacher Overload calculation [experiment starts]=======================
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
                let curr_teacher_mark = j + ";" + k + ";" + timetable[j][k].teacherid;
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
    //===================== Teacher Overload calculation [experiment ends]=========================
    // ============================================================================================


    // ============================================================================================
    // ====================== Student Overload calculation [experiment starts] ====================
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
                        overload_penalty_student += streak;
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
        alltimetable['data'][i].local_fitness = 100 - (overload_penalty_student * 6);
        alltimetable['data'][i].local_fitness += (active_day_count == 4 || active_day_count == 5) ? 20 : -20;
    }
    let total_overload_penalty_student = (overload_penalty_student_arr.reduce((a, b) => a + b, 0)).toFixed(2);;
    let avg_active_day_count = (active_day_count_arr.reduce((a, b) => a + b, 0)) / active_day_count_arr.length;
    // ====================== Student Overload calculation [experiment ends] ======================
    // ============================================================================================


    // ============================================================================================
    // =================== bus student come at 8am 12 am and leave at 1pm 4pm 6pm =================
    // ==================== perfect day reward calculation [experiment starts] ====================
    let perfect_day_status_average = '';
    let total_perfect_day_reward = 0;
    let perfect_dat_reward_map = {
        'PerfectDay': 10,
        'GoodDay': 5,
        'AverageDay': 0,
        'PoorDay': -10,
        'Holiday': 0
    };
    for (let i = 0; i < alltimetable['data'].length; i++) {
        let timetable = alltimetable['data'][i].timetable;
        let perfect_day_status = '';
        let perfect_day_status_arr = [];

        for (let j = 0; j < timetable.length; j++) {
            let day_start = 0;
            let day_end = 0;
            let day_load = 0;
            let flag = true;
            for (let k = 0; k < timetable[j].length; k++) {
                if (timetable[j][k].teacherid == "") {
                    continue;
                }
                else {
                    day_load++;
                    if (flag) {
                        day_start = k;
                        flag = false;
                    }
                    day_end = k;
                }
            }
            if ((day_start >= 0 && day_start <= 4) && (day_end <= 4 && day_end >= 0)) {
                perfect_day_status = (day_load >= 3) ? 'PerfectDay' : 'PoorDay';
            }
            else if ((day_start >= 4 && day_start <= 9) && (day_end <= 9 && day_end >= 4)) {
                perfect_day_status = (day_load >= 4) ? 'PerfectDay' : (day_load >= 2) ? 'GoodDay' : 'poorDay';
            }
            else if ((day_start >= 0 && day_start <= 7) && (day_end <= 7 && day_end >= 0)) {
                perfect_day_status = (day_load >= 6) ? 'PerfectDay' : (day_load >= 4) ? 'GoodDay' : (day_load >= 2) ? 'AverageDay' : 'PoorDay';
            }
            else if (day_load == 0) {
                perfect_day_status = 'Holiday';
            }
            else {
                perfect_day_status = (day_load >= 7) ? 'GoodDay' : (day_load >= 5) ? 'AverageDay' : 'PoorDay';
            }
            if (perfect_day_status != 'Holiday') {
                perfect_day_status_arr.push(perfect_day_status);
            }
        }
        // console.log(perfect_day_status_arr);
        // remove the most frequent element from the array
        perfect_day_status_average = perfect_day_status_arr.sort((a, b) =>
            perfect_day_status_arr.filter(v => v === a).length - perfect_day_status_arr.filter(v => v === b).length).pop();
        alltimetable['data'][i].local_fitness += perfect_dat_reward_map[perfect_day_status_average];
        total_perfect_day_reward += perfect_dat_reward_map[perfect_day_status_average];
    }
    // ====================== perfect day reward calculation [experiment starts] ==================
    // ============================================================================================

    // ============================================================================================
    // ====================== Average Local Fitness Calculation [experiment starts] =================
    let local_fitness_total = 0;
    for(let i = 0; i < alltimetable['data'].length; i++){
        local_fitness_total += alltimetable['data'][i].local_fitness;
    }
    let avg_local_fitness_total = local_fitness_total / alltimetable['data'].length;
    // ====================== Average Local Fitness Calculation [experiment ends] ===================
    // ============================================================================================

    let real_fitness_score = 0;
    real_fitness_score += (100 * alltimetable.data.length) 
    real_fitness_score -= (count_teacher_conflicts * 20) 
    real_fitness_score -= (count_room_conflicts * 20) 
    real_fitness_score -= (overload_penalty * 14) 
    real_fitness_score -= (total_overload_penalty_student * 6);
    real_fitness_score += (avg_active_day_count == 4 || avg_active_day_count == 5) ? 24 : -24;
    real_fitness_score += total_perfect_day_reward;
    real_fitness_score += avg_local_fitness_total;
    real_fitness_score = Math.ceil(real_fitness_score)
    alltimetable['fitness'] = real_fitness_score;

    if (config.showstats) {
        console.log("Teacher Conflicts               ========  " + count_teacher_conflicts);
        console.log("Room Conflicts                  ========  " + count_room_conflicts);
        console.log("Student Overload Penalty        ========  " + overload_penalty_student_arr);
        console.log("Total Student Overload Penalty  ========  " + total_overload_penalty_student);
        console.log("Active Day Count                ========  " + active_day_count_arr);
        console.log("Average Active Day Count        ========  " + avg_active_day_count);
        console.log("Teacher Overload Penalty        ========  " + overload_penalty);
        console.log("Real Fitness Score              ========  " + real_fitness_score);
        console.log("Total Perfect Day Reward        ========  " + total_perfect_day_reward);
    }
    return alltimetable;
};

export default fitness_func;

// for testing purpose only
let alltimetable = JSON.parse(fs.readFileSync('population_selected.json', 'utf8'));        // for testing purpose only
for(let i=0; i<alltimetable.length; i++){
    alltimetable[i] = fitness_func(alltimetable[i]);
}                          
fs.writeFileSync('population_selected.json', JSON.stringify(alltimetable, null, 4), 'utf8');