d3.select(".close").on("click", function() { d3.select(".modal").attr("style", "display: none")})

var slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}

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

var x, y, k;

var projection = d3.geoAlbersUsa()
    .scale(1070)
    .translate([width/2, height/2 + 45]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("class", "svg-content")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 800 550");

svg.append("rect")
    .attr("class", "background")
    .on("click", stateClicked);

var g = svg.append("g");
svg.append("text")
    .attr("id", "cityError")
    .attr("transform", "translate(200, 240)");

var idToObject = new Map();
var stateIdToIndex = new Map();

var stateColor = d3.scaleThreshold()
    .domain([0, 500, 1000, 1500, 2000, 2500])
    .range(["#eee", "#D0E5ED", "#71B2CA", "#137FA6", "#0E5F7D", "#0A4053"]);

var stateLegend = d3.legendColor()
    .scale(stateColor)
    .orient("horizontal")
    .shapeWidth(110)
    .labels(["0", "1-500", "501-1000", "1001-1500", "1501-2000", ">2000"]);

var countyColor = d3.scaleThreshold()
    .domain([1, 50, 100, 150])
    .range(["white", "#D0E5ED", "#71B2CA", "#137FA6", "#0E5F7D"]);

var countyLegend = d3.legendColor()
    .scale(countyColor)
    .orient("horizontal")
    .shapeWidth(110)
    .labels(["0", "1-50", "51-100", "100-150", ">150"]);

svg.append("g").attr("id", "legend")
    .attr("transform", "translate(50, 25)").call(stateLegend)
    .append("text").text("Number of Sanborn Maps from the State")
    .attr("x", 150).attr("y", -5).attr("id", "legendTitle");

var tooltip = d3.select(".tooltip").text("test");

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
    g.attr("style", "cursor: pointer").append("g")
        .selectAll("path")
        .data(topojson.feature(values[1], values[1].objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "#eee");
    
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
        .on("click", cityClicked)
        .on("mouseover", function(d) { 
            if (d) {
                let stateIndex = d.properties["state"];
                let countyIndex = d.properties["county"];
                let cityIndex = d.properties["city"];
                tooltip.text(sanborn[stateIndex]["counties"][countyIndex]["cities"][cityIndex]["city"]);
            }
            return tooltip.classed("visible", true); })
        .on("mousemove", function() {
            return tooltip
                .style("left", event.pageX-10 + "px")
                .style("top", event.pageY-5-tooltip.node().getBoundingClientRect().height + "px"); })
        .on("mouseout", function() { return tooltip.classed("visible", false); });
    
    g.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(values[1], values[1].objects.counties).features)
        .enter().append("path")
        .attr("d", path)
        .classed("county", true)
        .attr("id", function(d) { return "c" + d.id; })
        .attr("fill", function(d) { return countyColor(d.properties.count); })
        .on("click", countyClicked)
        .on("mouseover", function(d) { 
            if (d && d.properties.count > 0 && d.properties.index.length > 0) {
                let stateIndex = d.properties.index[0]["state"];
                let countyIndex = d.properties.index[0]["county"];
                tooltip.text(sanborn[stateIndex]["counties"][countyIndex]["county"]);
            }
            return tooltip.classed("visible", true); })
        .on("mousemove", function(d) {
            if (d.properties.count == 0) {
                tooltip.classed("visible", false);
            }
            return tooltip
                .style("left", event.pageX-10 + "px")
                .style("top", event.pageY-5-tooltip.node().getBoundingClientRect().height + "px"); })
        .on("mouseout", function() { return tooltip.classed("visible", false); });

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
        .on("click", stateClicked)
        .on("mouseover", function(d) { 
            if (d) {
                tooltip.text(sanborn[stateIdToIndex.get(d.id)]["state"]);
            }
            return tooltip.classed("visible", true); })
        .on("mousemove", function() {
            return tooltip
                .style("left", event.pageX-10 + "px")
                .style("top", event.pageY-5-tooltip.node().getBoundingClientRect().height + "px"); })
        .on("mouseout", function() { return tooltip.classed("visible", false); });

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
            cityName = toTitleCase(index);
        }
        i++;
    }
    let randomItem = randomCityList[Math.floor(Math.random() * randomCityList.length)];
    d3.select("#news").select("a")
        .attr("href", "https://chroniclingamerica.loc.gov/lccn/" + randomItem["site_url"])
        .attr("target", "_blank")
        .select("img")
        .attr("src", "https://news-navigator.labs.loc.gov/data/" + randomItem["url"]);
    addNewsInfo(randomItem, cityName + ", " + randomState["state"], "the entire USA");
}

