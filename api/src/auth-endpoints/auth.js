const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');

const UserDAO = require('../data/dao/UserDAO');
const { TokenMiddleware, generateToken, removeToken } = require('../auth-endpoints/auth-middleware');
router.use(cookieParser());
router.use(express.json());

router.post('/login', (req, res) => {
  //console.log("body of login request: ", req.body);
  if (req.body.username && req.body.password) {
    UserDAO.getUserByCredentials(req.body.username, req.body.password).then(user => {
      let result = {
        user: user
      }
      generateToken(req, res, user);
      res.status(200);
      res.json(result);
    }).catch(err => {
      res.status(401).json({ error: err });
    });
  }
  else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

router.post('/register', (req, res) => {
  //validate registration data
  //console.log("body of register request: ", req.body);
  if (req.body.username && req.body.password) {
    UserDAO.createUser(req.body.username, req.body.password).then(user => {
      let result = {
        user: user
      }
      generateToken(req, res, user);
      res.json(result);
    }).catch(err => {
      res.status(401).json({ error: err });
    });
  }
  else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});


router.post('/logout', (req, res) => {
  removeToken(req, res);
  res.json({ success: true });
});


router.get('/currentuser', TokenMiddleware, (req, res) => {
  res.json(req.user);
});

module.exports = router;