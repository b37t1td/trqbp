/*********************************************************************************
* File Name     : lib/defaults.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 16:48]
* Last Modified : [2018-11-20 19:17]
* Description   :  
**********************************************************************************/

const UserAgent = require('user-agents');

module.exports.defaultAgent = function() {
    return new UserAgent({ platform: 'Win32' }).toString();
}
