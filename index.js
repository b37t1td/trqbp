/*********************************************************************************
* File Name     : index.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 15:24]
* Last Modified : [2018-11-20 20:23]
* Description   :  
**********************************************************************************/

const Tagged = require('./lib/tagged');
const cookie = 'B=b=DA2BE4A7F59BBC2C&locale_cookie=en_US&remember_me=; _ga=GA1.2.1944660281.1536063691; G_ENABLED_IDPS=google; _gid=GA1.2.926165895.1537252582; __qca=P0-391567704-1538331239367; __gads=ID=569a20580ae5ae15:T=1538331240:S=ALNI_Mb1QsV4QQy6cMXjSWQaTmy59zldUw; __zlcmid=p6hkXaUVGXdrtu; S=n509p8jajf19a36gbajot64kbh; L=3iUAXEFn9MET.1rZ27s.5Fzzvq; _gat_UA-1982760-1=1';

const fs = require('fs');

(async function() {
  const proxy = 'socks5://127.0.0.1:9000';
  let tagged = new Tagged({ proxy, cookie });

  try {
//    console.log(await tagged.petInfo('5458689216'));
//    console.log((await tagged.getPets2()));
    console.log(await tagged.myId());
  } catch(e) {
    console.log(e);
  }
//  console.log(await tagged.wishList());
//  console.log(await tagged.pip());
  //
//  fs.writeFileSync('/tmp/rr.json', await tagged.wishList());
//  let json = fs.readFileSync('/tmp/rr.json', 'utf-8');

//  json = json.replace(/\\/gi, '');

//  console.log(JSON.parse(json).results.pets) ;

})();
