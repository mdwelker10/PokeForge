const crypto = require('crypto');

module.exports = class {
  id = null;
  username = null;
  #passwordHash = null;;
  #salt = null;;

  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.#salt = data.salt;
    this.#passwordHash = data.password;
  }

  validatePassword(password) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, this.#salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) { //problem computing digest, like hash function not available
          reject("Error: " + err);
        }
        const digest = derivedKey.toString('hex');

        if (this.#passwordHash == digest) {
          resolve(this.toJSON());
        }
        else {
          reject("Invalid username or password");
        }
      });
    });
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username
    }
  }
};