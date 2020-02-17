//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                ////
//   W E A T H I F Y -- Receba sugestões de música baseados na temperatura local.                                 ////
//                                                                                                                ////
//   Criado por: Ewerton Evangelista de Souza                                                                     ////
//   Data: 17/02/2020                                                                                             ////
//                                                                                                                ////
//   Mensagem:                                                                                                    ////
//   Meu nome é Ewerton, atualmente já terminei todas as matérias do curso de Engenharia Química                  ////
//   com uma média de 84.5 e falta apenas um estágio para eu me formar. Garanto que posso aprender                ////
//   e me adaptar em qualquer função/local/time que me colocarem.                                                 ////
//                                                                                                                ////
//   Nunca tive contato com Javascript, nem NodeJS, mas como você poderá observar pelo programa abaixo,           ////
//   sou capaz de aprender por conta própria em um prazo de tempo relativamente curto qualquer habilidade         ////
//   que me seja requisitada.                                                                                     ////
//                                                                                                                ////
//   Tenho total certeza que ainda poderei melhorar bastante, tanto na qualidade do código, quanto                ////
//   nos fundamentos por de trás. Peço apenas a oportunidade para tal. Estou a disposição para qualquer contato.  ////
//                                                                                                                ////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const SpotifyWebApi = require('spotify-web-api-node');
const path = require('path');
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
//Tokens do OpenWeatherMap & Spotify
const weatherAPIKey = '697d6ce957d178a54e52af80a56842ca';
const spotifyApi = new SpotifyWebApi({
    clientId: 'c1aaaf0b45494d7fbc6252481d0c6b28',
    clientSecret: 'f3d6d95a5c7946a2ba70bb5b62feac1d'
});
spotifyApi.clientCredentialsGrant().then(data => {
    spotifyApi.setAccessToken(data.body['access_token'])
});
//Mostra página inicial
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/weather.html'));
});

//Confere se existem números em uma string
function hasNumber(string) {
    return /\d/.test(string);
}

//Remove acentos
function removeAccents(str) {
    const map = {
        'a': 'á|à|ã|â|À|Á|Ã|Â',
        'e': 'é|è|ê|É|È|Ê',
        'i': 'í|ì|î|Í|Ì|Î',
        'o': 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
        'u': 'ú|ù|û|ü|Ú|Ù|Û|Ü',
        'c': 'ç|Ç',
        'n': 'ñ|Ñ'
    };
    for (let pattern in map) {
        str = str.replace(new RegExp(map[pattern], 'g'), pattern);
    }
    return str;
}

//Puxa dados do local na API do OpenWeatherMap
function getOpenWeatherData(url, _callback) {
    axios.get(url).then(response => {
        _callback(response.data)
    }).catch(function (error) {
        if (error.response) {
            _callback(error.response.status)
        }
    })
}

//Puxa faixas de alguma playlist com base na temperatura, usando a API do Spotify
function getPlaylist(weatherData, _callback) {
    const temperatura = weatherData.main.temp;
    const Offset = Math.floor(Math.random() * 50);
    const numFaixas = 10;

    let playlistID;
    if (temperatura > 30) {
        playlistID = '37i9dQZF1DX8a1tdzq5tbM'
    } else if (temperatura >= 15) {
        playlistID = '37i9dQZF1DX6aTaZa0K6VA'
    } else if (temperatura >= 10) {
        playlistID = '37i9dQZF1DWXRqgorJj26U'
    } else {
        playlistID = '37i9dQZF1DWWEJlAGA9gs0'
    }

    spotifyApi.getPlaylistTracks(playlistID, {limit: numFaixas, offset: Offset}, function (err, data) {
        const trackNames = [];
        for (let track in data.body.items) {
            trackNames.push(data.body.items[track].track.name)
        }
        _callback(trackNames)
    })
}

//Puxa local enviado pelo cliente, padroniza e redireciona ao resultado
app.post('/', function (req, res) {
    const textoDigitado = req.body.textoDigitado;
    if (hasNumber(textoDigitado)) {
        const coordenadas = textoDigitado.replace(" ", "").split(",");
        res.redirect('/result/?lat=' + coordenadas[0] + '&lon=' + coordenadas[1])
    } else {
        const cidade = removeAccents(textoDigitado);
        res.redirect('/result/?cidade=' + cidade)
    }
});
//Disponibiliza página com as faixas recomendadas
app.get('/result', function (req, res) {
    let url;
    if (req.query !== {}) {
        if (typeof req.query.cidade === 'undefined') {
            const lat = req.query.lat;
            const lon = req.query.lon;
            url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&mode=json&appid=${weatherAPIKey}`;
        } else {
            const cidade = req.query.cidade;
            url = `http://api.openweathermap.org/data/2.5/weather?q=${cidade}&units=metric&mode=json&appid=${weatherAPIKey}`;
        }
        getOpenWeatherData(url, function (data) {
            if (typeof data === 'number') {
                res.send(`Erro ${data}.<br/>Tente novamente.`)
            } else {
                getPlaylist(data, function (playlist) {
                    res.send(playlist)
                })
            }
        })
    }
});
//Inicia o servidor
app.listen(3000);