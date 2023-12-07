import http from '../utils/HTTPClient.js';
import { effectMap } from '../utils/PokemonUtils.js';
import { pokeDataToggleSmall, small } from '../utils/responsive.js';

const SMALL_SIZE = 600;

addEventListener('DOMContentLoaded', e => {
  const arr = window.location.href.toString().split('/');
  http.get(`/api/pokemon/${arr[arr.length - 1]}`).then(async (pokemon) => {
    const stats = [pokemon.hp, pokemon.attack, pokemon.defense, pokemon.sp_attack, pokemon.sp_defense, pokemon.speed];
    if (window.innerWidth < SMALL_SIZE) {
      pokeDataToggleSmall(window.location.href.toString());
    }
    window.addEventListener('resize', e => {
      if (window.innerWidth < SMALL_SIZE && !small) {
        pokeDataToggleSmall(window.location.href.toString());
        createLabels(stats);
      } else if (window.innerWidth > SMALL_SIZE && small) {
        pokeDataToggleSmall(window.location.href.toString());
        createLabels(stats);
      }
    });
    const pokemonName = pokemon.name;
    const pokemonId = parseInt(pokemon.id);
    const types = [pokemon.type1, pokemon.type2];
    let typeImgs = document.getElementsByClassName('pokemonTypeImg');
    const pokeImg = document.getElementById('poke-img');
    document.getElementsByTagName('title').item(0).innerHTML = pokemonName;
    document.getElementById('poke-name').innerHTML = pokemonName;
    typeImgs.item(0).src = `../../images/types/${types[0]}.png`;
    if (!pokemon.type2) {
      typeImgs.item(1).remove();
    } else {
      typeImgs.item(1).src = `../../images/types/${types[1]}.png`
    }
    let num = pokemonId < 10 ? `00${pokemonId}` : pokemonId < 100 ? `0${pokemonId}` : pokemonId;
    pokeImg.src = `../../images/pokemon/${num}.png`;
    makeChart(stats);
    //Load other data
    const abilitiesP = http.get(`/api/pokemon/${pokemonId}/abilities`);
    const movesP = http.get(`/api/pokemon/${pokemonId}/moves`);
    const defensesP = http.get(`/api/pokemon/${pokemonId}/defenses`);
    Promise.all([abilitiesP, movesP, defensesP]).then((values) => {
      let abilTbl = document.getElementById("abilitiesTbody");
      let movesTbl = document.getElementById("movesTbody");
      const abilities = values[0];
      const moves = values[1];
      const defenses = values[2];
      //abilities
      abilities.forEach(a => {
        let tr = document.createElement('tr');
        let nametd = document.createElement('td');
        let desctd = document.createElement('td');
        let hiddentd = document.createElement('td');
        nametd.innerHTML = a.name;
        desctd.innerHTML = a.description;
        hiddentd.innerHTML = a.is_hidden;
        if (a.is_hidden) {
          tr.classList.add('highlight-row');
        }
        tr.appendChild(nametd);
        tr.appendChild(desctd);
        tr.appendChild(hiddentd);
        abilTbl.appendChild(tr);
      });
      //defenses
      Object.entries(defenses).forEach(([type, effect]) => {
        let text = document.getElementById(type);
        text.classList.add(effectMap(effect));
        text.innerText = effect;
      });
      //moves
      moves.forEach(m => {
        let tr = document.createElement('tr');
        let nametd = document.createElement('td');
        let typetd = document.createElement('td');
        let cattd = document.createElement('td');
        let powertd = document.createElement('td');
        let acctd = document.createElement('td');
        nametd.innerHTML = m.name;
        powertd.innerHTML = m.power;
        acctd.innerHTML = m.accuracy;
        //create images
        let typeimg = document.createElement('img');
        typeimg.src = `../../images/types/${m.type}.png`;
        typeimg.alt = m.type;
        typeimg.classList.add('tbl-icon');
        typetd.appendChild(typeimg);
        let catimg = document.createElement('img');
        catimg.src = `../../images/category/${m.category}.png`;
        catimg.alt = m.category;
        catimg.classList.add('tbl-icon');
        cattd.appendChild(catimg);
        //append
        tr.appendChild(nametd);
        tr.appendChild(typetd);
        tr.appendChild(cattd);
        tr.appendChild(powertd);
        tr.appendChild(acctd);
        movesTbl.appendChild(tr);
      });
    }).catch(err => {
      document.getElementById('error').innerHTML = "An error occured loading data for this Pokemon";
      document.getElementById('error').classList.remove('d-none');
    });
  }).catch(err => {
    if (err.status == 401) {
      window.location.href = '/';
    }
    document.getElementById('error').classList.remove('d-none');
  });
});

function makeChart(stats) {
  //determine colors based on stats
  let colors = [];
  stats.forEach((element) => {
    if (element >= 150) colors.push("rgba(60, 189, 25, 1)");
    else if (element >= 120) colors.push("rgba(35, 153, 31, 1)");
    else if (element >= 100) colors.push("rgba(35, 150, 54, 1)");
    else if (element >= 80) colors.push("rgba(38, 173, 128, 1)");
    else if (element >= 60) colors.push("rgba(39, 140, 161, 1)");
    else if (element >= 40) colors.push("rgba(29, 95, 143, 1)");
    else colors.push("rgba(20, 52, 102, 1)");
  });
  //create chart
  const ctx = document.getElementById("stats-chart");
  new Chart(ctx, {
    type: "bar",
    data: {
      datasets: [
        {
          data: stats,
          borderWidth: 1,
          backgroundColor: colors,
        },
      ],
    },
    options: {
      scales: {
        x: {
          beginAtZero: true,
          max: 256,
          grid: {
            color: 'rgba(218, 165, 32, 0.75)'
          },
          ticks: {
            color: 'white'
          }
        },
        y: {
          grid: {
            color: 'rgba(218, 165, 32, 0.75)'
          },
          ticks: {
            color: 'white'
          }
        }
      },
      indexAxis: "y",
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        }
      },
    },
  });
  createLabels(stats);
}

function createLabels(stats) {
  const ctx = document.getElementById("stats-chart");
  const chart = Chart.getChart(ctx);
  if (!chart) {
    return;
  }
  if (small) {
    chart.data.labels = [
      `HP: ${stats[0]}`,
      `ATT: ${stats[1]}`,
      `DEF: ${stats[2]}`,
      `SPATT: ${stats[3]}`,
      `SPDEF: ${stats[4]}`,
      `SPD: ${stats[5]}`,
    ];
    //take top stat, add 50, round to nearest 10
    let top = Math.round((Math.max(...stats) + 50) / 10) * 10;
    //new chart max is rounded increase of top stat above or 256, whichever is smaller
    chart.options.scales.x.max = Math.min(top, 256);
  } else {
    chart.data.labels = [
      `HP: ${stats[0]}`,
      `ATTACK: ${stats[1]}`,
      `DEFENSE: ${stats[2]}`,
      `SP ATTACK: ${stats[3]}`,
      `SP DEFENSE: ${stats[4]}`,
      `SPEED: ${stats[5]}`,
    ];
    chart.options.scales.x.max = 256;
  }
  chart.update();
}