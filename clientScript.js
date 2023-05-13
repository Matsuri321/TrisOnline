// dichiarazione delle variabili

let clientId
let gameId
let isTurn = false
let TuoSimbolo
let socket;
let board;
let game

    
// recupero degli elementi del DOM
const connectBtn = document.getElementById('connectBtn')
const NuovaPartitaBtn = document.getElementById('newGame')
const currGames = document.getElementById('currGames')
const AggiungiPartita = document.querySelector('button[type="submit"]')
const Celle = document.querySelectorAll('#cell')
const StanzaPartita = document.querySelector('#board')
const userCol = document.querySelector('.flex-col1')
// listener per il click sul pulsante di connessione
connectBtn.addEventListener('click', () => {
    socket = new WebSocket('ws://localhost:8080')
    socket.onopen = function(event) {}
    // listener per il click sul pulsante di creazione di una nuova partita
    NuovaPartitaBtn.addEventListener('click', () => {
        const payLoad = {
            'method': 'create',
            'clientId': clientId
        }

        socket.send(JSON.stringify(payLoad))

    })

    socket.onmessage = function(msg) {
        const data = JSON.parse(msg.data)
        switch (data.method) {
            case 'connect':
                clientId = data.clientId
                userCol.innerHTML = `IdUtente: ${clientId}`
                userCol.classList.add('joinLabel')
                break
            case 'create':
                // informa che il gioco è stato creato con successo
                gameId = data.game.gameId
                TuoSimbolo = data.game.players[0].symbol
                console.log(`game id is ${gameId} and your symbol is ${TuoSimbolo}`)
                Celle.forEach(cell => {
                    cell.classList.remove('x')
                    cell.classList.remove('cirlce')
                })
                break

            case 'gamesAvail':
                while (currGames.firstChild) {
                    currGames.removeChild(currGames.lastChild)
                }
                const games = data.games
                games.forEach((game) => {
                    const li = document.createElement('li')
                    li.addEventListener('click', selectGame)
                    li.innerText = game
                    currGames.appendChild(li)
                })
                break
            case 'join':
                gameId = data.game.gameId
                TuoSimbolo = data.game.players[1].symbol
                console.log(`Id della partita è ${gameId} e il tuo simbolo è: ${TuoSimbolo}`)
                Celle.forEach(cell => {
                    console.log(`cell classes are ${cell.classList}`)
                    cell.classList.remove('x')
                    cell.classList.remove('cirlce')

                })
                break
            case 'updateBoard':
                StanzaPartita.style.display = "grid"
                console.log(`Stanza aggiornata è ${data.game.board}`)
                game = data.game
                board = game.board
                const symbolClass = TuoSimbolo == 'x' ? 'x' : 'circle'
                StanzaPartita.classList.add(symbolClass)
                index = 0
                Celle.forEach(cell => {
                    if (board[index] == 'x')
                        cell.classList.add('x')
                    else if (board[index] == 'o')
                        cell.classList.add('circle')
                    else
                        cell.addEventListener('click', clickCell)
                    index++
                })

                game.players.forEach((player) => {
                    if (player.clientId == +clientId && player.isTurn == true) {
                        isTurn = true
                        console.log(`è il tuo turno`)
                    }
                })
                break

            case 'gameEnds':
                console.log(`il vintore è ${data.winner}`)
                window.alert(`il vintore è ${data.winner}`)
                break;
            case 'draw':
                alert('Partita è finito in pareggio')
                break
        }
    }

    socket.onclose = function(event) {

    }

    socket.onerror = function(err) {

    }
})

function selectGame(src) {
    gameId = +src.target.innerText
    AggiungiPartita.addEventListener('click', joingm, { once: true })
}

function joingm() {
    const payLoad = {
        'method': 'join',
        'clientId': clientId,
        'gameId': gameId
    }
    socket.send(JSON.stringify(payLoad))
}

function clickCell(event) {

    if (!isTurn || event.target.classList.contains('x') || (event.target.classList.contains('circle')))
        return

    const cellclass = TuoSimbolo == 'x' ? 'x' : 'circle'
    event.target.classList.add(cellclass)

    index = 0
    Celle.forEach(cell => {
        if (cell.classList.contains('x'))
            board[index] = 'x'
        if (cell.classList.contains('circle'))
            board[index] = 'o'
        index++
    })
    isTurn = false
    makeMove()
}

function makeMove() {
    index = 0
    Celle.forEach((cell) => {
        if (cell.classList.contains('x'))
            game.board[index] == 'x'

        if (cell.classList.contains('circle'))
            game.board[index] == 'o'
        index++
    })
    Celle.forEach(cell => cell.removeEventListener('click', clickCell))
    const payLoad = {
        'method': 'makeMove',
        'game': game
    }
    socket.send(JSON.stringify(payLoad))
}

