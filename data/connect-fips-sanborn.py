import json

# load data files
with open('fips.txt') as f:
    statelines = f.readlines()[16:67]

with open('fips.txt') as f:
    countylines = f.readlines()[72:]

with open('sanborn-with-fips.json') as f:
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
    state_dictionary[split_line[1].rstrip()] = int(split_line[0])
    
# format countylines info into a dictionary
for line in countylines:
    line.strip()
    split_line = line.split("        ")
    split_line[1] = split_line[1].split(' County')[0].upper() # to only have name not ' County' after it
    if split_line[1] not in county_dictionary:
        county_dictionary[split_line[1]] = []
    county_dictionary[split_line[1]].append(int(split_line[0]))
    if 'ST.' in split_line[1]:
        with_saint = split_line[1].replace('ST.', 'SAINT')
        if with_saint not in county_dictionary:
            county_dictionary[with_saint] = []
        county_dictionary[with_saint].append(int(split_line[0]))

# add fips code(s) to sanborn maps

to_fix = {} # for places that have multiple counties or are otherwise not found
# organized with state as key mapped to list of counties

def addtofix(state_name, county_name, extra):
    if state_name not in to_fix:
        to_fix[state_name] = []
    to_fix[state_name].append(county_name + extra)

for state in sanborn: # access each state and find the state code - to make sure county is the actual one in the state
    state_name = state['state'].upper()
    state_min = state_dictionary[state_name]*1000
    state_max = state_min + 1000
    for county in state['counties']: # access each county in the state
        county_name = county['county'].split(' County')[0].upper()
        if county_name in county_dictionary: # check if that county is in the dictionary of county fips codes
            codes = county_dictionary[county_name]
            code = 0 # will remain 0 if county is in the dictionary but not for the correct state
            for c in codes: # check the codes for that county name and check if in the desired state
                if c > state_min and c < state_max:
                    code = c
                    if 'fips' not in county or isinstance(county['fips'], int):
                        county['fips'] = []
                    county['fips'].append(code)
            if code == 0: # if not in state, add to the fix list
                addtofix(state_name, county_name, '')
        else: # if county not in dictionary, add to the fix list
            addtofix(state_name, county_name, ' not found')

file = open('fips-to-fix.json', 'w')
file.write(json.dumps(to_fix))
file.close()

file = open('sanborn-with-fips.json', 'w')
file.write(json.dumps(sanborn))
file.close()

# check fips codes on counties, remove not used, re-order
# figure out how to convert to correct indices
