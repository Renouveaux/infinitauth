'use strict';

const express 		= require('express');
const jwt			= require('express-jwt');

const User = require('../models/users.js');

const account = express.Router();

account.use(jwt({secret: process.env.secret}).unless(function(req) {
	return (
		req.method === 'PUT'
		);
})
);

account.use(function (err, req, res, next) {
	if (err.name === 'UnauthorizedError') { 
		res.status(401).json({
			"status": 401,
			"code": 401,
			"message": "Authentication required.",
			"developerMessage": "Authentication with a valid API Key is required."
		});
	}
});

account.get('/:account_id', function(req, res, next){

	User.getAccountInformation(req.params.account_id, function(err, data){

		if(err) {
			res.status(404).json(err);
			return next();
		}

		res.json(data);
	});

});

account.put('/', function(req, res, next){

	if(Object.keys(req.body.accounts).length <= 0){
		res.status(405).json({"message": "Accounts data not send correctly"}); 
		return false;
	}

	if(Object.keys(req.body).length <= 0) {
		res.status(405).json({"message": "Thanks to give some data"}); 
		return false;
	}

	User.findOne({ username: req.body.username }, function(err, user) {
		if (err) {
			res.status(400).json({"message": "an error occured, your request can not be processed"})
			return false;
		}

		if (user) {
			res.status(409).json({ message: 'This user account already exist' });
			return false;
		}

		const admin = new User({
			username: req.body.username || null,
			firstname: req.body.firstname || null,
			lastname: req.body.lastname || null,
			email: req.body.email || null,
			accounts: {
				kind: req.body.accounts.kind || null,
				password: req.body.accounts.password || null
			}
		});

		return admin.save(function(saveErr) {
			if (saveErr){
				res.status(400).json({"message": saveErr.errors[Object.keys(saveErr.errors)[0]].message});
				return false;
			};

			return res.json({ "message": "Your account was created" });
		});
	});

});

account.patch('/:account_id', function(req, res, next){

	res.status(405).json({"message": "Your not allowed to update this resource"});

	res.status(204).end();

});

account.delete('/:account_id', function(req, res, next){

	res.status(405).json({"message": "Your not allowed to delete this resource"});

	res.status(204).end();

});


module.exports = account;

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
*/