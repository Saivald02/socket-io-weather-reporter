var express = require('express');
var router = express.Router();

var User = require('./models/user');

const Data = require("./data");
const PrivateMessage = require("./models/private_messages");
const RoomMessage = require("./models/room_messages");
const Rooms = require("./models/rooms");


// https://mongoosejs.com/docs/api.html#model_Model.find

router.get("/getAllUsers", (req, res) => {
  console.log('getting all users from database');
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return res.json({ error: error});
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return res.json({ error: err});
          //return()
        } else {

          /*
          let param = req.query;
          const query = param.sender;
          const room = param.room;
          console.log('find room messages');
          console.log(param);
          */
          User.find({}, {_id: 0, username: 1}, function(err, results){
              if(err){
                  console.log('---- get all users error -----');
                  //console.log(results);
                  return res.json({ data: err });
              }

              if(results.length == 0) {
                  console.log("No record found")
                  return res.json({ success: false });
              }
              //console.log(results);
              return res.json({ data: results });
          });
        }
      }
    });
});

router.get("/getAllRooms", (req, res) => {
  console.log('getting all rooms from database');
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return res.json({ error: error});
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return res.json({ error: err});
          //return()
        } else {

          Rooms.find({}, {_id: 0, room: 1}, function(err, results){
              if(err){
                  console.log('---- get all rooms error -----');
                  //console.log(results);
                  return res.json({ data: err });
              }

              if(results.length == 0) {
                  console.log("No record found")
                  return res.json({ success: false });
              }
              //console.log(results);
              return res.json({ data: results });
          });
        }
      }
    });
});

router.get("/getRoomMessageHistory", (req, res) => {

  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return res.json({ error: error});
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return res.json({ error: err});
          //return()
        } else {


          let param = req.query;
          const query = param.sender;
          const room = param.room;
          console.log('find room messages');
          console.log(param);
          RoomMessage.find({ room: room }, function(err, results){
              if(err){
                  return res.json({ data: err });
              }

              if(results.length == 0) {
                  console.log("No record found")
                  return res.json({ success: false });
              }
              //console.log(results);
              return res.json({ data: results });
          });
        }
      }
    });
});

router.post('/createRoom', function (req, res, next) {
    console.log('create new room');
    //console.log(req);
    User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return res.json({ error: error});
        } else {
          if (user === null) {
            var err = new Error('Not authorized! Go back!');
            err.status = 400;
            return res.json({ error: err});
          } else {
            //console.log('found you');
            let data = new Rooms();
            const { room, creator } = req.body;
            console.log(creator);
            //console.log('cannot find req.body');
            if (!creator && !room) {
                return res.json({
                    success: false,
                    error: "INVALID INPUTS"
                });
            }

            //console.log('here?');

            data.room = room;
            data.creator = creator;
            //data.message = message;
            data.save(err => {
                if (err) return res.json({ success: false, error: err });
                console.log('saving new channel to database');
                return res.json({ success: true });
            });

          }
        }
      });
});

router.post('/roomMessageSend', function (req, res, next) {
    console.log('sending room message');
    //console.log(req);
    User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return res.json({ error: error});
        } else {
          if (user === null) {
            var err = new Error('Not authorized! Go back!');
            err.status = 400;
            return res.json({ error: err});
          } else {
            //console.log('found you');
            let data = new RoomMessage();
            const { room, sender, message } = req.body;
            //console.log('cannot find req.body');
            if (!sender && !room && !message && message !== '') {
                return res.json({
                    success: false,
                    error: "INVALID INPUTS"
                });
            }

            //console.log('here?');

            data.room = room;
            data.sender = sender;
            data.message = message;
            data.save(err => {
                if (err) return res.json({ success: false, error: err });
                console.log('saving room message to database');
                return res.json({ success: true });
            });

          }
        }
      });
});

router.get("/getPrivateMessageHistory", (req, res) => {

  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return res.json({ error: error});
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return res.json({ err: err});
        } else {

          let param = req.query;
          const query = param.sender;
          const rec = param.receiver;

          PrivateMessage.find( {
              $or: [
                  { $and: [{sender: query}, {receiver: rec}] },
                  { $and: [{sender: rec}, {receiver: query}] }
              ],
            }, function (err, results) {
                    if (err) {
                      return res.json({ data: err });
                    } else {
                      //console.log(results);
                      return res.json({ data: results });
                    }
          });
          /*
          PrivateMessage.find({ sender: query || rec, receiver: rec || query }, 'sender receiver message', function (err, docs) {
            if (error) {
              return next(err);
            } else {
              console.log(docs);
              return res.json({ data: docs });
            }
          })
          */
        }
      }
    });
});

