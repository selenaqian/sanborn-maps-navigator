import json

# load data files
with open('fips.txt') as f:
    statelines = f.readlines()[16:67]

with open('fips.txt') as f:
    countylines = f.readlines()[72:]

with open('sanborn-maps-data-all.json') as f:
    sanborn = json.load(f)

with open('../us.json') as f:
    us = json.load(f)

state_dictionary = {}
county_dictionary = {}
count = 0
# format statelines info into a dictionary
for line in statelines:
    line.strip()
    split_line = line.split("        ")
    state_dictionary[split_line[1]] = int(split_line[0])

# format countylines info into a dictionary
for line in countylines:
    line.strip()
    split_line = line.split("        ")
    county_dictionary[split_line[1]] = int(split_line[0])
print(county_dictionary)

# add fips code(s) to sanborn maps file


# check fips codes on counties, remove not used, re-order
# figure out how to convert to correct indices
