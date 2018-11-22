/*********************************************************************************
* File Name     : index.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 15:24]
* Last Modified : [2018-11-23 01:39]
* Description   :  
**********************************************************************************/

require('dotenv').config();
const EMAILS = process.env.EMAILS.split(',');
const PROXIES = process.env.PROXIES.split(',');

const { startInstance } = require('./lib/poll');
const Remote = require('./lib/remote');

(async function() {
  let bots = [];

  function findBot(id) {
    return bots.filter((b) => b.id === id)[0];
  }

  const remote = new Remote('wss://app-plqkqftgch.now.sh', function(data) {
    function remoteSync(bot) {
      process.nextTick(() => {
        remote.send({ type: 'force-pong', id: bot.id, stats: bot.petRuns(), state: true });
      });
    }

    if (data.type === 'share') {
      for (let bot of bots) {
        bot.run(String(data.id), data.price);
        remoteSync(bot);
       }
      return;
    }

    if (data.type === 'remove') {
      for (let bot of bots) {
        bot.remove(String(data.id));
        remoteSync(bot);
       }
      return;
    }

    if (data.type === 'ping') {
      process.nextTick(() => {
        for (let bot of bots) {
          remote.send({ type: 'pong', id: bot.id, stats: bot.petRuns() });
         }
      });
      return;
    }

    if (data.type === 'buy-remote') {
      let bot = findBot(data.client);
      if (bot) {
        bot.petInfo(data.pet).then(function(pet) {
          bot.buy(pet);
        });
        remoteSync(bot);
      }
      return;
    }

    if (data.type === 'run-remote') {
      let bot = findBot(data.client);
      if (bot) {
        try {
          bot.run(String(data.id), data.price);
          bot.myId();
        } catch(e) {
          console.log(e);
        }
        remoteSync(bot);
      }
      return;
    }

    if (data.type === 'remove-remote') {
      let bot = findBot(data.client);
      if (bot) {
        bot.remove(String(data.pet));
        remoteSync(bot);
      }
      return;
    }
  });

  try {
    for (let idx in EMAILS) {
      let bot = await startInstance(EMAILS[idx], PROXIES[idx]);
      bot.id = await bot.myId();
      bots.push(bot);
    }
  } catch(e) {
    console.log(e);
  }

  process.stdin.resume();
})();
