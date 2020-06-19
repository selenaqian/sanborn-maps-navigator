import json

with open('/Users/me/Documents/Duke/09 Summer 2020/Sanborn Maps Project/sanborn-maps-data-all.json') as f:
  data = json.load(f)

#state = data[13] #indiana
#state = data[14] #iowa
#state = data[15] #kansas
#state = data[20] #massachussets
#state = data[21] #michigan
#state = data[24] #missouri
#state = data[35] #oklahoma
#state = data[37] #pennsylvania
#state = data[42] #texas
state = data[48] #wisconsin
counties = state['counties']
counties_map = dict()

for county in counties:
    countyName = county['county']
    if countyName not in counties_map:
        counties_map[countyName] = []
    for city in county['cities']:
        counties_map[countyName].append(city)

full_map = []
for c in counties_map:
    temp = dict()
    temp['county'] = c
    temp['cities'] = counties_map[c]
    full_map.append(temp)
    
#file = open('ny-fixed.json', 'w')
#file = open('ill-fixed.json', 'w')
#file = open('in-fixed.json', 'w')
#file = open('ia-fixed.json', 'w')
#file = open('ks-fixed.json', 'w')
#file = open('ma-fixed.json', 'w')
#file = open('mi-fixed.json', 'w')
#file = open('mo-fixed.json', 'w')
#file = open('ok-fixed.json', 'w')
#file = open('pa-fixed.json', 'w')
#file = open('tx-fixed.json', 'w')
file = open('wi-fixed.json', 'w')
file.write(json.dumps(full_map))
file.close()

#also used to fix other paginated states
