const botgram = require("botgram")
const bot = botgram("862407925:AAHPVI0Ww-kdA8oeXYzNfL1h8cfu2vGivTQ")
var fs = require("fs")

let count = 1
let choosingGame = false

bot.command("start", "help", (msg, reply) =>
    reply.text("To schedule an alert, do: /alert <seconds> <text>"))


bot.command("conf", (msg, reply, next) => {
    let test = readJSON("new.json")
    let arrayGames = test.games
    let replyArray = []
    arrayGames.forEach(function (game){
      replyArray.push({text: game.name})
    })
    var keyboard1 = [replyArray]
    choosingGame = true
    // Display the keyboard
    reply.keyboard(keyboard1, true, true).text("Che gioco scegli?")
})

// CHOOSE A GAME 

let gameToBeChoose = []
let choosingGamesStart = false
let playersChoosing = false
let totalVotes = 0
let randomChoice = ""
let maxVotes = []

bot.command("start_poll", (msg, reply, next) => {
    console.log("Started a new poll")
  
    // RESETTING VALUES
    gameToBeChoose = []
    choosingGamesStart = false
    playersChoosing = false
    totalVotes = 0
    randomChoice = ""
    maxVotes = []
  
    let test = readJSON("new.json")
    let arrayGames = test.games
    let replyArray = []
    arrayGames.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    arrayGames.forEach(function (game){
      replyArray.push([{text: game.name}])
    })
    replyArray.push([{text: "DONE"}])
    var keyboard1 = replyArray
    choosingGamesStart = true
    // Display the keyboard
    reply.keyboard(keyboard1, false).text("Quali giochi mettere nel sondaggio?")
})

bot.command("choose", (msg, reply, next) => {
    if(gameToBeChoose.length === 0) {
      reply.text("Per effettuare un sondaggio lanciare il comando /start_poll")
    }
    else {
      let replyArray = []
      gameToBeChoose.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
      gameToBeChoose.forEach(function (game){
        replyArray.push([{text: game.name}])
      })

      var keyboard1 = replyArray
      // Display the keyboard
      reply.keyboard(keyboard1, true, true).text("Che gioco vuoi giocare?")
    }
})

bot.command("end_poll", (msg, reply, next) => {

    // se non è il primo Done Choosing
    if (maxVotes.length !== 0) {
      console.log("Info about poll")
      reply.text("Gioco Vincitore : ")
      maxVotes.forEach(function (game){
        reply.text(game.name + " con " + game.count + " voti!")
      })
      reply.text("Voti Totali Effettuati : " + totalVotes)
      
      if (maxVotes.length > 1) {
        reply.text("Anche se non me l'hai chiesto effettuo una scelta randomica per te : ") 
        reply.text(randomChoice)
      }
    }
    else if(gameToBeChoose.length === 0) {
      reply.text("Per effettuare un sondaggio lanciare il comando /start_poll")
    }
    else {
      console.log("Poll ended")
      let length = gameToBeChoose.length
      let maxCount = 0
      for (let i = 0; i<length; i++) {
        totalVotes += gameToBeChoose[i].count
        if (gameToBeChoose[i].count > maxCount) {
          maxVotes = [gameToBeChoose[i]]
          maxCount = gameToBeChoose[i].count
        }
        else if (gameToBeChoose[i].count === maxCount) {
          maxVotes.push(gameToBeChoose[i])
        }
      }
      reply.text("Gioco Vincitore : ")
      maxVotes.forEach(function (game){
        reply.text(game.name + " con " + game.count + " voti!")
      })
      reply.text("Voti Totali Effettuati : " + totalVotes)
      
      if (maxVotes.length > 1 && randomChoice == "") {
        let ind = Math.floor(Math.random() * maxVotes.length)
        reply.text("Anche se non me l'hai chiesto effettuo una scelta randomica per te : ")
        randomChoice = maxVotes[ind].name 
        reply.text(randomChoice)
      } else if(maxVotes.length > 1) {
        reply.text("Anche se non me l'hai chiesto effettuo una scelta randomica per te : ") 
        reply.text(randomChoice)
      }
    }
    gameToBeChoose = []
})

bot.text(function (msg, reply, text) {
  if (choosingGamesStart) {
    let replyText = ""
    if (msg.text === "DONE") {
      console.log("Poll ended")
      choosingGamesStart = false
      playersChoosing = true
      // Remove keyboard
      reply.keyboard().text("Perfetto! Lancia il comando /choose per effettuare la tua scelta");
    }
    else if (gameToBeChoose.length === 0) {
      console.log("New choice done " + msg.text)
      gameToBeChoose.push({"name": msg.text, "count": 0})
      reply.text("Added")
    }
    else {
      let length = gameToBeChoose.length
      let gameAdded = false
      for (let ind=0; ind<length; ind++) {
        if(gameToBeChoose[ind].name === msg.text) {
          gameAdded = true      
          console.log("Game already added : " + msg.text)
          reply.text("Gioco già aggiunto")      
        }
      }
      if (!gameAdded) {      
        console.log("New choice done " + msg.text)
        gameToBeChoose.push({"name": msg.text, "count": 0})
        reply.text("Added")
      }
    }
  }
  if (playersChoosing) {
    gameToBeChoose.forEach( function (game) {
      if (game.name === msg.text) {
        game.count++
        reply.text("Attendi che tutti finiscano di votare poi qualcuno lanci il comando /end_poll")
      }
    })
  }
});


bot.command((msg, reply) =>
    reply.text("Invalid command."))


function readFile (file) {
  return fs.readFileSync(file, 'utf8');
}

function readJSON (file) {
  let rawdata = fs.readFileSync('new.json');  
  let newJS = JSON.parse(rawdata);  
  return newJS; 
}

function writeFile (file, data) {
  fs.writeFile(file, data, (err) => {
  if (err) console.log(err);
  console.log("Successfully Written to File.");
});
}
