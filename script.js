async function getAccessToken(clientId, clientSecret) {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    return data.access_token;
}

async function getSpotifyData(accessToken) {
    const endpoints = [
        'https://api.spotify.com/v1/search?q=genre%3A%22bollywood%22&type=track&market=IN&limit=50&year=2023',
        'https://api.spotify.com/v1/search?q=genre%3A%22bollywood%22&type=artist&market=IN&limit=50&year=2023'
    ];

    const requests = endpoints.map(endpoint =>
        fetch(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        }).then(response => response.json())
    );

    const results = await Promise.all(requests);
    return results;
}

function calculateMetrics(data) {
    const tracks = data[0].tracks.items;
    const artists = data[1].artists.items;

    const numArtists = artists.length;
    const numSongs = tracks.length;

    let totalValence = 0;
    let totalTempo = 0;
    let totalMode = 0;
    let maxPopularity = 0;

    tracks.forEach(track => {
        totalValence += track.valence;
        totalTempo += track.tempo;
        totalMode += track.mode;
        if (track.popularity > maxPopularity) {
            maxPopularity = track.popularity;
        }
    });

    const avgValence = totalValence / numSongs;
    const avgTempo = totalTempo / numSongs;
    const avgMode = totalMode / numSongs;

    return {
        numArtists,
        numSongs,
        avgValence,
        avgTempo,
        avgMode,
        maxPopularity,
        topTracks: tracks.sort((a, b) => b.popularity - a.popularity).slice(0, 10),
        topTempoTracks: tracks.sort((a, b) => b.tempo - a.tempo).slice(0, 10),
        topDanceableTracks: tracks.sort((a, b) => b.danceability - a.danceability).slice(0, 10)
    };
}

function displayMetrics(metrics) {
    document.getElementById('numArtists').textContent = metrics.numArtists.toLocaleString();
    document.getElementById('numSongs').textContent = metrics.numSongs.toLocaleString();
    document.getElementById('avgValence').textContent = metrics.avgValence.toFixed(2);
    document.getElementById('avgTempo').textContent = metrics.avgTempo.toFixed(2);
    document.getElementById('avgMode').textContent = metrics.avgMode.toFixed(2);
    document.getElementById('maxPopularity').textContent = metrics.maxPopularity;
}

function displayCharts(metrics) {
    const topTracks = metrics.topTracks.map(track => track.name);
    const topTrackPopularity = metrics.topTracks.map(track => track.popularity);

    const topTempoTracks = metrics.topTempoTracks.map(track => track.name);
    const topTrackTempo = metrics.topTempoTracks.map(track => track.tempo);

    const topDanceableTracks = metrics.topDanceableTracks.map(track => track.name);
    const topTrackDanceability = metrics.topDanceableTracks.map(track => track.danceability);

    new Chart(document.getElementById('topPopularTracks'), {
        type: 'bar',
        data: {
            labels: topTracks,
            datasets: [{
                label: 'Popularity',
                data: topTrackPopularity,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    new Chart(document.getElementById('topTempoTracks'), {
        type: 'line',
        data: {
            labels: topTempoTracks,
            datasets: [{
                label: 'Tempo',
                data: topTrackTempo,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    new Chart(document.getElementById('topDanceableTracks'), {
        type: 'bar',
        data: {
            labels: topDanceableTracks,
            datasets: [{
                label: 'Danceability',
                data: topTrackDanceability,
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

const clientId = 'fc2fc2e8eef9467ab0380a4d9a4d40a8';
const clientSecret = '5660f92212cc45bea34dd6235ae6b197';

getAccessToken(clientId, clientSecret).then(accessToken => {
    getSpotifyData(accessToken).then(data => {
        const metrics = calculateMetrics(data);
        displayMetrics(metrics);
        displayCharts(metrics);
    });
});
