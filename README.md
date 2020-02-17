# W E A T H I F Y #

Micro-serviço que recebe requisições HTTP no formato REST, tendo como parâmetros o nome de uma cidade ("Belo Horizonte") ou uma combinação de latitude e longitude ("-19.973, -43.944") e retorna uma sugestão de playlist (array com o título de 10 músicas) de acordo com a temperatura atual da cidade.


![Página inicial](https://i.imgur.com/AXHw912.png)


**Regras de negócio**
- \>30° C = Festa
- ≥15° e <30° C = Pop
- ≥10° e <15° C = Rock
- <10° C = Clássica

**Observações:**
- Construído utilizando Node.js.
- Utiliza API do Spotify e OpenWeatherMap.

**Créditos:**
Ewerton Evangelista de Souza

Belo Horizonte, 17 de Fevereiro de 2020
