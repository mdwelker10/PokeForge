const db = require('../DBConnection');
const User = require('../models/User');
const crypto = require('crypto');


function getUserByCredentials(username, password) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM user WHERE username=?', [username]).then(({ results }) => {
      if (!results[0]) {
        reject("User not found");
      }
      const user = new User(results[0]);
      //console.log(user);
      if (user) { // we found our user
        user.validatePassword(password).then((user) => {
          resolve(user);
        }).catch(err => {
          reject(err);
        });
      }
      else { // if no user with provided username
        reject("No such user");
      }
    });
  });
}



function createUser(username, password) {
  return new Promise((resolve, reject) => {
    //insert User
    let salt = crypto.randomBytes(32);
    //console.log(salt);

    salt = salt.toString('hex');
    //console.log(salt);
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) { //problem computing digest, like hash function not available
        reject("Error: " + err);
      }

      const hashedPassword = derivedKey.toString('hex');
      db.query('INSERT INTO user(username, password, salt) VALUES (?, ?, ?)', [username, hashedPassword, salt]).then(({ results }) => {
        if (results.affectedRows == 0) {
          reject("Could not create new account");
        }
        resolve({ id: results.insertId, username: username });
      }).catch(err => {
        reject("Error:" + err);
      });;
    });
  });
}


// function hashPassword(password, salt) {

//   crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
//     if (err) { //problem computing digest, like hash function not available
//       reject("Error: " +err);
//     }

//     const digest = derivedKey.toString('hex');
//     return digest;



//   });

// }

function getFilteredUser(user) {
  return {
    "id": user.id,
    "username": user.username
  }
}


module.exports = {
  getUserByCredentials: getUserByCredentials,
  createUser: createUser
};
