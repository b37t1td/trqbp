/*********************************************************************************
* File Name     : lib/remote.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-21 01:54]
* Last Modified : [2018-11-21 01:55]
* Description   :  
**********************************************************************************/

const WebSocket = require('ws');

class Remote {
  constructor(url, callback) {
    this.tmp = [];
    this.clients = [];
    this.url = url;
    this.callback = callback;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = this.onmessage.bind(this);
    this.ws.onclose = () => {
      this.ws = null
      setTimeout(this.connect.bind(this), 1000);
    }
  }

  onmessage(ev) {
    let data = JSON.parse(ev.data);
    this.callback(data);
  }

  send(data) {
    if (this.ws && this.ws.readyState === 1) {
      this.ws.send(JSON.stringify(data));
    } else {
      setTimeout(function() {
        this.send(data);
      }.bind(this), 1000);
    }
  }
}

module.exports = Remote;
