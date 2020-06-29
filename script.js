let sanborn;
d3.json("https://raw.githubusercontent.com/selenaqian/sanborn-maps-navigator/master/data/sanborn-with-fips.json")
    .then(function(data) { displayAllStateResults(data);
                           sanborn = data;});

let usa = d3.json("https://raw.githubusercontent.com/selenaqian/sanborn-maps-navigator/master/data/us-indexed-cities.json");

//setting what clicking USA does
d3.select("#country").on("dblclick", function() { zoomout(); });

var width = 800,
    height = 500,
    centered,
    countyCentered;

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

usa.then(function(us) {
  console.log(topojson.feature(us, us.objects.cities).features);
    g.append("g")
      .attr("id", "cities")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.cities).features)
    .enter().append("path")
      .attr("d", path)
    .classed("city", true)
    .attr("id", function(d) {return "city" + d.id; })
      .on("click", countyClicked);

  g.append("path")
      .datum(topojson.mesh(us, us.objects.cities, function(a, b) { return a !== b; }))
      .attr("id", "city")
      .attr("d", path);
    
    g.append("g")
      .attr("id", "counties")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("d", path)
    .classed("county", true)
    .attr("id", function(d) {return "c" + d.id; })
      .on("click", countyClicked);

  g.append("path")
      .datum(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b; }))
      .attr("id", "county-borders")
      .attr("d", path);
    
    g.append("g")
      .attr("id", "states")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)
    .classed("state", true)
    .attr("id", function(d) { return "s" + d.id; })
      .on("click", stateClicked);

  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("id", "state-borders")
      .attr("d", path);
}).catch(function(error) {throw error;});

function countyClicked(d, i) {
    console.log(d);
    console.log(d.properties.index);
  var x, y, k;

  d3.select('#results').selectAll('*').remove();
    g.selectAll(".county").classed("active", false);
  if (d && countyCentered !== d) { //centers on county that was clicked
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 10;
    countyCentered = d;
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
    //stateClicked(topojson.feature(usa, usa.objects.states).features[d.properties.index[a]["state"]], d.properties.index[a]["state"]);
  }
}

function stateClicked(d, i) {
    console.log(d);
  var x, y, k;

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
        displayAllCountyResults(sanborn[i]);
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
    d3.select("#city").text("> " + jsonObj["city"]).on("dblclick", function() {
        d3.select("#results").selectAll("*").remove();
        displayAllItemResults(jsonObj); });

  let l = jsonObj["items"].length;
  for (let i = 0; i < l; i++) {
    let item = jsonObj["items"][i];

    div = d3.select("#results").append("div");
    div.classed("results-item", true).append("p")
        .append("a")
        .text(item["name"] + " " + getDate(item["date"]))
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
    d3.select("#county").text("> " + jsonObj["county"]).on("dblclick", function() {
        d3.select("#results").selectAll("*").remove();
        displayAllCityResults(jsonObj); });

  let l = jsonObj["cities"].length;
  for (let i = 0; i < l; i++) {
    let city = jsonObj["cities"][i];

    // pick a random item in the city
    let randomItemNum = Math.floor(Math.random() * city["items"].length);
    let randomItem = city["items"][randomItemNum];
    
    div = d3.select("#results").append("div");
    div.classed("results-item", true).append("p").text(city["city"])
        .on("click", function() { 
        d3.select("#results").selectAll("*").remove();
        displayAllItemResults(city); });
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
    d3.select("#state").text("> " + jsonObj["state"]).on("dblclick", function() {
        d3.select("#results").selectAll("*").remove();
        displayAllCountyResults(jsonObj); });

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
    div.classed("results-item", true).append("p").text(county["county"])
      .on("click", function() { 
        d3.select("#results").selectAll("*").remove();
        displayAllCityResults(county); });
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
    div.classed("results-item", true).append("p")
      .text(stateObj["state"])
      .on("click", function() { d3.select("#results").selectAll("*").remove();
                               displayAllCountyResults(stateObj); })
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