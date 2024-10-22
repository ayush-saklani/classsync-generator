let config = {
    min: 0,
    max: 49,
    population_size: 10,
    min_local_fitness: 100,
    showstats: false,
    min_global_fitness: 210,
    max_generation: 100,
    eliteRate: 0.05,
    selectionRate: 1,
    mutationRate: 0.01,
    max_streak : 4,
    max_streak_student: 4,
};

export default config;

// let min = 0;                             // if 10 then start from 10 (tuesday 9am)
// let max = 49;                            // it 59 then end at 59  (saturday 6pm)

// Timtable in 2D-array (just for reference)
//  0  1  2  3  4  5  6  7  8  9        monday
// 10 11 12 13 14 15 16 17 18 19        tuesday
// 20 21 22 23 24 25 26 27 28 29        wednesday
// 30 31 32 33 34 35 36 37 38 39        thursday
// 40 41 42 43 44 45 46 47 48 49        friday
// 50 51 52 53 54 55 56 57 58 59        saturday
// 60 61 62 63 64 65 66 67 68 69        sunday
//              |
//             \/
//           index = [6,4] in 2D array   and yes i made it by myself not AI :P and yes it is copied from above :P, 