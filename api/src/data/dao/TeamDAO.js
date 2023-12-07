const db = require('../DBConnection');
const Team = require('../models/Team');
const { constructError } = require('../../utils');

/**
 * Gets teams based on a User ID. Only gets public teams unless the requester and user IDs match
 * @param {*} requesterId user ID of the user making the request
 * @param {*} userId user ID to get the teams of
 */
function getUserTeams(requesterId, userId) {
  return new Promise((resolve, reject) => {
    let connection = db.getDatabaseConnection();
    connection.getConnection(async (err, conn) => {
      try {
        //check if requesting user is the same as user ID to get teams of
        let teamResults = null;
        if (requesterId == userId) {
          teamResults = await executeQuery(conn, "SELECT * FROM team WHERE user_id = ?", [userId]);
        } else {
          teamResults = await executeQuery(conn, "SELECT * FROM team WHERE public = TRUE and user_id = ?", [userId]);
        }
        if (teamResults.length === 0) {
          reject(constructError(400, "Could not find a team with given query"));
        }
        //get info for all teams found
        let teamsArr = [];
        for (const r of teamResults) {
          //get pokemon entry info (not moves/items yet)
          let sql = "SELECT pe.id, p.id AS pokemon_id, p.name AS pokemon_name, a.name AS ability_name, pe.item_id AS item_id FROM pokemon_entry AS pe JOIN pokemon AS p ON p.id = pe.pokemon_id ";
          sql += "JOIN ability AS a ON a.id = pe.ability_id WHERE pe.team_id = ?";
          let entryResults = await executeQuery(conn, sql, [r.id]);
          if (entryResults.length === 0) {
            reject(constructError(500, "Error fetching team data - No pokemon entries found"));
          }
          //console.log('ENTRY: ', entryResults, '\nTEAM RESULTS ', teamResults);
          let pokemonDataArr = [];
          let pokemonMovesArr = [];
          let pokemonMoveTypesArr = [];
          for (let e of entryResults) {
            //get item name if item is present
            let itemName = null;
            if (e.item_id) {
              let itemResults = await executeQuery(conn, "SELECT name FROM item WHERE id = ?", [e.item_id]);
              if (!itemResults[0]) {
                reject(constructError(500, `Error fetching team data - Could not get item with id ${e.item_id}`));
              }
              itemName = itemResults[0].name;
            }
            //get move data
            let moveResults = await executeQuery(conn, "SELECT m.name FROM move AS m JOIN known_moves AS km ON km.move_id = m.id WHERE km.entry_id = ?", [e.id]);
            if (moveResults.length < 1 || moveResults.length > 4) {
              reject(constructError(500, "Error fetching team data - Could not get correct move data"));
            }
            const moveNames = moveResults.reduce((acc, curr) => { acc.push(curr.name); return acc; }, []);
            //get pokemon types
            let typeResults = await executeQuery(conn, "SELECT type1, type2 FROM pokemon WHERE id = ?", [e.pokemon_id]);
            if (typeResults.length === 0) {
              reject(constructError(500, `Error fetching team data - Could not get types for ${e.pokemon_name}`));
            }
            //get types of the moves
            let moveTypeSql = "SELECT type FROM move WHERE ";
            for (let i = 0; i < moveNames.length; i++) {
              if (i === moveNames.length - 1)
                moveTypeSql += "name = ?";
              else
                moveTypeSql += "name = ? OR "
            }
            let moveTypeResults = await executeQuery(conn, moveTypeSql, moveNames);
            if (moveTypeResults.length != moveNames.length) {
              reject(constructError(500, `Error fetching team data - Error getting types of moves pokemon "${e.pokemon_name}" knows`));
            }
            pokemonDataArr.push({
              pokemon_id: e.pokemon_id,
              name: e.pokemon_name,
              type1: typeResults[0].type1,
              type2: typeResults[0].type2,
              item: itemName,
              ability: e.ability_name
            });
            pokemonMovesArr.push(moveNames);
            pokemonMoveTypesArr.push(moveResults.reduce((acc, curr) => { acc.push(curr.name); return acc; }, []));
          }
          teamsArr.push(new Team(r, pokemonDataArr, pokemonMovesArr, pokemonMoveTypesArr));
        }
        resolve(teamsArr);
      } catch (err) {
        reject(constructError(500, "Problem getting teams"));
      }
    });
  });
}


