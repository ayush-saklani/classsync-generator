const displayTimetableAsTables = (timetable) => {
    console.log("asdasdasdsa");
    let listHTML = '<article class="collapsett">';
    listHTML += `<button class="collapse" style="text-align: center;">Collapse</button>`;
    listHTML += ``;

    listHTML += '<ol>';
    console.log(timetable.length);

    for (let i = 0; i < timetable.length; i++) {
        listHTML += `
        <li>
            <table>            
                <thead>
                <tr>
                <th>${timetable[i].teacher}</th>
                <th><b>08-09</b></th>
                <th><b>09-10</b></th>
                <th><b>10-11</b></th>
                <th><b>11-12</b></th>
                <th><b>12-01</b></th>
                <th><b>01-02</b></th>
                <th><b>02-03</b></th>
                <th><b>03-04</b></th>
                <th><b>04-05</b></th>
                <th><b>05-06</b></th>
                </tr>
                </thead>
                <tbody>`;

        let day = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"];
        console.log(timetable[i].timetable);
        for (let j = 0; j < 7; j++) {
            listHTML += `<tr> <th><b>${day[j]}</b></th>`; // Start each row
            for (let k = 0; k < 10; k++) {
                if (timetable[i].timetable.find(x => x.day == j && x.slot == k) != undefined) {
                    let dataslot = timetable[i].timetable.find(x => x.day == j && x.slot == k);
                    listHTML += `<td>`
                    listHTML += ` <b style="color: black">${dataslot.subjectid}</b><br>
                                <b style="color: black">Room:${dataslot.roomid}</b><br>`;
                    if (dataslot.type === 'theory') {
                        listHTML += `<b style="color: darkgreen">${dataslot.type}</b>`;
                    } else {
                        listHTML += `<b style="color: red">${dataslot.type}</b>`;
                    }
                    listHTML += `<br><b style="color: black">Section:${dataslot.section}</b>`;
                    listHTML += `</td>`;
                } else {
                    listHTML += `<td></td>`;
                }
            }
            listHTML += '</tr>'; // Close each row
        }


        listHTML += '</tbody></table></li>'; // Close each table and list item
    }

    listHTML += '</ol></article>'; // End ordered list
    document.getElementById('timetable').innerHTML += listHTML; // Insert into the page

    // Add event listeners for the collapse buttons
    let collapseButtons = document.getElementsByClassName('collapse');
    Array.from(collapseButtons).forEach((element) => {
        element.addEventListener('click', () => {
            let x = element.closest(".collapsett");
            let currentHeight = window.getComputedStyle(x).height;

            if (currentHeight !== "80px") {
                x.style.height = "80px"; // Collapse to 80px
                x.style.overflow = "hidden"; // Hide overflow content
            } else {
                x.style.height = "auto"; // Expand back to full height
                x.style.overflow = "visible"; // Show full content
            }
        });
    });
};

const functiosn = async () => {

    let timetable = [];
    await fetch('./population_selected.json')
        .then(response => response.json())
        .then(data => {
            let population = data;
            let temp = {};
            let teacher = {};
            for (let z = 0; z < population.length; z++) {
                for (let i = 0; i < population[z]['data'].length; i++) {
                    for (let j = 0; j < 7; j++) {
                        for (let k = 0; k < 10; k++) {
                            if (population[z]['data'][i]['timetable'][j][k].teacherid == "") {
                                continue;
                            }
                            let teacher_checker = "teacher" + ";" + z + ";" + j + ";" + k + ";" + population[z]['data'][i]['timetable'][j][k].teacherid;
                            teacher[population[z]['data'][i]['timetable'][j][k].teacherid] = true;
                            temp[teacher_checker] = true;
                        }
                    }
                }
            }
            let teacher_arr = []
            for (let key in teacher) {
                teacher_arr.push(key);
            }
            console.log(teacher_arr);
            console.log(population.length);
            let teachertt = [];
            let temparr = [];
            for (let z = 0; z < population.length; z++) {
                let temparrarrarr = [];
                for (let x = 0; x < teacher_arr.length; x++) {
                    let temparrarr = [];
                    for (let i = 0; i < population[z]['data'].length; i++) {
                        for (let j = 0; j < 7; j++) {
                            for (let k = 0; k < 10; k++) {

                                let teacher_checker = "teacher" + ";" + z + ";" + j + ";" + k + ";" + teacher_arr[x];
                                if (population[z]['data'][i]['timetable'][j][k].teacherid == teacher_arr[x]) {
                                    // console.log(teacher_checker);
                                    let abc = teacher_checker.split(';')
                                    // console.log(abc);
                                    temparrarr.push({
                                        day: abc[2],
                                        slot: abc[3],
                                        subjectid: population[z]['data'][i]['timetable'][j][k].subjectid,
                                        roomid: population[z]['data'][i]['timetable'][j][k].roomid,
                                        type: population[z]['data'][i]['timetable'][j][k].type,
                                        section : i
                                    });
                                }
                            }
                        }
                    }
                    temparrarrarr.push({
                        teacher: teacher_arr[x],
                        timetable: temparrarr
                    });
                }
                temparr.push(temparrarrarr);
            }
            for (let i = 0; i < temparr.length; i++) {
                console.log(temparr[i]);
                displayTimetableAsTables(temparr[i]);
            }
        }).then(() => {
            // let collapseButtons = document.getElementsByClassName('collapse');
            // Array.from(collapseButtons).forEach((element) => {
            //     let x = element.closest(".collapsett");
            //     x.style.height = "80px"; // Collapse to 80px
            //     x.style.overflow = "hidden"; // Hide overflow content
            // });
        }).catch(error => console.error('Error fetching the timetable:', error));
    console.log(timetable);

}
functiosn();
