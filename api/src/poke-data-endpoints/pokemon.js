const express = require('express');
const router = express.Router();
const { handleError } = require('../utils');
const PokemonDAO = require('../data/dao/PokemonDAO');
const { TokenMiddleware } = require('../auth-endpoints/auth-middleware');
const cookieParser = require('cookie-parser');
router.use(cookieParser());

//get all pokemon
router.get("/", TokenMiddleware, (req, res) => {
  PokemonDAO.getAllPokemon().then(pokemon => {
    res.status(200).json(pokemon);
  }).catch(err => {
    //console.log('The Error is', err);
    res.status(500).json({ error: "Could not get pokemon data" });
  });
});

//get pokemon by its name
router.get('/:name', TokenMiddleware, (req, res) => {
  PokemonDAO.getPokemonByName(req.params.name).then(pokemon => {
    if (pokemon) {
      res.status(200).json(pokemon);
    } else {
      res.status(404).json({ error: "Pokemon not found" });
    }
  }).catch(err => {
    handleError(err, res);
  });
});

//get pokemon by its id
router.get('/id/:id', TokenMiddleware, (req, res) => {
  PokemonDAO.getPokemonById(req.params.id).then(pokemon => {
    if (pokemon) {
      res.status(200).json(pokemon);
    } else {
      res.status(404).json({ error: "Pokemon not found" });
    }
  }).catch(err => {
    handleError(err, res);
  });
});

//get all pokemon with a certain type
//might want to only return names (or names+types or specific data entries needed)
router.get('/type/:type', TokenMiddleware, (req, res) => {
  PokemonDAO.getPokemonByType(req.params.type).then(pokemon => {
    if (pokemon) {
      res.status(200).json(pokemon);
    } else {
      res.status(404).json({ error: "Pokemon with that type not found" });
    }
  }).catch(err => {
    handleError(err, res);
  });
});

//get weaknesses of this pokemon, can be via id or name
router.get('/:identifier/defenses', TokenMiddleware, (req, res) => {
  const identifier = req.params.identifier.toLowerCase();
  if (isNaN(identifier)) {
    PokemonDAO.getPokemonByName(identifier, true).then(data => {
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({ error: "Pokemon not found" });
      }
    }).catch(err => {
      handleError(err, res);
    });
  } else {
    PokemonDAO.getPokemonById(identifier, true).then(data => {
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({ error: "Pokemon not found" });
      }
    }).catch(err => {
      handleError(err, res);
    });
  }
});

//get moves a pokemon can learn, can be via id or name
router.get('/:identifier/moves', TokenMiddleware, (req, res) => {
  const identifier = req.params.identifier.toLowerCase();
  PokemonDAO.getPokemonMoves(identifier, isNaN(identifier)).then(data => {
    if (data) {
      return res.status(200).json(data);
    } else {
      return res.status(400).json({ error: "Could not get move data for this Pokemon" });
    }
  }).catch(err => {
    handleError(err, res);
  });
});

//get abilities a pokemon can have, can be via id or name
router.get('/:identifier/abilities', TokenMiddleware, (req, res) => {
  const identifier = req.params.identifier.toLowerCase();
  PokemonDAO.getPokemonAbilities(identifier, isNaN(identifier)).then(data => {
    if (data) {
      return res.status(200).json(data);
    } else {
      return res.status(400).json({ error: "Could not get move data for this Pokemon" });
    }
  }).catch(err => {
    handleError(err, res);
  });
});

module.exports = router;

