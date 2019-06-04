var socket = io.connect(),
    myTurn = true, symbol;

var matches = ['XXX', 'OOO'];

function getBoardState() {
    var obj = {};

    $('.cell').each(function () {
        obj[$(this).attr('id')] = $(this).text() || '';
    });

    console.log("state: ", obj);
    return obj;
}

function isGameOver() {
    var state = getBoardState();
    console.log("Board State: ", state);

    var rows = [
        state.a0 + state.a1 + state.a2,
        state.b0 + state.b1 + state.b2,
        state.c0 + state.c1 + state.c2,
        state.a0 + state.b1 + state.c2,
        state.a2 + state.b1 + state.c0,
        state.a0 + state.b0 + state.c0,
        state.a1 + state.b1 + state.c1,
        state.a2 + state.b2 + state.c2
    ];

    for (var i = 0; i < rows.length; i++) {
        if (rows[i] === matches[0] || rows[i] === matches[1]) {
            return true;
        }
    }
    return false;
}

function renderTurnMessage() {
    if (!myTurn) {
        $('#messages').text('Your opponent\'s turn');
        $('.cell').attr('disabled', true);

    } else {
        $('#messages').text('Your turn.');
        $('.cell').removeAttr('disabled');

    }
}

function makeMove(e) {
    e.preventDefault();
    if (!myTurn) {
        return;
    }

    if ($(this).text().length) {
        return;
    }
    socket.emit('make.move', {
        symbol: symbol,
        position: $(this).attr('id')
    });

}

socket.on('move.made', function (data) {
    $('#' + data.position).text(data.symbol);

    myTurn = (data.symbol !== symbol);

    if (!isGameOver()) {
        return renderTurnMessage();
    }

    if (myTurn) {
        $('#messages').text('Game over. You lost.');
    } else {
        $('#messages').text('Game over. You won!');
    }
    $('.cell').attr('disabled', true);
});

socket.on('game.begin', function (data) {
    $("#symbol").html(data.symbol);
    symbol = data.symbol;

    myTurn = (data.symbol === 'X');
    renderTurnMessage();
});

socket.on('opponent.left', function () {
    $('#messages').text('Your opponent left the game.');
    $('.cell').attr('disabled', true);
});

$(function () {
    $('.board button').attr('disabled', true);
    $(".cell").on("click", makeMove);
});