# sanborn-maps-navigator
Interactive map [search site](https://selenaqian.github.io/sanborn-maps-navigator/) created during Library of Congress Junior Fellows Program summer 2020. The site allows users to click different locations of the map to zoom in and see updated Sanborn Maps results. It also selects and displays a random historical newspaper image from the area (country, state, city - currently does not change for counties).

## Goals

Connect a wider audience to the vast collection of Sanborn Maps by creating a navigation tool that will make interaction more intuitive.

Introduce an element of serendipity in the connection to the time and place when these maps were created.

## The Collections

### Sanborn Fire Insurance Maps

A collection of 50,513 atlases created by the Sanborn Maps Company. Around 32,000 of these atlases are currently available online and are, to the best of the Library's knowledge, in the public domain. These maps detail a rich history of architecture, providing building-by-building information from the respective times.

Each atlas has a front page that shows the different segments of the city contained in the inner pages. Details of these numbered segments can then be accessed by going to the respective inner page.

For more on the collections, go to the [Library's website](https://www.loc.gov/collections/sanborn-maps/).

### Newspaper Navigator Dataset

A dataset containing visual information pulled from the 16,358,041 historic newspaper pages in [Chronicling America](https://chroniclingamerica.loc.gov/). This content was identified using machine learning to find photos, illustrations, maps, cartoons, editorial cartoons, headlines, and ads. The Sanborn Maps Navigator project currently draws from the 1,494,585 photos from newspapers published in the locations of the maps. There's still much more out there to explore.

For more and to see the full datasets, go to the [Newspaper Navigator page](https://news-navigator.labs.loc.gov/).

## Gathering Data

I used Python 3 in Jupyter notebooks to query the Library of Congress API and the Newspaper Navigator dataset for the metadata of the maps and photos. I then processed and organized the data, keeping only what I needed and sorting by geographic location.

For the full details, go to the Jupyter notebooks and Python code used to collect the data (listed below in order of creation and use unless otherwise specified). I would recommend downloading or otherwise cloning the actual files and reading them in a different editor instead of reading them on this repository. There are a number of places where there's a long printed list of results used as an example that can make it difficult to find the next section.

* [Sanborn data](data/sanborn/sanborn-maps-data.ipynb) - query Sanborn data and putting it all into one file
  * [Fix paginated states](data/sanborn/paginatedstate-fix-script.py) - when querying states that had multiple pages, my code treated each of those pages as a separate organization unit for reading and writing. This script fixed the duplicate counties that created. The original script could certainly be written in a way that would remedy this problem.
* [Add the FIPS codes](data/sanborn/fips-connection/connect-fips-sanborn.py) - read in the list of FIPS codes from a text file and match and add them to the Sanborn data. Before running this, you'll also need to do a bit of checking for county name changes:
  * [Web Scrape for County Name Changes](data/sanborn/fips-connection/county-namechanges-scraper.ipynb) - as I was adding in FIPS codes, I noticed that there were some counties that didn't have matches. Part of that was due to county names that had changed since the time the historical collection material was created. So, I found a website online that showed changes in county names over time and used web scraping to pull that entire list and write it into a JSON file that I could use in the script to add FIPS codes.
* [Index Counties](data/sanborn/fips-connection/index-counties.ipynb) - this goes back the other way, connecting the geographic shapes to the Sanborn data. Since the Sanborn data is organized by state and county in ordered lists, I can use the indices to access specific parts of the Sanborn data from other places in the website's code. This script creates that connection associating the specific geographic shape to the associated Sanborn data county object.
* [Independent Cities](data/sanborn/fips-connection/independent-cities-fix.py) - Virginia has a number of independent cities which were all categorized under the "Independent City" county. I noticed this while doing the county indexing. There was clearly an error here in how my code handled that, so I wrote this script to separate each of those cities out into their own counties and matched them to the FIPS codes.
* [Geocode Cities](data/sanborn/city-coordinates/geocode-cities.ipynb) - pulled out the city names with their state into CSV files that could be run through an online geocoder. Those results were then connected to the Sanborn map cities and written into their own separate GeoJSON file.
* [Records Counter](data/records-counter.ipynb) - used to count the number of records in each state and county. This information then was written into the data files and used to select the colors on the chloropleth map.
* [Newspaper Navigator data](data/newspaper-navigator/newspaper-navigator-data.ipynb) - query Newspaper Navigator data and organize it by location

## Building the Site

I coded the site from scratch, working in HTML, CSS, and JavaScript. I learned and used JavaScript's [D3 library](https://d3js.org/) to create the interactive map visual and update the results sections.

For full code, see the files:

* [Main/home page](index.html)
* [About page](about.html)
* [JavaScript file](script.js) - handles map visualization, zooming, generating/updating results, tooltips, etc.
* [Site-wide styling](global-style.css)
* [Main page styling](home-style.css)
* [About page styling](about-style.css)

## Making Updates

Since the site is driven by the data files, only the data files should need updating in order to change what shows on the site.

See the [how-to-update notebook](how-to-update.ipynb) for full details and starter code.

## Resources

Project-specific:

* Slideshow code adapted from [W3Schools](https://www.w3schools.com/howto/howto_js_slideshow.asp)
* Modal pop-up box code adapted from [W3Schools](https://www.w3schools.com/howto/howto_css_modals.asp)
* Loading animation code adapted from [W3Schools](https://www.w3schools.com/howto/howto_css_loader.asp)
* Map zoom code adapted from [Mike Bostock's click-to-zoom via transform](https://bl.ocks.org/mbostock/2206590)

General:

* [Mozilla Developer Network Web Docs](https://developer.mozilla.org/en-US/) - really useful for finding detailed and clear information on anything HTML, CSS, and JavaScript
* [D3 docs](https://github.com/d3/d3/wiki) and [examples](https://observablehq.com/@d3/gallery) - JavaScript data visualization, animation, and interaction library

Special thanks to Laurie Allen, my project mentor, and the rest of [LC Labs](https://labs.loc.gov/about/people/); to the creator of [Newspaper Navigator](https://labs.loc.gov/work/experiments/newspaper-navigator), Ben Lee, who's an Innovator in Residence at the Library; and to the [Geography & Maps Division](https://www.loc.gov/rr/geogmap/) who helped me learn about the history of the Sanborn maps and about how the collection was created and digitized.
