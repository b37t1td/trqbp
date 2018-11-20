/*********************************************************************************
* File Name     : lib/poll.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 23:37]
* Last Modified : [2018-11-20 23:42]
* Description   :  
**********************************************************************************/

const assert = require('assert');

const Storage = require('node-storage');
const db = new Storage(process.env.DB || __dirname + './data/db');
db.put('checkStore', true);
assert(db.get('checkStore'), 'Storage does not work');

const login = require('./login');
const Tagged = require('./tagged');

async function startInstance(email, proxy) {
  let cookie = db.get(`${email}.cookie`) || await login({ email, password: process.env.ALLPASS, proxy });
  db.put(`${email}.cookie`, cookie);

  let tagged = new Tagged({ proxy, cookie });
  let id = await tagged.myId();

  if (!id) {
    cookie = await login({ email, password: process.env.ALLPASS, proxy });
    db.put(`${email}.cookie`, cookie);
  } else if (process.env.DEBUG) {
    console.log('Logged in', email, 'via', proxy, 'id', id);
  }
}

module.exports.startInstance = startInstance;
