let config = {
  min: 0,                                       // if 10 then start from 10 (tuesday 9am)
  max: 49,                                      // it 59 then end at 59  (saturday 6pm)
  population_size: 10,                          // population size
  showstats: false,                             // toggle to show stats of each generation // true for debugging // (not fine tuned yet)
  min_local_fitness: 80,                        // minimum local fitness score which is bare minimum to be acceptable
  min_global_fitness: 180,                      // minimum global fitness score which is bare minimum to be acceptable
  max_generation: 1000000,                      // maximum generation limit to avoid infinite computation of poor offsprings
  eliteRate: 0.05,                              // elite rate (5% of population) will be selected as elites for next generation
  selectionRate: 1,                             // selection rate (100% of population) will be selected for crossover (not used rn)
  mutationRate: 0.01,                           // mutation rate (1% of population) will be mutated for next generation
  max_streak: 4,                                // maximum consecutive slot allocation allowed for a teacher
  max_streak_student: 4,                        // maximum consecutive slot allocation allowed for a student
  acceptable_Global_Fitness_Score: 300,         // acceptable Global Fitness Score (Final Result)
  acceptable_Local_Fitness_Score_min: 125,      // acceptable Local Fitness Score (Final Result)
  acceptable_Local_Fitness_Score_bareminimum: 100,// acceptable Local Fitness Score (Final Result)
  acceptable_Local_Fitness_Score_percentage: 1, // acceptable Local Fitness Score (Final Result)
};

export default config;

// let min = 0;                                 // if 10 then start from 10 (tuesday 9am)
// let max = 49;                                // it 59 then end at 59  (saturday 6pm)

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
//           index = [6,4] in 2D array   and yes i made it by myself not AI :P and yes it is copied from above :P
//           // Additional notes can be added here for clarity