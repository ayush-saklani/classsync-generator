# **Class-Sync Generator** <img src="assets/img/new-logo-white.svg" height="55" align="left"/>
**This is the all new addition to the classsync where we are introducing the automation in timetable generation using genetic algorithm.**<br>
**_(currently in the intitial-coding-ish phase of development)_** 

# **Languages, Frameworks and Tools**
<div align="left" style="margin: 10px;">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" height="75"/>
<img src="https://static-00.iconduck.com/assets.00/node-js-icon-454x512-nztofx17.png"height="75"/>
<!-- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original-wordmark.svg" height="75"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongoose/mongoose-original-wordmark.svg" height="75"/> -->
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/json/json-plain.svg" height="75"/>
</div>

# Data and Algorithm Flow
<img src="./assets/img/GA Flow diagram.png" />

| **Step**                      | **Description**                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Data Collection               | Gather all necessary data including teacher availability, room availability, and subject requirements.                                 |
| Initial Population Generation | Create an initial set of possible timetables (population).                                                                             |
| Fitness Evaluation            | Evaluate each timetable based on predefined criteria such as teacher conflicts, room conflicts, and adherence to subject requirements. |
| Selection                     | Select the best-performing timetables to serve as parents for the next generation.                                                     |
| Crossover and Mutation        | Generate new timetables by combining parts of the selected parents and introducing small random changes (mutations).                   |
| Iteration                     | Repeat the evaluation, selection, and crossover/mutation steps for several generations until an optimal timetable is found.            |
| Final Timetable               | Select the best timetable from the final generation as the solution.                                                                   |

___This process ensures that the generated timetable is optimized for the given constraints and requirements.___

# Data Structure Used 

```
data.JSON (example)
{
    "fitness": 0,
    "data":[
        {
            "local_fitness": 0,
            "timetable": [
                [{ "classid": "", "teacherid": "" }, ........ for 10 periods ],
                [{ "classid": "", "teacherid": "" }, ........ for 10 periods ],
                "
                "
                "
                .... for 7 days a week 
            ],
            "subjects": [
                {
                    "subjectid": "TEST1",
                    "teacherid": "2118526",
                    "weekly_hrs": 3,
                    "type": "theory"
                },
                {
                    "subjectid": "PTEST1",
                    "teacherid": "21185299",
                    "weekly_hrs": 2,
                    "type": "practical"
                },
                ... as many subject as we want to plot
            ]
        },
        {
            "local_fitness": 0,
            "timetable": [
                [{ "classid": "", "teacherid": "" }, ........ for 10 periods ],
                "
                "
                .... for 7 days a week 
            ],
            "subjects": [
                {
                    "subjectid": "TEST1",
                    "teacherid": "2118526",
                    "weekly_hrs": 3,
                    "type": "theory"
                },
                ... as many subject as we want to plot
            ]
        },
        .... as many sections as we need with predecided teacher and subjects 
    ]
}
```

<img src="assets/img/structure.svg" width="100%"/>

___This is an abstract representation of our data strucutre as timetable set___ 

# File Structure *(Not updated)
| **File Name**           | **Description**
|--------------------|-----------------------------------|
|`test.js`                    |  Function to build a generation
|`plot_timetables.js`         |  Function that plot the timetable according to the predefined resource data set 
|`validate_timetable.js`      |  Function that validate the timetable set from teacher and room clash 
|`fitness_func.js`            |  Fitness Function
|`selection.js`               |  Function that do the selection of the Fit timetable for next generation as parents
||
|`data.json`                  |  Represent a set of timetables ___(1 person in population)___ 
|`data2.json`                 |  Represent a plotted set of timetables ___(for testing)___
|`population.json`            |  Represent population of many set of timetable
|`room.json`                  |  Room data in which slots can be plotted 
|`population_selected.json`   |  Selected timetable from this generation 
||
|`index.html`                 |  For visualization of plotted set of timetable 
|`index.js`<br>`index2.js`<br>`index3.js`|  JS for `index.html`
|`README.md`                  |  Readme.md


# Penalty and Reward System *(Not updated)
__(these are not used right now)__ 
| **Type**           | **Condition**                     | **Points**|
|--------------------|-----------------------------------|-----------|
| Teacher Conflict   | Per conflict                      | -20       |
| Room Conflict      | Per conflict                      | -20       |
| Teacher Overload   | Per extra hour                    | -10       |
| Student Overload   | For exceeding max classes in a day| -5        |
| Perfect Day Reward | 4-5 classes in a day              | +6        |
| Active Day Count   | 4-5 active days                   | +20       |
| Low Active Days    | Less than 3 active days           | -10       |

# Terminology
|Algorithm Terminology|Common Terminology|Description|Example|
|--|--|--|--|
|Generation|Population|**Represent a Set of probable group of Timtable (or genome)**|**20 set of 20 section's Timetable <br>(20 Genomes)**|
|Genome or Chromosome|Timetable Set <br> or Person (or unit) of a generation|**It is the Set of probable Timtables (or Gene)**|**20 section's Timetable <br>(20 Genes)**|
|Gene|Timtable|**It is the single Timetable**|**Timetable of section A**|