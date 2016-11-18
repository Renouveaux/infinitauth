const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;
const SALT_WORK_FACTOR = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 1 * 60 * 1000;

const UserSchema = new Schema({
  __v: {type: Number, select: false},
  username : { type : String, required: true },
  firstname : { type : String, required: true },
  lastname : { type : String, required: true },
  email : { type : String, required: true },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date },
  emailVerified: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Number },
  accounts : { type : Schema.Types.Mixed, select : false, required: true}
});

UserSchema.virtual('isLocked').get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
  });

UserSchema.pre('save', function saveIt(next) {

  const user = this;
  if (user.isModified('user.accounts.password')) return next();
  const password = user.accounts.password;

  // generate a salt
  return bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);


    // hash the password along with our new salt
    return bcrypt.hash(password, salt, function(hashErr, hash) {
      if (hashErr) return next(hashErr);
      
      user.accounts.password = hash;

      return next();
    });

  });
});

UserSchema.methods.comparePassword = function compare(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.accounts.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

UserSchema.methods.incLoginAttempts = function(cb){
  // if we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    }, cb);
  }

  // otherwise we're incrementing
  var updates = { $inc: { loginAttempts: 1 } };
  // lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return this.update(updates, cb);
}

// expose enum on the model, and provide an internal convenience reference 
var reasons = UserSchema.statics.failedLogin = {
  NOT_FOUND: 0,
  PASSWORD_INCORRECT: 1,
  MAX_ATTEMPTS: 2
};

UserSchema.statics.getAuthenticated = function(username, password, cb) {
  this.findOne({ username: username }, function(err, user) {
    if (err) return cb(err);

        // make sure the user exists
        if (!user) {
          return cb(null, null, reasons.NOT_FOUND);
        }

        // check if the account is currently locked
        if (user.isLocked) {
            // just increment login attempts if account is already locked
            return user.incLoginAttempts(function(err) {
              if (err) return cb(err);
              return cb(null, null, reasons.MAX_ATTEMPTS);
            });
          }

        // test for a matching password
        user.comparePassword(password, function(err, isMatch) {
          if (err) return cb(err);

            // check if the password was a match
            if (isMatch) {
                // if there's no lock or failed attempts, just return the user
                if (!user.loginAttempts && !user.lockUntil) return cb(null, {
                  username: user.username,
                  firstname: user.firstname,
                  lastname: user.lastname,
                  email: user.email,
                  createdAt: user.createdAt,
                  emailVerified: user.emailVerified,
                  loginAttempts: user.loginAttempts
                });
                // reset attempts and lock info
                var updates = {
                  $set: { loginAttempts: 0 },
                  $unset: { lockUntil: 1 }
                };
                return user.update(updates, function(err) {
                  if (err) return cb(err);
                  return cb(null, {
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    createdAt: user.createdAt,
                    emailVerified: user.emailVerified,
                    loginAttempts: 0
                  });
                });
              }

            // password is incorrect, so increment login attempts before responding
            user.incLoginAttempts(function(err) {
              if (err) return cb(err);
              return cb(null, null, reasons.PASSWORD_INCORRECT);
            });
          });
      }).select('+accounts');
};

UserSchema.statics.getAccountInformation = function(account_id, cb){
  this.findById(account_id, function(err, data){
    if (err) return cb({
      "message" : "No data found"
    });

    return cb(null, data);
  });
}

module.exports = mongoose.model('User', UserSchema);