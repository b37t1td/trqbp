/*********************************************************************************
* File Name     : index.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 15:24]
* Last Modified : [2018-11-20 23:42]
* Description   :  
**********************************************************************************/

require('dotenv').config();
const EMAILS = process.env.EMAILS.split(',');
const PROXIES = process.env.PROXIES.split(',');

const { startInstance } = require('./lib/poll');

(async function() {
  let bots = [];

  try {
    for (let idx in EMAILS) {
      bots.push(startInstance(EMAILS[idx], PROXIES[idx]));
    }

    await Promise.all(bots);
  } catch(e) {
    console.log(e);
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
