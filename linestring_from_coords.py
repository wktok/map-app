import json

# Load the station GeoJSON
with open('map-app/JY_nodes.geojson', 'r', encoding='utf-8') as f:
    stations_data = json.load(f)

# Extract coordinates in the desired order for the path
coordinates = []
for feature in stations_data['features']:
    coordinates.append(feature['geometry']['coordinates'])

line_geojson = {
    "type": "FeatureCollection",
    "features": [
        {
            "geometry": {
                "type": "LineString",
                "coordinates": coordinates,
            },
            "properties": {
                "name": "JY"
            }
        }
    ]
}

# save the LineString GeoJSON to a new file
with open('map-app/JY_line_path.geojson', 'w', encoding='utf-8') as f:
    json.dump(line_geojson, f, ensure_ascii=False, indent=2)
