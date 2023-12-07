const express = require('express');
const router = express.Router();

const { TokenMiddleware } = require('../auth-endpoints/auth-middleware');
const AbilityDAO = require('../data/dao/AbilityDAO');
const { handleError } = require('../utils');
const cookieParser = require('cookie-parser');
router.use(cookieParser());

//get all abilitys
router.get('/', TokenMiddleware, (req, res) => {
  AbilityDAO.getAllAbilities().then(abilities => {
    res.status(200).json(abilities);
  }).catch(err => {
    res.status(500).json({ error: "Could not get ability data" });
  });
});

//get specific ability by it's name
router.get('/:name', TokenMiddleware, (req, res) => {
  AbilityDAO.getAbilityByName(req.params.name).then(ability => {
    if (ability) {
      res.status(200).json({ ability });
    } else {
      res.status(404).json({ error: 'Ability not found' });
    }
  }).catch(err => {
    handleError(err, res);
  });
});

//get ability by it's id
router.get('/id/:id', TokenMiddleware, (req, res) => {
  AbilityDAO.getAbilityById(req.params.id).then(ability => {
    if (ability) {
      res.status(200).json({ ability });
    } else {
      res.status(404).json({ error: 'Ability not found' });
    }
  }).catch(err => {
    handleError(err, res);
  });
});

module.exports = router;