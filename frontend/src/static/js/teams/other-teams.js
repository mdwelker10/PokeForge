
import http from '../utils/HTTPClient.js';
const teamList = document.querySelector('#teamsList');


const SMALL_SIZE = 600;


addEventListener('DOMContentLoaded', e => {
    http.get('/api/teams/').then(teams => {
        for (let i = 0; i < teams.length; ++i) {
            const team = document.createElement('div');
            team.className = "container my-5";
            let name = document.createElement('h2');

            name.innerHTML = teams[i].name;
            team.appendChild(name);


            for (let a = 0; a < teams[i].pokemon.length; ++a) {
                const pokemon = document.createElement('div');
                pokemon.className = "container d-flex justify-content-between align-items-center my-3";

                const pokemonName = document.createElement('h2');
                pokemonName.style.fontSize = "%20";
                pokemonName.innerHTML = teams[i].pokemon[a].name;
                pokemon.appendChild(pokemonName);



                let img = document.createElement('img');


                img.style.maxWidth = "20%";
                img.style.height = "auto";
                let id = parseInt(teams[i].pokemon[a].pokemon_id);
                let num = id < 10 ? `00${id}` : id < 100 ? `0${id}` : id;
                img.src = `images/pokemon/${num}.png`;
                img.alt = teams[i].pokemon[a].name;

                // let ability = document.createElement('h5');
                let ability = document.createElement('h2');

                ability.innerHTML = teams[i].pokemon[a].ability;



                pokemon.appendChild(img);
                pokemon.appendChild(ability);
                console.log(teams[i].pokemon[a].pokemon_item);
                if (teams[i].pokemon[a].item && window.innerWidth > SMALL_SIZE) {

                    let item = document.createElement('h2');
                    item.className = "item";
                    item.innerHTML = teams[i].pokemon[a].item;
                    pokemon.appendChild(item);
                }

                pokemon.style.backgroundColor = "#112a85";
                pokemon.style.borderRadius = "5px";

                team.appendChild(pokemon);

            }
            team.style.backgroundColor = "#091644";
            team.style.borderRadius = "5px";
            teamList.append(team);
        }
    }).catch(err => {
        if (err.status == 401) {
            window.location.href = '/';
        }
        let errorBox = document.createElement('h1');
        errorBox.className = "container text-center";
        errorBox.innerHTML = "No Teams Available";
        teamList.append(errorBox);
        console.error('Could not load teams');
    });


    // Change values when window is resized 
    window.onresize = function () {
        let items;
        if (items = document.querySelectorAll(".item")) {
            if (items && items.length > 0 && window.innerWidth < SMALL_SIZE) {
                for (let m = 0; m < items.length; ++m) {
                    items[m].classList.add("d-none");
                }
            }
            else if (items && items.length > 0) {
                for (let m = 0; m < items.length; ++m) {
                    if (items[m].classList.contains("d-none")) {
                        items[m].classList.remove("d-none");
                    }
                }
            }
        }
    };
});



