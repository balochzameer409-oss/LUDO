const {join} = require('path')
const views = join(__dirname, '../views');

let {rooms,NumberOfMembers} = require('../models/model')

exports.root = (_req,res)=>{
    res.redirect(301,'/');
}

exports.room = (req,res)=>{
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
    
    // اگر کمرہ بھرا ہوا ہے
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
    
    // اگر query parameters موجود ہیں تو check کریں
    if(Object.keys(req.query).length > 0){
        // اگر صرف expected parameters ہیں تو ٹھیک ہے
        // مثال: ?playerId=123
        // اگرنہیں تو انہیں ignore کریں یا error دیں
    }
    
    // تمام چیکس کے بعد صفحہ کھولیں
    res.sendFile('ludo.html', { root: views });
}
