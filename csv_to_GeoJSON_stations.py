import csv
import json
import copy

# name csv file
csv_file = 'map-app/data.csv'

# name GeoJSON file
geojson_file = 'map-app/JY_nodes.geojson'

# read csv
csv_data = csv.reader(open(csv_file, 'r', encoding="utf-8"), quotechar='"')

# geojson header
# geojson feature_collection object
feature_collection = {
    "type": "FeatureCollection",
    "features": []
}

# geojson feature object
feature_template = {
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [0, 0]
    },
    "properties": {
        "node": ""
    }
}

# convert csv data to geojson
for row in csv_data:
    # skip header
    if row[0] == 'lon':
        continue

    # get feature
    feature = copy.deepcopy(feature_template)
    feature['geometry']['coordinates'] = [float(row[1]), float(row[0])]
    feature['properties']['station_name'] = str(row[2])

    feature_collection['features'].append(feature)

# export geojson file
f = open(geojson_file, 'w', encoding='utf-8')
json.dump(feature_collection, f, ensure_ascii=False, indent=4)
f.close()