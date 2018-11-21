/*********************************************************************************
* File Name     : lib/login.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 21:12]
* Last Modified : [2018-11-22 01:43]
* Description   :  
**********************************************************************************/
const assert = require('assert');
const trp = require('request');
const request = require('request-promise-native');
const SocksProxyAgent = require('socks-proxy-agent');
const cherio = require('cherio');

const { defaultAgent } = require('./defaults');

module.exports = async function(opt = {}) {
  assert((opt.email && opt.password), 'Missing login arguments');

  let jar = trp.jar();
  let options = {
    uri: 'https://secure.tagged.com/secure_login.html?ver=2&loc=en_US&uri=http%3A%2F%2Fwww.tagged.com',
    jar,
    headers: {
      'User-Agent': opt.ua || defaultAgent(),
      'Referer': 'http://www.tagged.com/',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    timeout: 2000,
    followAllRedirects: true,
    form: {
      name: 'login',
      username: opt.email,
      password: opt.password
    },
  };

  if (opt.proxy) {
    options.agent = new SocksProxyAgent(opt.proxy);
  }

  try {
    if (process.env.DEBUG) {
      console.log('Login credentials for ', opt.email);
      let old = options.uri;
      options.uri = 'https://www.hashemian.com/whoami/';
      let $ = cherio.load(await request(options));

      console.log($('.wrapit pre').text().split('\n').filter((l) => {
        if (l.match(/^HTTP_/) || l.match(/^REMOTE/)) {
          return l;
        }
      }).join('\n'));

      options.uri = old;
    }

    $ = cherio.load(await request(options));
    $('input').map(function() {
      let name = $(this).attr('name');
      if (!options.form[name] && name) {
        options.form[name] = $(this).attr('value');
      }
    });

    await request.post(options);
    const cookie = jar.getCookieString('http://www.tagged.com/apps/pets.html?dataSource=Pets&ll=nav');

    if (process.env.DEBUG) {
      console.log('Received cookie: ', cookie);
    }

    return cookie;
  } catch(e) {
    assert(e);
  }
}
