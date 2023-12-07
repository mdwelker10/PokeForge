const effectiveness = {
  "normal": {
    "fighting": 2,
    "ghost": 0
  },
  "fire": {
    "fire": 0.5,
    "water": 2,
    "grass": 0.5,
    "ice": 0.5,
    "ground": 2,
    "bug": 0.5,
    "rock": 2,
    "steel": 0.5,
    "fairy": 0.5
  },
  "water": {
    "fire": 0.5,
    "water": 0.5,
    "electric": 2,
    "grass": 2,
    "ice": 0.5,
    "steel": 0.5
  },
  "electric": {
    "electric": 0.5,
    "ground": 2,
    "flying": 0.5,
    "steel": 0.5
  },
  "grass": {
    "fire": 2,
    "water": 0.5,
    "electric": 0.5,
    "grass": 0.5,
    "ice": 2,
    "poison": 2,
    "ground": 0.5,
    "flying": 2,
    "bug": 2
  },
  "ice": {
    "fire": 2,
    "ice": 0.5,
    "fighting": 2,
    "rock": 2,
    "steel": 2
  },
  "fighting": {
    "flying": 2,
    "psychic": 2,
    "bug": 0.5,
    "rock": 0.5,
    "dark": 0.5,
    "fairy": 2
  },
  "poison": {
    "grass": 0.5,
    "fighting": 0.5,
    "poison": 0.5,
    "ground": 2,
    "psychic": 2,
    "bug": 0.5,
    "fairy": 0.5
  },
  "ground": {
    "water": 2,
    "electric": 0,
    "grass": 2,
    "ice": 2,
    "poison": 0.5,
    "rock": 0.5
  },
  "flying": {
    "electric": 2,
    "grass": 0.5,
    "ice": 2,
    "fighting": 0.5,
    "ground": 0,
    "bug": 0.5,
    "rock": 2
  },
  "psychic": {
    "fighting": 0.5,
    "psychic": 0.5,
    "bug": 2,
    "ghost": 2,
    "dark": 2
  },
  "bug": {
    "fire": 2,
    "grass": 0.5,
    "fighting": 0.5,
    "ground": 0.5,
    "flying": 2,
    "rock": 2
  },
  "rock": {
    "normal": 0.5,
    "fire": 0.5,
    "water": 2,
    "grass": 2,
    "fighting": 2,
    "poison": 0.5,
    "ground": 2,
    "flying": 0.5,
    "steel": 2
  },
  "ghost": {
    "normal": 0,
    "fighting": 0,
    "poison": 0.5,
    "bug": 0.5,
    "ghost": 2,
    "dark": 2
  },
  "dragon": {
    "fire": 0.5,
    "water": 0.5,
    "electric": 0.5,
    "grass": 0.5,
    "ice": 2,
    "dragon": 2,
    "fairy": 2
  },
  "dark": {
    "fighting": 2,
    "psychic": 0,
    "bug": 2,
    "ghost": 0.5,
    "dark": 0.5,
    "fairy": 2
  },
  "steel": {
    "normal": 0.5,
    "fire": 2,
    "grass": 0.5,
    "ice": 0.5,
    "fighting": 2,
    "poison": 0,
    "ground": 2,
    "flying": 0.5,
    "psychic": 0.5,
    "bug": 0.5,
    "rock": 0.5,
    "dragon": 0.5,
    "steel": 0.5,
    "fairy": 0.5
  },
  "fairy": {
    "fighting": 0.5,
    "poison": 2,
    "bug": 0.5,
    "dragon": 0,
    "dark": 0.5,
    "steel": 2
  }
}


export const typeList = [
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
export const getDefensesJson = (type1, type2 = undefined) => {
  //create starter return object
  let base = typeList.reduce((pre, cur) => Object.assign(pre, { [cur]: 1 }), {});
  let ret = Object.assign(base, effectiveness[type1]);
  if (type2) {
    typeList.forEach((type) => {
      if (Object.hasOwn(effectiveness[type2], type) && ret[type] < 1) {
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
export const getMoveEffectiveness = (moveTypes) => {
  if (moveTypes.length < 1) {
    return false;
  }
  for (const type of moveTypes) {
    if (!typeList.includes(type)) {
      return false;
    }
  }
  //create starter return object
  let ret = typeList.reduce((pre, cur) => Object.assign(pre, { [cur]: -1 }), {});
  typeList.forEach((type) => {
    for (const mt of moveTypes) {
      if (!Object.hasOwn(effectiveness[type], mt)) {
        ret[type] = 1;
      }
      else if (effectiveness[type][mt] > ret[type]) {
        ret[type] = effectiveness[type][mt];
      }
    }
  });
  return ret;
}