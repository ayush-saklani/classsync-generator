const displayTimetableAsTables2 = (timetable) => {
    const unacceptable = 25 , poor = 40 , average = 70 , good = 1000 ;
    let listHTML = `<table style="width:100%; border: 2px solid black;">`;
    for (let i = 0; i < timetable.length; i++) {
        listHTML += `<tr><td class="setclass" style="text-align: center; padding 10px; margin : 0px">${timetable[i].fitness}</td>`;
        for (let j = 0; j < timetable[i]['data'].length; j++) {
            if(timetable[i]['data'][j]['local_fitness'] <unacceptable){
                listHTML += `<td class="unacceptable">${(timetable[i]['data'][j]['local_fitness'] || "Fit-NA")}</td>`;
            }else if(timetable[i]['data'][j]['local_fitness'] <poor){
                listHTML += `<td class="poor">${(timetable[i]['data'][j]['local_fitness'] || "Fit-NA")}</td>`;
            }else if(timetable[i]['data'][j]['local_fitness'] <average){
                listHTML += `<td class="average">${(timetable[i]['data'][j]['local_fitness'] || "Fit-NA")}</td>`;
            }else {
                listHTML += `<td class="good">${(timetable[i]['data'][j]['local_fitness'] || "Fit-NA")}</td>`;
            }
        }
        listHTML += `</tr>`;
    }
    listHTML += `</table>`
    document.getElementById('timetable').innerHTML += listHTML;
};
const displayTimetableAsTables = (timetable) => {
    let listHTML = '<article class="collapsett">';
    listHTML += `<h1 style="text-align: center; font-size: 1.5em; padding 10px; margin : 10px">Avg Fitness of this set ${timetable.fitness}</h1>`;
    listHTML += `<span style = "display: flex; flex-wrap: wrap; justify-content: center; align-items: center; width: 100%; font-weight: bold;"> Total TT : ${timetable['data'].length} [ `;
    for (let i = 0; i < timetable['data'].length; i++) {
        listHTML += `${(timetable['data'][i]['local_fitness'] || "Fit-NA")} `;
    }
    listHTML += ']</span></article>';
    document.getElementById('timetable').innerHTML += listHTML;
};
const functiosn = async () => {
    let timetable = [];
    await fetch('./population_selected.json')
        .then(response => response.json())
        .then(data => {
            displayTimetableAsTables2(data);
        }).catch(error => console.error('Error fetching the timetable:', error));
    console.log(timetable);

}
functiosn();