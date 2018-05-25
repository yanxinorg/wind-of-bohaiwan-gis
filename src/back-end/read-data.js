/**
 * Created by YiTing-003 on 2018/5/22.
 */
var path = require('path');
var fs = require('fs');
var readline = require('linebyline');
var Promise = require('promise');

module.exports = function (file_path) {
  var ret_data = [];
  return new Promise(function (resolve, reject) {
    var rl = readline(file_path);
    rl.on('line', function(line, lineCount, byteCount) {
      var data = line.split(/\s+/g);
      ret_data.push({
        latitude: parseFloat(data[0]), //维度
        longitude: parseFloat(data[1]), //经度
        s2n: data[2], //从南到北
        w2e: data[3] //从西到东
      });
    }).on('error', function(e){
      reject(e);
    }).on('close', function(){
      resolve(ret_data);
    });
  });
};