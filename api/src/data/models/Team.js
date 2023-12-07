const types = require('../types/types');

class Team {
  id = null;
  user_id = null;
  public = null;
  name = null;
  last_modified = null;
  pokemon = null;
  pokemonData = null;

  //pokemon data/moves/moveTypes are Arrays of objects
  constructor(data, pokemonData, pokemonMoves, pokemonMoveTypes) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.public = data.public;
    this.name = data.name;
    this.last_modified = data.last_modified;
    const entryObjs = pokemonData.reduce((acc, curr, idx) => { acc.push(new PokemonEntry(curr, pokemonMoves[idx], pokemonMoveTypes[idx])); return acc; }, []);
    this.pokemonData = entryObjs;
    this.pokemon = entryObjs.map((e) => e.ToJSON());
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      public: this.public,
      name: this.name,
      last_modified: this.last_modified,
      pokemon: this.pokemon
    };
  }

  toDetailedJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      public: this.public,
      name: this.name,
      last_modified: this.last_modified,
      pokemon: this.pokemonData.map(p => p.toDetailedJSON())
    };
  }
}

class PokemonEntry {
  pokemon_id = null;
  name = null;
  type1 = null;
  type2 = null;
  item = null;
  ability = null;
  moves = null;
  moveTypes = null;

  constructor(data, moves, moveTypes) {
    this.pokemon_id = data.pokemon_id;
    this.name = data.name;
    this.item = data.item;
    this.type1 = data.type1;
    this.type2 = data.type2;
    this.ability = data.ability;
    this.moves = moves;
    this.moveTypes = moveTypes;
  }

  getTypeDefenses() {
    return types.getDefensesJson(this.type1, this.type2);
  }

  getMoveEffectiveness() {
    return types.getMoveEffectiveness(this.moveTypes);
  }

  ToJSON() {
    return {
      pokemon_id: this.pokemon_id,
      name: this.name,
      type1: this.type1,
      type2: this.type2,
      ability: this.ability,
      moves: this.moves,
      item: this.item

    };
  }

  toDetailedJSON() {
    return {
      pokemon_id: this.pokemon_id,
      name: this.name,
      type1: this.type1,
      type2: this.type2,
      ability: this.ability,
      moves: this.moves,
      item: this.item,
      defenses: this.getTypeDefenses(),
      moveEffectiveness: this.getMoveEffectiveness()
    };
  }
}

module.exports = Team;