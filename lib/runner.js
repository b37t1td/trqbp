/*********************************************************************************
* File Name     : lib/runner.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 23:46]
* Last Modified : [2018-11-21 01:52]
* Description   :  
**********************************************************************************/

const BigNumber = require('bignumber.js');
const assert = require('assert');

function newValue(val) {
  let o = BigNumber(val);
  let pre10 = o.dividedBy(100).times(10);
  return o.plus(pre10).toFixed(0);
}

class Runner {
  constructor(opt = {}) {
    assert(opt.bot && opt.id && opt.price, 'Missing options');

    this.stats = { fail: 0, rice: 0, price: '', buy: 0 };
    this.bot = opt.bot;
    this.id = opt.id;
    this.price = opt.price;
    this.delay = 0;

    this.onown = opt.onown || function() { this.stats.buy += 1 }.bind(this);
    this.onrace = opt.onrace || function(r) { this.stats.rice = r ; this.stats.fail += 1 }.bind(this);
    this.onstop = opt.onstop || function() {};
    this.oc = 0;
  }

  async buy(pet) {
    if (!this.stop && this.oc < 20 && BigNumber(pet.price).isLessThan(this.price)) {
      return this.runner(await this.bot.buy(pet));
    }

    this.stop = true;
    this.onstop();
  }

  async upup() {
    this.pet = await this.bot.petInfo(this.id);

    assert(this.pet, 'Server returns invalid pet');
    assert(this.pet.userId !== this.id, 'Pet id does not mach, how ??');

    if (!this.pet.purchase_token || this.pet.ownerId === this.bot.id) {
      this.oc += 1;
      return setTimeout(this.upup.bind(this), 1000);
    } else {
      await this.buy(this.pet);
    }
  }

  async runner(data) {
    this.pet.price = this.pet.value = newValue(this.pet.price);
    this.oc = 0;

    if (data.boughtPetOk || data.code === 121) { // Owner
//      console.log('owner');
      this.onown();
      return setTimeout(() => { this.upup(); }, 1000);
    } else if (data.petruninfo && data.petruninfo.timeRemaining) {
//      console.log('runrun');
//      console.log(data);
      let remain = Number(data.petruninfo.timeRemaining);
      let racers = Number(data.petruninfo.racerCount);

      if (racers > 10) {
        this.delay += 1;
      }

      setTimeout(() => this.buy(this.pet), remain - this.delay);
      this.onrace(racers);

    } else if (data.code === 105) {
      console.log('price_change');
      this.pet.price = this.pet.value = data.newValue;
      this.delay = 0;
      return this.buy(this.pet);
    } else {
      console.log('unhandled');
      console.log(data);
    }
  }
}

module.exports = Runner;
