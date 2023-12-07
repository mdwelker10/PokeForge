import { getDefensesJson, typeList } from "../types/types.js";

/** Variants in Pokemon names mapped to the actual name stored in the database */
export const nameVariants = {
  'Type Null': 'Type: Null',
  'Type-Null': 'Type: Null',
  'Nidoran M': 'Nidoran♂',
  'Nidoran F': 'Nidoran♀',
  'Mr Mime': 'Mr. Mime',
  'Mr Rime': 'Mr. Rime',
  'Flabébé': 'Flabebe'
}

//TODO add megas and forms into database (only if time allows)
/** Gets sprite name corresponding to Pokemon name */
export const getSpriteName = (name, ability, item) => {
  let n = name.toLowerCase();
  n = n.replaceAll(' ', '-').replaceAll(':', '').replaceAll("'", '');
  n = n.replaceAll('♂', '-m').replaceAll('♀', '-f').replaceAll('.', '');
  //random chances for being silly
  if (n == 'pikachu') {
    let random = Math.floor(Math.random() * 5) + 1;
    if (random == 3) {
      n += '-partner-cap';
    }
  } else if (n == 'unown') {
    //TODO maybe later
  } else if (n == 'gastrodon' || n == 'shellos') {
    let random = Math.floor(Math.random() * 2) + 1;
    if (random == 1) {
      n += '-west';
    } else {
      n += '-east';
    }
  } else if (n == 'basculin') {
    let random = Math.floor(Math.random() * 2) + 1;
    if (random == 1) {
      n += '-red-striped';
    } else {
      n += '-blue-striped';
    }
  } else if (n == 'greninja') {
    let random = Math.floor(Math.random() * 20) + 1;
    if (random == 3) {
      n += '-ash';
    }
  }
  //item and ability sprite changes
  if (n == 'arceus' && ability == 'multitype') {
    const type = plateToType[item];
    if (type) {
      n += `-${type}`;
    }
  } else if (n == 'giratina' && item == 'griseousorb') {
    n += '-origin';
  } else if (n == 'genesect' && driveToType[item]) {
    n += `-${item.substring(0, item.indexOf('drive'))}`;
  } else if (n == 'silvally' && ability == 'rkssystem') {
    const type = typeList.find(t => t === item.replace('memory', ''));
    if (type) {
      n += `-${type}`;
    }
  }
  return n;
}

/** 
 * Map of type effectiveness to the corresponding class. 
 * Not an actual map due to ability modifiers
 * */
export const effectMap = (num) => {
  if (num == 0) {
    return 'no-effect';
  } else if (num == 1) {
    return 'normal-effect';
  } else if (num > 2) {
    return 'quadruple-effect';
  } else if (num > 1) {
    return 'double-effect';
  }
  let inverse = 1 / num;
  if (inverse > 2) {
    return 'quarter-effect'
  } else {
    return 'half-effect';
  }
};

/** drives to the type they change genesect's techno blast to. No spaces all lowercase for consistency */
export const driveToType = {
  shockdrive: 'electric',
  burndrive: 'fire',
  chilldrive: 'ice',
  dousedrive: 'water'
}

/** plates to the type they change the Arceus to. No spaces all lowercase for consistency */
export const plateToType = {
  dracoplate: 'dragon',
  dreadplate: 'dark',
  earthplate: 'ground',
  fistplate: 'fighting',
  flameplate: 'fire',
  icicleplate: 'ice',
  insectplate: 'bug',
  ironplate: 'steel',
  meadowplate: 'grass',
  mindplate: 'psychic',
  pixieplate: 'fairy',
  skyplate: 'flying',
  splashplate: 'water',
  spookyplate: 'ghost',
  stoneplate: 'rock',
  toxicplate: 'poison',
  zapplate: 'electric'
}

