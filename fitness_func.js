import fs from 'fs';
let alltimetable = JSON.parse(fs.readFileSync('data2.json', 'utf8'));

const fitness_func = (alltimetable) => {
    let res = [];
    for (let i = 0; i < alltimetable.length; i++) {
        let timetable = alltimetable[i].timetable;
        let fitness_score = 0;
        let teacher_conflicts = 0;
        let room_conflicts = 0;
        let day_overload_penalty = 0;

        // Step 1: Check for teacher and room conflicts
        for (let j = 0; j < timetable.length; j++) {            // loop through days
            let teacher_map = {};  // Track teacher per slot across the day
            let room_map = {};     // Track room per slot across the day

            // Loop through the day's timetable slots
            for (let k = 0; k < timetable[j].length; k++) {  // j represents the current day
                let current_teacher = timetable[j][k].teacherid;
                let current_room = timetable[j][k].classid;

                if (current_teacher !== "" && current_room !== "") {
                    // Initialize the slot in the maps if it doesn't exist
                    if (!teacher_map[k]) {
                        teacher_map[k] = new Set();  // Track teachers assigned to this slot
                    }
                    if (!room_map[k]) {
                        room_map[k] = new Set();  // Track rooms assigned to this slot
                    }

                    // Check for teacher conflict
                    if (teacher_map[k].has(current_teacher)) {
                        teacher_conflicts++;
                    } else {
                        teacher_map[k].add(current_teacher);  // Assign teacher to this slot
                    }

                    // Check for room conflict
                    if (room_map[k].has(current_room)) {
                        room_conflicts++;
                    } else {
                        room_map[k].add(current_room);  // Assign room to this slot
                    }
                }
            }


            // Step 2: Check for day overload for each teacher
            for (let teacher in teacher_map) {
                let teacher_slots = Object.keys(teacher_map).length;
                if (teacher_slots > 5) {    // let's say more than 5 classes in a day is excessive
                    day_overload_penalty++;
                }
            }
        }

        // Step 3: Check for weekly hours fulfillment for each subject
        let weekly_hours_bonus = 0;
        alltimetable[i].subjects.forEach(subject => {
            let total_hours = subject.weekly_hrs;
            let assigned_hours = 0;
            for (let j = 0; j < timetable.length; j++) {
                for (let k = 0; k < timetable[j].length; k++) {
                    if (timetable[j][k].teacherid === subject.teacherid) {
                        assigned_hours++;
                    }
                }
            }
            if (assigned_hours === total_hours) {
                weekly_hours_bonus += 5;  // reward for fulfilling weekly hours
            }
        });

        // Step 4: Calculate final fitness score
        fitness_score = (weekly_hours_bonus * 10) - (teacher_conflicts * 20) - (room_conflicts * 15) - (day_overload_penalty * 10);
        res.push({ section: (alltimetable[i].section || i), fitness_score: fitness_score });
        console.log(day_overload_penalty)
    }
    // Calculate the average fitness score
    let total_fitness_score = res.reduce((acc, curr) => acc + curr.fitness_score, 0);
    let avg_fitness_score = total_fitness_score / res.length;
    // console.log("Average Fitness Score: " + avg_fitness_score);
    res.push({ fitness_score: avg_fitness_score });
    return res;
};
console.log(fitness_func(alltimetable));

export default fitness_func;