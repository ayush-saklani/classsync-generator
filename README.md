# **Class-Sync Generator** <img src="assets/img/new-logo-white.svg" height="55" align="left"/>
**This is the all new addition to the ClassSync where we are introducing the automation in timetable generation using genetic algorithm.**<br>
**_(currently in the initial-coding-ish phase of development)_** 

# Steps to follow
1.  **First get whole teacher allocated timetable from the mongoDB database _i.e. classsync.tables.json_**
2. **Run _ABconvert.js_ which converts the Class-Sync data into the format required by this genetic algorithm. The converted timetable format is saved as _classsync.converted.tables.json_** 
3. **Run _algorithm.js_ to run the algorithm and get the best solution saves as _acceptedsol.json_  _( this is the best solution to the TT scheduling problem at this moment )_** 
4. **Run _BAconvert.js_ which converts the data format required by this genetic algorithm into the Class-Sync data format. _( the data is converted into 3 types of timetable i.e Room, faculty and section's timetable seperately )_** 
5. **Upload this data back to the MongoDB database which can be reflected to the Class-sync Website or downloaded for recirculation. _(the data can be iron out from here)_**


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

___This is an abstract representation of our data structure as timetable set___ 

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
|Generation|Population|**Represent a Set of probable group of Timetable (or genome)**|**20 set of 20 section's Timetable <br>(20 Genomes)**|
|Genome or Chromosome|Timetable Set <br> or Person (or unit) of a generation|**It is the Set of probable Timetables (or Gene)**|**20 section's Timetable <br>(20 Genes)**|
|Gene|Timetable|**It is the single Timetable**|**Timetable of section A**|





# ==================
# ==================
# ==================
# Do Not Delete !!!!!!!!!!!!!!!!!!!! 
# Up for Review !!!!!!!!!!!!!!!!!!!!
# ==================
# ==================
# ==================

# Mutation for clarity

## Question - lets take mutation rate as 5% and 100 timetables per genome (100 section to plot). so i have to mutate 5 timetable (5%) and in each of them 1 or 2 slots (70 slots ~ 1 slot _(ceil)_) right ?  
### 1. **Understanding Mutation Rate**:
If your **mutation rate** is 5%, that means **5% of the total genes** (timetables or slots) will undergo mutation.

### 2. **Applying Mutation to the Genome**:
In your case:
- A **genome** consists of **100 timetables** (one for each section, where resources like teachers and rooms are distributed).
- The **mutation rate** is 5%.

### 3. **How Mutation Works**:
- If the mutation rate is **5%**, that means **5% of the total timetables in the genome will be mutated**.
- So, for **100 timetables**, 5% mutation rate means you would **mutate 5 timetables**:
 ### __Timetables to Mutate=100×0.05=5__
  
### 4. **Mutating Slots in Timetables**:
Once you've selected the **5 timetables** to mutate:
- You will need to decide how many **slots** in each timetable to mutate.
- Typically, you mutate **1 or 2 slots per timetable**, which introduces small changes while maintaining most of the structure.
  
So for each of the 5 timetables:
- You might change **1 or 2 random slots** in each timetable.

### Example:
- You have a genome with **100 timetables**.
- With a 5% mutation rate, you randomly select **5 timetables** to undergo mutation.
- In each of these 5 timetables, you randomly change **1 or 2 slots** (e.g., swapping teachers, rooms, or subjects).

### Summary:
- **5% mutation rate** on 100 timetables means you mutate **5 timetables**.
- In each of these timetables, mutate **1 or 2 slots** to introduce small, random changes.

This approach helps maintain diversity while avoiding overly disruptive changes in the population.

---
## Question - can we introduce a global mutation rate and a local mutation rate ?

Yes, you can absolutely introduce both a **global mutation rate** and a **local mutation rate**. This would allow you to control mutations at two different levels within your evolutionary algorithm:

### 1. **Global Mutation Rate**:
This applies to the entire genome (set of timetables). It controls how many timetables (or genes) will be selected for mutation across the entire population or generation.

### 2. **Local Mutation Rate**:
This applies to each timetable that has been selected for mutation (from the global mutation rate). It controls how many slots within each selected timetable will be mutated.

---

### How to Implement:

#### 1. **Global Mutation Rate**:
- This would determine how many timetables (genes) within the genome (generation) will undergo mutation.
- For example, if you have 100 timetables in a genome and the global mutation rate is 5%, then **5 timetables** would be selected for mutation.

#### 2. **Local Mutation Rate**:
- Once you’ve selected the timetables to be mutated (via the global mutation rate), the local mutation rate determines how many slots (individual positions within a timetable) will be changed.
- For instance, if a timetable has 70 slots (representing time periods), a local mutation rate of 10% means that **7 slots** would be selected for mutation within each mutated timetable.

---

### Example:
Let’s say you have:
- **100 timetables** (genes) in your population (genome).
- A **global mutation rate** of 5%.
- A **local mutation rate** of 10%.

#### Step 1: Apply the Global Mutation Rate
- 5% of 100 timetables = **5 timetables** are selected for mutation.

#### Step 2: Apply the Local Mutation Rate
- Each of the 5 timetables has **70 slots** (for example, representing different periods in a week).
- With a 10% local mutation rate, **7 slots** in each selected timetable would be mutated.

#### Step 3: Mutation Execution
- You change 7 random slots within each of the 5 selected timetables, possibly swapping teachers, rooms, or subjects.

---

### Benefits of Combining Both Rates:
- **Global Mutation Rate** helps ensure that mutation happens across different timetables to maintain diversity.
- **Local Mutation Rate** allows fine control over the extent of change within each mutated timetable, ensuring mutations are not too disruptive to a single solution.

---

### Implementation Considerations:
- You might want to adjust the global and local mutation rates based on how much diversity or exploration you need in the population.
  - **Higher global mutation rates**: More timetables will be mutated.
  - **Higher local mutation rates**: More slots within each timetable will change, leading to bigger shifts in individual timetables.

---
## Question - what are the best rate for both in my case
In your case, where you are dealing with timetables (representing different sections with teachers, classrooms, and time slots), the optimal mutation rates (global and local) will depend on several factors, including the complexity of your constraints and the size of your population.

However, there are general guidelines you can follow based on evolutionary algorithms applied to similar scheduling problems:

### General Suggestions:
#### **Global Mutation Rate (5% - 10%)**:
This rate determines how many timetables (or genes) within the genome (population) will be selected for mutation.

- **5% Global Mutation Rate**: Mutates 5 timetables out of every 100. This is a good rate if your population is already quite diverse and you just need a small amount of exploration to avoid stagnation.
- **10% Global Mutation Rate**: Mutates 10 timetables out of every 100. This is more aggressive and could help when you are stuck in local optima, but it risks more disruption of good solutions.

A **5-10% global mutation rate** is commonly used in genetic algorithms for scheduling, as it allows some diversity while preserving much of the good solutions found so far.

#### **Local Mutation Rate (1% - 5%)**:
This rate governs how many slots within each selected timetable will be mutated.

- **1% Local Mutation Rate**: Mutates 1 or 2 slots per timetable. This would be ideal if your problem requires only small adjustments for improvement. You can preserve the structure of most timetables while allowing minor tweaks to improve fitness.
- **5% Local Mutation Rate**: Mutates 3-5 slots per timetable. This allows for slightly larger changes but may be useful when some timetables are far from an ideal solution and need bigger changes to improve.

A **1-5% local mutation rate** is typically used to ensure timetables are not overly disrupted, but it still allows for exploration of different combinations.

### In Your Case:
Given that you are working with **sets of timetables (representing different sections)** and managing constraints like teacher assignments, rooms, and class timings, here is a suggested starting point:

- **Global Mutation Rate**: Start with **5%**. This will ensure that 5 timetables out of 100 in each generation are mutated, allowing for exploration without too much disruption.
- **Local Mutation Rate**: Start with **1-3%**. This means that for each selected timetable, 1-2 slots will be mutated. This is a small but meaningful change that can gradually improve solutions without causing excessive chaos in your schedules.

### Tuning the Rates:
You may need to experiment with these rates based on your specific problem. Consider the following:
- If your algorithm **converges too quickly** (gets stuck in local optima), try increasing both the global and local mutation rates slightly.
- If your algorithm **loses good solutions too often**, try reducing the mutation rates to preserve the better timetables while still exploring.

Start with **5% global** and **1-3% local**, and adjust based on the results you're observing. You can also dynamically adjust these rates during the evolution process (e.g., reduce mutation rates over time as the population converges). 