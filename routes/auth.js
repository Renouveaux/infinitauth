'use strict';

const express 		= require('express');
const bodyParser 	= require('body-parser');
const jwt			= require('jsonwebtoken');

const User = require('../models/users.js');

const auth = express.Router();

auth.use(bodyParser.urlencoded({ extended: true }));
auth.use(bodyParser.json());

auth.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  next();
});

auth.get('/', function(req, res){
  //TODO 
  //Le client donne son token, nous vérifions si ce dernier est valable ou pas.
})

/*auth.get('/setup', function(req, res) {
  User.findOne({ username: 'admin' }, function(err, user) {
    if (err) throw err;

    if (user) {
      return res.status(409).json({ message: 'user already exists' });
    }

    const admin = new User({
      username: 'admin',
      firstname: 'admin',
      lastname: 'admin',
      email: `admin@${process.env.MONGO_ADDR}`,
      accounts: {
      	kind: 'internal',
      	password: 'changemeplease'
      }
    });

    return admin.save(function(saveErr) {
      if (saveErr) throw saveErr;

      return res.json({ success: true });
    });
  });
});

auth.get('/update', function(req, res){
	User.findOne({username: 'admin'}, function(err, d){
		d.firstname = "Yannick",
		d.lastname = "peron",
		d.save();
	})
})

auth.get('/upgrade', function(req, res){
	User.update({username: 'admin'}, 
	{
		$set: {
			firstname : "Yannick",
			lastname : "peron"
		}
	}, { multi: true }, function(err, d){
		return res.json({ success : true });
	})
})*/

auth.post('/', function(req, res){

  User.getAuthenticated(req.body.username, req.body.password, function(err, user, reason){
    if(err) throw err;

    if(user){
      console.log("Login user with success");
      const token = jwt.sign(user, req.app.get('secretPassphrase'), {
          expiresIn: 86400, // 24 hours
        });

      return res.json({
        success: true,
        message: 'Authentification complete',
        token,
      });
    }

    var reasons = User.failedLogin;
    switch (reason) {
      case reasons.NOT_FOUND:
      case reasons.PASSWORD_INCORRECT:
      return res.json({
        success: false,
        message: 'Authentication failed. Username and password do not match.'
      });
      break;
      case reasons.MAX_ATTEMPTS:
      return res.json({
        success: false,
        message: 'Too many failed login attempts'
      });
      break;
    }

  })

})


module.exports = auth;