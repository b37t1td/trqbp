/*********************************************************************************
* File Name     : lib/runner.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 23:46]
* Last Modified : [2018-11-22 14:37]
* Description   :  
**********************************************************************************/

const BigNumber = require('bignumber.js');
const assert = require('assert');

function extraExit(data) {
  const fs = require('fs');
  console.log(data);
  fs.unlinkSync(process.env.DB);
  process.exit(-1);
}

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

    this.onown = opt.onown || function() { this.stats.buy += 1; this.rstump(); }.bind(this);
    this.onrace = opt.onrace || function(r) { this.stats.rice = r ; this.stats.fail += 1; this.rstump(); }.bind(this);
    this.onstop = opt.onstop || function() { };
    this.oc = 0;
  }

  rstump() {
    this.stamp = new Date();
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
      return setTimeout(this.upup.bind(this), 1300);
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
      return setTimeout(() => { this.upup(); }, 1300);
    } else if (data.petruninfo) {
//      console.log('runrun');
//      console.log(data);
      let remain = Number(data.petruninfo.timeRemaining);
      let racers = Number(data.petruninfo.racerCount);

      if (this.delay < 40) {
        if (racers > 10) {
          this.delay += 10;
        } else {
          this.delay -= 2;
        }
      } else {
        this.delay = 5;
      }

      if (this.delay < 1) {
        this.delay = 1;
      }

//      if (this.stats.fail >= 110 && this.stats.buy === 0 && racers > 25) {
//        console.log('stopping', this.id, this.stats);
//        this.stop = true;
//        return;
//      }

      setTimeout(() => this.buy(this.pet), remain - this.delay);
      this.onrace(racers);
    } else if (data.code === 105) {
//      console.log('price_change');
      this.pet.price = this.pet.value = data.newValue;
      this.delay = 0;
      return this.buy(this.pet);
    } else if (data.code === 122) {
      console.log(data);
      this.stop = true;
      return;
    } else if (data.code === 101) { // service down ?? 
      console.log(data);
      return setTimeout(() => { this.upup(); }, 3000);
    } else if (data.stat === 'security') { // service down ?? 
      this.stop = true;
      return extraExit(data)

    } else {
      console.log('unhandled');
      console.log(data);
      this.stop = true;
    }
  }
}

module.exports = Runner;
