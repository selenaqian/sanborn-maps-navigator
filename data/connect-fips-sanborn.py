import json
from spellchecker import SpellChecker

# load data files
with open('fips.txt') as f:
    statelines = f.readlines()[16:67]

with open('fips.txt') as f:
    countylines = f.readlines()[72:]

with open('sanborn-with-fips.json') as f:
    sanborn = json.load(f)

with open('../us.json') as f:
    us = json.load(f)

with open('county-namechanges.json') as f:
    prev2curr = json.load(f)

# initialize spellchecker - will use to correct misspelled counties
spell = SpellChecker()
spell.word_frequency.load_words(prev2curr.keys())
spell.known(prev2curr.keys())

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
    if ' County' in split_line[1]:
        split_line[1] = split_line[1].split(' County')[0].upper().rstrip() # to only have name not ' County' after it
    elif ' Borough' in split_line[1]:
        split_line[1] = split_line[1].split(' Borough')[0].upper().rstrip()
    else:
        split_line[1] = split_line[1].split(' Census Area')[0].upper().rstrip()
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

# to initialize all fips with empty array
for state in sanborn:
    for county in state['counties']:
        county['fips'] = []

def county_found(county_name):
    codes = county_dictionary[county_name]
    code = 0 # will remain 0 if county is in the dictionary but not for the correct state
    for c in codes: # check the codes for that county name and check if in the desired state
        if c > state_min and c < state_max:
            code = c
            county['fips'].append(code)
    if code == 0: # if not in state, add to the fix list
        addtofix(state_name, county_name, '')

for state in sanborn: # access each state and find the state code - to make sure county is the actual one in the state
    state_name = state['state'].upper()
    state_min = state_dictionary[state_name]*1000
    state_max = state_min + 1000
    for county in state['counties']: # access each county in the state in sanborn
        if ' County' in county['county']:
            county_name = county['county'].split(' County')[0].upper()
        elif ' Counties' in county['county']:
            county_name = county['county'].split(' Counties')[0].upper()
        else:# ' Census Division' in county['county']:
            county_name = county['county'].split(' Census Division')[0].upper()
        if county_name in county_dictionary: # check if that county is in the dictionary of county fips codes
            county_found(county_name)
        elif county_name in prev2curr: # if county not in dictionary, check if can replace with current name
            county_name = prev2curr[county_name][0]
            county_found(county_name)
        elif ' AND ' in county_name: # has two counties
            mult_names = county_name.split(' AND ')
            for n in mult_names:
                if n in county_dictionary:
                    county_found(n)
                else:
                    misspelled = spell.unknown([n]) # check for misspelling
                    if len(misspelled) > 0:
                        mis = misspelled.pop()
                        corrected = spell.correction(mis).upper()
                        if corrected in county_dictionary:
                            county_found(corrected)
                            addtofix(state_name, n, ': ' + corrected)
                        else:
                            addtofix(state_name, n, ' misspelled not found')
                    else:
                        addtofix(state_name, n, ' double')
        else: # if not found initially or with updated name
            misspelled = spell.unknown([county_name]) # check for misspelling
            if len(misspelled) > 0:
                mis = misspelled.pop()
                corrected = spell.correction(mis).upper()
                if corrected in county_dictionary:
                    county_found(corrected)
                    addtofix(state_name, county_name, ': ' + corrected)
                else:
                    addtofix(state_name, county_name, ' misspelled not found')
            else:
                addtofix(state_name, county_name, ' not found')

file = open('fips-to-fix.json', 'w')
file.write(json.dumps(to_fix))
file.close()

file = open('sanborn-with-fips.json', 'w')
file.write(json.dumps(sanborn))
file.close()

# check fips codes on counties, remove not used, re-order
# figure out how to convert to correct indices
