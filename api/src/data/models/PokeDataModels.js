class Ability {
  id = null;
  name = null;
  description = null;

  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
  }
}

class Item {
  id = null;
  name = null;
  description = null;

  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
  }
}

class Move {
  id = null;
  name = null;
  type = null;
  category = null;
  power = null;
  accuracy = null;
  pp = null;
  description = null;

  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.category = data.category;
    this.power = data.power == 0 ? '---' : data.power == 1 ? '???' : data.power;
    this.accuracy = data.accuracy < 1 ? '---' : data.accuracy;
    this.pp = data.pp;
    this.description = data.description;
  }
}

module.exports = {
  Ability: Ability,
  Item: Item,
  Move: Move
};