// Creates display of random news image from anywhere in one state.
// i is the state's index.
function stateNews(i) {
    d3.select("#no_photo").remove();
    state = newsNav[i];
    if (Object.keys(state["cities"]).length > 0) {
        let randomCityNum = Math.floor(Math.random() * Object.keys(state["cities"]).length);
        let randomCityList, cityName;
        let i = 0;
        for(var index in state["cities"]) {
            if (i == randomCityNum) {
                randomCityList = state["cities"][index];
                cityName = toTitleCase(index);
            }
            i++;
        }
        let randomItem = randomCityList[Math.floor(Math.random() * randomCityList.length)];
        d3.select("#news").select("a")
            .attr("href", "https://chroniclingamerica.loc.gov/lccn/" + randomItem["site_url"])
            .attr("target", "_blank")
            .select("img")
            .attr("src", "https://news-navigator.labs.loc.gov/data/" + randomItem["url"]);
        addNewsInfo(randomItem, cityName + ", " + state["state"], state["state"]);
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
    let name = toTitleCase(city);
    state = newsNav[i];
    if (city in state["cities"]) {
        cityList = state["cities"][city];
        let randomItem = cityList[Math.floor(Math.random() * cityList.length)];
        d3.select("#news").select("a")
            .attr("href", "https://chroniclingamerica.loc.gov/lccn/" + randomItem["site_url"])
            .attr("target", "_blank")
            .select("img")
            .attr("src", "https://news-navigator.labs.loc.gov/data/" + randomItem["url"]);
        addNewsInfo(randomItem, name + ", " + state["state"], name);
    }
    else {
        d3.select("#news").select("p")
            .append("p")
            .attr("id", "no_photo")
            .text("No available photos from " + name);
    }
}

// Adds the newspaper name, location, and publication date based on metadata.
// newsItem is the selected photo, lccn is the location, randomArea is the range of how large the area the random image was picked from (e.g. a state name or USA for the country).
function addNewsInfo(newsItem, lccn, randomArea) {
    let newsText = d3.select("#news-text");
    newsText.selectAll("*").remove();
    newsText.append("p").text("Newspaper: ")
        .append("a")
        .attr("href", "https://chroniclingamerica.loc.gov/lccn/" + newsItem["site_url"].split("/")[0])
        .attr("target", "_blank")
        .text(newsItem["name"].replace("[volume]", "").trim());
    newsText.append("p").text("Publication location: ")
        .append("a")
        .attr("href", "https://chroniclingamerica.loc.gov/titles/places/" + lccn.split(", ")[1].toLowerCase().replace(" ", "_"))
        .attr("target", "_blank")
        .text(lccn);
    newsText.append("p").text("Date: ")
        .append("a")
        .attr("href", "https://chroniclingamerica.loc.gov/lccn/" + newsItem["site_url"])
        .attr("target", "_blank")
        .text(getDate(newsItem["pub_date"]));
    newsText.append("p").text("Selected from " + randomArea);
}

// Converts string to title case, where first letter of each word is capitalized.
// str is the passed in string.
function toTitleCase(str) {
    let strSplit = str.split(" ");
    let toReturn = "";
    for (let i = 0; i < strSplit.length; i++) {
        toReturn += strSplit[i].charAt(0) + strSplit[i].slice(1).toLowerCase() + " ";
    }
    return toReturn.trim();
}

function cityClicked(d) {
    if (d && centered !== d.id) { //centers on city that was clicked
        d3.select('#results-flex').selectAll('*').remove();
        d3.select("#cityError").text("");
        d3.select("#legend").selectAll("*").remove();
        g.selectAll('.city').classed('active', false);
        if (d.geometry.coordinates[0] !== 0 || d.geometry.coordinates[1] !== 0) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
        } else {
            d3.select("#cityError").text("City coordinates not currently available.");
        }
        k = 50;
        centered = d.id;
        let stateIndex = d.properties["state"];
        let countyIndex = d.properties["county"];
        let cityIndex = d.properties["city"];
        displayAllItemResults(sanborn[stateIndex]["counties"][countyIndex]["cities"][cityIndex]);
        cityNews(stateIndex, d.properties["cityName"].toUpperCase());
        g.select("#city" + String(d.id)).classed("active", true);
        //zooming part
        g.transition()
            .duration(750)
            .attr("transform", "translate(" + width/2 + "," + height/2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5/k + "px");
    }
/**    else { //goes back to county
        countyClicked(topojson.feature(usa, usa.objects.counties).features[d.properties["county"]], d.properties["county"]);
  }*/
}