/**
 * Gets all public teams
 * @param {*} nameIncludes optional - will filter for teams with a name containing the given string. To not use pass a falsy value
 * @param {*} PokemonIncluded optional - will filter for teams that contain the given pokemon names. To not use pass a falsy value. Invalid pokemon names will be ignored
 */
function getAllTeams(currentUserID, includeCurrentUser = false, nameIncludes = false, pokemonIncluded = false) {
  return new Promise((resolve, reject) => {
    let connection = db.getDatabaseConnection();

    connection.getConnection(async (err, conn) => {
      try {
        //get pokemonIDs if necessary
        let pokemonIDsToSearch = [];
        if (pokemonIncluded && Array.isArray(pokemonIncluded) && pokemonIncluded.length > 0) {
          let pokemonPlaceholders = pokemonIncluded.map(p => "?").join(", ");
          let pokemonLower = pokemonIncluded.map(p => p.replaceAll(' ', '').toLowerCase());
          let pokemonResults = await executeQuery(conn, `SELECT id FROM pokemon WHERE LOWER(REPLACE(name, ' ', '')) IN (${pokemonPlaceholders})`, pokemonLower);
          if (pokemonResults.length > 0) {
            pokemonIDsToSearch = pokemonResults.map(r => r.id);
          }
        }
        //determine team search SQL and execute search
        let teamResults = null;
        if (pokemonIDsToSearch.length > 0) {
          let teamSQL = "SELECT t.* FROM team as t ";
          let idPlaceholders = pokemonIDsToSearch.map(i => '?').join(', ');
          teamSQL += `JOIN pokemon_entry AS pe ON pe.team_id = t.id WHERE pe.pokemon_id IN (${idPlaceholders}) AND t.public = TRUE`;
          if (!includeCurrentUser) {
            teamSQL += ' AND t.user_id != ?';
            pokemonIDsToSearch.push(currentUserID);
          }
          if (nameIncludes && typeof nameIncludes === 'string') {
            pokemonIDsToSearch.push(`%${nameIncludes}%`);
            teamResults = await executeQuery(conn, `${teamSQL} AND t.name LIKE ?`, pokemonIDsToSearch);
          } else {
            teamResults = await executeQuery(conn, teamSQL, pokemonIDsToSearch);
          }
        } else if (nameIncludes && typeof nameIncludes === 'string') {
          let sql = "SELECT * FROM team WHERE public = TRUE AND name LIKE ?";
          if (!includeCurrentUser) {
            sql += " AND user_id != ?";
          }
          teamResults = await executeQuery(conn, sql, [`%${nameIncludes}%`, currentUserID]);
        } else {
          if (!includeCurrentUser) {
            teamResults = await executeQuery(conn, 'SELECT * FROM team WHERE public = TRUE AND user_id != ?', [currentUserID]);
          } else {
            teamResults = await executeQuery(conn, 'SELECT * FROM team WHERE public = TRUE');
          }
        }
        if (teamResults.length === 0) {
          reject(constructError(400, "Could not find a team with given query"));
        }
        //get info for all teams found
        let teamsArr = [];
        for (const r of teamResults) {
          //get pokemon entry info (not moves/items yet)
          let sql = "SELECT pe.id, p.id AS pokemon_id, p.name AS pokemon_name, a.name AS ability_name, pe.item_id AS item_id FROM pokemon_entry AS pe JOIN pokemon AS p ON p.id = pe.pokemon_id ";
          sql += "JOIN ability AS a ON a.id = pe.ability_id WHERE pe.team_id = ?";
          let entryResults = await executeQuery(conn, sql, [r.id]);
          if (entryResults.length === 0) {
            reject(constructError(400, "Error fetching team data - No pokemon entries found"));
          }
          //console.log('ENTRY: ', entryResults, '\nTEAM RESULTS ', teamResults);
          let pokemonDataArr = [];
          let pokemonMovesArr = [];
          let pokemonMoveTypesArr = [];
          for (let e of entryResults) {
            //get item name if item is present
            let itemName = null;
            if (e.item_id) {
              let itemResults = await executeQuery(conn, "SELECT name FROM item WHERE id = ?", [e.item_id]);
              if (!itemResults[0]) {
                reject(constructError(400, `Could not get item with id ${e.item_id} `));
              }
              itemName = itemResults[0].name;
            }
            //get move data
            let moveResults = await executeQuery(conn, "SELECT m.name FROM move AS m JOIN known_moves AS km ON km.move_id = m.id WHERE km.entry_id = ?", [e.id]);
            if (moveResults.length < 1 || moveResults.length > 4) {
              reject(constructError(500, "Error fetching team data - Could not get correct move data"));
            }
            const moveNames = moveResults.reduce((acc, curr) => { acc.push(curr.name); return acc; }, []);
            //get pokemon types
            let typeResults = await executeQuery(conn, "SELECT type1, type2 FROM pokemon WHERE id = ?", [e.pokemon_id]);
            if (typeResults.length === 0) {
              reject(constructError(500, `Error fetching team data - Could not get types for ${e.pokemon_name}`));
            }
            //get types of the moves
            let moveTypeSql = "SELECT type FROM move WHERE ";
            for (let i = 0; i < moveNames.length; i++) {
              if (i === moveNames.length - 1)
                moveTypeSql += "name = ?";
              else
                moveTypeSql += "name = ? OR "
            }
            let moveTypeResults = await executeQuery(conn, moveTypeSql, moveNames);
            if (moveTypeResults.length != moveNames.length) {
              reject(constructError(500, `Error fetching team data - Error getting types of moves pokemon "${e.pokemon_name}" knows`));
            }
            pokemonDataArr.push({
              pokemon_id: e.pokemon_id,
              name: e.pokemon_name,
              type1: typeResults[0].type1,
              type2: typeResults[0].type2,
              item: itemName,
              ability: e.ability_name
            });
            pokemonMovesArr.push(moveNames);
            pokemonMoveTypesArr.push(moveResults.reduce((acc, curr) => { acc.push(curr.name); return acc; }, []));
          }
          teamsArr.push(new Team(r, pokemonDataArr, pokemonMovesArr, pokemonMoveTypesArr));
        }
        resolve(teamsArr);
      } catch (err) {
        return reject(constructError(500, "Problem getting teams"));
      }
    });
  });
}

