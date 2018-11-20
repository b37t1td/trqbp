/*********************************************************************************
* File Name     : index.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 15:24]
* Last Modified : [2018-11-20 22:56]
* Description   :  
**********************************************************************************/

require('dotenv').config();
const EMAILS = process.env.EMAILS.split(',');
const PROXIES = process.env.PROXIES.split(',');

const assert = require('assert');

const Storage = require('node-storage');
const db = new Storage(process.env.DB || __dirname + './data/db');
db.put('checkStore', true);
assert(db.get('checkStore'), 'Storage does not work');

const Tagged = require('./lib/tagged');
const login = require('./lib/login');

async function startSession(email, proxy) {
}

(async function() {

  for (let idx in EMAILS) {
    let email = EMAILS[idx];
    let proxy = PROXIES[idx];
    let cookie = db.get(`${email}.cookie`) || await login({ email, password: process.env.ALLPASS, proxy });
    let tagged = new Tagged({ proxy, cookie });
    let id = await tagged.myId();

    if (id) {
      if (process.env.DEBUG) {
        console.log('Successfully logged in by ', id);
       }
    } else {
      cookie = await login({ email, password: process.env.ALLPASS, proxy });
    }

    db.put(`${email}.cookie`, cookie);
  }

//  let tagged = new Tagged({ proxy, cookie });
 

//  try {
//    console.log(await login({
//      email: 'julia.r12@gmail.su',
//      password: 'lnYZbc6B4taWj9Cd',
//      proxy
//    }));
//    console.log(await tagged.petInfo('5458689216'));
//    console.log((await tagged.getPets2()));
//   let petId = '6066301549';
//   let pet = (await tagged.petInfo(petId)).results.pet; 
//   console.log(await tagged.buy(pet));
//  } catch(e) {
//    console.log(e);
//  }
//  console.log(await tagged.wishList());
//  console.log(await tagged.pip());
  //
//  fs.writeFileSync('/tmp/rr.json', await tagged.wishList());
//  let json = fs.readFileSync('/tmp/rr.json', 'utf-8');

//  json = json.replace(/\\/gi, '');

//  console.log(JSON.parse(json).results.pets) ;

})();
