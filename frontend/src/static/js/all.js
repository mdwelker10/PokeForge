import http from './utils/HTTPClient.js';

document.addEventListener('DOMContentLoaded', e => {
  http.get('/api/auth/currentuser').then(user => {
    let btn = document.getElementById('btn-preferences')
    if (!btn) {
      return;
    }
    btn.innerHTML = user.username;
    let shiny = document.getElementById('shiny-check');
    shiny.checked = localStorage.getItem('shiny') === 'true';
    shiny.addEventListener('change', e => {
      if (shiny.checked) {
        localStorage.setItem('shiny', true);
      } else {
        localStorage.setItem('shiny', false);
      }
    });
  }).catch(err => {
    if (err.status == 401) {
      window.location.href = '/';
    } else {
      console.error(err);
    }
  });
});

//Service Worker
function registerServiceWorker() {
  if (!navigator.serviceWorker) {
    return;
  }

  navigator.serviceWorker.register('/serviceWorker.js')
    .then(registration => {
      if (!navigator.serviceWorker.controller) {
        return;
      }

      if (registration.waiting) {
        newServiceWorkerReady(registration.waiting);
      }

      registration.addEventListener('updatefound', () => {
        console.log("SW update found", registration, navigator.serviceWorker.controller);
        newServiceWorkerReady(registration.installing);
      });
    })
    .catch(error => {
      console.error(`Service worker registration failed with error: ${error}`);
    });

  navigator.serviceWorker.addEventListener('message', event => {
    console.log('SW message', event.data);
  })

  // Ensure refresh is only called once.
  // This works around a bug in "force update on reload" in dev tools.
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    window.location.reload();
    refreshing = true;
  });

};

registerServiceWorker();


//This method is used to notify the user of a new version
function newServiceWorkerReady(worker) {
  const popup = document.createElement('div');
  popup.classList.add('bg-warning', 'd-flex', 'align-items-center', 'justify-content-center');
  popup.id = 'popup';

  const p = document.createElement('p');
  p.innerHTML = 'A New Version is Available!';
  p.classList.add('text-center', 'text-dark', 'my-auto', 'fs-6', 'me-4');
  popup.appendChild(p);

  const buttonOk = document.createElement('button');
  buttonOk.innerHTML = 'Update';
  buttonOk.addEventListener('click', e => {
    worker.postMessage({ action: 'skipWaiting' });
  });
  buttonOk.classList.add('btn', 'btn-sm', 'btn-info', 'me-2');
  popup.appendChild(buttonOk);

  const buttonCancel = document.createElement('button');
  buttonCancel.innerHTML = 'Dismiss';
  buttonCancel.classList.add('btn', 'btn-sm', 'btn-danger');
  buttonCancel.addEventListener('click', e => {
    document.body.removeChild(popup);
  });
  popup.appendChild(buttonCancel);

  document.body.insertBefore(popup, document.body.firstChild);
}