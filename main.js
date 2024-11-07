import maplibregl from 'maplibre-gl';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import OpacityControl from 'maplibre-gl-opacity';
import 'maplibre-gl-opacity/dist/maplibre-gl-opacity.css';
import {lineString, bezierSpline, length, along} from '@turf/turf';


var color_jy = '#7BAB4F';
var train_size = 3;

const map = new maplibregl.Map({
    container: 'map', // container id
    center: [139.738, 35.685], // starting position [lng, lat]
    minZoom: 8,
    maxZoom: 18,
    zoom: 12, // starting zoom
    maxBounds: [138.738, 34.685, 140.738, 36.685],
    style: {
      version: 8,
      sources:{
        // basemap: gsi standard map
        gsi_std: {
          type: 'raster',
          tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'] ,
          maxzoom: 18,
          tileSize: 256,
          attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院 地理院タイル</a>',
        },

        gsi_photo: {
          type: 'raster',
          tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'] ,
          maxzoom: 18,
          tileSize: 256,
          attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院 地理院タイル</a>',
        },



      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#2e2e2e'
          }
        },

        {
          id: 'gsi-std-layer',
          type: 'raster',
          source: 'gsi_std',
          paint: { 'raster-opacity': 0.3},
        },

        {
          id: 'gsi-photo-layer',
          type: 'raster',
          source: 'gsi_photo',
          paint: { 'raster-opacity': 0.3},
        },
      ],
    },
});

map.addControl(new maplibre.NavigationControl(), 'top-right');



function startAnimation(smoothedLine, train){
  // calculate distance of smoothedLine and divide into small sections to interpolate
  const totalDist = length(smoothedLine, { units: 'kilometers' });
  const smoothingFactor = 5000;
  const increment = totalDist / smoothingFactor;

  // create an array of interpolated points along the path
  const interpolatedPoints = [];
  for (let i = 0; i <= smoothingFactor; i++) {
    const point = along(smoothedLine, increment * i, { units: 'kilometers'});
    interpolatedPoints.push(point.geometry.coordinates);
  }

  let currentIndex = 0;

  function moveTrain() {
    const trainShape = [];
    for (let i = 0; i < 10; i++) {
      trainShape.push(interpolatedPoints[currentIndex + train_size*i])
    }
    
    // Update the LineString coordinates to `currentPos`
    // rotation is not considered at this point
    train.geometry.coordinates = trainShape;

    map.getSource('train-shape').setData(train);
    
    if (currentIndex < interpolatedPoints.length - 2){
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    requestAnimationFrame(moveTrain);
  }
  moveTrain();
}


map.on('style.load', () => { 

  // Initial train shape coordinates 
  let train = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
        [139.7667060, 35.6812546,],
        [139.7709170, 35.6917842]   
      ]
    }
  };

  // Add the lineString as a source to the map
  map.addSource('train-shape', {
    type: 'geojson',
    data: train
  });

  // Add a layer to visualize the lineString
  map.addLayer({
    id: 'train-shape-layer',
    type: 'line',
    source: 'train-shape',
    layout: {
      'line-join': 'miter',
      'line-cap': 'square'
    },
    paint: {
      'line-color': color_jy,
      'line-width': 3
    }
  });

  fetch('JY_line_path.geojson')
    .then(response => response.json())
    .then(lineData => {
      const lineFeature = lineData.features.find(
        feature => feature.geometry.type === "LineString"
      );
      if (!lineFeature) {
        console.error('LineString feature not found');
        return;
      }
      const line = lineString(lineFeature.geometry.coordinates)
      const smoothedLine = bezierSpline(line, {sharpness: 0.5});

      map.addSource(
        'yamanoteLine',{
          'type': 'geojson',
          'data': smoothedLine
        }
      );

      map.addLayer({
        'id': 'JY-line-layer',
        'type': 'line',
        'source': 'yamanoteLine',
        'paint': {
          'line-color': color_jy,
          'line-width': 5,
          'line-opacity': 0.5,
        },
      });

      startAnimation(smoothedLine, train);
  });

  fetch('JY_stations.geojson')
  .then(response => response.json())
  .then(data => {
    map.addSource(
      'stations',{
        'type': 'geojson',
        'data': data
      });
      
      map.addLayer({
        'id': 'station-layer',
        'type': 'circle',
        'source': 'stations',
        'paint': {
          'circle-radius': 5,
          'circle-color': '#ffffff',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#000'
        }
      });
    })  
  .catch(error => console.error('Error loading GeoJSON:', error));

  const opacity = new OpacityControl({
    baseLayers:{
      'gsi-std-layer': '地理院地図',
      'gsi-photo-layer': '航空写真',
    },

    overLayers:{
      'JY-line-layer': '山手線',
      'station-layer': '駅',
      'train-shape-layer': '電車'
    },
  });
  map.addControl(opacity, 'top-left');

});



// 電車の大きさを緯度経度で管理してるのでズームアウトすると相対的に小さくなって見えない。
// 角度が一定
// 〇　→今のノードと次のノードをつないだ線分に太さと長さを与えたほうがいい感じかもしれない

// 更に今後できたらいいこと
// 駅でとまる
// 駅で止まる際に加速、減速の表現
// 複数本同時に走らせる
// 本当の時刻表ベースで運行を再現
// 時間を止めたり、早回ししたりする

