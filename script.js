let sanborn;
var stateNameToId = new Map();
d3.json("https://raw.githubusercontent.com/selenaqian/sanborn-maps-navigator/master/data/sanborn-with-fips.json")
    .then(function(data) { displayAllStateResults(data);
                           sanborn = data; 
                           for(let i = 0; i < sanborn.length; i++) {
                               stateNameToId.set(sanborn[i]["state"], i);
                           } });

let cities = d3.json("https://raw.githubusercontent.com/selenaqian/sanborn-maps-navigator/master/data/us-cities.json")

let usa = d3.json("https://raw.githubusercontent.com/selenaqian/sanborn-maps-navigator/master/data/us-indexed.json");

let newsNav = [];
for(let i = 0; i < 51; i++) {
    d3.json("https://raw.githubusercontent.com/selenaqian/sanborn-maps-navigator/master/data/newspaper-navigator/photos-trimmed-" + String(i) + ".json").then(function(data) {
        newsNav[i] = data;
    })
}

//setting what clicking USA does
d3.select("#country").on("click", function() { zoomout(); });

var width = 800,
    height = 500,
    centered;

var projection = d3.geoAlbersUsa()
    .scale(1070)
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("class", "svg-content")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 800 500");

svg.append("rect")
    .attr("class", "background")
    .on("click", stateClicked);

var g = svg.append("g");

var idToObject = new Map();
var stateIdToIndex = new Map();

Promise.all([cities, usa]).then(function(values) {    
    let counties = topojson.feature(values[1], values[1].objects.counties).features;
    let states = topojson.feature(values[1], values[1].objects.states).features;
    
    for(let i = 0; i < values[1].objects.states.geometries.length; i++) {
        stateIdToIndex.set(states[i].id, i);
    }
    
    for(let i = 0; i < values[0].features.length; i++) {
        idToObject.set(values[0].features[i].id, values[0].features[i]);
    }
    for(let i = 0; i < values[1].objects.counties.geometries.length; i++) {
        idToObject.set(values[1].objects.counties.geometries[i].id, counties[i]);
    }
    for(let i = 0; i < values[1].objects.states.geometries.length; i++) {
        idToObject.set(i, states[i]);
    }
    g.append("g")
        .attr("id", "cities")
        .selectAll("circle")
        .data(values[0].features)
        .enter().append("circle")
        .attr("cx", function(d) {
               if(projection(d.geometry.coordinates)) {
                   return projection(d.geometry.coordinates)[0];
               }
               else { return 0; } })
        .attr("cy", function(d) {
               if(projection(d.geometry.coordinates)) {
                   return projection(d.geometry.coordinates)[1];
               }
               else { return 0; } })
        .attr("r", 1)
        .classed("city", "true")
        .attr("id", function(d) { return "city" + d.id; })
        .on("click", cityClicked);
    
    g.append("g")
      .attr("id", "counties")
    .selectAll("path")
      .data(topojson.feature(values[1], values[1].objects.counties).features)
    .enter().append("path")
      .attr("d", path)
    .classed("county", true)
    .attr("id", function(d) { return "c" + d.id; })
      .on("click", countyClicked);

  g.append("path")
      .datum(topojson.mesh(values[1], values[1].objects.counties, function(a, b) { return a !== b; }))
      .attr("id", "county-borders")
      .attr("d", path);
    
    g.append("g")
      .attr("id", "states")
    .selectAll("path")
      .data(topojson.feature(values[1], values[1].objects.states).features)
    .enter().append("path")
      .attr("d", path)
    .classed("state", true)
    .attr("id", function(d) { return "s" + d.id; })
      .on("click", stateClicked);

  g.append("path")
      .datum(topojson.mesh(values[1], values[1].objects.states, function(a, b) { return a !== b; }))
      .attr("id", "state-borders")
      .attr("d", path);
}).catch(function(error) { throw error; })

function cityClicked(d) {
    d3.select('#results').selectAll('*').remove();
    g.selectAll('.city').classed('active', false);
    if (d && centered !== d) { //centers on city that was clicked
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 50;
    centered = d;
    let stateIndex = d.properties["state"];
    let countyIndex = d.properties["county"];
    let cityIndex = d.properties["city"];
    displayAllItemResults(sanborn[stateIndex]["counties"][countyIndex]["cities"][cityIndex]);
    g.select("#city" + String(d.id)).classed("active", true);
    //zooming part
  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
  } else { //goes back to county
          countyClicked(topojson.feature(usa, usa.objects.counties).features[d.properties["county"]], d.properties["county"]);
  }
}

function countyClicked(d, i) {
    console.log(d);
    console.log(d.properties.index);
  let x, y, k;

  d3.select('#results').selectAll('*').remove();
    g.selectAll(".county").classed("active", false);
  if (d && centered !== d) { //centers on county that was clicked
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 10;
    centered = d;
    for (a = 0; a < d.properties.index.length; a++) {
        let stateIndex = d.properties.index[a]["state"];
        let countyIndex = d.properties.index[a]["county"];
        displayAllCityResults(sanborn[stateIndex]["counties"][countyIndex]);
    }
      g.select("#c" + String(d.id)).classed("active", true);
    //zooming part
  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
  } else { //goes back to state
      usa.then(function(us) {
          stateClicked(topojson.feature(us, us.objects.states).features[d.properties.index[0]["state"]], d.properties.index[0]["state"]);
      });
  }
}

