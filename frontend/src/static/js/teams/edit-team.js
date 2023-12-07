import { typeList } from '../types/types.js';
import http from '../utils/HTTPClient.js';
import * as utils from '../utils/PokemonUtils.js';
import { createToggleSmall, small } from '../utils/responsive.js';

const SMALL_SIZE = 350;

const spriteClassList = ['mb-3', 'pokesprite', 'pokemon', 'name-sprite', 'd-none'];

const query = window.location.search;
let parameters = new URLSearchParams(query);
let teamId = parameters.get('id');
let getRequest = '/api/teams/id/' + teamId;

document.addEventListener('DOMContentLoaded', (event) => {
  http.get(getRequest).then(team => {
    console.log(team);
    document.getElementById('team-name').value = team.name;
    for (let i = 0; i < team.pokemon.length; ++i) {
      if (team.pokemon[i] && team.pokemon[i].name != "" || team.pokemon[i].name != null) {
        let slotId = 'teamslot-' + i;
        document.getElementById(slotId).value = team.pokemon[i].name;
        let sprite = document.getElementById(`sprite-${i}`);
        let img = document.getElementsByClassName(`mystery-${i}`);
        img[0].classList.add('d-none');
        const newname = utils.getSpriteName(team.pokemon[i].name, team.pokemon[i].ability, team.pokemon[i].item);
        sprite.classList.remove('d-none');
        sprite.parentElement.setAttribute('href', `pokemon/info/${team.pokemon[i].name.toLowerCase().replaceAll(' ', '')}`);
        sprite.classList.add(newname);
        if (localStorage.getItem('shiny') === 'true') {
          sprite.classList.add('shiny');
        }
        let abilityId = 'abilityslot-' + i;
        document.getElementById(abilityId).value = team.pokemon[i].ability;
        if (team.pokemon[i].item && team.pokemon[i].item != "") {
          let itemId = 'itemslot-' + i;
          document.getElementById(itemId).value = team.pokemon[i].item;
        }
        if (team.pokemon[i].moves && team.pokemon[i].moves.length > 0) {
          for (let b = 0; b < team.pokemon[i].moves.length; b++) {
            let moveId = 'moveslot-' + i + '-' + b;
            document.getElementById(moveId).value = team.pokemon[i].moves[b];
          }
        }
        const types = team.pokemon[i].type2 ? [team.pokemon[i].type1, team.pokemon[i].type2] : [team.pokemon[i].type1];
        updatePokemonEntry(i, false, team.pokemon[i].name, types);
      }

    }

  }).catch(err => {
    console.log("something went wrong.")
  });
});
/** Gets Pokemon, move, ability, and item data and loads them into respective data lists */
function loadData() {
  return new Promise(async (resolve, reject) => {
    http.get('/api/moves').then(moves => {
      let list = document.getElementById('all-moves-list');
      moves.forEach(m => {
        let option = document.createElement('option');
        option.value = m.name;
        list.appendChild(option);
      });
    }).catch(err => {
      //first API request on the page
      if (err.status = 401) {
        reject(err);
      }
      console.error('Could not load move data');
    });
    http.get('/api/abilities').then(abilities => {
      let list = document.getElementById('all-abils-list');
      abilities.forEach(a => {
        let option = document.createElement('option');
        option.value = a.name;
        list.appendChild(option);
      });
    }).catch(err => {
      console.error('Could not load ability data');
    });
    let pokemon = await http.get('/api/pokemon').catch(err => {
      console.error("Could not load Pokemon data");
      console.error(`Error message: ${err.message}`);
      reject(err);
    });
    if (!pokemon) {
      reject('Pokemon data not received');
    }
    let pokelist = document.getElementById('pokelist');
    pokemon.forEach(p => {
      let option = document.createElement('option');
      option.value = p.name
      pokelist.appendChild(option);
    });
    //append more options for different variations of names
    Object.keys(utils.nameVariants).forEach(k => {
      let option = document.createElement('option');
      option.value = k;
      pokelist.appendChild(option);
    });
    http.get('/api/items').then(items => {
      let list = document.getElementById('itemlist');
      items.forEach(i => {
        let option = document.createElement('option');
        option.value = i.name;
        list.appendChild(option);
      });
    }).catch(err => {
      console.error('Could not load item data');
    });
    resolve(pokemon);
  });
}

