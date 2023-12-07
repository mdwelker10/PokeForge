const db = require('../DBConnection');
const Pokemon = require('../models/Pokemon');
const { Move } = require('../models/PokeDataModels');
const types = require('../types/types');
const { constructError } = require('../../utils');

function getAllPokemon() {
  return db.query('SELECT * FROM pokemon').then(({ results }) => {
    return results.map(data => new Pokemon(data));
  });
}

function getPokemonByName(name, getDefenses = false) {
  const q = name.replaceAll(' ', '').toLowerCase();
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM pokemon WHERE LOWER(REPLACE(name,' ','')) = ?", [q]).then(({ results }) => {
      if (results[0]) {
        if (getDefenses) {
          const p = new Pokemon(results[0]);
          resolve(p.getTypeDefenses());
        }
        resolve(new Pokemon(results[0]));
      } else {
        reject(constructError(400, "Could not find data for that pokemon"));
      }
    }).catch(err => {
      reject(constructError(500, "Could not get pokemon data"));
    });
  });
}

function getPokemonById(id, getDefenses = false) {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM pokemon WHERE id = ?", [id]).then(({ results }) => {
      if (results[0]) {
        if (getDefenses) {
          const p = new Pokemon(results[0]);
          resolve(p.getTypeDefenses());
        }
        resolve(new Pokemon(results[0]));
      } else {
        reject(constructError(400, "Could not find data for that pokemon"));
      }
    }).catch(err => {
      reject(constructError(500, "Could not get pokemon data"));
    });
  });
}

function getPokemonByType(type) {
  return new Promise((resolve, reject) => {
    let q = type.toLowerCase();
    db.query("SELECT * FROM pokemon WHERE type1 = ? OR type2 = ?", [q, q]).then(({ results }) => {
      if (results) {
        resolve(results.map(data => new Pokemon(data)));
      } else {
        reject(constructError(400, 'Pokemon with that type not found'));
      }
    }).catch(err => {
      if (!types.typeList.includes(q)) {
        reject(constructError(400, 'Type is not valid'));
      }
      reject(constructError(500, 'Could not get pokemon data'));
    });
  });
}

function getPokemonMoves(identifier, isName) {
  return new Promise((resolve, reject) => {
    let insert = '';
    if (isName) {
      insert = "LOWER(REPLACE(p.name, ' ', '')) = ?";
    } else {
      insert = "p.id = ?"
    }
    db.query(`SELECT m.* FROM pokemon AS p JOIN teachable_moves AS tm ON tm.pokemon_id = p.id JOIN move AS m ON m.id = tm.move_id WHERE ${insert} ORDER BY m.name ASC`,
      [identifier]).then(({ results }) => {
        if (results && results.length > 1) {
          resolve(results.map(data => new Move(data)));
        } else {
          reject(constructError(400, 'Could not find moves for that Pokemon'));
        }
      }).catch(err => {
        reject(constructError(500, 'Could not get pokemon move data'));
      });
  });
}

function getPokemonAbilities(identifier, isName) {
  return new Promise((resolve, reject) => {
    let insert = '';
    if (isName) {
      insert = "LOWER(REPLACE(p.name, ' ', '')) = ?";
    } else {
      insert = "p.id = ?"
    }
    db.query(`SELECT a.*, pa.is_hidden FROM pokemon AS p JOIN pokemon_abilities AS pa ON pa.pokemon_id = p.id JOIN ability AS a ON a.id = pa.ability_id WHERE ${insert}`,
      [identifier]).then(({ results }) => {
        if (results) {
          resolve(results.map(data => ({ id: data.id, name: data.name, is_hidden: data.is_hidden == 1 ? true : false, description: data.description })));
        } else {
          reject(constructError(400, "Could not get pokemon abilities"));
        }
      }).catch(err => {
        reject(constructError(500, "Could not get pokemon ability data"));
      });
  });
}

module.exports = {
  getAllPokemon: getAllPokemon,
  getPokemonByName: getPokemonByName,
  getPokemonById: getPokemonById,
  getPokemonByType: getPokemonByType,
  getPokemonMoves: getPokemonMoves,
  getPokemonAbilities: getPokemonAbilities
};