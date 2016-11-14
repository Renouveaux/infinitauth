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
	res.send("Put ok.");
});


module.exports = account;