/*********************************************************************************
* File Name     : lib/tagged.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 16:44]
* Last Modified : [2018-11-20 19:41]
* Description   :  
**********************************************************************************/

const request = require('request-promise-native');
const SocksProxyAgent = require('socks-proxy-agent');
const cherio = require('cherio');

const { defaultAgent } = require('./defaults');
const { assign } = Object;

module.exports = class Tagged {
  constructor(opts) {
    this.reqOpt = {
      headers: {
        'User-Agent': opts.ua || defaultAgent(),
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'http://www.tagged.com/apps/pets.html?dataSource=Pets&ll=nav',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept': 'application/json, text/javascript, */*; q=0.01'
      }
    };

    if (opts.cookie) {
      this.reqOpt.headers.Cookie = opts.cookie;
    }

    if (opts.proxy) {
      this.agent = new SocksProxyAgent(opts.proxy);
    }
  }

  getOpts(o) {
    return assign({ agent: this.agent }, o, this.reqOpt);
  }

  async request(form) {
    let opt = this.getOpts(assign({
      uri: 'http://www.tagged.com/api/?application_id=user&format=JSON'},
      { form }));

    return await request.post(opt);
  }

  async wishList(num) {
    const req = {
      method: 'tagged.apps.pets.getList',
      type_of_list: 'wish',
      page_num: 0,
      num_items: num || 100
    };

    return JSON.parse(await this.request(req));
  }

  async pip() {
    let opts = this.getOpts({ uri: 'https://www.hashemian.com/whoami/' });
    let $ = cherio.load(await request(opts));
    return $('.wrapit pre').text().split('\n').filter((l) => {
      if (l.match(/^HTTP_/) || l.match(/^REMOTE/)) {
        return l;
      }
    }).join('\n');
  }
}