function getTeamById(teamId, userId) {
  return new Promise((resolve, reject) => {
    let connection = db.getDatabaseConnection();
    connection.getConnection(async (err, conn) => {
      try {
        //get team info first
        // let teamResults = await executeQuery(conn, "SELECT * FROM team WHERE public = TRUE OR (user_id = ? AND id = ?)", [userId, teamId]);
        //Was the above query but was changed so only the user can get their own team, may need to be changed in the future for different functionality.
        let teamResults = await executeQuery(conn, "SELECT * FROM team WHERE (user_id = ? AND id = ?)", [userId, teamId]);
        if (teamResults.length === 0) {
          reject(constructError(400, "Team could not be found or did not have permission to view"));
        }
        //get pokemon entry info (not moves/items yet)
        let sql = "SELECT pe.id, p.id AS pokemon_id, p.name AS pokemon_name, a.name AS ability_name, pe.item_id AS item_id FROM pokemon_entry AS pe JOIN pokemon AS p ON p.id = pe.pokemon_id ";
        sql += "JOIN ability AS a ON a.id = pe.ability_id WHERE pe.team_id = ?";
        let entryResults = await executeQuery(conn, sql, [teamId]);
        if (entryResults.length === 0) {
          reject(constructError(500, "Error fetching team data - No pokemon entries found"));
        }
        //console.log('ENTRY: ', entryResults, '\nTEAM RESULTS ', teamResults);
        let pokemonDataArr = [];
        let pokemonMovesArr = [];
        let pokemonMoveTypesArr = [];
        for (let e of entryResults) {
          //get item name if item is present
          let itemName = null;
          if (e.item_id) {
            let itemResults = await executeQuery(conn, "SELECT name FROM item WHERE id = ?", [e.item_id]);
            if (!itemResults[0]) {
              reject(constructError(500, `Error fetching team data - Could not get item with id ${e.item_id} `));
            }
            itemName = itemResults[0].name;
          }
          //get move data
          let moveResults = await executeQuery(conn, "SELECT m.name FROM move AS m JOIN known_moves AS km ON km.move_id = m.id WHERE km.entry_id = ?", [e.id]);
          if (moveResults.length < 1 || moveResults.length > 4) {
            reject(constructError(500, "Error fetching team data - Could not get correct move data"));
          }
          const moveNames = moveResults.reduce((acc, curr) => { acc.push(curr.name); return acc; }, []);
          //get pokemon types
          let typeResults = await executeQuery(conn, "SELECT type1, type2 FROM pokemon WHERE id = ?", [e.pokemon_id]);
          if (typeResults.length === 0) {
            reject(constructError(500, `Error fetching team data - Could not get types for ${e.pokemon_name}`));
          }
          //get types of the moves
          let moveTypeSql = "SELECT type FROM move WHERE ";
          for (let i = 0; i < moveNames.length; i++) {
            if (i === moveNames.length - 1)
              moveTypeSql += "name = ?";
            else
              moveTypeSql += "name = ? OR "
          }
          let moveTypeResults = await executeQuery(conn, moveTypeSql, moveNames);
          if (moveTypeResults.length != moveNames.length) {
            reject(constructError(500, `Error fetching team data - Error getting types of moves pokemon "${e.pokemon_name}" knows`));
          }
          pokemonDataArr.push({
            pokemon_id: e.pokemon_id,
            name: e.pokemon_name,
            type1: typeResults[0].type1,
            type2: typeResults[0].type2,
            item: itemName,
            ability: e.ability_name
          });
          pokemonMovesArr.push(moveNames);
          pokemonMoveTypesArr.push(moveTypeResults.reduce((acc, curr) => { acc.push(curr.type); return acc; }, []));
        }
        let team = new Team(teamResults[0], pokemonDataArr, pokemonMovesArr, pokemonMoveTypesArr);
        resolve(team);
      } catch (err) {
        reject(constructError(500, "Problem getting team"));
      }
    });
  });
}

