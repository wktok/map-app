import maplibregl from 'maplibre-gl';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import OpacityControl from 'maplibre-gl-opacity';
import 'maplibre-gl-opacity/dist/maplibre-gl-opacity.css';

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
        // stations: {
        //   type: 'geojson',
        //   data: 'data'
        // }
      },
      layers: [
        {
          id: 'gsi-layer',
          type: 'raster',
          source: 'gsi',
        },
        // {
        //   id: 'station-layer',
        //   type: 'circle',
        //   source: 'stations',
        //   paint: {
        //     'circle-radius': 3,
        //     'circle-color': '#007cbf'
        //   }
        // }
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
        'circle-color': color_jy
      }
    });
  })
  .catch(error => console.error('Error loading GeoJSON:', error));
});