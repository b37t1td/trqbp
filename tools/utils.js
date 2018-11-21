/*********************************************************************************
* File Name     : tools/utils.js
* Created By    : Svetlana Linuxenko, <svetlana@linuxenko.pro>, www.linuxenko.pro
* Creation Date : [2018-11-20 15:44]
* Last Modified : [2018-11-22 01:22]
* Description   :  
**********************************************************************************/

module.exports.trim = function(text) {
  return text.replace(/\s/gi, '');
}

module.exports.sleep = function (millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

