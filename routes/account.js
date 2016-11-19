'use strict';

const express 		= require('express');
const jwt			= require('express-jwt');
const token			= require('jsonwebtoken');

const User = require('../models/users.js');

const account = express.Router();

account.use(jwt({secret: process.env.secret}).unless(function(req) {
	return (req.method === 'PUT');
}));

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

account.get('/', function(req, res, next){

	let constToken = req.headers.authorization.split(' ')[1];

	token.verify(constToken, process.env.secret, function(err, decoded){
		if(err) return res.status(400).json({"message" : "The token given can't be verified"});
		
		User.getAccountInformation(decoded.username, function(err, data){

			if(err) {
				return res.status(404).json(err);
			}

			res.status(206).json(data);
		});
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
		/*
		Check if a error was returned by MongoDB
		*/
		if (err) {
			res.status(400).json({"message": "an error occured, your request can not be processed"})
			return false;
		}

		if (user) {
			res.status(409).json({ message: 'This user account already exist' });
			return false;
		}

		const admin = new User({
			username: req.body.username,
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			email: req.body.email,
			accounts: {
				kind: req.body.accounts.kind,
				password: req.body.accounts.password
			}
		});

		return admin.save(function(saveErr) {
			if (saveErr){
				res.status(400).json({"message": saveErr.errors[Object.keys(saveErr.errors)[0]].message});
				return false;
			};

			return res.status(201).json({ "message": "Your account was created" });
		});
	});

});

/*account.patch('/', function(req, res, next){

	res.status(405).json({"message": "Your not allowed to update this resource"});

	res.status(204).end();

});*/

account.delete('/', function(req, res, next){

	let constToken = req.headers.authorization.split(' ')[1];

	token.verify(constToken, process.env.secret, function(err, decoded){
		if(err) return res.status(400).json({"message" : "The token given can't be verified"});
		
		User.findOneAndRemove(decoded.username, function(err, data){

			if(err) {
				return res.status(404).json({"message" : "This resource doesn't exist anymore, please delete your token"});
			}

			res.status(204).end();
		});
	});

});


module.exports = account;