function createTeam(team, userId) {
  return new Promise((resolve, reject) => {
    let validate_ret = validateTeamBody(team);
    if (validate_ret !== true) {
      reject(constructError(400, validate_ret));
    }

    let connection = db.getDatabaseConnection();
    connection.getConnection((err, conn) => {
      conn.beginTransaction(async (err) => {
        if (err) {
          reject(constructError(500, "Could not set up database transaction"));
        }
        //insert team
        let x = new Date(Date.now());
        let first = x.toISOString().substring(0, x.toISOString().indexOf('T'));
        let last_modified = `${first} ${x.getHours()}:${x.getMinutes()}:00`;
        conn.query('INSERT INTO team(user_id, public, name, last_modified) VALUES (?, ?, ?, ?)', [userId, team.public, team.name, last_modified], async (err, results, fields) => {
          if (err) {
            return conn.rollback(() => { reject(constructError(500, "Could not create team")); });
          }
          const newTeamId = results.insertId;
          for (const p of team.pokemon) {
            try {
              //get ability and pokemon id, while checking that both are valid
              let abilSQL = "SELECT p.id AS pokemon_id, a.id AS ability_id FROM pokemon AS p JOIN pokemon_abilities AS pa ON p.id = pa.pokemon_id ";
              abilSQL += "JOIN ability AS a ON a.id = pa.ability_id WHERE LOWER(REPLACE(p.name, ' ', '')) = ? AND LOWER(REPLACE(a.name, ' ', '')) = ?";
              let abilResults = await executeQuery(conn, abilSQL, [p.name, p.ability]);
              if (abilResults.length === 0) {
                return conn.rollback(() => { reject(constructError(400, `Ability ${p.ability} is not valid on ${p.name}, or one of these values does not exist`)); });
              }
              const pokeId = abilResults[0].pokemon_id;
              const abilId = abilResults[0].ability_id;
              //get held item id, checking that it is valid
              let itemId = null;
              if (p.item) {
                let itemResults = await executeQuery(conn, "SELECT id as item_id FROM item WHERE LOWER(REPLACE(name, ' ', '')) = ?", [p.item]);
                if (itemResults.length === 0) {
                  return conn.rollback(() => { reject(constructError(400, `Item ${p.item} on ${p.name} is not a valid item`)); });
                }
                itemId = itemResults[0].item_id;
              }
              //create pokemon entry
              const entryValues = [newTeamId, pokeId, itemId, abilId];
              let entryResults = await executeQuery(conn, "INSERT INTO pokemon_entry(team_id, pokemon_id, item_id, ability_id) VALUES (?, ?, ?, ?)", entryValues);
              let entryId = entryResults.insertId;
              //get move IDs
              let moveSelectSQL = "SELECT tm.move_id FROM pokemon AS p JOIN teachable_moves AS tm ON p.id = tm.pokemon_id JOIN move AS m ON m.id = tm.move_id ";
              let where = " WHERE p.id = ? AND (";
              let args = [pokeId];
              const movesLength = p.moves.length;
              for (let i = 0; i < movesLength; i++) {
                if (i === movesLength - 1)
                  where += "LOWER(REPLACE(m.name, ' ', '')) = ?)";
                else
                  where += "LOWER(REPLACE(m.name, ' ', '')) = ? OR ";
                args.push(p.moves[i]);
              }
              moveSelectSQL += where;
              //console.log(moveSelectSQL);
              let moveSelectResults = await executeQuery(conn, moveSelectSQL, args);
              if (moveSelectResults.length !== movesLength) {
                return conn.rollback(() => { reject(constructError(400, `A move on ${p.name} is invalid`)); });
              }
              let moveIds = moveSelectResults.map(m => m.move_id);
              //bulk insert into known_moves
              let bulkVals = moveIds.map(mid => [entryId, mid]);
              await executeQuery(conn, "INSERT INTO known_moves VALUES ?", [bulkVals]);
            } catch (err) {
              return conn.rollback(() => { reject(constructError(500, "Could not create team - error processing move data")) });
            }
          }
          conn.commit((err) => {
            if (err) {
              return conn.rollback(() => { reject(constructError(500, "Problem saving new team")); });
            }
            resolve(newTeamId);
          });
        });
      });
    });
  });
}

