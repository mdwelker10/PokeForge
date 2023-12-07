const express = require('express');
const router = express.Router();
const { TokenMiddleware } = require('../auth-endpoints/auth-middleware');
const { handleError } = require('../utils');
const TeamDAO = require('../data/dao/TeamDAO');
const cookieParser = require('cookie-parser');
router.use(cookieParser());

//create a new team, returns id of created team
router.post('/create', TokenMiddleware, (req, res) => {
  if (req.body) {
    TeamDAO.createTeam(req.body, req.user.id).then(data => {
      return res.status(200).json({ id: data });
    }).catch(err => {
      handleError(err, res);
    });
  } else {
    return res.status(400).json({ error: "Invalid request" });
  }
});

/**
 * Get all public teams
 * User query p to filter by containing pokemon
 *  - ?p=pikachu
 *  - ?p=charizard&p=blastoise&p=venusaur
 * ---------------------------------------------------
 * User query name to filter by teams containing a certain string. 
 * Expecting that name will be URI encoded
 *  - ?name=gen5
 *  - ?name=my%20team
 * Multiple pokemon queries can be made, only one name query can be made  
 * ---------------------------------------------------
 * User query own to include teams belonging to the logged in user
 *  - ?own=true
 * By default these teams will be excluded
 */
router.get('/', TokenMiddleware, (req, res) => {
  let pokemon = req.query.p;
  if (pokemon && !Array.isArray(pokemon)) {
    pokemon = [pokemon];
  }
  let name = req.query.name ? decodeURIComponent(req.query.name) : false;
  let includeOwn = req.query.own == 'true';

  TeamDAO.getAllTeams(req.user.id, includeOwn, name, pokemon ? pokemon : false).then(teams => {
    return res.status(200).json(teams);
  }).catch(err => {
    //console.log(err);
    handleError(err, res);
  });
});

//edit specific existing team
router.put('/id/:teamid', TokenMiddleware, (req, res) => {
  if (req.body) {
    TeamDAO.editTeam(req.body, req.user.id).then(data => {
      return res.status(200).json({ id: data });
    }).catch(err => {
      handleError(err, res);
    });
  } else {
    return res.status(400).json({ error: "Invalid request" });
  }
});

//get team via the teamid
//query ?detailed=true gets type defenses and move effectiveness information for each pokemon in team
router.get('/id/:teamid', TokenMiddleware, (req, res) => {
  TeamDAO.getTeamById(req.params.teamid, req.user.id).then(team => {
    if (req.query.detailed == 'true') {
      return res.status(200).json(team.toDetailedJSON());
    } else {
      return res.status(200).json(team.toJSON());
    }
  }).catch(err => {
    handleError(err, res);
  });
});

//delete team 
router.delete('/id/:teamid', TokenMiddleware, (req, res) => {
  TeamDAO.deleteTeam(req.params.teamid, req.user.id).then(() => {
    res.status(200).json({ "success": true });
  }).catch(err => {
    handleError(err, res);
  });
});

//get all public teams for a specific user
router.get('/user/:userid', TokenMiddleware, (req, res) => {
  TeamDAO.getUserTeams(req.params.userid, req.user.id).then(teams => {
    res.status(200).json(teams);
  }).catch(err => {
    handleError(err, res);
  });
});

//get all teams (public and private) for the logged in user
router.get('/myteams', TokenMiddleware, (req, res) => {
  TeamDAO.getUserTeams(req.user.id, req.user.id).then(teams => {
    res.status(200).json(teams);
  }).catch(err => {
    handleError(err, res);
  });
});

module.exports = router;