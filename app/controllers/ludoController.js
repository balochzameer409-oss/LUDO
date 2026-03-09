const {join} = require('path')
const views = join(__dirname, '../views');

let {rooms, NumberOfMembers} = require('../models/model')

// جوائن order: Yellow(3) → Red(1) → Blue(2) → Green(0)
const JOIN_ORDER = [3, 1, 2, 0];

exports.root = (_req, res) => {
    res.redirect(301, '/');
}

exports.room = (req, res) => {
    const roomCode = req.params.ROOMCODE;

    if(!roomCode || typeof roomCode !== 'string'){
        res.statusCode = 400;
        res.end('400! غلط روم کوڈ');
        return;
    }

    if(!Object.keys(rooms).includes(roomCode)){
        res.statusCode = 404;
        res.end('404! یہ روم کوڈ موجود نہیں ہے۔ ہوم سے نیا کمرہ بنائیں۔');
        return;
    }

    if(Object.keys(rooms[roomCode]).length >= 4){
        res.statusCode = 403;
        res.end('403! یہ کمرہ مکمل بھر چکا ہے۔ دوسرا کمرہ بنائیں۔');
        return;
    }

    if(NumberOfMembers[roomCode] && NumberOfMembers[roomCode].constant){
        if(Object.keys(rooms[roomCode]).length >= NumberOfMembers[roomCode].members){
            res.statusCode = 403;
            res.end('403! اس کمرے میں مقررہ کھلاڑیوں کی تعداد پوری ہو چکی ہے۔');
            return;
        }
    }

    res.sendFile('ludo.html', { root: views });
}

exports.addPlayer = (roomCode, socketId) => {
    if(!rooms[roomCode]){
        return null;
    }

    // JOIN_ORDER کے مطابق خالی جگہ تلاش کرو
    // پہلا → Yellow(3), دوسرا → Red(1), تیسرا → Blue(2), چوتھا → Green(0)
    for(let i = 0; i < JOIN_ORDER.length; i++){
        let slot = JOIN_ORDER[i];
        if(!rooms[roomCode][slot]){
            rooms[roomCode][slot] = {
                sid: socketId,
                num: slot
            };
            return slot;
        }
    }
    return null;
}

exports.removePlayer = (roomCode, playerNum) => {
    if(rooms[roomCode] && rooms[roomCode][playerNum]){
        delete rooms[roomCode][playerNum];

        if(Object.keys(rooms[roomCode]).length === 0){
            delete rooms[roomCode];
            delete NumberOfMembers[roomCode];
            delete exports.win[roomCode];
            return true;
        }
        return false;
    }
    return false;
}

exports.getPlayersCount = (roomCode) => {
    if(!rooms[roomCode]){
        return 0;
    }
    return Object.keys(rooms[roomCode]).length;
}

exports.getRoomPlayers = (roomCode) => {
    if(!rooms[roomCode]){
        return null;
    }
    return rooms[roomCode];
}
