var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var app = express();
var port = 9907;

var bodyparser = require('body-parser');
var multer = require('multer');

var options = {
		ca: fs.readFileSync('./ssl/ca_bundle.crt'),
		key: fs.readFileSync('./ssl/private.key'),
		cert: fs.readFileSync('./ssl/certificate.crt')
		//requestCert: false,
		//rejectUnauthorized: false
};

http.createServer(app).listen(9908);
https.createServer(options, app).listen(port);

app.use(express.static(__dirname+'/public'));
//app.listen(port);
//var server = https.createServer(options, app).listen(port, function(){
//  console.log("server started");
//});  
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

