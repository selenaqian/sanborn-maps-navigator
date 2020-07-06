import json

with open('fips.txt') as f:
    countylines = f.readlines()[3033:3074]

with open('sanborn-with-fips.json') as f:
    sanborn = json.load(f)

county_dictionary = {}

# format countylines info into a dictionary
for line in countylines:
    line.strip()
    split_line = line.split("        ")
    split_line[1] = split_line[1].split(' city')[0].upper().rstrip()
    if split_line[1] not in county_dictionary:
        county_dictionary[split_line[1]] = []
    county_dictionary[split_line[1]].append(int(split_line[0]))

virginia = sanborn[45]
indep = virginia['counties'][3] # gets the independent cities county

indep_list = []

# want to split out the separate cities into their own counties and match to fips
for city in indep['cities']:
    temp_dict = dict()
    temp_dict['county'] = city['city'] + ' (Independent City)'
    temp_dict['cities'] = []
    temp_dict['cities'].append(city)
    temp_dict['fips'] = county_dictionary[city['city'].upper()]
    indep_list.append(temp_dict)

print(indep_list)
