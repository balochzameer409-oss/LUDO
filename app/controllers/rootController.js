const {join} = require('path')
let {rooms, NumberOfMembers, win} = require('../models/model')

const views = join(__dirname, '../views');

// ہوم پیج دکھائیں
exports.get = (req, res) => {
    res.sendFile('index.html', { root: views });
}

// نیا کمرہ بنائیں یا موجودہ کمرے میں جائیں
exports.post = (req, res) => {
    if(req.body.action_to_do === 'create'){
        let p0th = randomPath()
        
        if(!p0th){
            res.statusCode = 500;
            res.end('خرابی: کمرہ نہیں بن سکا۔ دوبارہ کوشش کریں');
            return;
        }
        
        // ✅ نیا روم بنائیں - صحیح ساخت کے ساتھ
        rooms[p0th] = {}; // خالی کمرہ
        NumberOfMembers[p0th] = {
            constant: false,
            members: 4
        };
        win[p0th] = {}; // جیتنے والوں کی معلومات
        
        console.log(`✅ نیا کمرہ بنایا: ${p0th}`);
        res.redirect(301, 'ludo/' + p0th);
        
    } else if(req.body.action_to_do === 'join'){
        const roomCode = req.body.roomcode;
        
        // روم کوڈ چیک کریں
        if(!roomCode || typeof roomCode !== 'string'){
            res.statusCode = 400;
            res.end('400! روم کوڈ صحیح نہیں ہے۔');
            return;
        }
        
        // روم موجود ہے یا نہیں
        if(!Object.keys(rooms).includes(roomCode)){
            res.statusCode = 404;
            res.end('404! کمرہ کوڈ غلط ہے یا موجود نہیں ہے۔');
            return;
        }
        
        // روم میں جگہ ہے یا نہیں
        if(Object.keys(rooms[roomCode]).length >= 4){
            res.statusCode = 403;
            res.end('403! یہ کمرہ مکمل بھر چکا ہے۔ دوسرا کمرہ بنائیں۔');
            return;
        }
        
        console.log(`✅ کمرے میں داخل: ${roomCode}`);
        res.redirect(301, 'ludo/' + roomCode);
        
    } else {
        res.statusCode = 400;
        res.end('400! غلط درخواست');
    }
}

// منفرد 8 حرفی کمرہ کوڈ بنائیں
function randomPath(){
    let attempts = 0;
    const maxAttempts = 100;
    
    while(attempts < maxAttempts){
        // بہتر random generation - 8 حرفی کوڈ
        let randomCode = (
            Math.random().toString(36).substr(2, 6) + 
            Math.random().toString(36).substr(2, 6)
        ).substr(0, 8).toUpperCase(); // بڑے حروف میں
        
        // چیک کریں کہ یہ کوڈ پہلے سے موجود تو نہیں
        if(!Object.keys(rooms).includes(randomCode)){
            return randomCode;
        }
        attempts++;
    }
    
    console.error('⚠️ randomPath: منفرد کوڈ بنانے میں ناکام');
    return null;
}

// آفلائن لودو کھیل
exports.getOffline = (req, res) => {
    res.sendFile('ludo-offline.html', { root: views });
}

// ✅ موجودہ تمام کمرے دیکھیں (صرف ڈیبگنگ کے لیے)
exports.getRooms = (req, res) => {
    res.json({
        rooms: rooms,
        numberOfMembers: NumberOfMembers,
        totalRooms: Object.keys(rooms).length
    });
}

// ✅ کسی خاص روم کی معلومات
exports.getRoomInfo = (req, res) => {
    const roomCode = req.params.roomCode;
    
    if(!rooms[roomCode]){
        res.statusCode = 404;
        res.json({ error: 'کمرہ موجود نہیں' });
        return;
    }
    
    res.json({
        roomCode: roomCode,
        players: rooms[roomCode],
        playersCount: Object.keys(rooms[roomCode]).length,
        maxPlayers: NumberOfMembers[roomCode].members,
        winners: win[roomCode] || {}
    });
}
