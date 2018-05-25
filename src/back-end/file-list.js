/**
 * Created by YiTing-003 on 2018/5/25.
 */
var Promise = require('promise');
var filewalk = require('rs-filewalk');
var _ = require('underscore');
var MD5 = require("crypto-js/md5");
var clone = require('clone');

module.exports = function (file_path) {
  return new Promise(function (resolve, reject) {
    var startTimeStamp = 1484755200000;
    var index = 1;
    var tmp = filewalk(file_path);
    var fileIndex = {};
    var fileList = _.map(tmp, function(item){
      item.md5 = MD5(item.folder + item.file).toString();
      item.timestamp = startTimeStamp + (index++) * 86400000;
      fileIndex[item.md5] = clone(item);
      delete item.folder;
      delete item.base;
      return item;
    });
    resolve({
      fileIndex: fileIndex,
      fileList: fileList
    });
  });
};

