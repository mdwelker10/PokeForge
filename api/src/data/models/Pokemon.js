const types = require('../types/types');

class Pokemon {
  id = null;
  name = null;
  type1 = null;
  type2 = null;
  hp = null;
  attack = null;
  defense = null;
  sp_attack = null;
  sp_defense = null;
  speed = null;

  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.type1 = data.type1;
    this.type2 = data.type2 ? data.type2 : null;
    this.hp = data.hp;
    this.attack = data.attack;
    this.defense = data.defense;
    this.sp_attack = data.sp_attack;
    this.sp_defense = data.sp_defense;
    this.speed = data.speed;
  }

  getTypeDefenses() {
    return types.getDefensesJson(this.type1, this.type2);
  }
}

module.exports = Pokemon;