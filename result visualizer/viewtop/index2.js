const displayTimetableAsTables2 = (timetable) => {
    const unacceptable = 90, poor = 100, average = 115, good = 1000;
    let listHTML = `<table style="width:100%; border: 2px solid black;">`;
    for (let i = 0; i < timetable.length; i++) {
        listHTML += `<tr><td class="setclass" style="text-align: center; padding 10px; margin : 0px">${Math.round(timetable[i].fitness * 1000) / 1000}</td>`;
        for (let j = 0; j < timetable[i]['data'].length; j++) {
            if (timetable[i]['data'][j]['local_fitness'] < unacceptable) {
                listHTML += `<td class="unacceptable">${(timetable[i]['data'][j]['local_fitness'] || "Fit-NA")}</td>`;
            } else if (timetable[i]['data'][j]['local_fitness'] < poor) {
                listHTML += `<td class="poor">${(timetable[i]['data'][j]['local_fitness'] || "Fit-NA")}</td>`;
            } else if (timetable[i]['data'][j]['local_fitness'] < average) {
                listHTML += `<td class="average">${(timetable[i]['data'][j]['local_fitness'] || "Fit-NA")}</td>`;
            } else {
                listHTML += `<td class="good">${(timetable[i]['data'][j]['local_fitness'] || "Fit-NA")}</td>`;
            }
        }
        listHTML += `</tr>`;
    }
    listHTML += `</table>`
    document.getElementById('timetable').innerHTML += listHTML;
};
const functiosn = async () => {
    let timetable = [];
    await fetch('../../JSON/classsync.win.selected.tables.json')
        .then(response => response.json())
        .then(data => {
            displayTimetableAsTables2(data);
        }).catch(error => console.error('Error fetching the timetable:', error));
    console.log(timetable);

}
functiosn();