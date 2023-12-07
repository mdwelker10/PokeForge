import http from '../utils/HTTPClient.js';
const teamList = document.querySelector('#teamsList');


const SMALL_SIZE = 600;

document.addEventListener('DOMContentLoaded', (event) => {
    http.get('/api/teams/myteams').then(teams => {

        if (teams == null || teams.length == 0) {
            console.log("empty");
        }

        for (let i = 0; i < teams.length; ++i) {
            const team = document.createElement('div');
            team.className = "container my-5";
            let name = document.createElement('h2');

            name.innerHTML = teams[i].name;
            team.appendChild(name);
            let buttonsContainer = document.createElement('div');
            buttonsContainer.className = "container d-flex justify-content-around align-items-center my-3";

            const link = document.createElement('button');
            link.innerHTML = "Edit";
            link.className = "px-5 py-2";
            link.fontSize = "3em";
            link.style.fontWeight = "bold";
            link.style.color = "#ffe600";
            link.style.textDecoration = "none";
            link.style.backgroundColor = "#112a85";
            link.style.borderRadius = "20px";
            link.style.borderColor = "#091644";
            link.addEventListener('click', e => {
                window.location.href = '/editteam?id=' + teams[i].id;
            });

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = "Delete";
            deleteButton.addEventListener('click', e => {
                //HERE IT IS
                let deleteCall = 'api/teams/id/' + teams[i].id;
                http.delete(deleteCall).catch(err => {
                    console.error('Could not load teams');
                });
                location.reload();
            });
            deleteButton.className = "px-5 py-2";

            deleteButton.fontSize = "3em";
            deleteButton.style.color = "#ffe600";
            deleteButton.style.fontWeight = "bold";
            deleteButton.style.textDecoration = "none";
            deleteButton.style.backgroundColor = "#112a85";
            deleteButton.style.borderRadius = "20px";
            deleteButton.style.borderColor = "#091644";
            buttonsContainer.appendChild(link);
            buttonsContainer.appendChild(deleteButton);
            team.appendChild(buttonsContainer);
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





