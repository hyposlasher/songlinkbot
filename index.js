const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// replace the value below with the Telegram token you receive from @BotFather
const TOKEN = '1723140864:AAGZMlFiJTSZqEc1wIH6LIt8ZUP2lKSmHsU';

const options = {
  webHook: {
    // Port to which you should bind is assigned to $PORT variable
    // See: https://devcenter.heroku.com/articles/dynos#local-environment-variables
    port: process.env.PORT
    // you do NOT need to set up certificates since Heroku provides
    // the SSL certs already (https://<app-name>.herokuapp.com)
    // Also no need to pass IP because on Heroku you need to bind to 0.0.0.0
  }
};

const url = process.env.APP_URL || 'https://songlinkbot.herokuapp.com:443';

const bot = new TelegramBot(TOKEN, options);

bot.setWebHook(`${url}/bot${TOKEN}`);

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

bot.onText(/\/sendpic/, (msg) => {

  bot.sendPhoto(
    msg.chat.id,
    "https://is2-ssl.mzstatic.com/image/thumb/Music124/v4/3a/94/68/3a946811-6ab6-e0ec-1982-0b646534c35d/19UMGIM96748.rgb.jpg/1000x1000bb.jpeg",
    {
      caption: 
        `Tame Impala — One More Year | 5:24

        Album: The Slow Rush (2020)`
    }
  );   
});