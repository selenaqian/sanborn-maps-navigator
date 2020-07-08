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

var newsNav = [];
let newsFiles = []
for(let i = 0; i < 51; i++) {
    newsFiles[i] = d3.json("https://raw.githubusercontent.com/selenaqian/sanborn-maps-navigator/master/data/newspaper-navigator/photos-trimmed-" + String(i) + ".json");
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

var stateColor = d3.scaleThreshold()
    .domain([0, 500, 1000, 1500, 2000, 2500])
    .range(["#eee", "#D0E5ED", "#71B2CA", "#137FA6", "#0E5F7D", "#0A4053"]);

var countyColor = d3.scaleThreshold()
    .domain([1, 50, 100, 150])
    .range(["white", "#D0E5ED", "#71B2CA", "#137FA6", "#0E5F7D"]);

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
    .attr("fill", function(d) { return countyColor(d.properties.count); })
      .on("click", countyClicked);

  g.append("path")
      .datum(topojson.mesh(values[1], values[1].objects.counties, function(a, b) { return a !== b; }))
      .attr("id", "county-borders")
      .attr("d", path);
    
    g.append("g").attr("id", "states")
        .selectAll("path")
        .data(topojson.feature(values[1], values[1].objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .classed("state", true)
        .attr("id", function(d) { return "s" + d.id; })
        .attr("fill", function(d) { return stateColor(d.properties.count); })
        .on("click", stateClicked);

  g.append("path")
      .datum(topojson.mesh(values[1], values[1].objects.states, function(a, b) { return a !== b; }))
      .attr("id", "state-borders")
      .attr("d", path);
    
}).catch(function(error) { throw error; })

Promise.all(newsFiles).then(function(values) {
    for(let i = 0; i < 51; i++) {
        newsNav[i] = values[i];
    }
}).then(countryNews)
    .catch(function(error) { throw error; })

// Creates display of a random news image from anywhere in the country.
function countryNews() {
    d3.select("#no_photo").remove();
    let randomState = newsNav[Math.floor(Math.random() * newsNav.length)];
    let randomCityNum = Math.floor(Math.random() * Object.keys(randomState["cities"]).length);
    let randomCityList;
    let i = 0;
    for(var index in randomState["cities"]) {
        if (i == randomCityNum) {
            randomCityList = randomState["cities"][index];
        }
        i++;
    }
    let randomItem = randomCityList[Math.floor(Math.random() * randomCityList.length)];
    d3.select("#news").select("a")
        .attr("href", randomItem["site_url"])
        .attr("target", "_blank")
        .select("img").attr("style", "width:100%")
        .attr("src", randomItem["url"]);
}

// Creates display of random news image from anywhere in one state.
// i is the state's index.
function stateNews(i) {
    d3.select("#no_photo").remove();
    state = newsNav[i];
    if (Object.keys(state["cities"]).length > 0) {
        let randomCityNum = Math.floor(Math.random() * Object.keys(state["cities"]).length);
        let randomCityList;
        let i = 0;
        for(var index in state["cities"]) {
            if (i == randomCityNum) {
                randomCityList = state["cities"][index];
            }
            i++;
        }
        let randomItem = randomCityList[Math.floor(Math.random() * randomCityList.length)];
        d3.select("#news").select("a")
            .attr("href", randomItem["site_url"])
            .attr("target", "_blank")
            .select("img")
            .attr("src", randomItem["url"]);
    }
    else {
        d3.select("#news").select("p")
            .append("p")
            .attr("id", "no_photo")
            .text("No available photos from " + state["state"]);
    }
}

// Creates display of random news image from anywhere in one city.
// city is the city name.
// If the city is not available in the newspaper dataset, then the function will add an extra line of text stating that there are no available photos from newspapers in that city.
function cityNews(i, city) {
    d3.select("#no_photo").remove();
    state = newsNav[i];
    if (city in state["cities"]) {
        cityList = state["cities"][city];
        let randomItem = cityList[Math.floor(Math.random() * cityList.length)];
        d3.select("#news").select("a")
            .attr("href", randomItem["site_url"])
            .attr("target", "_blank")
            .select("img")
            .attr("src", randomItem["url"]);
    }
    else {
        let citySplit = city.split(" ");
        let name = "";
        for (let i = 0; i < citySplit.length; i++) {
            name += citySplit[i].charAt(0) + citySplit[i].slice(1).toLowerCase() + " ";
        }
        d3.select("#news").select("p")
            .append("p")
            .attr("id", "no_photo")
            .text("No available photos from " + name);
    }
}

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
        cityNews(stateIndex, d.properties["cityName"].toUpperCase());
        g.select("#city" + String(d.id)).classed("active", true);
        //zooming part
        g.transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");
    }
    else { //goes back to county
        countyClicked(topojson.feature(usa, usa.objects.counties).features[d.properties["county"]], d.properties["county"]);
  }
}

function countyClicked(d, i) {
  let x, y, k;

  d3.select('#results').selectAll('*').remove();
    g.selectAll(".county").classed("active", false);
    g.selectAll('.city').classed('active', false);
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
  let x, y, k;

  d3.select('#results').selectAll('*').remove();
    g.selectAll("path").classed("active", false);
    g.selectAll('.city').classed('active', false);
  if (d && centered !== d) { //centers on state that was clicked
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
    if(d.id < 57) {
        d3.select("#s" + String(d.id)).classed("active", true);
        displayAllCountyResults(sanborn[stateIdToIndex.get(d.id)]);
        stateNews(stateIdToIndex.get(d.id));
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
    countryNews();
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

// this function creates the display for all the state results of the country, in alphabetical order.
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