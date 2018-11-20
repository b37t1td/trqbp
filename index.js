/*********************************************************************************
* File Name     : index.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 15:24]
* Last Modified : [2018-11-20 18:46]
* Description   :  
**********************************************************************************/

const Tagged = require('./lib/tagged');

(async function() {
  const proxy = 'socks5://127.0.0.1:9000';
  let tagged = new Tagged({ proxy });

  console.log(`Starting from: ${(await tagged.pip())}`);

})();
