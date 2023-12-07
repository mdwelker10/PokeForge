const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT;

// Designate the static folder as serving static resources
app.use(express.static(__dirname + '/static'));

function getFile(filename) {
  return path.join(__dirname, 'static', 'templates', filename);
}

app.get('/', (req, res) => {
  res.sendFile(getFile('login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(getFile('register.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(getFile('home.html'));
});

app.get('/create', (req, res) => {
  res.sendFile(getFile('teams/create-team.html'));
});

app.get('/pokemon', (req, res) => {
  res.sendFile(getFile('pokemon-data/pokemon.html'));
});

app.get('/pokemon/info/:name', (req, res) => {
  res.sendFile(getFile('pokemon-data/pokemon-view.html'));
});

app.get('/viewotherteams', (req, res) => {
  res.sendFile(getFile('teams/other-teams.html'));
});

app.get('/vieweditteams', (req, res) => {
  res.sendFile(getFile('teams/my-teams.html'));
});

app.get('/editteam', (req, res) => {
  res.sendFile(getFile('teams/edit-team.html'));
});

app.get('/offline', (req, res) => {
  res.sendFile(getFile('offline.html'));
});

app.use((req, res) => {
  res.status(404).sendFile(getFile('not-found.html'));
});

// As our server to listen for incoming connections
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));