import csv
from pathlib import Path

current_dir = Path(__file__).parent
csv_dir = current_dir / 'data.csv'

with open(csv_dir, 'r', encoding='utf-8') as input, open(current_dir / 'JY_stations.csv', 'w', encoding='utf-8') as output:
    reader = csv.reader(input)
    data = list(reader)
    writer = csv.writer(output, lineterminator='\n')

    data[0].append('station_name')
    for i in range(1, len(data)):
        data[i].append('JY_' + '{:0=2}'.format(i))

    print(data)
    writer.writerows(data)