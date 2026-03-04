const {join} = require('path')
const views = join(__dirname, '../views');

let {rooms, NumberOfMembers} = require('../models/model')

exports.root = (_req, res) => {
    res.redirect(301, '/');
}

exports.room = (req, res) => {
    // روم کوڈ چیک کریں
    const roomCode = req.params.ROOMCODE;
    
    if(!roomCode || typeof roomCode !== 'string'){
        res.statusCode = 400;
        res.end('400! غلط روم کوڈ');
        return;
    }
    
    // اگر روم موجود نہیں ہے
    if(!Object.keys(rooms).includes(roomCode)){
        res.statusCode = 404;
        res.end('404! یہ روم کوڈ موجود نہیں ہے۔ ہوم سے نیا کمرہ بنائیں۔');
        return;
    }
    
    // اگر کمرہ بھرا ہوا ہے (4 سے زیادہ کھلاڑی)
    if(Object.keys(rooms[roomCode]).length >= 4){
        res.statusCode = 403;
        res.end('403! یہ کمرہ مکمل بھر چکا ہے۔ دوسرا کمرہ بنائیں۔');
        return;
    }
    
    // اگر NumberOfMembers کی خصوصی حد ہے
    if(NumberOfMembers[roomCode] && NumberOfMembers[roomCode].constant){
        if(Object.keys(rooms[roomCode]).length >= NumberOfMembers[roomCode].members){
            res.statusCode = 403;
            res.end('403! اس کمرے میں مقررہ کھلاڑیوں کی تعداد پوری ہو چکی ہے۔');
            return;
        }
    }
    
    // اب لودو صفحہ کھولیں
    res.sendFile('ludo.html', { root: views });
}

// Socket.IO کے ذریعے کھلاڑی کو کمرے میں شامل کریں
exports.addPlayer = (roomCode, socketId) => {
    if(!rooms[roomCode]){
        return null;
    }
    
    // خالی جگہ تلاش کریں (0-3)
    for(let i = 0; i < 4; i++){
        if(!rooms[roomCode][i]){
            // کھلاڑی کو شامل کریں
            rooms[roomCode][i] = {
                sid: socketId,
                num: i
            };
            return i; // کھلاڑی کا نمبر واپس کریں
        }
    }
    return null; // کوئی جگہ نہیں
}

// کھلاڑی کو کمرے سے نکالیں
exports.removePlayer = (roomCode, playerNum) => {
    if(rooms[roomCode] && rooms[roomCode][playerNum]){
        delete rooms[roomCode][playerNum];
        
        // اگر کمرہ خالی ہو گیا تو اسے delete کریں
        if(Object.keys(rooms[roomCode]).length === 0){
            delete rooms[roomCode];
            delete NumberOfMembers[roomCode];
            delete exports.win[roomCode];
            return true; // کمرہ ختم ہو گیا
        }
        return false;
    }
    return false;
}

// روم میں کتنے کھلاڑی ہیں
exports.getPlayersCount = (roomCode) => {
    if(!rooms[roomCode]){
        return 0;
    }
    return Object.keys(rooms[roomCode]).length;
}

// روم کی معلومات حاصل کریں
exports.getRoomPlayers = (roomCode) => {
    if(!rooms[roomCode]){
        return null;
    }
    return rooms[roomCode];
}
