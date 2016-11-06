var app = require('express')();
var cookieParser = require('cookie-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://mongodb:mongodb@localhost/mydb';

app.use(cookieParser());

app.get('/deleteHistory', function(req,res){

  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);

    removeHisroty(db, function() {
        db.close();
    });
  });

  res.send('All History Removed');


  });


app.get('/', function(req, res){
  //res.cookie('userName','Pedro Brito', { maxAge: 900000 });
  //var userName = req.cookie.userName;

//  console.log(req.cookies['username']);

  if (req.cookies['username']) {

    res.sendFile('chat.html', { root : __dirname});

  }

  else {

    res.sendFile('welcome.html', { root : __dirname});

  }

});



io.on('connection', function(socket){

  //var socket = io('localhost');
  var sessionid = socket.id;

  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    findHistory(db, sessionid, function() {
        db.close();
    });
  });

  socket.on('chat message', function(msg){



    io.emit('chat message', msg);
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      insertDocument(db, msg, function() {
      db.close();
      });
    });
  });
});


http.listen(80, function(){
  console.log('listening on *:80');
});

var findHistory = function(db, sessionid, callback) {
   var cursor =db.collection('chatHistory').find( );
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {

        io.to(sessionid).emit('chat message', doc['message']);

      //  io.emit('chat message', doc['message']);

        //console.dir(doc);
      } else {
         callback();
      }
   });
};


var insertDocument = function(db, msg, callback) {
   db.collection('chatHistory').insertOne( {
      "message" : msg,

   }, function(err, result) {
    assert.equal(err, null);
  //  console.log("Inserted a document into the restaurants collection.");
    callback();
  });
};

var removeHisroty = function(db, callback) {
   db.collection('chatHistory').deleteMany( {}, function(err, results) {
    //  console.log(results);
      callback();
   });
};