/** 
 * For when user is done typing in the name of a Pokemon to put into their team.
 * If name is valid it will put insert the pokemon sprite and update data lists to have move/ability values for that pokemon.
 * Otherwise displays mystery image and updates data lists to use all move/ability values
 * */
function updatePokemonEntry(idx, offenseOnly, name = null, types = null) {
  let sprite = document.getElementById(`sprite-${idx}`);
  let btn = document.getElementById(`btn-${idx}`);
  let imgs = Array.from(document.getElementsByClassName(`mystery-${idx}`));
  let headRows = Array.from(document.getElementsByClassName('head-row'));
  //get the sprites in offense/defense tables - DOM moment
  let sprites = headRows.map(e => e.children.item(idx + 1).children[1].firstElementChild);
  sprites.push(sprite);
  sprite.classList.forEach(c => {
    if (!spriteClassList.includes(c)) {
      sprites.forEach(s => s.classList.remove(c)); //remove the class of the old pokemon sprite
    }
  });
  if (!name) {
    sprites.forEach(s => { s.classList.add('d-none'); s.parentElement.setAttribute('href', '#'); });
    imgs.forEach(i => i.classList.remove('d-none'));
    btn.innerHTML = `Team Slot ${idx + 1}:`;
    updateTeamEntryData(idx, offenseOnly);
  } else {
    btn.innerHTML = `Team Slot ${idx + 1}: ${name}`;
    const ability = document.getElementById(`abilityslot-${idx}`).value.toLowerCase().replaceAll(' ', '');
    const item = document.getElementById(`itemslot-${idx}`).value.toLowerCase().replaceAll(' ', '');
    const newname = utils.getSpriteName(name, ability, item);
    imgs.forEach(i => i.classList.add('d-none'));
    sprites.forEach(s => {
      s.classList.remove('d-none');
      s.parentElement.setAttribute('href', `pokemon/info/${name.toLowerCase().replaceAll(' ', '')}`);
      s.classList.add(newname);
      if (localStorage.getItem('shiny') === 'true') {
        s.classList.add('shiny');
      }
    });
    updateTeamEntryData(idx, offenseOnly, name.toLowerCase().replaceAll(' ', ''), types);
  }
}

/**
 * Update datalist for moves and abilities given index in team of pokemon and the name. 
 * Null/no name means load all moves/abilities
 * idx not in range of 0-5 (inclusive) = perform action for all indexes
 */
function updateTeamEntryData(idx, offenseOnly, name = null, types = null) {
  if (idx < 0 || idx > 5) {
    for (let i = 0; i < 6; i++) {
      updateTeamEntryData(i, name);
    }
  } else {
    let moveList = document.getElementById(`movelist-${idx}`);
    let abilityList = document.getElementById(`abilitylist-${idx}`);
    let abilInput = document.getElementById(`abilityslot-${idx}`);
    let moveInputs = document.querySelectorAll(`input[id^='moveslot-${idx}']`);
    //reset totals for offense/defense stats in case new pokemon name is null and pokemom was only removed
    typeList.forEach((type) => {
      resetTypes(type, idx, offenseOnly);
    });
    if (!name) {
      abilInput.setAttribute('list', 'all-abils-list');
      moveInputs.forEach(mi => {
        mi.setAttribute('list', 'all-moves-list');
      });
      if (idx != 0) {
        abilInput.required = false;
        moveInputs.item(0).required = false;
      }
    } else {
      moveList.replaceChildren();
      abilityList.replaceChildren();
      //moves
      http.get(`/api/pokemon/${name}/moves`).then(moves => {
        moves.forEach(m => {
          let option = document.createElement('option');
          option.value = m.name;
          moveList.appendChild(option);
        });
      }).catch(err => {
        console.error(`Error loading move data for ${name}`);
      });
      moveInputs.forEach(mi => {
        mi.setAttribute('list', `movelist-${idx}`);
      });
      //abilities
      http.get(`/api/pokemon/${name}/abilities`).then(abilities => {
        abilities.forEach(a => {
          let option = document.createElement('option');
          option.value = a.name;
          abilityList.appendChild(option);
        });
      }).catch(err => {
        console.error(`Error loading ability data for ${name}`);
      });
      abilInput.setAttribute('list', `abilitylist-${idx}`);
      //team detailed information
      if (!offenseOnly) {
        updateDefense(idx, name, types, abilInput.value);
      }
      updateOffense(idx, name, types, abilInput.value);
      if (idx != 0) {
        abilInput.required = true;
        moveInputs.item(0).required = true;
      }
    }
  }
}

