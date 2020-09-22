if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}  

window.onload = function() {
    var tablediv = document.getElementById("table");

    for (let i = 0; i < 6; i++) {
        let morningStart = createTimebox(0, i);
        let morningEnd   = createTimebox(1, i);
        let eveningStart = createTimebox(2, i);
        let eveningEnd   = createTimebox(3, i);
        let result       = createTimebox(4, i);

        if (i == 5) { // Saturday
            morningStart.classList.add("saturdayline");
            morningEnd.classList.add("saturdayline");
            eveningStart.classList.add("saturdayline");
            eveningEnd.classList.add("saturdayline");
            result.classList.add("saturdayline");
        }

        tablediv.appendChild(morningStart);
        tablediv.appendChild(morningEnd);
        tablediv.appendChild(eveningStart);
        tablediv.appendChild(eveningEnd);
        tablediv.appendChild(result);
    }

    let globalResult = document.createElement("input");
    globalResult.type = "text";
    globalResult.readOnly = true;
    globalResult.id = "global";
    globalResult.value = "00:00";

    tablediv.appendChild(globalResult);

    loadTimes();
    computeTimes();

    // Add to homescreen popup

    // Detects if device is on iOS 
    const isIos = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test( userAgent );
    }

    // Detects if device is in standalone mode
    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

    if (isIos() && !isInStandaloneMode()) {
        document.getElementById("popup").style["display"] = "block";
    }

    // Saturday checkbox

    document.getElementById("displaySat").checked = localStorage.satcb == "true" ? true : false;
    displaySat();
}

function createTimebox(x, y) {
    /*
        This function return a input of type time
        depending of its coordinates in the table.
    */

    // Attribute of input time : pattern="[0-9]{2}:[0-9]{2}"

    var timebox = document.createElement("input"); // Probably a bad variable name
    
    timebox.id =  '' + x + y; // Setting the id to the coordinates to retrieve it later

    if (x == 4) { // If the box is in the last column
        timebox.readOnly = true;
        timebox.type = "text";
    } else {
        timebox.type = "time";
        timebox.pattern = "[0-9]{2}:[0-9]{2}";

        timebox.addEventListener('input', saveTimes);
        timebox.classList.add("timeinput");
    }

    timebox.style = "display: block;";

    timebox.value = "00:00";

    return timebox;

    // TODO: Add localStorage data loading here
}

function saveTimes() {
    var times = {};
    var inputs = document.getElementsByClassName("timeinput");

    for (let input of inputs) {
        times[input.id] = input.value;
    }

    var stringToSave = JSON.stringify(times);

    localStorage.savedtimes = stringToSave;

    computeTimes();
}

function loadTimes() {
    // `{"10":"00:00","11":"00:00","12":"00:00","13":"00:00","14":"00:00","15":"00:00","20":"00:00","21":"00:00","22":"00:00","23":"00:00","24":"00:00","25":"00:00","30":"00:00","31":"00:00","32":"00:00","33":"00:00","34":"00:00","35":"00:00","00":"00:00","01":"00:00","02":"00:00","03":"00:00","04":"00:00","05":"00:00"}`
    
    var stringTimesLoaded = localStorage.savedtimes;

    if (stringTimesLoaded == "undefined" || stringTimesLoaded == undefined) {
        localStorage.savedtimes = `{"10":"00:00","11":"00:00","12":"00:00","13":"00:00","14":"00:00","15":"00:00","20":"00:00","21":"00:00","22":"00:00","23":"00:00","24":"00:00","25":"00:00","30":"00:00","31":"00:00","32":"00:00","33":"00:00","34":"00:00","35":"00:00","00":"00:00","01":"00:00","02":"00:00","03":"00:00","04":"00:00","05":"00:00"}`
    }

    stringTimesLoaded = localStorage.savedtimes;

    var times = JSON.parse(stringTimesLoaded);

    for (let t in times) {
        document.getElementById(t).value = times[t];
    }

    return times; // To get a nice object
}

function computeTimes() {
    var times = loadTimes();

    // Day totals

    for (let i = 0; i < 6; i++) {
        var morningStart = times["0" + i];
        var morningEnd   = times["1" + i];

        var morningTotal = subTimes(morningEnd, morningStart);

        var eveningStart = times["2" + i];
        var eveningEnd   = times["3" + i];

        var eveningTotal = subTimes(eveningEnd, eveningStart);

        var dayTotal = addTimes(morningTotal, eveningTotal);

        // console.log(morningTotal, eveningTotal, dayTotal);

        document.getElementById("4" + i).value = dayTotal;
    }


    // Week total

    var weekTotal = "00:00";

    for (let i = 0; i < 6; i++) {
        weekTotal = addTimes(weekTotal, document.getElementById("4" + i).value);
    }

    document.getElementById("global").value = weekTotal;
}

// Times : a - b
function subTimes(a, b) {
    var ah = Number(a.split(":")[0]);
    var am = Number(a.split(":")[1]);

    var bh = Number(b.split(":")[0]);
    var bm = Number(b.split(":")[1]);

    var inMinutes = ((ah - bh) * 60) + (am - bm);
    var hours = Math.floor(inMinutes / 60);
    var minutes = inMinutes % 60;

    var strhours   = "";
    var strminutes = "";

    if (hours < 10 && hours >= 0) { strhours += "0"; }
    if (minutes < 10 && minutes >= 0) { strminutes += "0"; }

    strhours += hours;
    strminutes += minutes;

    return `${strhours}:${strminutes}`;
}

function addTimes(a, b) {
    var ah = Number(a.split(":")[0]);
    var am = Number(a.split(":")[1]);

    var bh = Number(b.split(":")[0]);
    var bm = Number(b.split(":")[1]);

    var inMinutes = ((ah + bh) * 60) + (am + bm);
    var hours = Math.floor(inMinutes / 60);
    var minutes = inMinutes % 60;

    var strhours   = "";
    var strminutes = "";

    if (hours < 10 && hours >= 0) { strhours += "0"; }
    if (minutes < 10 && minutes >= 0) { strminutes += "0"; }

    strhours += hours;
    strminutes += minutes;

    return `${strhours}:${strminutes}`;
}

function reset() {
    if(confirm("Voulez-vous vraiment tout supprimer ?")) {
        localStorage.savedtimes = "undefined";
    }

    loadTimes();
    computeTimes();
}