//POST route for log in
router.post('/privateMessageSend', function (req, res, next) {
    console.log('sending private message');
    //console.log(req);
    User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return res.json({ err: error});
        } else {
          if (user === null) {
            var err = new Error('Not authorized! Go back!');
            err.status = 400;
            return res.json({ error: err});
          } else {
            //console.log('found you');
            let data = new PrivateMessage();
            const { sender, receiver, message } = req.body;
            //console.log('cannot find req.body');
            if (!sender && !receiver && !message && message !== '') {
                return res.json({
                    success: false,
                    error: "INVALID INPUTS"
                });
            }

            //console.log('here?');
            data.sender = sender;
            data.receiver = receiver;
            data.message = message;
            data.save(err => {
                if (err) return res.json({ success: false, error: err });
                //console.log('saving private message to database');
                return res.json({ success: true });
            });
            //return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.username + '<br><a type="button" href="/logout">Logout</a>')
            //return res.json({ success: 'success!' });
          }
        }
      });
});

//POST route for log in
router.post('/login', function (req, res, next) {
    console.log('log me in');

    if (req.body.username && req.body.password) {
        var loginData = {
            username: req.body.username,
            password: req.body.password,
        }
    }
    console.log(loginData);
    console.log(req.body.username);
    if (req.body.username && req.body.password) {
        User.authenticate(req.body.username, req.body.password, function (error, user) {
            if (error || !user) {
                //var err = new Error('Wrong username or password.');
                //err.status = 401;
                //return next(err);
                return res.json({ error: 'Wrong username or password' });
            } else {
                req.session.userId = user._id;
                //return res.redirect('/profile');
                console.log('user auth success');
                return res.json({ success: loginData });
            }
        });
    }
})
//POST route for updating data
router.post('/register', function (req, res, next) {
  console.log('register me');
  console.log(req.body);
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return res.json({ error: err});
  }

  if (req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }

    var userInfo = {
        username: req.body.username,
    }
    //console.log(userData);

    User.find({ username: userInfo.username }, function(err, results){
        if(err){
            return res.json({ data: err });
        }

        if(results.length == 0) {
            console.log("No record found");
            User.create(userData, function (error, user) {
              if (error) {
                return res.json({ error: error});
              } else {
                req.session.userId = user._id;
                console.log('user create');
                //console.log(user);
                return res.json({ success: userInfo });
                //return res.redirect('/profile');
              }
            });

        } else {
            console.log('username not available');
            return res.json({ error: true });
        }
        //console.log(results);
        //return res.json({ data: results });
    });



  } else if (req.body.username && req.body.password) {
    User.authenticate(req.body.username, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong username or password.');
        err.status = 401;
        return res.json({ error: err});
      } else {
        req.session.userId = user._id;
        //return res.redirect('/profile');
        console.log('user auth');
        return res.json({ success: true });
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return res.json({ error: err});
  }
})

// GET route after registering
router.get('/profile', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return res.json({ error: error});
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return res.json({ error: err});
        } else {
          //return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.username + '<br><a type="button" href="/logout">Logout</a>')
          return res.json({ success: true });
        }
      }
    });
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  console.log('logging out');
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return res.json({ error: err});
      } else {
        //return res.redirect('/');
        return res.json({ success: false });
      }
    });
  }
});

// -------------------------------------------------------------------------------

router.get("/getData", (req, res) => {
    Data.find((err, data) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: data });
    });
});


// this is our create methid
// this method adds new data in our database
router.post("/putData", (req, res) => {
    let data = new Data();

    const { id, message } = req.body;

    if ((!id && id !== 0) || !message) {
        return res.json({
            success: false,
            error: "INVALID INPUTS"
        });
    }
    data.message = message;
    data.id = id;
    console.log('adding stuff to database');
    console.log(data);
    data.save(err => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
    });
});

// this is our update method
// this method overwrites existing data in our database
router.post("/updateData", (req, res) => {
    const { id, update } = req.body;
    Data.findOneAndUpdate(id, update, err => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
    });
});

// this is our delete method
// this method removes existing data in our database
router.delete("/deleteData", (req, res) => {
    const { id } = req.body;
    Data.findOneAndDelete(id, err => {
        if (err) return res.send(err);
        return res.json({ success: true });
    });
});

//app.use("/api", router);

module.exports = router;
