let fs = require("fs")

exports.readFile = function  (file) {
    return fs.readFileSync(file, 'utf8');
}

exports.readJSON = function  (file) {
    let rawdata = fs.readFileSync('new.json');
    let newJS = JSON.parse(rawdata);
    return newJS;
}

exports.writeFile  = function (file, data) {
    fs.writeFile(file, data, (err) => {
        if (err) console.log(err);
        console.log("Successfully Written to File.");
    });
}

exports.addGameToStorico = function (gameStorico, playersStorico, winnerStorico){
    fs.readFile('new.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            let obj = JSON.parse(data); //now it an object
            let now = new Date().toISOString()
            obj.storico.push({date: now, game: gameStorico, players: playersStorico, winner: winnerStorico}); //add some data
            json = JSON.stringify(obj); //convert it back to json
            fs.writeFile('new.json', json, 'utf8', (err) => {
                if (err) console.log(err);
                console.log("Successfully Written to File.");
            }); // write it back
        }});
}

exports.middleware = function (msg, reply, next) {
    console.info("[%s] Received %s from chat %s (%s)",
        new Date().toISOString(), msg.type, msg.chat.id, msg.chat.name);
    next();
}

exports.esempio = function (){
    let esempio = "esempio"
    return esempio
}
