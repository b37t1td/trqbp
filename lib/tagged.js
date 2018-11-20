/*********************************************************************************
* File Name     : lib/tagged.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 16:44]
* Last Modified : [2018-11-20 19:04]
* Description   :  
**********************************************************************************/

const request = require('request-promise-native');
const SocksProxyAgent = require('socks-proxy-agent');
const cherio = require('cherio');

const { defaultAgent } = require('./defaults');
const { trim } = require('../tools/utils');
const { assign } = Object;

module.exports = class Tagged {
  constructor(opts) {
    this.reqOpt = {
      headers: {
        'User-Agent': opts.ua || defaultAgent
      }
    };

    if (opts.proxy) {
      this.agent = new SocksProxyAgent(opts.proxy);
    }
  }

  getOpts(o) {
    return assign({ agent: this.agent }, o, this.reqOpt);
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
