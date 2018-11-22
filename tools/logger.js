/*********************************************************************************
* File Name     : tools/logger.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-22 13:43]
* Last Modified : [2018-11-22 18:50]
* Description   :  
**********************************************************************************/

const mongoose = require('mongoose');
const { assign } = Object;
let dbInstance;

const Pong = mongoose.model('Pong', new mongoose.Schema({
  bot: Number,
  pet: Number,
  fail: Number,
  rice: Number,
  price: Number,
  buy: Number,
  n: Number,
  created: Date
}));

const Share = mongoose.model('Share', new mongoose.Schema({
  id: Number,
  donor: Number,
  created: Date
}));

const Event = mongoose.model('Event', new mongoose.Schema({
  id: Number,
  owner_id: Number,
  pet_id: Number,
  purchase_price: String,
  earned_amount: String,
  profit_amount: String,
  event_date: Number,
  event_type: Number,
  current_owner_id: Number
}));

async function instance() {
  try {
    if (!dbInstance) {
      await mongoose.connect(process.env.MONGO, { useNewUrlParser: true });
      dbInstance = mongoose.connection;
    }
  } catch(e) {
    console.log(e);
    return await instance();
  }

  return dbInstance;
}

async function logShare(data) {
  try {
    let share = new Share(assign(data, { created: new Date() }));
    await share.save();
  } catch(e) {
    console.log(e);
  }
}

let lastPong = 0;

async function logPongs(data) {
  // Log every N pong
  if (lastPong >= 3) {
    try {
      let date = new Date();
      for (let p of data) {
        if (!p.id) continue;
        for (let r of p.stats.petRuns) {
          if (!r) continue;
          await Pong.findOne({ bot: p.id, pet: r.id }).remove();

          let pong = new Pong({
            bot: p.id,
            pet: r.id,
            fail: r.fail,
            rice: r.rice,
            price: r.price,
            buy: r.buy,
            n: p.n,
            created: date
          });

          await pong.save();
         }
      }
    } catch(e) {
      console.log(e);
    }
    lastPong = 0;
  }

  lastPong += 1;
}

let lastEvent = 0;

async function logBotEvents(bot, id) {
  try {
    let news = (await bot.news({ id, num_events: 8 })).results.events_html;

    for (let n of news) {
      if (n.event_type === 1 || n.event_type === 0 || n.event_type === 3) {
        if (!await Event.findOne({ id, event_type: n.event_type, event_date: n.event_date })) {
          n.id = id;
          let event = new Event(n);
          await event.save();
        }
      }
    }
  } catch(e) {
    console.log(e);
  }
}

async function logEvents(data) {
  try {
    if (lastEvent >= 30) {
      let bot = data.bot;
      let bots = data.bots

      for (let b of bots) {
        await logBotEvents(bot, b.id);
      }

      lastEvent = 0;
    }
  } catch(e) {
    console.log(e);
  }

  lastEvent += 1;
}

module.exports = async function(scope, data) {
  let db;
  try {
    db = await instance();
  } catch(e) {
    console.log(e);
    return;
  }

  switch(scope) {
    case 'pongs':
      await logPongs(data);
      break;
    case 'share':
      await logShare(data);
      break;
   case 'events':
      await logEvents(data);
      break;
  }
}
