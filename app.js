const got = require('got');

//GET data from server
got('https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=6441262445696368f3eb4bbce83c').then((response) => { 

    const data = JSON.parse(response.body);
    const events = data.events;

    let sessionMap = {};
    let sessionsByUser = {};

    //group data by ID into sessionMap from API
    events.forEach((event) => {
        const url = event.url;
        const id = event.visitorId;
        const timestamp = event.timestamp;
        if (!sessionMap[id]) {
            sessionMap[id] = [];
        }
        sessionMap[id].push({timestamp: timestamp, url: url});
        
    });

    //sort each id's data by timestamp
    for (const idActivity in sessionMap) {
        sessionMap[idActivity].sort();
    }


    

   //put data into sessionsByUser according to given conditions
    for (const id in sessionMap) {
        let startIndex = 0;
        let pagesArr = [];
        let idObj = {};
        for (let i = 0; i < sessionMap[id].length-1; i++) {
            pagesArr.push(sessionMap[id][i].url);
            //split data into separate sessions if more than 10mins have passed
            if (sessionMap[id][i+1].timestamp - sessionMap[id][i].timestamp > 600000) {
                const duration = sessionMap[id][i].timestamp - sessionMap[id][startIndex].timestamp;
                idObj = {duration: duration, pages: pagesArr, startTime: sessionMap[id][startIndex].timestamp};
                //start index is used to calculate durations so it must be changed when time in between sessions exceeds 10mins
                startIndex = i+1;
                //pages now go into the next array
                pagesArr = [];
                if (!sessionsByUser[id]) {
                    sessionsByUser[id] = [];
                }
                sessionsByUser[id].push(idObj);
            }
        }
    }

    const x = {};
    x.sessionsByUser = sessionsByUser;

    //POST data to server
    got.post('https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=6441262445696368f3eb4bbce83c', {
        json: JSON.stringify(x),
        headers: {
            'Content-type': 'application/json'
        }
    }).then((response) => {
        console.log(response.body);
    }).catch((error) => {
        console.log("error 1");
        console.error(error);
    });
}).catch((error) => {
    console.error(error);
});
