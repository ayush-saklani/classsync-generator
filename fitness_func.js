import fs from 'fs';

let alltimetable = JSON.parse(fs.readFileSync('data2.json', 'utf8'));

const fitness_func = (timetable) => {
    let fitness = 0;

    for (let i = 0; i < 7; i++) {
        let free_period_counter_morning = 0;
        let free_period_counter_afternoon = 0;
        for (let j = 0; j < 10; j++) {

            if (timetable.timetable[i][j].classid === "") {
                if (j < 5) {
                    free_period_counter_morning++;
                } else {
                    free_period_counter_afternoon++;
                }
            }
        }
        if ((free_period_counter_morning + free_period_counter_afternoon) === 10) {
            fitness += 2;
            continue;
        }
        if (free_period_counter_morning === 5) {
            fitness += 1;
        }
        if (free_period_counter_afternoon === 5) {
            fitness += 1;
        }
    }
    for (let i = 0; i < 7; i++) {
        let curr_class = 0;
        for (let j = 0; j < 10; j++) {
            if (timetable.timetable[i][j].classid != "") {
                curr_class++;
            } else {
                curr_class = 0;
            }
            if (curr_class > 3) {
                // fitness = fitness - 2;
                fitness = fitness - curr_class;
            }
        }
    }
    return fitness;
};
console.log(fitness_func(alltimetable[2]));
// console.log((alltimetable[0]));

export default fitness_func;