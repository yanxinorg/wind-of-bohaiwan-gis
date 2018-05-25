/**
 * Created by YiTing-003 on 2018/5/22.
 */
var express = require('express');
var proxy = require('http-proxy-middleware');
var path = require('path');
var appRoot = require('app-root-path');
var app = express();
var dataPromise = require('./read-data');
var convertPromise = require('./convert2read');
var fileListPromise = require('./file-list');
var FILE_LIST_CACHE = null;

// var filePath = path.join(appRoot.path,'/data' + '/渤海湾风场预报/g000.txt');
// dataPromise(filePath)
//   .then(function (data) {
//     console.log(data);
//   }).catch(function (reason) {
//     console.log(reason);
//   });

// // proxy middleware options
// var options = {
//   target: 'http://www.example.org', // target host
//   changeOrigin: true,               // needed for virtual hosted sites
//   ws: true,                         // proxy websockets
//   pathRewrite: {
//     '^/api/old-path' : '/api/new-path',     // rewrite path
//     '^/api/remove/path' : '/path'           // remove base path
//   },
//   router: {
//     // when request.headers.host == 'dev.localhost:3000',
//     // override target 'http://www.example.org' to 'http://localhost:8000'
//     'dev.localhost:3000' : 'http://localhost:8000'
//   }
// };
//
// // create the proxy (without context)
// var exampleProxy = proxy(options);
//
// // mount `exampleProxy` in web server
// app.use('/api', exampleProxy);

app.use(express.static(path.join(appRoot.path,'/src/front-end')));

app.get('/file/:filemd5',function (req,res,next) {
  var fileObj = FILE_LIST_CACHE[req.params.filemd5];
  console.log(fileObj);
  var filePath = fileObj.folder + '\\\\' + fileObj.file;
  dataPromise(filePath)
    .then(function (data) {
      return convertPromise(data);
    })
    .then(function (data) {
      res.json({
        status:0,
        message: 'ok',
        data: data
      });
    })
    .catch(function (reason) {
      res.json({
        status:-1,
        message: 'error',
        data: reason
      });
  });
});

app.get('/filelist',function (req,res,next) {
  var filePath = path.join(appRoot.path,'/data/');
  fileListPromise(filePath)
    .then(function (data) {
      FILE_LIST_CACHE = data.fileIndex;
      res.json({
        status:0,
        message: 'ok',
        data: data.fileList
      });
    })
    .catch(function (reason) {
      res.json({
        status:-1,
        message: 'error',
        data: reason
      });
    });
});

app.listen(3000,function () {
  console.log('!!!!!!!!!server is here!!!!!!!!!!');
});