/** Updates the offense tab when viewing team details */
function updateOffense(idx, name, types, ability) {
  let item = document.getElementById(`itemslot-${idx}`).value;
  const moveInputs = Array.from(document.querySelectorAll(`input[id^='moveslot-${idx}']`));
  //build query string for api call with move names
  const moveNamesQuery = '?m=' + moveInputs.reduce((pre, curr) => {
    const lowerItem = item.replaceAll(' ', '').toLowerCase();
    if (curr.value && curr.value != '') {
      //do some pre-filtering based on entered ability / move / item
      let val = curr.value.replaceAll(' ', '').toLowerCase();
      if (val == 'judgment') {
        const m = utils.typeToMove[utils.plateToType[lowerItem]];
        val = m ? m : val;
      } else if (val == 'technoblast') {
        const m = utils.typeToMove[utils.driveToType[lowerItem]];
        val = m ? m : val;
      } else if (val == 'multi-attack') {
        const m = utils.typeToMove[typeList.find(t => t === item.replace('memory', ''))];
        val = m ? m : val;
      } else if (val == 'naturalgift') {
        //TODO make a map or something to get the type based on held berry (if applicable)
      } else if (ability == 'normalize') {
        val = utils.typeToMove['normal'];
      }
      pre.push(val);
    }
    return pre;
  }, []).join('&m=');
  //offense data with moves user has filled in
  http.get(`/api/moves/attack/effectiveness${moveNamesQuery}&i=true`).then(offenses => {
    offenses = offenses.data;
    const data = utils.typeOffenseModifiers(offenses, ability, types, item);
    Object.entries(data).forEach(([type, eff]) => {
      const row = document.getElementById(`offense-${type}`);
      const off = row.children.item(idx + 1); //the <td> that displays the SVG (or - if normal effectiveness)
      const totalNoEffect = row.children.item(7);
      const totalNotEffective = row.children.item(8);
      const totalSuperEffective = row.children.item(9);
      let notEffectiveCount = parseInt(totalNotEffective.innerHTML);
      let superEffectiveCount = parseInt(totalSuperEffective.innerHTML);
      if (eff == 0) {
        const svg = document.createElement('img');
        svg.src = 'images/svg/exclaim.svg';
        svg.setAttribute('width', '30em');
        off.innerHTML = '';
        off.appendChild(svg);
        totalNoEffect.classList.add('no-effect');
        totalNoEffect.innerHTML = parseInt(totalNoEffect.innerHTML) + 1;
      } else if (eff < 1) {
        const svg = document.createElement('img');
        svg.src = 'images/svg/x.svg';
        svg.setAttribute('width', '30em');
        off.innerHTML = '';
        off.appendChild(svg);
        notEffectiveCount++;
        if (notEffectiveCount > 0) {
          totalNotEffective.classList.add('double-effect');
          totalNotEffective.classList.remove('quadruple-effect');
        } else if (notEffectiveCount > 2) {
          totalNotEffective.classList.add('quadruple-effect');
          totalNotEffective.classList.remove('double-effect');
        } else {
          totalNotEffective.classList.remove('double-effect', 'quadruple-effect');
        }
        totalNotEffective.innerHTML = notEffectiveCount;
      } else if (eff > 1) {
        const svg = document.createElement('img');
        svg.src = 'images/svg/check.svg';
        svg.setAttribute('width', '30em');
        off.innerHTML = '';
        off.appendChild(svg);
        superEffectiveCount++;
        if (superEffectiveCount > 0) {
          totalSuperEffective.classList.add('half-effect');
          totalSuperEffective.classList.remove('quarter-effect');
        } else if (superEffectiveCount > 2) {
          totalSuperEffective.classList.add('quarter-effect');
          totalSuperEffective.classList.remove('half-effect');
        } else {
          totalSuperEffective.classList.remove('half-effect', 'quarter-effect');
        }
        totalSuperEffective.innerHTML = superEffectiveCount;
      }
    });
  }).catch(err => {
    console.log(err);
    console.error(`Error loading type move offense data for ${name}`);
  });
}

