const express = require('express');

//api routes
const auth = require('./auth-endpoints/auth');
const pokemon = require('./poke-data-endpoints/pokemon');
const moves = require('./poke-data-endpoints/moves');
const teams = require('./teams-endpoints/teams');
const abilities = require('./poke-data-endpoints/abilities');
const items = require('./poke-data-endpoints/items');

const app = express();
const PORT = process.env.PORT;
app.use(express.json());

//use routes
app.use('/auth', auth);
app.use('/teams', teams);

app.use('/pokemon', pokemon);
app.use('/moves', moves);
app.use('/abilities', abilities);
app.use('/items', items);

//docker logs -f api
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));