function countyClicked(d, i) {
    g.selectAll(".county").classed("active", false);
    g.selectAll('.city').classed('active', false);
    d3.select("#legend").selectAll("*").remove();
    d3.select("#cityError").text("");
  if (d && d.properties.count > 0 && centered !== d.id) { //centers on county that was clicked
    d3.select('#results-flex').selectAll('*').remove();
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 10;
    centered = d.id;
    for (a = 0; a < d.properties.index.length; a++) {
        let stateIndex = d.properties.index[a]["state"];
        let countyIndex = d.properties.index[a]["county"];
        displayAllCityResults(sanborn[stateIndex]["counties"][countyIndex]);
    }
      g.select("#c" + String(d.id)).classed("active", true);
    //zooming part
  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width/2 + "," + height/2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
  } else { //goes back to state
      usa.then(function(us) {
          let index = Math.round(d.id/1000);
          stateClicked(topojson.feature(us, us.objects.states).features[stateIdToIndex.get(index)], stateIdToIndex.get(index));
      });
  }
}

function stateClicked(d, i) {
    g.selectAll("path").classed("active", false);
    g.selectAll('.city').classed('active', false);
    d3.select("#legend").selectAll("*").remove();
    d3.select("#cityError").text("");
    d3.select("#legend")
        .attr("transform", "translate(75, 25)").call(countyLegend)
        .append("text").text("Number of Sanborn Maps from the County")
        .attr("x", 100).attr("y", -5).attr("id", "legendTitle");
    d3.select("#legend").append("rect")
        .attr("fill", "white") //backup color
        .attr("width", d3.select("#legend").node().getBBox().width + 10)
        .attr("height", d3.select("#legend").node().getBBox().height + 5)
        .attr("x", d3.select("#legend").node().getBBox().x - 5)
        .attr("y", d3.select("#legend").node().getBBox().y)
        .attr("fill", "rgba(255, 255, 255, 0.6)");
    d3.select(".legendCells").raise();
    d3.select("#legendTitle").raise();
  if (d && centered !== d.id) { //centers on state that was clicked
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d.id;
    d3.select('#results-flex').selectAll('*').remove();
    if(d.id < 57) {
        d3.select("#s" + String(d.id)).classed("active", true);
        displayAllCountyResults(sanborn[stateIdToIndex.get(d.id)]);
        stateNews(stateIdToIndex.get(d.id));
        //zooming part
        g.transition()
            .duration(750)
            .attr("transform", "translate(" + width/2 + "," + height/2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5/k + "px");
    }
  } else if (centered == d.id) { // want to keep everything the same
      d3.select("#s" + String(d.id)).classed("active", true);
  } else { // centers back on center of map
    zoomout();
  }
}

function zoomout() {
    countryNews();
    d3.select("#results-flex").selectAll("*").remove();
    d3.select("#state").text("");
    d3.select("#county").text("");
    d3.select("#city").text("");
    d3.select("#legend").selectAll("*").remove();
    d3.select("#legend")
        .attr("transform", "translate(50, 25)").call(stateLegend)
        .append("text").text("Number of Sanborn Maps from the State")
        .attr("x", 150).attr("y", -5).attr("id", "legendTitle");
    displayAllStateResults(sanborn);
    x = width/2;
    y = height/2;
    k = 1;
    centered = null;
     g.selectAll("path")
      .classed("active", false);
    g.transition()
      .duration(750)
      .attr("transform", "translate(" + width/2 + "," + (height/2+15) + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5/k + "px");
}

