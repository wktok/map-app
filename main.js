import maplibregl from 'maplibre-gl';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import OpacityControl from 'maplibre-gl-opacity';
import 'maplibre-gl-opacity/dist/maplibre-gl-opacity.css';
import {lineString, bezierSpline, multiLineString, circle} from '@turf/turf';

var color_jy = '#7BAB4F'

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
        gsi: {
          type: 'raster',
          tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'] ,
          maxzoom: 18,
          tileSize: 256,
          attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院 地理院タイル</a>',
        },
      },
      layers: [
        {
          id: 'gsi-layer',
          type: 'raster',
          source: 'gsi',
        },
      ],
    },
});

map.addControl(new maplibre.NavigationControl(), 'top-right');

map.on('laod', () =>{
  const opacity = new OpacityControl({
    baseLayers:{
      'stations': '山手線',
    },
  });
  map.addControl(opacity, 'top-left');
})

map.on('style.load', () => {  
  fetch('JY_line_path.geojson')
    .then(response => response.json())
    .then(lineData => {
      console.log(lineData)
      const lineFeature = lineData.features.find(
        feature => feature.geometry.type === "LineString"
      );
      if (!lineFeature) {
        console.error('LineString feature not found');
        return;
      }
      console.log(lineFeature.geometry.coordinates)
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
        }

      });
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

});