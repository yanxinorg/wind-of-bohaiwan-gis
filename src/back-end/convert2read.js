/**
 * Created by YiTing-003 on 2018/5/22.
 */
var Promise = require('promise');
var _ = require('underscore');
var turf = require('@turf/turf');

module.exports = function (array_data) {
  return new Promise(function (resolve, reject) {
    var turfPoints = [];
    var points = _.map(array_data, function(item){
      var a = item.s2n;
      var b = item.w2e;
      var c = Math.sqrt(Math.pow(a,2) + Math.pow(b,2));
      var asin_radian = Math.asin(a/c);
      var clock_radian = 0;

      if ( b >= 0 ) {
        clock_radian = -asin_radian;
      } else {
        clock_radian = Math.PI + asin_radian;
      }

      // if (asin_radian >= 0 ) {
      //   if ( b >= 0 ) {
      //     clock_radian = -asin_radian;
      //   } else {
      //     clock_radian = Math.PI + asin_radian;
      //   }
      // } else {
      //   if ( b >= 0 ) {
      //     clock_radian = -asin_radian;
      //   } else {
      //     clock_radian = Math.PI + asin_radian;
      //   }
      // }

      item.speed = c;
      item.radian = clock_radian;

      var turfPoint = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          // Note order: longitude, latitude.
          coordinates: [item.longitude, item.latitude]
        },
        properties: {
          speed: item.speed
        }
      };
      turfPoints.push(turfPoint);
      return item;
    });
    var breaks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    resolve({
      isolines: turf.isolines(turf.featureCollection(turfPoints), breaks, {zProperty: 'speed'}),
      points: points
    });
  });
};