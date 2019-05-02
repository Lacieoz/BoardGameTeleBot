let lib = require('./mylib');
const botgram = require("botgram")
var fs = require("fs")
const bot = botgram("862407925:AAHPVI0Ww-kdA8oeXYzNfL1h8cfu2vGivTQ")

bot.command("start", "help", (msg, reply) =>{
    reply.text("To start a poll do: /startpoll")
    reply.text("To see all the storico do: /see_storico")
    reply.text("To add a game to storico do: /add_match")
})

bot.all(lib.middleware);


bot.command("prova", function (msg, reply, next) {
  reply.inlineKeyboard([[
    { text: "↑  Turn up", callback_data: JSON.stringify({ type: "volume", direction: true }) },
    { text: "↓  Turn down", callback_data: JSON.stringify({ type: "volume", direction: false }) },
  ]]);
  reply.text("Use the buttons below to modify the volume:");
});

bot.callback(function (query, next) {
  console.log(query)
  // Try to parse payload data as JSON. If we succeed, and `type` is set
  // to "volume" then the query is for us.
  var data;
  try {
    data = JSON.parse(query.data);
  } catch (e) {
    return next();
  }
  if (data.type !== "volume")
    return next();
  else {
    console.log("here")
    // Turn volume up or down
    let answer = "Va Bene! " + String(data.direction)
    return query.answer({ text: answer, alert: true });
  }

});

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

/**********************************************/
/****************CHOOSE A GAME*****************/
/**********************************************/

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

    let allGames = lib.readJSON("new.json")
    let arrayGames = allGames.games
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

/**********************************************/
/************END CHOOSE A GAME*****************/
/**********************************************/

/**********************************************/
/*******************STORICO********************/
/**********************************************/

let gameStorico = ""
let playersStorico = []
let winnerStorico = ""
let stateStorico = "start"

bot.command("add_match", function (msg, reply, next) {
    if (stateStorico !== "start") {
        gameStorico = ""
        playersStorico = []
        winnerStorico = ""
    }
    let allGames = lib.readJSON("new.json")
    let arrayGames = allGames.games
    let replyArray = []
    arrayGames.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    arrayGames.forEach(function (game){
        replyArray.push([{text: game.name}])
    })
    // Display the keyboard
    reply.keyboard(replyArray, false, true).text("Che gioco avete giocato?")

    stateStorico = "game"
});

bot.command("players_storico", function (msg, reply, next) {
    if (stateStorico !== "pl") {
        reply.text("send command /add_match to add a new match to storico")
    } else {
        let jsonDoc = lib.readJSON("new.json")
        let arrayPlayers = jsonDoc.players
        let replyArray = []
        arrayPlayers.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        arrayPlayers.forEach(function (pl){
            replyArray.push([{text: pl.name}])
        })
        replyArray.push([{text: "DONE"}])
        // Display the keyboard
        reply.keyboard(replyArray, false).text("Chi ha giocato?")
    }
});

bot.command("winner_storico", function (msg, reply, next) {
    if (stateStorico !== "win") {
        reply.text("send command /add_match to add a new match to storico")
    }
    else {
        let replyArray = []
        playersStorico.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        playersStorico.forEach(function (game){
            replyArray.push([{text: game.name}])
        })
        // Display the keyboard
        reply.keyboard(replyArray, false, true).text("Chi ha vinto?")

        stateStorico = "ch_win"
    }
});

bot.command("see_storico", function (msg, reply, next) {
    let jsonDoc = lib.readJSON("new.json")
    let arrayStorico = jsonDoc.storico
    let replyString = ""
    arrayStorico.forEach(function (sto) {
        console.log(sto)
        replyString += "Data : " + sto.date.substring(0,10) + " alle " + sto.date.substring(11,19) + "\n" + "Game : " + sto.game + "\n" + "Winner : " + sto.winner + "\n" + "Players : "
        sto.players.forEach(function (pl) {
            replyString += pl.name + "  "
        })
        replyString += "\n\n"
    })
    // Display the keyboard
    reply.text(replyString)
});

/**********************************************/
/***************END STORICO********************/
/**********************************************/

bot.text(function (msg, reply, text) {

    // PARTE POLL

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

    // PARTE STORICO

    if (stateStorico === "game") {
        gameStorico = msg.text
        reply.text("Perfetto! Lancia il comando /players_storico per aggiungere i giocatori")
        stateStorico = "pl"
    } else if (stateStorico === "pl") {
        if (msg.text === "DONE" && playersStorico.length >= 2) {
            console.log("Players added")
            stateStorico = "win"
            // Remove keyboard
            reply.keyboard().text("Perfetto! Lancia il comando /winner_storico per aggiungere il vincitore");
        } else if (msg.text === "DONE" && playersStorico.length <= 2){
            reply.text("scegli almeno due giocatori")
        } else if (playersStorico.length === 0) {
            console.log("New player added " + msg.text)
            playersStorico.push({"name": msg.text})
            reply.text("Added")
        }
        else {
            let length = playersStorico.length
            let playerAdded = false
            for (let ind=0; ind<length; ind++) {
                if(playersStorico[ind].name === msg.text) {
                    playerAdded = true
                    console.log("Player already added : " + msg.text)
                    reply.text("Player già aggiunto")
                }
            }
            if (!playerAdded) {
                console.log("New player added " + msg.text)
                playersStorico.push({"name": msg.text})
                reply.text("Added")
            }
        }
    } else if(stateStorico === "ch_win") {
        playersStorico.forEach(function(pl) {
            if(pl.name === msg.text) {
                winnerStorico = msg.text
                lib.addGameToStorico(gameStorico, playersStorico, winnerStorico)
                stateStorico = "start"
                reply.text("Partita aggiunta allo storico, usare il comando /see_storico per vedere tutti i game fatti")
            }
        })
    }
});

bot.command((msg, reply) =>
    reply.text("Invalid command."))
