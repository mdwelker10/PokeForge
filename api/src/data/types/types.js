const effectiveness = require('./effectiveness.json');

exports.typeList = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy'
];

//type defenses for 2 (or 1) types
exports.getDefensesJson = (type1, type2 = undefined) => {
  //create starter return object
  let base = this.typeList.reduce((pre, cur) => Object.assign(pre, { [cur]: 1 }), {});
  let ret = Object.assign(base, effectiveness[type1]);
  if (type2) {
    this.typeList.forEach((type) => {
      if (Object.hasOwn(effectiveness[type2], type)) {
        ret[type] *= effectiveness[type2][type];
      }
    });
  }
  return ret;
}

/**
 * returns JSON data for defenses of an opponent type based on the array of moveTypes input into the method
 * 0 means cannot hit that type, 0.5 means not very effective on that type, 1 means normal effectiveness, 2 means super effective
 * Basically, can a pokemon with moves of types in moveTypes hit a normal type? if so what effectiveness? This is done for all types.
 * EX: passing in getMoveEffectiveness(normal, fighting) = {
  normal: 2,
  fire: 1,
  water: 1,
  electric: 1,
  grass: 1,
  ice: 2,
  fighting: 1,
  poison: 1,
  ground: 1,
  flying: 1,
  psychic: 1,
  bug: 1,
  rock: 2,
  ghost: 0,
  dragon: 1,
  dark: 2,
  steel: 2,
  fairy: 1
}
This states that a Pokemon with a normal move and fighting move can hit normal types for super effective, cant hit ghost types, etc.
NOTE: returns false if nothing passed or a string that is not a type is passed*/
exports.getMoveEffectiveness = (moveTypes) => {
  if (moveTypes.length < 1) {
    return false;
  }
  for (const type of moveTypes) {
    if (!this.typeList.includes(type)) {
      return false;
    }
  }
  //create starter return object
  let ret = this.typeList.reduce((pre, cur) => Object.assign(pre, { [cur]: -1 }), {});
  this.typeList.forEach((type) => {
    for (const mt of moveTypes) {
      if (!Object.hasOwn(effectiveness[type], mt) && ret[type] < 1) {
        ret[type] = 1;
      }
      else if (effectiveness[type][mt] > ret[type]) {
        ret[type] = effectiveness[type][mt];
      }
    }
  });
  return ret;
}