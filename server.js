var express = require('express');
var app = express();
var port = 8086;
//var bodyparser = require('body-parser');
var multer = require('multer');
var https = require('https');
var fs = require('fs');

var pkey = fs.readFileSync('./ssl/private.key','utf8');
var crt = fs.readFileSync('./ssl/certificate.crt');




app.use(express.static(__dirname+'/public'));

/*
app.post('blob', (req, res) => {
  req.pipe(fs.createWriteStream('public/myFile.wav'))
    .on('error', (e) => res.status(500).end(e.message))
    .on('close', () => res.end('File saved'))
});
*/

var wav = multer({dest:'wav/'});
app.post('/wav',wav.single('wav'),function(req,res){
	console.log(req.headers);
	console.log(req.file);
	res.sendStatus(200);
});

var mp3 = multer({dest:'mp3/'});
app.post('/mp3',mp3.single('mp3'),function(req,res){
	console.log(req.headers);
	console.log(req.file);
	res.sendStatus(200);
});


//app.listen(port);

var server = https.createServer({key:pkey,cert:crt}, app);
server.listen(port,function(){console.log(port)});
