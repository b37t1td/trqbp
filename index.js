/*********************************************************************************
* File Name     : index.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 15:24]
* Last Modified : [2018-11-22 12:56]
* Description   :  
**********************************************************************************/

require('dotenv').config();
const { startInstance } = require('./lib/poll');
const Remote = require('./lib/remote');
const BigNumber = require('bignumber.js');
const prices = require('./tools/prices');

const LP = BigNumber(process.env.LOWPRICE);
const BP = BigNumber(prices[process.env.MAXPRICE]);

const Storage = require('node-storage');
const db = new Storage(process.env.DB + '-polls');

function wids(data) {
  return data.results.pets.map(function(d) {
    return d.userId;
  });
}

const MTIME = (3600 * (Number(process.env.MTIME) || 5)) * 1000;

async function validate(e, bot) {
  try {
    let pp = BigNumber(e.purchase_price);

    if (e.event_type !== 3 ||
      (new Date() - new Date(e.event_date * 1000)) > 820000 ||
      !pp.isGreaterThan(LP) ||
      !pp.isLessThan(BP)) {
        return;
    }

    let pet =  await bot.petInfo(e.pet_id);
    pp = BigNumber(pet.price);

    if (pet.lockTime !== 0 ||
      pet.gender !== 'F' ||
      pet.displayName.length < 3 ||
      pet.isValid !== true ||
      pet.petsPurchased < 3 ||
      !pp.isGreaterThan(LP) ||
      !pp.isLessThan(BP)    ||
      (new Date() - new Date(pet.last_purchase_time * 1000) > MTIME) ||
      (new Date() - new Date(pet.lastTraded * 1000) > MTIME) ||
      (new Date() - new Date(pet.lastActiveTime * 1000) > MTIME) ||
      !pet.purchase_token) {
      return;
    }

    return e.pet_id;

  } catch(e) {
    console.log(e);
  }
}

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

(async function() {
  let bots = [];
  const remote = new Remote('wss://app-plqkqftgch.now.sh', function(data) {
    if (data.type === 'pongs') {
      bots = data.pongs.map(function(p) {
        p.n = p.stats.petRuns.length;
        return p;
      }).sort(function(a,b) {
        return a.n - b.n;
      });
    }
  });

  try {
    let bot = await startInstance(process.env.EMAIL, process.env.PROXY);
    let wishes = wids(await bot.wishList({ num_items: 100 }));

    setInterval(async function() {
      wishes = wids(await bot.wishList({ num_items: 100 }));
    }, 600000);

    async function crawl() {
      let cache = [];
      let count = 0;
      for (let w of wishes) {
        count += 1;

        if (count > 10) {
          count = 0;
          await sleep(1000);
        }

        bot.news({ id: w, num_events: 6}).then(async function(res) {
          let events = res.results.events_html;

          for (let e of events) {
            if (e && e.pet_id && cache.indexOf(e.pet_id) === -1) {
              cache.push(e.pet_id);

              let id = await validate(e, bot);
              if (id) {
                if (bots[0]) {
                  let b = bots[0];
                  let uuid = id + '-' + b.id;

                  if (!db.get(uuid)) {
                    console.log('send', uuid);
                    remote.send({ type: 'run-remote', client: b.id, id: Number(id), price: process.env.MAXPRICE });

                    if (bots[1]) {
                      remote.send({ type: 'run-remote', client: bots[1].id, id: Number(id), price: process.env.MAXPRICE });
                    }

                    if (bots[2]) {
                      remote.send({ type: 'run-remote', client: bots[2].id, id: Number(id), price: process.env.MAXPRICE });
                    }
                    db.put(uuid, true);
                  }
                }
              }
            }
          }
        });
      }

     await sleep(Number(process.env.FDELAY) || 30000);
     crawl();
    }

    crawl();

  } catch(e) {
    console.log(e);
  }

  process.stdin.resume();
})();