/** Updates the defense tab when viewing team details */
function updateDefense(idx, name, types, ability) {
  let item = document.getElementById(`itemslot-${idx}`).value;
  //type defenses
  http.get(`/api/pokemon/${name}/defenses`).then((defenses) => {
    const data = utils.typeDefenseModifiers(defenses, ability, types, item); //account for abilities and items
    Object.entries(data).forEach(([type, eff]) => {
      const row = document.getElementById(`defense-${type}`);
      const def = row.children.item(idx + 1); //the <td> that displays the value
      const totalWeak = row.children.item(7);
      const totalResist = row.children.item(8);
      let totalWeakNum = parseInt(totalWeak.innerHTML);
      let totalResistNum = parseInt(totalResist.innerHTML);
      //add new effect
      const effect = utils.effectMap(eff);
      if (effect != 'normal-effect') {
        def.classList.add(effect);
        if (eff > 1) {
          totalWeak.innerHTML = totalWeakNum + 1;
          totalWeakNum++;
        } else {
          totalResist.innerHTML = totalResistNum + 1;
          totalResistNum++;
        }
      }
      if (totalResistNum > 0) {
        totalResist.className = 'half-effect';
      } else if (totalResistNum > 2) {
        totalResist.className = 'quarter-effect';
      } else {
        totalResist.className = '';
      }
      if (totalWeakNum > 0) {
        totalWeak.classList.add('double-effect');
        totalWeak.classList.remove('quadruple-effect');
      } else if (totalWeakNum > 2) {
        totalWeak.classList.add('quadruple-effect');
        totalWeak.classList.remove('double-effect')
      } else {
        totalResist.classList.remove('double-effect', 'quadruple-effect');
      }
      def.innerHTML = eff;
    });
  }).catch(err => {
    // console.log(err);
    console.error(`Error loading type defense data for ${name}`);
  });
}