// this function creates the display for all the item results of one city.
// shows first/cover thumbnail for this item.
// takes in a parameter of the entire city object.
function displayAllItemResults(jsonObj) {
    d3.select("#city").text(jsonObj["city"]).on("click", function() {
        d3.select("#results-flex").selectAll("*").remove();
        displayAllItemResults(jsonObj); });
    d3.select("#arrow1").classed("visible", true);
    d3.select("#arrow2").classed("visible", true);
    d3.select("#arrow3").classed("visible", true);
    d3.select("#results-header").text("Sanborn Maps from " + jsonObj["city"]);

  let l = jsonObj["items"].length;
  for (let i = 0; i < l; i++) {
    let item = jsonObj["items"][i];

    div = d3.select("#results-flex").append("div");
    div.classed("results-item", true).append("p")
        .append("a")
        .text(getDate(item["date"]))
        .attr("href", item["item_url"])
        .attr("target", "_blank")
        .classed("results-text", true);
    div.append("a")
        .attr("href", item["item_url"])
        .attr("target", "_blank")
        .on("mouseover", function() {
            tooltip.text("Go to loc.gov page of " + getDate(item["date"]) + " atlas from " + jsonObj["city"])
                .classed("visible", true);
        })
        .on("mousemove", function() {
            tooltip
                .style("left", event.pageX-20 + "px")
                .style("top", event.pageY-5-tooltip.node().getBoundingClientRect().height + "px"); })
        .on("mouseout", function() { return tooltip.classed("visible", false); })
        .append("img")
        .attr("src", item["thumbnail_urls"][0]);
  }
}

// this function creates the display for all the city results of one county.
// shows one randomly selected image from each city - more info on random selection in the code.
// takes in a parameter of the entire county object.
function displayAllCityResults(jsonObj) {
    d3.select("#city").text("");
    d3.select("#county").text(jsonObj["county"])
        .on("click", function() { 
            countyClicked(idToObject.get(jsonObj["fips"][0]));
        });
    d3.select("#arrow1").classed("visible", true);
    d3.select("#arrow2").classed("visible", true);
    d3.select("#arrow3").classed("visible", false);
    d3.select("#results-header").text("Sanborn Maps from Cities in " + jsonObj["county"]);

  let l = jsonObj["cities"].length;
  for (let i = 0; i < l; i++) {
    let city = jsonObj["cities"][i];

    // pick a random item in the city
    let randomItemNum = Math.floor(Math.random() * city["items"].length);
    let randomItem = city["items"][randomItemNum];
    
    div = d3.select("#results-flex").append("div");
    div.classed("results-item", true)
        .on("click", function() { 
        let data_id = city["city"].replace(/\s+/g, '') + d3.select("#state").text().replace(/\s+/g, ''); //figure out the id
        cityClicked(idToObject.get(data_id)); }) //get the data object from the mapped pairs
        .append("p").text(city["city"]).classed("results-text", true);
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
    d3.select("#state").text(jsonObj["state"]).on("click", function() { 
        let stateName = d3.select("#state").text();
        stateClicked(idToObject.get(stateNameToId.get(stateName))); });
    d3.select("#arrow1").classed("visible", true);
    d3.select("#arrow2").classed("visible", false);
    d3.select("#arrow3").classed("visible", false);
    d3.select("#results-header").text("Sanborn Maps from Counties in " + jsonObj["state"]);

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
      
    div = d3.select("#results-flex").append("div");
    div.classed("results-item", true)
      .on("click", function() { 
        countyClicked(idToObject.get(county["fips"][0])); })
        .append("p").text(county["county"]).classed("results-text", true);
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
    d3.select("#arrow1").classed("visible", false);
    d3.select("#arrow2").classed("visible", false);
    d3.select("#arrow3").classed("visible", false);
    d3.select("#results-header").text("Sanborn Maps from States in the USA");
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
      
    div = d3.select("#results-flex").append("div")
    div.classed("results-item", true)
      .on("click", function() { 
        stateClicked(idToObject.get(i)); })
        .append("p")
        .text(stateObj["state"]).classed("results-text", true);
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
  if (item_split.length > 1) {
    month = parseInt(item_split[1]);
  }
  if (month < 1 || month > 12) {
    return String(year);
  }
  if (item_split.length == 2) {
     return months[month - 1] + " " + String(year);
  }
  else if (item_split.length == 3) {
      return months[month - 1] + " " + String(item_split[2]) + ", " + String(year);
  }
}