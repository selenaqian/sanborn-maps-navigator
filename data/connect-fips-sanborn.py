import json

with open('fips.txt') as f:
    datalines = f.readlines()[16:]

with open('sanborn-maps-data-all.json') as f:
    sanborn = json.load(f)

with open('../us.json') as f:
    us = json.load(f)