/** Resets the offense/defense chart entry for the speified index and type */
function resetTypes(type, idx, offenseOnly) {
  if (!offenseOnly) {
    //Defense
    const row = document.getElementById(`defense-${type}`);
    const def = row.children.item(idx + 1); //the <td> that displays the value
    const totalWeak = row.children.item(7);
    const totalResist = row.children.item(8);
    let totalWeakNum = parseInt(totalWeak.innerHTML);
    let totalResistNum = parseInt(totalResist.innerHTML);
    //undo previous pokemon's effect if one was there
    const oldNum = isNaN(def.innerHTML) ? null : parseFloat(def.innerHTML);
    if (oldNum !== null && oldNum < 1) {
      totalResist.innerHTML = totalResistNum - 1;
      totalResistNum--;
    } else if (oldNum !== null && oldNum > 1) {
      totalWeak.innerHTML = totalWeakNum - 1;
      totalWeakNum--;
    }
    def.innerHTML = '-';
    def.classList.remove(...def.classList);
    if (totalResistNum > 0) {
      totalResist.className = 'half-effect';
    } else if (totalResistNum > 2) {
      totalResist.className = 'quarter-effect';
    } else {
      totalResist.className = '';
    }
    if (totalWeakNum > 0) {
      totalWeak.classList.add('double-effect');
      totalWeak.classList.remove('quadruple-effect');
    } else if (totalWeakNum > 2) {
      totalWeak.classList.add('quadruple-effect');
      totalWeak.classList.remove('double-effect')
    } else {
      totalWeak.classList.remove('double-effect', 'quadruple-effect');
    }
  }
  //Offense
  const row2 = document.getElementById(`offense-${type}`);
  const off = row2.children.item(idx + 1); //the <td> that displays the SVG (or - if normal effectiveness)
  //check for svg presence
  if (off.children.length > 0) {
    const svgSrc = off.children.item(0).src;
    const totalNoEffect = row2.children.item(7);
    const totalNotEffective = row2.children.item(8);
    const totalSuperEffective = row2.children.item(9);
    let notEffectiveCount = parseInt(totalNotEffective.innerHTML);
    let superEffectiveCount = parseInt(totalSuperEffective.innerHTML);
    let noEffectCount = parseInt(totalNoEffect.innerHTML);
    if (svgSrc.includes('check')) {
      if (superEffectiveCount == 3) { //if it's 3 before removing then it will be downgraded
        totalSuperEffective.classList.add('half-effect');
        totalSuperEffective.classList.remove('quarter-effect');
      } else if (superEffectiveCount == 1) { //if it's 1 before removing then it will be removed
        totalSuperEffective.classList.remove('quarter-effect');
        totalSuperEffective.classList.remove('half-effect');
      }
      totalSuperEffective.innerHTML = superEffectiveCount - 1;
    } else if (svgSrc.includes('exclaim')) {
      noEffectCount--;
      if (noEffectCount == 0) {
        totalNoEffect.classList.remove('no-effect');
      }
      totalNoEffect.innerHTML = noEffectCount;
    } else if (svgSrc.includes('x')) {
      if (notEffectiveCount == 3) { //if it's 3 before removing then it will be downgraded
        totalNotEffective.classList.add('double-effect');
        totalNotEffective.classList.remove('quadruple-effect');
      } else if (notEffectiveCount == 1) { //if it's 1 before removing then it will be removed
        totalNotEffective.classList.remove('quadruple-effect');
        totalNotEffective.classList.remove('double-effect');
      }
      totalNotEffective.innerHTML = notEffectiveCount - 1;
    }
  }
  off.innerHTML = '-';
}

function textEntryEvent(pokemon, n, i, offenseOnly = false) {
  let val = n.value.trim();
  //check if typed in name is empty
  if (!val || val == '') {
    return updatePokemonEntry(i, offenseOnly);
  }
  //find name in name list or type variant list
  let find = pokemon.find(({ name }) => name.toLowerCase() === val.toLowerCase());
  if (!find) {
    find = Object.keys(utils.nameVariants).find(e => e.toLowerCase() === val.toLowerCase());
    if (!find) {
      return updatePokemonEntry(i, offenseOnly);
    }
    find = pokemon.find(({ name }) => name.toLowerCase() === utils.nameVariants[find].toLowerCase());
  }
  n.value = find.name;
  //using name update button text and show sprite
  const types = find.type2 ? [find.type1, find.type2] : [find.type1];
  updatePokemonEntry(i, offenseOnly, find.name, types);
}

function showError(message, serverError = false) {
  let error = document.getElementById('upload-err');
  error.innerHTML = serverError ? `Server Error: ${message}` : message;
  error.classList.remove('d-none');
}

function showSuccess() {
  document.getElementById('upload-err').classList.add('d-none');
  //show modal TODO
  document.getElementById('upload-succ').classList.remove('d-none');
}

