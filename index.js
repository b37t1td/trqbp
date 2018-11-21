/*********************************************************************************
* File Name     : index.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 15:24]
* Last Modified : [2018-11-21 12:55]
* Description   :  
**********************************************************************************/

require('dotenv').config();
const { startInstance } = require('./lib/poll');
const Remote = require('./lib/remote');
const BigNumber = require('bignumber.js');

const LP = BigNumber('9146620701612724868483225687720398878210090213855');
const BP = BigNumber('9235568581687470146620701612724868483225687720398878210090213855');

const Storage = require('node-storage');
const db = new Storage(process.env.DB + '-polls');

function wids(data) {
  return data.results.pets.map(function(d) {
    return d.userId;
  });
}

function validate(e) {
  let pp = BigNumber(e.purchase_price);

  if (e.event_type === 3 && (new Date() - new Date(e.event_date * 1000)) < 2420000) {
    if (pp.isGreaterThan(LP) && pp.isLessThan(BP)) {
      return e.pet_id;
    }
  }
}

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

(async function() {
  let bots = [];
  const remote = new Remote('wss://app-plqkqftgch.now.sh', function(data) {
    if (data.type === 'pongs') {
      bots = data.pongs;
    }
  });

  try {
    let bot = await startInstance(process.env.EMAIL, process.env.PROXY);
    let wishes = wids(await bot.wishList({ num_items: 100 }));

    setInterval(async function() {
      wishes = wids(await bot.wishList({ num_items: 100 }));
    }, 200000);

    async function crawl() {
      for (let w of wishes) {
        let e = (await bot.news({ id: w, num_events: 1})).results.events_html[0];

        if (e) {
          let id = validate(e);
          if (id) {
            let uuid = id + '-' + w;
            if (!db.get(uuid)) {
              db.put(uuid, true);
              console.log('send', uuid);
              let b = bots[Math.floor(Math.random() * bots.length)];
              remote.send({ type: 'run-remote', client: b.id, id: Number(id), price: '10' });
            }
          }
        }
      }

     await sleep(7000);
     crawl();
    }

    crawl();

  } catch(e) {
    console.log(e);
  }

  process.stdin.resume();
})();
