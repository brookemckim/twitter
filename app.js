var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer  = require('multer')
var path = require('path')
var uuidv4 = require('uuid/v4');

var app = express();
var port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');


mongoose.Promise = require('bluebird');

var dbHost = process.env.DBHOST || "localhost";

mongoose.connect('mongodb://'+dbHost+':27017/twitter').then(function() {
	console.log('Start');
}).catch(function(err) {
  console.error('App starting error:', err.stack);
  process.exit(1);
});

var Tweet = require('./Tweet');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/photos')
  },
  filename: function (req, file, cb) {
		var ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
})

var upload = multer({ storage: storage })

app.listen(port, function(){
	console.log('Server is running on port:', port);
})

app.get('/', function(req, res){
	Tweet.find(function(err, tweets) {
		if(err) {
			console.log(err);
		} else {
			res.render('index', { tweets: tweets.reverse() })
		}
	});
});

app.post('/tweets', upload.single('photo'), function(req, res) {
	var tweet = new Tweet({
		user: req.body.user,
		body: req.body.body
	});

  if (req.file) {
	  tweet.imagePath = req.file.filename;
  }

	tweet.save().then(function() {
		res.redirect('/')
	}).catch(function(err) {
		res.status(400).send(err);
	});
});