function setUpSubmit() {
  document.getElementById('upload-btn').addEventListener('click', (e) => {
    const teamData = [];
    const teamName = document.getElementById('team-name').value.trim();
    if (teamName.length < 2) {
      return showError("Error: Team name must be at least 2 characters");
    }
    for (let i = 0; i < 6; i++) {
      const pokeName = document.getElementById(`teamslot-${i}`).value.trim();
      if (pokeName == '') {
        continue;
      }
      const pokeItem = document.getElementById(`itemslot-${i}`).value.trim();
      const itemName = pokeItem && pokeItem != '' ? pokeItem : null;
      const abilName = document.getElementById(`abilityslot-${i}`).value.trim();
      if (abilName == '') {
        return showError(`Error in Team Slot ${i + 1}: All Pokemon must have an ability`);
      }
      let moveNames = [];
      document.querySelectorAll(`input[id^='moveslot-${i}']`).forEach((m) => {
        if (m.value && m.value.trim() != '') {
          moveNames.push(m.value.trim());
        }
      });
      if (moveNames.length == 0) {
        return showError(`Error in Team Slot ${i + 1}: All Pokemon must have at least one move`);
      }
      teamData.push({
        name: pokeName,
        moves: moveNames,
        item: itemName,
        ability: abilName
      });
    }
    if (teamData.length == 0) {
      return showError("Error: Team must have at least one Pokemon");
    }
    const data = {
      name: teamName,
      teamId: teamId,
      public: document.getElementById('public-check').checked,
      pokemon: teamData
    };


    let putRequest = '/api/teams/id/' + teamId;
    http.put(putRequest, data).then(response => {
      showSuccess();
      // console.log('new id', response.id);
    }).catch(error => {
      showError(error, error.status >= 500);
    });
  });
}

function pokeInfoNav() {
  const defense = document.getElementById('defense');
  const offense = document.getElementById('offense');
  const defenseNav = document.getElementById('defense-nav');
  const offenseNav = document.getElementById('offense-nav');
  const hide = document.getElementById('hide-nav');
  //add listeners to switch between offense/defense or hide them
  defenseNav.addEventListener('click', e => {
    defense.classList.remove('d-none');
    offense.classList.add('d-none');
    hide.firstElementChild.classList.remove('active');
    defenseNav.firstElementChild.classList.add('active');
    offenseNav.firstElementChild.classList.remove('active');
  });
  offenseNav.addEventListener('click', e => {
    defense.classList.add('d-none');
    hide.firstElementChild.classList.remove('active');
    offense.classList.remove('d-none');
    offenseNav.firstElementChild.classList.add('active');
    defenseNav.firstElementChild.classList.remove('active');
  });
  hide.addEventListener('click', e => {
    hide.firstElementChild.classList.add('active');
    defenseNav.firstElementChild.classList.remove('active');
    offenseNav.firstElementChild.classList.remove('active');
    offense.classList.add('d-none');
    defense.classList.add('d-none');
  });
}

document.addEventListener('DOMContentLoaded', (event) => {
  //toggles for smaller screens
  if (window.innerWidth < SMALL_SIZE) {
    createToggleSmall();
  }
  window.addEventListener('resize', e => {
    if (window.innerWidth < SMALL_SIZE && !small) {
      createToggleSmall();
    } else if (window.innerWidth > SMALL_SIZE && small) {
      createToggleSmall();
    }
  });
  loadData().then(pokemon => {
    const nameInputs = Array.from(document.getElementsByClassName('poke-name-input'));
    const abilityInputs = Array.from(document.querySelectorAll(`input[id^='abilityslot']`));
    const itemInputs = Array.from(document.querySelectorAll(`input[id^='itemslot']`));
    updateTeamEntryData(-1, false); //initialize lists to use all values at start
    if (pokemon) {
      for (let i = 0; i < nameInputs.length; i++) {
        const moveInputs = Array.from(document.querySelectorAll(`input[id^='moveslot-${i}']`));
        const n = nameInputs[i];
        n.addEventListener('change', () => textEntryEvent(pokemon, n, i));
        moveInputs.forEach(m => m.addEventListener('change', () => textEntryEvent(pokemon, n, i, true)));
        abilityInputs[i].addEventListener('change', () => textEntryEvent(pokemon, n, i));
        itemInputs[i].addEventListener('change', () => textEntryEvent(pokemon, n, i));
      }
    }
    setUpSubmit(); //set up the "form" submission for creating a team
    pokeInfoNav(); //set up the nav showing type defenses / move offenses
  }).catch(err => {
    if (err.status = 401) {
      window.location.href = '/';
    }
    console.info('Could not load Pokemon data, some features may be unavailable');
    console.log(err);
  });
});
