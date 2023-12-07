export var small = false;

export const pokeDataToggleSmall = (pageString) => {
  const pageArr = pageString.split('/');
  let borders = document.getElementsByClassName('v-border');
  for (let b of borders) {
    b.classList.toggle('mx-4');
    b.classList.toggle('mx-2');
  }
  let labels = document.getElementsByClassName('link-info');
  for (let l of labels) {
    l.classList.toggle('link-info-small');
  }
  if (pageArr[pageArr.length - 1] == 'pokemon') {  //all pokemon viewpage
    let searchContainer = document.getElementById('searchContainer');
    let entryList = document.getElementsByClassName('poke-entry');
    let entryImgList = document.getElementsByClassName('entry-img');
    searchContainer.classList.toggle('col-6');
    for (let e of entryList) {
      e.classList.toggle('m-3');
      e.classList.toggle('m-2');
    }
    for (let e of entryImgList) {
      e.classList.toggle('mx-4');
      e.classList.toggle('mx-3');
    }
  } else if (pageString.includes('/pokemon/info/')) { //individual pokemon viewpage
    let accordionWrap = document.getElementById('accordion-wrap');
    accordionWrap.classList.toggle('col-8');
  }
  small = !small;
}

export const createToggleSmall = () => {
  document.getElementById('public-text').innerHTML = small ? 'Make this team public?' : 'Public team?'
  small = !small;
}