/** A map of types to a move that is that type. Used for value replacement with moves like Judgement and Techno Blast*/
export const typeToMove = {
  normal: 'hyperbeam',
  fire: 'fireblast',
  water: 'surf',
  electric: 'thunder',
  grass: 'leafstorm',
  ice: 'blizzard',
  fighting: 'brickbreak',
  poison: 'poisonfang',
  ground: 'earthquake',
  flying: 'fly',
  psychic: 'psychic',
  bug: 'attackorder',
  rock: 'rockslide',
  ghost: 'shadowball',
  dragon: 'dragonclaw',
  dark: 'darkpulse',
  steel: 'irontail',
  fairy: 'moonblast'
}

/** Returns updated defenses JSON based on the given ability and types of the pokemon (needed for Delta Stream) and item (multitype, etc.) */
export const typeDefenseModifiers = (defenses, ability, types, item = '') => {
  let a = ability.toLowerCase().replaceAll(' ', '');
  let i = item.toLowerCase().replaceAll(' ', '');
  if (a == 'deltastream') {
    if (!types.includes('flying')) {
      return defenses;
    }
    defenses.rock /= 2;
    defenses.electric /= 2;
    defenses.ice /= 2;
  } else if (a == 'desolateland' || a == 'stormdrain' || a == 'waterabsorb') {
    defenses.water = 0;
  } else if (a == 'dryskin') {
    defenses.water = 0;
    defenses.fire *= 1.25;
  } else if (a == 'flashfire' || a == 'primordialsea') {
    defenses.fire = 0;
  } else if (a == 'heatproof') {
    defenses.fire /= 2;
  } else if (a == 'levitate' && i != 'ironball') {
    defenses.ground = 0;
  } else if (a == 'lightningrod' || a == 'motordrive' || a == 'voltabsorb') {
    defenses.electric = 0;
  } else if (a == 'sapsipper') {
    defenses.grass = 0;
  } else if (a == 'thickfat') {
    defenses.ice /= 2;
    defenses.fire /= 2;
  } else if (a == 'wonderguard') {
    for (let p in defenses) {
      if (defenses[p] <= 1) {
        defenses[p] = 0;
      }
    }
  } else if (a == 'multitype') {
    const type = plateToType[i];
    if (type) {
      return getDefensesJson(type);
    }
  } else if (a == 'rkssystem') {
    const type = typeList.find(t => t === i.replace('memory', ''));
    if (type) {
      return getDefensesJson(type);
    }
  }
  if (i == 'ringtarget') {
    //TODO - Probably require implementing an "ignore immunities" flag to the endpoint before this is called
  } else if (i == 'airballoon') {
    defenses.ground = 0;
  } else if (i == 'ironball' && defenses.ground == 0) {
    defenses.ground = 1;
  }
  return defenses;
}

//Theres a few things that don't work with this that probably require backend changes for a later date
export const typeOffenseModifiers = (offenseData, ability, types, item = '') => {
  let a = ability.toLowerCase().replaceAll(' ', '');
  let i = item.toLowerCase().replaceAll(' ', '');
  if (a == 'deltastream') {
    if (offenseData.flying == 2) {
      offenseData.flying = 1;
    }
  } else if (a == 'scrappy') {
    //TODO: Not Reliable - If initial value is 0.5 via dark move and normal move, should change to 1 but will stay at 0.5
    //willing to go along with this for now since having only dark/normal or dark/fighting moves on a scrappy pokemon are the only ways this is incorrect
    if (offenseData.ghost == 0) {
      offenseData.ghost = 1;
    }
  } else if (a == 'tintedlens') {
    for (let o in offenseData) {
      if (offenseData[o] == 0.5) {
        offenseData[o] = 1;
      }
    }
  }
  //TODO: Below abilities require either recalculation or coding optional ability passing to API endpoint
  //DesolateLand - no water moves, Primordial Sea - no fire moves. 
  //Aerilate: normal => flying, Pixilate: normal => fairy, Refrigerate: normal => ice

  return offenseData;
}