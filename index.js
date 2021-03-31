const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TOKEN = process.env.APP_URL;

const options = {
  webHook: {
    port: process.env.PORT
  }
};

const url = process.env.APP_URL;

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

function sendSong(chatId, pic, artist, songName, links) {
  bot.sendPhoto(
    chatId,
    pic,
    {
      reply_markup: {
        inline_keyboard: links.map(link => ([{ text: link.name, url: link.url}]))
      },
      parse_mode: "HTML",
      caption: `${artist} — <b>${songName}</b>`
    }
  );   
}

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
        const data = res.data.data;
        const img = data.image;
        const artist = data.artists[0].name;
        const song = data.name;

        services.forEach(service => {
          if (allLinks[service.name]) {
            links.push({
              name: service.title,
              url: service.name === 'itunes' ? allLinks.itunes[0].link.replace('{country}', 'ru'): allLinks[service.name][0].link,
            })
          }
        })

        sendSong(chatId, img, artist, song, links);
      })
      .catch(function (error) {
        if (error.response) {
          console.log('error.response.data:', error.response.data);
        } else if (error.request) {
          console.log('error.request: ', error.request);
        } else {
          console.log('Error', error.message);
        }
      });
  }
});





