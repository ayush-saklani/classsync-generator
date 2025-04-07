const displayTimetableAsTables = (timetable) => {
    let listHTML = '<article class="collapsett">';
    listHTML += `<h1 style="text-align: center; font-size: 2em;">Avg Fitness of this set ${timetable.fitness} <button class="collapse">Collapse</button></h1>`;
    listHTML += ``;

    listHTML += '<ol>'; // Start ordered list

    for (let i = 0; i < timetable['data'].length; i++) {
        listHTML += `
        <li>
            <table>            
                <thead>
                <tr>
                <th>localFit ${(timetable['data'][i]['local_fitness'] || "Fit-NA")}</th>
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

        for (let j = 0; j < timetable['data'][i]['timetable'].length; j++) {
            listHTML += `<tr> <th><b>${day[j]}</b></th>`; // Start each row
            for (let k = 0; k < timetable['data'][i]['timetable'][j].length; k++) {
                let roomid = timetable['data'][i]['timetable'][j][k].roomid || "";     // Default to 'N/A' if empty
                let teacherid = timetable['data'][i]['timetable'][j][k].teacherid || ""; // Default to 'N/A' if empty
                let subjectid = timetable['data'][i]['timetable'][j][k].subjectid || ""; // Default to 'N/A' if empty
                let type = timetable['data'][i]['timetable'][j][k].type || ""; // Default to 'N/A' if empty

                // Add row regardless of empty or non-empty data
                if (roomid === "" && teacherid === "" && subjectid === "" && type === "") {
                    listHTML += `<td> <br><br> </td>`;
                } else {
                    listHTML += `<td>
                                    <b style="color: black">${subjectid}</b>        <br>
                                    <b style="color: darkblue">${teacherid}</b>         <br>
                                    <b style="color: black">Room:${roomid}</b> <br>
                                    `;

                    if (type === 'theory') {
                        listHTML += `<b style="color: darkgreen">${type}</b>`;
                    } else {
                        listHTML += `<b style="color: red">${type}</b>`;
                    }
                    listHTML += `</td>`;
                }
            }
            listHTML += '</tr>'; // Close each row
        }

        listHTML += `<table><th>subjectid</th><th>teacherid</th><th>weekly hrs</th><th>type</th>`;
        let subjects = timetable['data'][i]['subjects'];
        subjects = subjects.sort((a, b) => a.type.localeCompare(b.type));
        for (let j = 0; j < subjects.length; j++) {
            listHTML += `<tr><td>${subjects[j].subjectid}</td><td>${subjects[j].teacherid}</td><td>${subjects[j].weekly_hrs}</td><td>${subjects[j].type}</td></tr>`;
        }
        listHTML += '</table>';
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
    await fetch('../JSON/population_selected.json')
        .then(response => response.json())
        .then(data => {
            timetable = data;
            for (let i = 0; i < timetable.length; i++) {
                displayTimetableAsTables(timetable[i]);
            }
            // if there are multiple timetables this function can be called multiple times in a loop
        }).then(() => {
            // Collapse all sections initially
            let collapseButtons = document.getElementsByClassName('collapse');
            Array.from(collapseButtons).forEach((element) => {
                let x = element.closest(".collapsett");
                x.style.height = "80px"; // Collapse to 80px
                x.style.overflow = "hidden"; // Hide overflow content
            });
        }).catch(error => console.error('Error fetching the timetable:', error));
    console.log(timetable);

}
functiosn();
