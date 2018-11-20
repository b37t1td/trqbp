/*********************************************************************************
* File Name     : lib/tagged.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 16:44]
* Last Modified : [2018-11-20 16:49]
* Description   :  
**********************************************************************************/

const request = require('request-promise');
const SocksProxyAgent = require('socks-proxy-agent');
const { defaultAgent } = require('./defaults');

const { assign } = Object;

module.exports = class Tagged {
  constructor(opts) {
    this.reqOpt = {
      headers: {
        'User-Agent': opts.ua || defaultAgent;
      }
    };

    if (opts.proxy) {
      this.reqOpt.agent = new SocksProxyAgent(opts.proxy);
    }
  }
}
