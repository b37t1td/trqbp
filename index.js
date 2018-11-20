/*********************************************************************************
* File Name     : index.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 15:24]
* Last Modified : [2018-11-20 16:45]
* Description   :  
**********************************************************************************/

const request = require('request-promise');
const cherio = require('cherio');
const SocksProxyAgent = require('socks-proxy-agent');
const { trim } = require('./tools/utils');

const PROXY = 'socks://127.0.0.1:9000';
const agent = new SocksProxyAgent(PROXY);
const PIP_URI = 'http://www.whoishostingthis.com/tools/user-agent/';

let opts = {
  agent,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0',
    'X-Requested-With': 'XMLHttpRequest'
  }
};

opts.url = PIP_URI;

(async function() {
  let $ = cherio.load(await request.get(opts), { normalizeWhitespace: true, });
  console.log(trim($('.info-box.ip').text()));
//  console.log(trim($('.info-box.user-agent').text()));
//  console.log(trim($('.screen-res').text()));

  let cookie = 'B=b=DA2BE4A7F59BBC2C&locale_cookie=en_US&remember_me=; _ga=GA1.2.1944660281.1536063691; G_ENABLED_IDPS=google; _gid=GA1.2.926165895.1537252582; __qca=P0-391567704-1538331239367; __gads=ID=569a20580ae5ae15:T=1538331240:S=ALNI_Mb1QsV4QQy6cMXjSWQaTmy59zldUw; __zlcmid=p6hkXaUVGXdrtu; S=da7bpausk7gh651tmlbaif9t3i; _fbp=fb.1.1542721966189.1607749566; L=112jhZOEI15p.1rZ16P.5Fzzvq; message_center_state=6065895386&6069458943&10567633_0&17601637_0&6069458943_0&6024717696_0&5423872030_0&6036615650_0&5459858243_0&6047626846_0&7349852082_0&5440935990_0&6037964797_0&6009449532_0&6042932704_0&5979864039_0&6005401537_0';
  opts.url = 'http://www.tagged.com/api/?application_id=user&format=JSON';
//  opts.url = 'https://request.urih.com/';
  opts.headers.Cookie = cookie;
//  opts.form = { method: 'tagged.apps.pets.getPetAndOwnerInfo' };
  opts.form = { method: 'tagged.apps.pets.getList', type_of_list: 'wish', page_num: 0, num_items: 2 };
  console.log(await request.post(opts));
//  $ = cherio.load(await request.post(opts), { normalizeWhitespace: true });

//  console.log($('#content .tbw .rht tr').map(function() { return $(this).text() }).get().join('\n'));

})();
