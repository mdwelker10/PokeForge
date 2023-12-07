const express = require('express');
const router = express.Router();

const { TokenMiddleware } = require('../auth-endpoints/auth-middleware');
const ItemDAO = require('../data/dao/ItemDAO');
const cookieParser = require('cookie-parser');
router.use(cookieParser());

//get all items
router.get('/', TokenMiddleware, (req, res) => {
  ItemDAO.getAllItems().then(items => {
    res.status(200).json(items);
  }).catch(err => {
    res.status(500).json({ error: "Could not get item data" });
  });
});

//get specific item by it's name
router.get('/:name', TokenMiddleware, (req, res) => {
  ItemDAO.getItemByName(req.params.name).then(item => {
    if (item) {
      res.status(200).json({ item });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  }).catch(err => {
    res.status(500).json({ error: "Could not get item data" });
  });
});

//get item by it's id
router.get('/id/:id', TokenMiddleware, (req, res) => {
  ItemDAO.getItemById(req.params.id).then(item => {
    if (item) {
      res.status(200).json({ item });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  }).catch(err => {
    res.status(500).json({ error: "Could not get item data" });
  });
});

module.exports = router;