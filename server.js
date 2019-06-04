var express = require('express'),
    app = express(),
    http = require('http').Server(app);


app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

let port = process.env.PORT || 8080;

http.listen(port, function () {
    console.log(`Server running on port ${port}`);
});


const io = require('socket.io')(http);

var players = {},
    unmatched;

function joinGame(socket) {

    players[socket.id] = {

        opponent: unmatched,

        symbol: 'X',

        socket: socket
    };

    if (unmatched) {
        players[socket.id].symbol = 'O';
        players[unmatched].opponent = socket.id;
        unmatched = null;
    } else {
        unmatched = socket.id;
    }
}

function getOpponent(socket) {
    if (!players[socket.id].opponent) {
        return;
    }
    return players[
        players[socket.id].opponent
    ].socket;
}

io.on('connection', function (socket) {
    console.log("Connection established...", socket.id);
    joinGame(socket);

    if (getOpponent(socket)) {
        socket.emit('game.begin', {
            symbol: players[socket.id].symbol
        });
        getOpponent(socket).emit('game.begin', {
            symbol: players[getOpponent(socket).id].symbol
        });
    }

    socket.on('make.move', function (data) {
        if (!getOpponent(socket)) {
            return;
        }
        console.log("Move made by : ", data);
        socket.emit('move.made', data);
        getOpponent(socket).emit('move.made', data);
    });

    socket.on('disconnect', function () {
        if (getOpponent(socket)) {
            getOpponent(socket).emit('opponent.left');
        }
    });
});
