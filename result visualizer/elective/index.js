const displayTimetableAsTables = (timetable) => {
    let listHTML = '<article >';
    for (let i = 0; i < timetable.length; i++) {
        listHTML += `
        <span style="padding: 10px; display: block;">
            <b style="color: black">( Course : ${timetable[i].course} )</b>
            <b style="color: black">( Semester : ${timetable[i].semester} )</b>
            <b style="color: black">( No. of Sections : ${timetable[i].no_of_section} )</b>
        </span>
       
        <table>            
            <thead>
            <tr><th></th><th><b>08-09</b></th><th><b>09-10</b></th><th><b>10-11</b></th><th><b>11-12</b></th><th><b>12-01</b></th><th><b>01-02</b></th><th><b>02-03</b></th><th><b>03-04</b></th><th><b>04-05</b></th><th><b>05-06</b></th></tr>
            </thead>
            <tbody>`;

        let day = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"];

        for (let j = 0; j < timetable[i]['timetable'].length; j++) {
            listHTML += `<tr> <th><b>${day[j]}</b></th>`; // Start each row
            for (let k = 0; k < timetable[i]['timetable'][j].length; k++) {
                const cellValue = timetable[i]['timetable'][j][k].elective_section_avail;
                if (timetable[i].no_of_section == cellValue.length) {
                    listHTML += `<td><b style="color: black">All</b></td>`;
                } else {
                    listHTML += `<td style="color: black; font-weight: bold">${cellValue.join(', ')}</td>`;
                }
            }
            listHTML += '</tr>'; // Close each row
        }
        listHTML += '</table>';
        listHTML += '</tbody></table>'; // Close each table and list item
    }

    listHTML += '</article>'; // End ordered list
    document.getElementById('timetable').innerHTML += listHTML; // Insert into the page
};
const action = async () => {
    await fetch('../../JSON/classsync.elective.seemap.json')
        .then(response => response.json())
        .then(data => {
            displayTimetableAsTables(data);
        }).catch(error =>
            console.error('Error fetching the timetable:', error)
        );
}
action();
