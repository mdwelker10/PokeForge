import http from '../utils/HTTPClient.js';
import { pokeDataToggleSmall, small } from '../utils/responsive.js';
const SMALL_SIZE = 600;

addEventListener('DOMContentLoaded', e => {
  let main = document.getElementsByTagName('main').item(0);
  let error = document.getElementById('error');
  let search = document.getElementById('search');
  http.get('/api/pokemon').then(data => {
    data.forEach((e, idx) => {
      //create elements
      let i = idx + 1;
      let a = document.createElement('a');
      let div = document.createElement('div');
      let img = document.createElement('img');
      let p = document.createElement('p');
      //apply classes / attributes
      a.classList.add('d-inline-block', 'poke-entry', 'm-3', 'p-1');
      a.href = `/pokemon/info/${e.name.replaceAll(' ', '').toLowerCase()}`;
      a.id = e.name.replaceAll(' ', '').toLowerCase();
      div.classList.add('justify-content-center', 'text-center');
      //let margin = window.innerWidth < 500 ? 'mx-4' : 'mx-5';
      img.classList.add('mx-4', 'mb-1', 'entry-img');
      let num = i < 10 ? `00${i}` : i < 100 ? `0${i}` : i;
      img.src = `images/pokemon/${num}.png`;
      img.alt = e.name;
      img.setAttribute('width', '100vw');
      p.classList.add('fs-6', 'poke-link');
      p.innerHTML = e.name;
      //append to page
      div.appendChild(img);
      div.appendChild(p);
      a.appendChild(div);
      main.appendChild(a);
    });
    if (window.innerWidth < SMALL_SIZE) {
      pokeDataToggleSmall(window.location.href.toString());
    }
    window.addEventListener('resize', e => {
      if (window.innerWidth < SMALL_SIZE && !small) {
        pokeDataToggleSmall(window.location.href.toString());
      } else if (window.innerWidth > SMALL_SIZE && small) {
        pokeDataToggleSmall(window.location.href.toString());
      }
    });
    const entries = document.querySelectorAll('.poke-entry');
    search.addEventListener("input", e => {
      const input = search.value.replaceAll(' ', '').toLowerCase();
      entries.forEach(e => {
        if (e.id.includes(input)) {
          e.classList.replace('d-none', 'd-inline-block');
        } else {
          e.classList.replace('d-inline-block', 'd-none');
        }
      });
    });
  }).catch(err => {
    if (err.status == 401) {
      window.location.href = '/';
    }
    console.log(err);
    error.classList.remove('d-none');
  });
});

