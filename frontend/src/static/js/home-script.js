import http from './utils/HTTPClient.js';

addEventListener('DOMContentLoaded', (e) => {
    document.getElementById('createButton').addEventListener('click', (e) => {
        window.location.href = '/create';
    });
    document.getElementById('viewpokedataButton').addEventListener('click', e => {
        window.location.href = '/pokemon';
    });
    document.getElementById('viewOtherButton').addEventListener('click', e => {
        window.location.href = '/viewotherteams';
    });

    document.getElementById('viewEditButton').addEventListener('click', e => {
        window.location.href = '/vieweditteams';
    });
    document.getElementById('logoutButton').addEventListener('click', e => {
        http.post('/api/auth/logout', {}).then(res => {
            window.location.href = '/';
        }).error(err => {
            console.error(err);
        });
    });
});
