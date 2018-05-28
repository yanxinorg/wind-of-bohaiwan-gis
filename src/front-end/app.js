(function init() {
  initMap();
  initTimeLine();
})();

function initMap() {

  var projection = new ol.proj.Projection({
    code: 'EPSG:4326',
    units: 'degrees'
  });

  var osmlayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    })
  })

  //天地图卫星地图
  var tian_di_tu_satellite_layer = new ol.layer.Tile({
    title: "天地图卫星影像",
    source: new ol.source.XYZ({
      url: 'http://t0.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}'
    })
  });

  //高德地图
  var gaodeLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
    })
  });

  // google地图层
  var googleMapLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      // url:'http://ditu.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i345013117!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0'
      // url:'http://ditu.google.cn/maps/vt/?pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i345013117!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0'
      url: 'http://www.google.cn/maps/vt?lyrs=s@800&gl=cn&x={x}&y={y}&z={z}'
    })
  });

  //初始化鼠标位置控件
  var mousePositionControl = new ol.control.MousePosition({
    //样式类名称
    className: 'mosuePosition',
    //投影坐标格式，显示小数点后边多少位
    coordinateFormat: ol.coordinate.createStringXY(8),
    //指定投影
    projection: projection
  });

  window.map = new ol.Map({
    target: 'map',
    layers: [googleMapLayer],
    view: new ol.View({
      zoom: 7,
      center: ol.proj.transform([119.6903, 38.8853], 'EPSG:4326', 'EPSG:3857')
    })
  });

  //将鼠标位置坐标控件加入到map中
  window.map.addControl(mousePositionControl);

  //--------------------------------------------
  var vectorSource = new ol.source.Vector({
    features: [] //add an array of features
  });
  window.vectorLayer = new ol.layer.Vector({
    source: vectorSource
  });
  window.map.addLayer(vectorLayer);
  //---------------------------------------------


  //---------------------------------------------
  var geojsonSource = new ol.source.Vector({
    features: []
  });


// convert #hex notation to rgb array
  var parseColor = function (hexStr) {
    return hexStr.length === 4 ? hexStr.substr(1).split('').map(function (s) { return 0x11 * parseInt(s, 16); }) : [hexStr.substr(1, 2), hexStr.substr(3, 2), hexStr.substr(5, 2)].map(function (s) { return parseInt(s, 16); })
  };

// zero-pad 1 digit to 2
  var pad = function (s) {
    return (s.length === 1) ? '0' + s : s;
  };

  var gradientColors = function (start, end, steps, gamma) {
    var i, j, ms, me, output = [], so = [];
    gamma = gamma || 1;
    var normalize = function (channel) {
      return Math.pow(channel / 255, gamma);
    };
    start = parseColor(start).map(normalize);
    end = parseColor(end).map(normalize);
    for (i = 0; i < steps; i++) {
      ms = i / (steps - 1);
      me = 1 - ms;
      for (j = 0; j < 3; j++) {
        so[j] = pad(Math.round(Math.pow(start[j] * me + end[j] * ms, 1 / gamma) * 255).toString(16));
      }
      output.push('#' + so.join(''));
    }
    return output;
  };

  corlorArray = gradientColors('#b2f2b2', '#f90c00', 20, 2.2);

  window.geojsonVectorLayer = new ol.layer.Vector({ //初始化矢量图层
    source: geojsonSource,
    style: function (feature, resolution) {

      // var styles = {
      //   'MultiLineString': new ol.style.Style({
      //     stroke: new ol.style.Stroke({
      //       color: highAlpColor,
      //       width: 3
      //     })
      //   })
      // };

      return new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: corlorArray[feature.values_.speed],
          width: 3
        })
      });
    }
  });
  window.map.addLayer(geojsonVectorLayer);
  //---------------------------------------------

  // getData();
}

function getData(filemd5) {
  $.get("/file/" + filemd5, null, function (result) {
    if (0 === result.status) {
      var iconFeatures = [];
      $.each(result.data.points, function (index, item) {
        // console.log(item.longitude, item.latitude);
        //创建标注要素
        var feature = new ol.Feature({ //创建一个要素，作为标注
          geometry: new ol.geom.Point(ol.proj.transform([item.longitude, item.latitude], 'EPSG:4326', 'EPSG:3857')), //必要
        });

        feature.setStyle(
          new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
              anchor: [0, 0],
              // anchorXUnits: 'fraction',
              // anchorYUnits: 'pixels',
              rotation: item.radian,
              src: 'img/arrow2.png'
            }))
          })
        );
        iconFeatures.push(feature);
      });
      window.vectorLayer.setSource(new ol.source.Vector({
        features: iconFeatures //add an array of features
      }));

      window.geojsonVectorLayer.setSource(new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(result.data.isolines, {// 用readFeatures方法可以自定义坐标系
          dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
          featureProjection: 'EPSG:3857' // 设定当前地图使用的feature的坐标系
        })
      }));
    } else {
      alert("error!!!!!!!");
    }
  });
}


function initTimeLine() {

  // DOM element where the Timeline will be attached
  var container = document.getElementById('visualization');

  // Create a DataSet (allows two way data-binding)
  var dataset = new vis.DataSet([
    {id: 1, content: 'test', start: new Date('2017', '1', '2')}
  ], {
    type: {start: 'ISODate', end: 'ISODate'}
  });

  // Configuration for the Timeline
  var options = {
    zoomMin: 1000 * 60 * 60 * 24,          // a day
    zoomMax: 1000 * 60 * 60 * 24 * 30 * 3  // three months
  };

  // Create a Timeline
  var timeline = new vis.Timeline(container, dataset, options);

  timeline.on('select', function (properties) {
    // console.log('select', properties.items[0]);
    getData(properties.items[0]);
  });

  $.get("/filelist", null, function (result) {
    if (0 === result.status) {
      var arr = [];
      $.each(result.data, function (index, item) {
        dataset.clear();
        var tmp = {};
        tmp.id = item.md5;
        tmp.content = item.file;
        // tmp.start = formatDateTime(item.timestamp);
        tmp.start = item.timestamp;
        arr.push(tmp);
      });
      // console.log(arr);
      dataset.add(arr);
    }
  });
}