function deleteTeam(teamId, currentUserID) {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM team WHERE id = ? AND user_id = ?', [teamId, currentUserID]).then(({ results }) => {
      if (results.affectedRows == 0) {
        reject(constructError(400, 'Team does not exist or inadequate permissions'));
      }
      resolve();
    }).catch(err => {
      reject(constructError(500, "Problem deleting team"));
    });
  });
}

function editTeam(team, userId) {
  return new Promise((resolve, reject) => {
    let validate_ret = validateTeamBody(team);
    if (validate_ret !== true) {
      reject(constructError(400, validate_ret));
    }


    let connection = db.getDatabaseConnection();
    connection.getConnection((err, conn) => {
      conn.beginTransaction(async (err) => {
        if (err) {
          reject(constructError(500, "Could not set up database transaction"));
        }
        let teamResults = await executeQuery(conn, 'UPDATE team SET name = ? WHERE id = ? AND user_id = ?', [team.name, team.teamId, userId]);
        if (teamResults.affectedRows == 0) {
          return conn.rollback(() => { reject(constructError(500, "Could not create team")); });
        }

        let teamPublicResults = await executeQuery(conn, 'UPDATE team SET public = ? WHERE id = ? AND user_id = ?', [team.public, team.teamId, userId]);
        if (teamPublicResults.affectedRows == 0) {
          return conn.rollback(() => { reject(constructError(500, "Could not create team")); });
        }

        let deleteResults = await executeQuery(conn, 'DELETE FROM pokemon_entry WHERE team_id = ?', [team.teamId]);
        if (deleteResults.affectedRows == 0) {
          return conn.rollback(() => { reject(constructError(500, "Could not create team")); });
        }

        const newTeamId = team.teamId;
        for (const p of team.pokemon) {
          try {
            //get ability and pokemon id, while checking that both are valid
            let abilSQL = "SELECT p.id AS pokemon_id, a.id AS ability_id FROM pokemon AS p JOIN pokemon_abilities AS pa ON p.id = pa.pokemon_id ";
            abilSQL += "JOIN ability AS a ON a.id = pa.ability_id WHERE LOWER(REPLACE(p.name, ' ', '')) = ? AND LOWER(REPLACE(a.name, ' ', '')) = ?";
            let abilResults = await executeQuery(conn, abilSQL, [p.name, p.ability]);
            if (abilResults.length === 0) {
              return conn.rollback(() => { reject(constructError(400, `Ability ${p.ability} is not valid on ${p.name}, or one of these values does not exist`)); });
            }
            const pokeId = abilResults[0].pokemon_id;
            const abilId = abilResults[0].ability_id;
            //get held item id, checking that it is valid
            let itemId = null;
            if (p.item) {
              let itemResults = await executeQuery(conn, "SELECT id as item_id FROM item WHERE LOWER(REPLACE(name, ' ', '')) = ?", [p.item]);
              if (itemResults.length === 0) {
                return conn.rollback(() => { reject(constructError(400, `Item ${p.item} on ${p.name} is not a valid item`)); });
              }
              itemId = itemResults[0].item_id;
            }
            //create pokemon entry
            const entryValues = [newTeamId, pokeId, itemId, abilId];
            let entryResults = await executeQuery(conn, "INSERT INTO pokemon_entry(team_id, pokemon_id, item_id, ability_id) VALUES (?, ?, ?, ?)", entryValues);
            let entryId = entryResults.insertId;
            //get move IDs
            let moveSelectSQL = "SELECT tm.move_id FROM pokemon AS p JOIN teachable_moves AS tm ON p.id = tm.pokemon_id JOIN move AS m ON m.id = tm.move_id ";
            let where = " WHERE p.id = ? AND (";
            let args = [pokeId];
            const movesLength = p.moves.length;
            for (let i = 0; i < movesLength; i++) {
              if (i === movesLength - 1)
                where += "LOWER(REPLACE(m.name, ' ', '')) = ?)";
              else
                where += "LOWER(REPLACE(m.name, ' ', '')) = ? OR ";
              args.push(p.moves[i]);
            }
            moveSelectSQL += where;
            //console.log(moveSelectSQL);
            let moveSelectResults = await executeQuery(conn, moveSelectSQL, args);
            if (moveSelectResults.length !== movesLength) {
              return conn.rollback(() => { reject(constructError(400, `A move on ${p.name} is invalid`)); });
            }
            let moveIds = moveSelectResults.map(m => m.move_id);
            //bulk insert into known_moves
            let bulkVals = moveIds.map(mid => [entryId, mid]);
            await executeQuery(conn, "INSERT INTO known_moves VALUES ?", [bulkVals]);
          } catch (err) {
            return conn.rollback(() => { reject(constructError(500, "Could not create team - error processing move data")) });
          }
        }
        conn.commit((err) => {
          if (err) {
            console.log(err);
            return conn.rollback(() => { reject(constructError(500, "Problem saving new team")); });
          }
          resolve();
        });

      });
    });








  });
}

