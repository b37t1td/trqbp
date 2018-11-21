/*********************************************************************************
* File Name     : lib/tagged.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 16:44]
* Last Modified : [2018-11-21 15:21]
* Description   :  
**********************************************************************************/

const assert = require('assert');
const request = require('request-promise-native');
const SocksProxyAgent = require('socks-proxy-agent');
const cherio = require('cherio');

const Runner = require('./runner');

const { defaultAgent } = require('./defaults');
const { assign } = Object;

const prices = require('../tools/prices');

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

    this.runners = [];
  }

  petRuns() {
    return {
      petRuns: this.runners.map((r) =>  {
        if (r.stop) {
          this.remove(r.id);
        }
        return assign({id : r.id}, r.stats);
      })
    };
  }

  remove(id) {
    for (let idx = 0; idx < this.runners.length; idx++) {
      if (this.runners[idx].id === id) {
        this.runners[idx].stop = true;
        this.runners.splice(idx, 1);
        break;
      }
    }
  }

  run(id, price) {
    assert(this.runners.length < 7, 'Too much runners');

    for (let runner of this.runners) {
      if (runner.id === id) {
        console.log('Already exists', id);
        return;
      }
      if (runner.stop) {
        this.remove(runner.id);
      }
    }

    let runner = new Runner({
      id,
      price: prices[price],
      bot: this,
      onostop: () => { this.remove(id) }
    });

    runner.stats.price = price;
    this.runners.push(runner);

    try {
      runner.upup();
    } catch(e) {
      console.log(e);
      this.remove(id);
    }
  }

  getOpts(o) {
    return assign({ agent: this.agent }, o, this.reqOpt);
  }

  async request(form) {
    let opt = this.getOpts(assign({
      uri: 'http://www.tagged.com/api/?application_id=user&format=JSON'},
      { form }));

    try {
      return JSON.parse(await request.post(opt));
    } catch(e) {
      console.log(e);
      assert(false, e);
    }
  }

  async news(opt = {}) {
    const req = {
      method: 'tagged.apps.pets.getNewsForUser',
      page_num: opt.page_num || 0,
      num_events: opt.num_events || 10,
      return_as_html: false,
      uid_of_page: opt.id
    };

    try {
      return await this.request(req);
    } catch(e) {
      assert(false, e);
    }
  }

  async wishList(opt = {}) {
    const req = {
      method: 'tagged.apps.pets.getList',
      type_of_list: opt.type_of_list || 'wish', // wishers
      page_num: opt.page_num || 0,
      num_items: opt.num_items || 10
    };

    try {
      return await this.request(req);
    } catch(e) {
      assert(false, e);
    }
  }

  async petInfo(pet_id) {
    assert(!!pet_id, 'pet_id could not be empty');

    const req = {
      method: 'tagged.apps.pets.getPetAndOwnerInfo',
      pet_id
    }

    try {
      let pet = (await this.request(req)).results.pet;
      pet.price = pet.value;

      return pet;
    } catch(e) {
      assert(false, e);
    }
  }

  async getPets2(opt = {}) {
    const req = {
      method: 'tagged.apps.pets.buyback.getPets2',
      offset: opt.offset || 0,
      page_num: opt.page_num || 0,
      num_results: opt.num_results || 10
    }

    try {
      return await this.request(req);
    } catch(e) {
      assert(false, e);
    }
  }

  async myId() {
    try {
      let res = await this.getPets2({ num_results: 1 });
      return res.result.user_id;
    } catch(e) {
      assert(false, e);
    }
  }

  async buy(pet) {
    assert((pet && pet.userId && pet.purchase_token && pet.ownerId), 'Invalid pet');
    assert((pet.isValid && !pet.isBlocked && !pet.deleted), 'Server said pet is invalid');

    const req = {
      method: 'tagged.apps.pets.buyPetAsync',
      api_signature: '',
      userid_to_buy: pet.userId,
      displayed_owner_id: pet.ownerId,
      purchase_token: pet.purchase_token,
      page_type: 'browse',
      pet_price: pet.value,
      one_click: 0,
      source: 'web'
    };

    try {
      let res = await this.request(req);

      if (res.results) {
        res = res.results;
      } else if (res.error) {
        res = res.error;
      }

      return res;
    } catch(e) {
      assert(false, e);
    }
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