function stateClicked(d, i) {
    console.log(d);
  let x, y, k;

  d3.select('#results').selectAll('*').remove();
    g.selectAll("path").classed("active", false);
  if (d && centered !== d) { //centers on state that was clicked
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
    if(d.id < 57) {
        d3.select("#s" + String(d.id)).classed("active", true);
        displayAllCountyResults(sanborn[stateIdToIndex.get(d.id)]);
    }
  } else { //centers back on center of map
    zoomout();
  }
    
    //zooming part
  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}

function zoomout() {
    d3.select("#results").selectAll("*").remove();
    d3.select("#state").text("");
    d3.select("#county").text("");
    d3.select("#city").text("");
    displayAllStateResults(sanborn);
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
     g.selectAll("path")
      .classed("active", false);
    g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}

// this function creates the display for all the item results of one city.
// shows first/cover thumbnail for this item.
// takes in a parameter of the entire city object.
function displayAllItemResults(jsonObj) {
    d3.select("#city").text("> " + jsonObj["city"]).on("click", function() {
        d3.select("#results").selectAll("*").remove();
        displayAllItemResults(jsonObj); });

  let l = jsonObj["items"].length;
  for (let i = 0; i < l; i++) {
    let item = jsonObj["items"][i];

    div = d3.select("#results").append("div");
    div.classed("results-item", true).append("p")
        .append("a")
        .text(getDate(item["date"]))
        .attr("href", item["item_url"])
        .attr("target", "_blank")
        .classed("results-text", true);
    div.append("a")
      .attr("href", item["item_url"])
      .attr("target", "_blank")
      .append("img")
      .attr("src", item["thumbnail_urls"][0]);
  }
}

// this function creates the display for all the city results of one county.
// shows one randomly selected image from each city - more info on random selection in the code.
// takes in a parameter of the entire county object.
function displayAllCityResults(jsonObj) {
    d3.select("#city").text("");
    d3.select("#county").text("> " + jsonObj["county"])
        .on("click", function() { 
            console.log(jsonObj["fips"][0]);
            countyClicked(idToObject.get(jsonObj["fips"][0]));
        });

  let l = jsonObj["cities"].length;
  for (let i = 0; i < l; i++) {
    let city = jsonObj["cities"][i];

    // pick a random item in the city
    let randomItemNum = Math.floor(Math.random() * city["items"].length);
    let randomItem = city["items"][randomItemNum];
    
    div = d3.select("#results").append("div");
    div.classed("results-item", true)
        .on("click", function() { 
        let data_id = city["city"].replace(/\s+/g, '') + d3.select("#state").text().substr(2); //figure out the id
        cityClicked(idToObject.get(data_id)); }) //get the data object from the mapped pairs
        .append("p").text(city["city"]);
    div.append("img")
      .attr("src", randomItem["thumbnail_urls"][0]);
  }
}

// this function creates the display for all the county results of one state.
// shows one randomly selected image from each county - more info on random selection in the code.
// takes in a parameter of the entire state object.
function displayAllCountyResults(jsonObj) {
    d3.select("#county").text("");
    d3.select("#city").text("");
    d3.select("#state").text("> " + jsonObj["state"]).on("click", function() { 
        let stateName = d3.select("#state").text().substr(2);
        stateClicked(idToObject.get(stateNameToId.get(stateName))); });

  let l = jsonObj["counties"].length;
  for (let i = 0; i < l; i++) {
    let county = jsonObj["counties"][i];

    // pick a random city in the county
    let randomCityNum = Math.floor(
      Math.random() * county["cities"].length
    );
    let randomCity = county["cities"][randomCityNum];

    // pick a random item in the city
    let randomItemNum = Math.floor(Math.random() * randomCity["items"].length);
    let randomItem = randomCity["items"][randomItemNum];
      
    div = d3.select("#results").append("div");
    div.classed("results-item", true)
      .on("click", function() { 
        countyClicked(idToObject.get(county["fips"][0])); })
        .append("p").text(county["county"]);
    div.append("img")
      .attr("src", randomItem["thumbnail_urls"][0]);
  }
}

// this function creates the display for all the state results of the country, in alphabetical order except DC at the end.
// shows one randomly selected image from each state - more info on random selection in the code.
// takes in a parameter of the entire data object.
function displayAllStateResults(jsonObj) {
    d3.select("#state").text("");
    d3.select("#county").text("");
    d3.select("#city").text("");
  let l = jsonObj.length;
  for (let i = 0; i < l; i++) {
    let stateObj = jsonObj[i];
    
    // pick a random county in the state
    let randomCountyNum = Math.floor(
      Math.random() * stateObj["counties"].length
    );
    let randomCounty = stateObj["counties"][randomCountyNum];

    // pick a random city in the county
    let randomCityNum = Math.floor(
      Math.random() * randomCounty["cities"].length
    );
    let randomCity = randomCounty["cities"][randomCityNum];

    // pick a random item in the city
    let randomItemNum = Math.floor(Math.random() * randomCity["items"].length);
    let randomItem = randomCity["items"][randomItemNum];
      
    div = d3.select("#results").append("div")
    div.classed("results-item", true)
      .on("click", function() { 
        console.log(i);
        stateClicked(idToObject.get(i)); })
        .append("p")
        .text(stateObj["state"]);
    div.append("img")
      .attr("src", randomItem["thumbnail_urls"][0]);
  }
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

// writes the date in a more readable format. converts from YYYY-MM to Month YYYY.
function getDate(date) {
  let item_split = date.split("-");
  let year = parseInt(item_split[0]);
  let month = 0;
  if (item_split.length == 2) {
    month = parseInt(item_split[1]);
  }
  if (month < 1 || month > 12) {
    return String(year);
  }
  return months[month - 1] + " " + String(year);
}