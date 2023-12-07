const db = require('../DBConnection');
const { Ability } = require('../models/PokeDataModels');

function getAllAbilities() {
  return db.query('SELECT * FROM ability').then(({ results }) => {
    return results.map(data => new Ability(data));
  });
}

function getAbilityByName(name) {
  const q = name.replaceAll(' ', '').toLowerCase();
  return db.query("SELECT * FROM ability WHERE LOWER(REPLACE(name,' ','')) = ?", [q]).then(({ results }) => {
    if (results[0]) {
      return new Ability(results[0]);
    } else {
      return null;
    }
  }).catch(err => {
    throw new Error('Query could not execute');
  });
}

function getAbilityById(id) {
  return db.query("SELECT * FROM ability WHERE id = ?", [id]).then(({ results }) => {
    if (results[0]) {
      return new Ability(results[0]);
    } else {
      return null;
    }
  }).catch(err => {
    throw new Error('Query could not execute');
  });
}

module.exports = {
  getAllAbilities: getAllAbilities,
  getAbilityByName: getAbilityByName,
  getAbilityById: getAbilityById
};