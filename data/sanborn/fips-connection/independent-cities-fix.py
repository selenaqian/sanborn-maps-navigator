# Fixing Counties of Independent Cities in Virginia

# While working on indexing counties, I noticed that Virginia has many cities that are considered an independent city. That is, they are not part of a county but have a county-level designation of their own. In the Sanborn metadata, their county is listed as "Independent Counties". That creates a problem for my project because the geographic shape files have these cities all listed in separate counties, while the Sanborn data has them initially all together. So, this script resolves that issue.

# First, import the JSON module and read in the files. I've specified lines 3033-3074 in the fips.txt file because those are the lines with the information about independent cities.

import json

with open('../../fips.txt') as f:
    countylines = f.readlines()[3033:3074]

with open('../../sanborn-with-fips.json') as f:
    sanborn = json.load(f)

county_dictionary = {}

# Next, format countylines info into a dictionary from county to FIPS code.
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

# Then, we want to split out the separate cities into their own counties and match to the FIPS code.
for city in indep['cities']:
    temp_dict = dict()
    temp_dict['county'] = city['city'] + ' (Independent City)'
    temp_dict['cities'] = []
    temp_dict['cities'].append(city)
    temp_dict['fips'] = county_dictionary[city['city'].upper()]
    indep_list.append(temp_dict)

# Now we have a list of the independent cities in separate counties with their matching FIPS codes. Add this new structure into the Sanborn file. I opted to print it and copy-paste into the file instead of doing this algorithmically, but it can be done either way.
print(indep_list)
