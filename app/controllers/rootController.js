const {join} = require('path')
let {rooms,NumberOfMembers,win} = require('../models/model')

const views = join(__dirname, '../views');

exports.get = (req,res)=>{
    res.sendFile('index.html', { root: views });
}

exports.post = (req,res)=>{
    if(req.body.action_to_do === 'create'){
        let p0th = randomPath()
        if(!p0th){
            res.statusCode = 500;
            res.end('خرابی: کمرہ نہیں بن سکا۔ دوبارہ کوشش کریں');
            return;
        }
        rooms[p0th] = {};
        win[p0th] = {};
        NumberOfMembers[p0th] = {constant:false,members:4};
        res.redirect(301, 'ludo/' + p0th);
    } else if(req.body.action_to_do === 'join'){
            if(Object.keys(rooms).includes(req.body.roomcode)){
                res.redirect(301, 'ludo/' + req.body.roomcode);
            } else{
                res.statusCode = 404;
                res.end('404! کمرہ کوڈ غلط ہے یا موجود نہیں ہے۔');
            }
        } else{
            res.statusCode = 400;
            res.end('400! غلط درخواست');
        }
}

// منفرد کمرہ کوڈ بنانے کے لیے
function randomPath(){
    let attempts = 0;
    const maxAttempts = 100; // سو سے زیادہ کوشش نہ کریں
    
    while(attempts < maxAttempts){
        // بہتر random generation
        let randomPath = (Math.random().toString(36).substr(2, 6) + 
                         Math.random().toString(36).substr(2, 6)).substr(0, 8);
        
        if(!Object.keys(rooms).includes(randomPath)){
            return randomPath;
        }
        attempts++;
    }
    
    // اگر سو کوششوں کے بعد بھی نہ ملے
    console.error('⚠️ randomPath: منفرد کوڈ بنانے میں ناکام');
    return null;
}

exports.getOffline = (req,res)=>{
    res.sendFile('ludo-offline.html', { root: views });
}
