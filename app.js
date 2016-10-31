'use strict';

const express	= require('express');
const mongoose 	= require('mongoose');

const app = express();

// Get constants
const SECRET = process.env.secret;
const MONGO_ADDR = process.env.MONGO_ADDR;
const MONGO_PORT = process.env.MONGO_PORT;
const MONGO_DATABASE = process.env.MONGO_DATABASE;

app.set('secretPassphrase', SECRET);

function getConnectionString(){
	return `mongodb://${MONGO_ADDR}:${MONGO_PORT}/${MONGO_DATABASE}`;
}

//connection to database
mongoose.Promise = global.Promise
const connectionString = getConnectionString();
console.log(`connecting to ${connectionString}`);
mongoose.connect(connectionString);

//Routing
app.route('/')
	.get(function(req, res){
		res.json({message: "Hello from infinitAuth"});
	});

app.use('/auth', require('./routes/auth'));

let port = process.env.port || 3000;

app.listen(port, function(){
	console.log(`The app is running on port ${port}` );
});

module.exports.server = app;