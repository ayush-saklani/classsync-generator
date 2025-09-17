import fs from 'fs';
import config from './config.js';

const teacher_and_room_conflicts = (alltimetable) => {
    let count_teacher_conflicts = 0;
    let count_room_conflicts = 0;
    // monday to sunday
    for (let j = 0; j < 7; j++) {
        // 8am to 6pm                       
        for (let k = 0; k < 10; k++) {
            let temp = {}
            for (let i = 0; i < alltimetable['data'].length; i++) {        // all timetables
                if (alltimetable['data'][i]['timetable'][j][k].teacherid && alltimetable['data'][i]['timetable'][j][k].roomid) {
                    if (alltimetable['data'][i]['timetable'][j][k].roomid == "" || alltimetable['data'][i]['timetable'][j][k].teacherid == "") continue;

                    if (temp[("teacher" + alltimetable['data'][i]['timetable'][j][k].teacherid)] || temp[("room" + alltimetable['data'][i]['timetable'][j][k].roomid)]) {
                        if (temp[("teacher" + alltimetable['data'][i]['timetable'][j][k].teacherid)]) count_teacher_conflicts++;
                        if (temp[("room" + alltimetable['data'][i]['timetable'][j][k].roomid)]) count_room_conflicts++;
                    } else {
                        temp[("room" + alltimetable['data'][i]['timetable'][j][k].roomid)] = true;
                        temp[("teacher" + alltimetable['data'][i]['timetable'][j][k].teacherid)] = true;
                        temp[(("room" + alltimetable['data'][i]['timetable'][j][k].roomid) + ";" + ("teacher" + alltimetable['data'][i]['timetable'][j][k].teacherid))] = true;
                    }
                    if (alltimetable['data'][i].joint) {
                        let otherteacherids = alltimetable['data'][i].subjects.find(
                            (subject) => subject.subjectid == alltimetable['data'][i].timetable[j][k].subjectid
                        ).merge_teachers;
                        if (otherteacherids.length > 0) {
                            otherteacherids.forEach((otherteacherid) => {
                                if (temp[("teacher" + otherteacherid)]) {
                                    count_teacher_conflicts++;
                                } else {
                                    temp[("teacher" + otherteacherid)] = true;
                                }
                            });
                        }
                    }
                }
            }
        }
    }
    return {
        "count_teacher_conflicts": count_teacher_conflicts,
        "count_room_conflicts": count_room_conflicts
    };
}
const calc_teacher_overload = (teacherid, overload_teacher_map) => {
    let streak = 0;
    for (let j = 0; j < 7; j++) {
        let local_streak = 0;
        for (let k = 0; k < 10; k++) {
            let curr_teacher_mark = j + ";" + k + ";" + teacherid;
            if (overload_teacher_map[curr_teacher_mark] == true) {
                local_streak++;
            } else if (overload_teacher_map[curr_teacher_mark] == false || overload_teacher_map[curr_teacher_mark] == undefined) {
                if (local_streak > config.max_streak) {
                    streak = streak + (local_streak - config.max_streak);
                }
                local_streak = 0;
            }
        }
    }
    return streak;
}
const teacher_overload_penalty = (alltimetable) => {
    let total_overload_penalty_teacher = 0;
    let overload_teacher_map = {}
    let teacher_map = {};
    for (let i = 0; i < alltimetable['data'].length; i++) {
        let timetable = alltimetable['data'][i].timetable;
        for (let j = 0; j < timetable.length; j++) {
            for (let k = 0; k < timetable[j].length; k++) {
                if (timetable[j][k].teacherid == "") continue;
                if (alltimetable['data'][i].joint) {
                    let otherteacherids = alltimetable['data'][i].subjects.find(
                        (subject) => subject.subjectid == alltimetable['data'][i].timetable[j][k].subjectid
                    ).merge_teachers;
                    if (otherteacherids.length > 0) {
                        otherteacherids.forEach((otherteacherid) => {
                            overload_teacher_map[(j + ";" + k + ";" + otherteacherid)] = true;
                            teacher_map[otherteacherid] = true;
                        });
                    }
                }
                let curr_teacher_mark = j + ";" + k + ";" + timetable[j][k].teacherid;
                overload_teacher_map[curr_teacher_mark] = true;
                teacher_map[timetable[j][k].teacherid] = true;
            }
        }
    }
    for (let teacher in teacher_map) {
        let streak = calc_teacher_overload(teacher, overload_teacher_map);
        total_overload_penalty_teacher += streak;
    }
    return total_overload_penalty_teacher;
}
const max_slot_per_day = (alltimetable) => {
    let penalty = 0;
    let penalties_per_timetable = [];
    for (let i = 0; i < alltimetable['data'].length; i++) {
        let timetable = alltimetable['data'][i].timetable;
        let local_penalty = 0;
        for (let j = 0; j < timetable.length; j++) { // for each day
            let slot_count = 0;
            for (let k = 0; k < timetable[j].length; k++) { // for each slot
                if (timetable[j][k].teacherid && timetable[j][k].teacherid !== "") {
                    slot_count++;
                }
            }
            if (slot_count > config.max_slot_per_day) {
                local_penalty += (slot_count - config.max_slot_per_day);
            }
        }
        penalties_per_timetable.push(local_penalty);
        penalty += local_penalty;
    }
    return { penalty, penalties_per_timetable };
}
const student_overload_penalty = (alltimetable) => {
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
                    if (streak > config.max_streak_student) {
                        overload_penalty_student += (streak - config.max_streak_student);
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
    let total_overload_penalty_student = (overload_penalty_student_arr.reduce((a, b) => a + b, 0)).toFixed(2);
    let avg_active_day_count = (active_day_count_arr.reduce((a, b) => a + b, 0)) / active_day_count_arr.length;
    return {
        "total_overload_penalty_student": total_overload_penalty_student,
        "avg_active_day_count": avg_active_day_count,
        "alltimetable": alltimetable
    }
}
const perfect_day_reward = (alltimetable) => {
    let perfect_day_status_average = '';
    let total_perfect_day_reward = 0;
    let perfect_dat_reward_map = {
        'PerfectDay': 25,
        'GoodDay': 10,
        'AverageDay': 5,
        'PoorDay': -20,
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
            if (day_load == 0) {
                perfect_day_status = 'Holiday';
            }
            else if ((day_start >= 0 && day_start <= 4) && (day_end <= 4 && day_end >= 0)) {          // 8am to 1pm
                perfect_day_status = (day_load >= 4) ? 'PerfectDay' : (day_load >= 3) ? 'GoodDay' : 'PoorDay';
            }
            else if ((day_start >= 4 && day_start <= 7) && (day_end <= 7 && day_end >= 4)) {         // 12pm to 4pm
                perfect_day_status = (day_load >= 3) ? 'PerfectDay' : (day_load >= 2) ? 'GoodDay' : 'PoorDay';
            }
            else if ((day_start >= 4 && day_start <= 9) && (day_end <= 9 && day_end >= 4)) {          // 12pm to 6pm
                perfect_day_status = (day_load >= 4) ? 'PerfectDay' : (day_load >= 3) ? 'GoodDay' : 'PoorDay';
            }
            else if ((day_start >= 0 && day_start <= 7) && (day_end <= 7 && day_end >= 0)) {          // 8am to 4pm
                perfect_day_status = (day_load >= 6) ? 'PerfectDay' : (day_load >= 5) ? 'GoodDay' : (day_load >= 4) ? 'AverageDay' : 'PoorDay';
            }
            else if ((day_start >= 0 && day_start <= 9) && (day_end <= 9 && day_end >= 0)) {          // 8am to 6pm
                perfect_day_status = (day_load >= 7) ? 'PerfectDay' : (day_load >= 6) ? 'GoodDay' : (day_load >= 5) ? 'AverageDay' : 'PoorDay';
            }else{
                console.log("Unexpected case in perfect day calculation for timetable index: " + i + ", day index: " + j);
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
    return {
        "total_perfect_day_reward": total_perfect_day_reward,
        "alltimetable": alltimetable
    };
}
const fitness_func = (alltimetable) => {
    let temporary_var;
    // ====================== Teacher and Room Conflicts [experiment starts] ======================
    temporary_var = teacher_and_room_conflicts(alltimetable);
    let count_teacher_conflicts = temporary_var.count_teacher_conflicts;
    let count_room_conflicts = temporary_var.count_room_conflicts;
    // ============================================================================================

    //===================== Teacher Overload calculation [experiment starts]=======================
    let total_overload_penalty_teacher = teacher_overload_penalty(alltimetable);
    // ============================================================================================

    // ====================== Student Overload calculation [experiment starts] ====================
    temporary_var = student_overload_penalty(alltimetable);
    let total_overload_penalty_student = temporary_var.total_overload_penalty_student;
    let avg_active_day_count = temporary_var.avg_active_day_count;
    alltimetable = temporary_var.alltimetable;
    // ============================================================================================

    // =================== bus student come at 8am 12 am and leave at 1pm 4pm 6pm =================
    // ==================== perfect day reward calculation [experiment starts] ====================
    temporary_var = perfect_day_reward(alltimetable);
    let total_perfect_day_reward = temporary_var.total_perfect_day_reward;
    alltimetable = temporary_var.alltimetable;
    // ============================================================================================

    // ====================== Max Slot Per Day Penalty [experiment starts] ========================
    let max_slot_penalty_obj = max_slot_per_day(alltimetable);
    let total_max_slot_penalty = max_slot_penalty_obj.penalty;
    let penalties_per_timetable = max_slot_penalty_obj.penalties_per_timetable;
    // Apply local penalty to each timetable's local_fitness
    for (let i = 0; i < alltimetable['data'].length; i++) {
        alltimetable['data'][i].local_fitness -= penalties_per_timetable[i] * 8; // weight can be adjusted
    }
    // ============================================================================================

    // ====================== Average Local Fitness Calculation [experiment starts] =================
    let local_fitness_total = 0;
    for (let i = 0; i < alltimetable['data'].length; i++) {
        local_fitness_total += alltimetable['data'][i].local_fitness;
    }
    let avg_local_fitness_total = local_fitness_total / alltimetable['data'].length;
    // ============================================================================================

    let real_fitness_score = 0;
    real_fitness_score += (100 * alltimetable.data.length)
    real_fitness_score -= (count_teacher_conflicts * 20)
    real_fitness_score -= (count_room_conflicts * 20)
    real_fitness_score -= (total_overload_penalty_teacher * 20)
    real_fitness_score -= (total_overload_penalty_student * 8);
    real_fitness_score -= (total_max_slot_penalty * 8); // Apply global penalty
    real_fitness_score += (avg_active_day_count == 4 || avg_active_day_count == 5) ? (24 * alltimetable.data.length) : (-24 * alltimetable.data.length);
    real_fitness_score += total_perfect_day_reward;
    real_fitness_score += (avg_local_fitness_total * alltimetable.data.length);
    real_fitness_score = real_fitness_score / alltimetable.data.length;
    real_fitness_score = real_fitness_score.toFixed(6);
    alltimetable['fitness'] = real_fitness_score;

    if (config.showstats) {
        console.log("Teacher Conflicts               ========  " + count_teacher_conflicts);
        console.log("Room Conflicts                  ========  " + count_room_conflicts);
        console.log("Total Student Overload Penalty  ========  " + total_overload_penalty_student);
        console.log("Average Active Day Count        ========  " + avg_active_day_count);
        console.log("Teacher Overload Penalty        ========  " + total_overload_penalty_teacher);
        console.log("Real Fitness Score              ========  " + real_fitness_score);
        console.log("Total Perfect Day Reward        ========  " + total_perfect_day_reward);
    }
    return alltimetable;
};
const fitness_func_generation = (alltimetable) => {
    for (let i = 0; i < alltimetable.length; i++) {
        alltimetable[i] = fitness_func(alltimetable[i]);
    }
    alltimetable = alltimetable.sort((a, b) => b.fitness - a.fitness);
    return alltimetable;
};
export { fitness_func, fitness_func_generation };

// for testing purpose only
// let alltimetable = JSON.parse(fs.readFileSync('./JSON/population_selected.json', 'utf8'));
// alltimetable = fitness_func_generation(alltimetable);
// fs.writeFileSync('./JSON/population_selected.json', JSON.stringify(alltimetable, null, 4), 'utf8');