function validateTeamBody(body) {
  if (typeof body.public !== 'boolean') {
    return "Public setting needs to be either true or false";
  }
  if (!body.name || typeof body.name !== 'string' || body.name.length < 3) {
    return "Team name must be a string of at least 2 characters";
  }
  if (!body.pokemon || !Array.isArray(body.pokemon) || body.pokemon.length < 1 || body.pokemon.length > 6) {
    return "Must specify between 1 and 6 Pokemon";
  }
  for (let i = 0; i < body.pokemon.length; i++) {
    let p = body.pokemon[i];
    if (!p.name) {
      return `Must specify the Pokemon's name at index ${i}`;
    }
    if (!p.ability) {
      return `Must specify the Pokemon's ability at index ${i}`;
    }
    if (!p.moves || !Array.isArray(p.moves) || p.moves.length < 1 || p.moves.length > 4) {
      return `Must specify between 1 and 4 moves for the Pokemon at index ${i}`
    }
    p.moves = p.moves.map(m => m.replaceAll(' ', '').toLowerCase());
    p.item = p.item ? p.item.replaceAll(' ', '') : null;
    p.ability = p.ability.replaceAll(' ', '').toLowerCase();
    p.name = p.name.replaceAll(' ', '').toLowerCase();
  }
  return true;
}

function executeQuery(conn, query, params = []) {
  return new Promise((resolve, reject) => {
    conn.query(query, params, (err, results, fields) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(results);
    });
  });
}

module.exports = {
  createTeam: createTeam,
  getTeamById: getTeamById,
  getAllTeams: getAllTeams,
  getUserTeams: getUserTeams,
  deleteTeam: deleteTeam,
  editTeam: editTeam
}