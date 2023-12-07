const db = require('../DBConnection');
const { Item } = require('../models/PokeDataModels');

function getAllItems() {
  return db.query('SELECT * FROM item').then(({ results }) => {
    return results.map(data => new Item(data));
  });
}

function getItemByName(name) {
  const q = name.replaceAll(' ', '').toLowerCase();
  return db.query("SELECT * FROM item WHERE LOWER(REPLACE(name,' ','')) = ?", [q]).then(({ results }) => {
    if (results[0]) {
      return new Item(results[0]);
    } else {
      return null;
    }
  }).catch(err => {
    throw new Error('Query could not execute');
  });
}

function getItemById(id) {
  return db.query("SELECT * FROM item WHERE id = ?", [id]).then(({ results }) => {
    if (results[0]) {
      return new Item(results[0]);
    } else {
      return null;
    }
  }).catch(err => {
    throw new Error('Query could not execute');
  });
}


module.exports = {
  getAllItems: getAllItems,
  getItemByName: getItemByName,
  getItemById: getItemById
};