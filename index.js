require('https').createServer().listen(process.env.PORT || 5000).on('request', function(req, res){
  res.end('')
});

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// replace the value below with the Telegram token you receive from @BotFather
const token = '1723140864:AAGZMlFiJTSZqEc1wIH6LIt8ZUP2lKSmHsU';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const servicesRegex = [
  /music.apple.com/,
  /music.yandex.com/,
  /open.spotify.com/,
  /youtube.com/
]

const services = [
  {
    title: "Spotify",
    name: 'spotify'
  },
  {
    title: "Apple Music",
    name: 'itunes'
  },
  {
    title: "YouTube",
    name: 'youtube'
  },
  {
    title: "Yandex Music",
    name: 'yandex'
  },
]

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (servicesRegex.some(regex => regex.test(msg.text))) {   
    axios.post('https://songwhip.com/api/create', {
      country: "RU",
      url: msg.text
    })
      .then(res => {
        const allLinks = res.data.data.links;
        const links = [];

        services.forEach(service => {
          if (allLinks[service.name]) {
            links.push({
              name: service.title,
              url: service.name === 'itunes' ? allLinks.itunes[0].link.replace('{country}', 'ru'): allLinks[service.name][0].link,
            })
          }
        })

        const artist = `${res.data.data.artists[0].name} – <b>${res.data.data.name}</b>`;
        const urls = links.reduce((acc, link) => acc + `<a href='${link.url}'>${link.name}</a>\n`, '');
        const message = artist + "\n" + urls;

        bot.sendMessage(chatId, message, {parse_mode: "HTML", disable_web_page_preview: true});
      })
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log('error.response.data:', error.response.data);
          console.log('error.response.status:', error.response.status);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log('error.request: ', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
      });
  }
});