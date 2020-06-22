const state = document.getElementById("state");
const county = document.getElementById("county");
const city = document.getElementById("city");
const map = document.getElementById("map");
const results = document.getElementById("results");
const news = document.getElementById("news");
const country = document.getElementById("country");
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

//proof of concept with color transition
d3.select("#map")
  .append("p")
  .text("hi. want this to be longer to see color transition")
  .style("color", "red")
  .on("click", function() {
    d3.select(this)
      .transition()
      .duration(2000)
      .style("color", "#" + Math.floor(Math.random() * 16777215).toString(16));
  });

//proof of concept with looping through a dataset
let dataset = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
d3.select(".news")
  .selectAll('p') //need this part to tell it to create more of these
  .data(dataset)
  .enter()
  .append('p')
  .text(d => d);

//setting what clicking USA does
d3.select("#country").on("click", function() { displayAllStateResults(sanborn);
                                             zoomout(); });

let newdata = d3.json(
  "https://cdn.glitch.com/1153fcbd-92b3-4373-8225-17ad609ee2fa%2Fsanborn-maps-data-all.json?v=1591818314615");

let sanborn;
d3.json("https://raw.githubusercontent.com/selenaqian/sanborn-maps-navigator/master/sanborn-maps-data-indexFIPS.json")
    .then(function(data) { displayAllStateResults(data);
                           sanborn = data;});

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
    .on("click", clicked);

var g = svg.append("g");

let usa;
d3.json("https://cdn.glitch.com/1153fcbd-92b3-4373-8225-17ad609ee2fa%2Fus.json?v=1592579350323").then(function(us) {
    usa = us;
  g.append("g")
      .attr("id", "states")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("d", path)
      .on("click", clicked);

  g.append("path")
      .datum(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b; }))
      .attr("id", "state-borders")
      .attr("d", path);
    
    g.append("g")
      .attr("id", "states")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)
      .on("click", clicked);

  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("id", "state-borders")
      .attr("d", path);
}).catch(function(error) {throw error;});

function clicked(d, i) {
  var x, y, k;

  if (d && centered !== d) { //centers on state that was clicked
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
    displayAllCountyResults(sanborn[i]);
  } else { //centers back on center of map
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
      displayAllStateResults(sanborn);
  }

    //changes styling
  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

    //zooming part
  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}

function zoomout() {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
     g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });
    g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}

// this function creates the display for all the item results of one city.
// shows first/cover thumbnail for this item.
// takes in a parameter of the entire city object.
function displayAllItemResults(jsonObj) {
  removeAll(results);
  removeAll(city);
  let myH3 = document.createElement("h3");
  myH3.textContent = "> " + jsonObj["city"];
  myH3.onclick = function() {
    displayAllItemResults(jsonObj);
  };
  city.appendChild(myH3);

  let l = jsonObj["items"].length;
  for (let i = 0; i < l; i++) {
    let item = jsonObj["items"][i];

    let div = document.createElement("div"); // create container for name and image
    let itemName = document.createElement("p"); // create text element for name
    itemName.textContent = item["name"] + " " + getDate(item["date"]);

    // get the first/cover thumbnail image for this item
    let imgUrl = item["thumbnail_urls"][0];
    let image = document.createElement("img");
    image.src = imgUrl;

    // add elements to the div container then add to the section on the page
    div.appendChild(itemName);
    div.appendChild(image);

    results.appendChild(div);
  }
}

// this function creates the display for all the city results of one county.
// shows one randomly selected image from each city - more info on random selection in the code.
// takes in a parameter of the entire county object.
function displayAllCityResults(jsonObj) {
  removeAll(results);
  removeAll(city);
  removeAll(county);
  let myH3 = document.createElement("h3");
  myH3.textContent = "> " + jsonObj["county"];
  myH3.onclick = function() {
    displayAllCityResults(jsonObj);
  };
  county.appendChild(myH3);

  let l = jsonObj["cities"].length;
  for (let i = 0; i < l; i++) {
    let city = jsonObj["cities"][i];

    let div = document.createElement("div"); // create container for name and image
    let cityName = document.createElement("p"); // create text element for name
    cityName.textContent = city["city"];
    cityName.onclick = function() {
      displayAllItemResults(city);
    };

    // pick a random item in the city
    let randomItemNum = Math.floor(Math.random() * city["items"].length);
    let randomItem = city["items"][randomItemNum];

    // get the first/cover thumbnail image for this city
    let imgUrl = randomItem["thumbnail_urls"][0];
    let image = document.createElement("img");
    image.src = imgUrl;

    // add elements to the div container then add to the section on the page
    div.appendChild(cityName);
    div.appendChild(image);

    results.appendChild(div);
  }
}

// this function creates the display for all the county results of one state.
// shows one randomly selected image from each county - more info on random selection in the code.
// takes in a parameter of the entire state object.
function displayAllCountyResults(jsonObj) {
  removeAll(results);
  removeAll(city);
  removeAll(county);
  removeAll(state);
    d3.select("#state").text("> " + jsonObj["state"]).on("click", function() {
    displayAllCountyResults(jsonObj);
  });

  let l = jsonObj["counties"].length;
  for (let i = 0; i < l; i++) {
    let county = jsonObj["counties"][i];

    let div = document.createElement("div"); // create container for name and image
    let countyName = document.createElement("p"); // create text element for name
    countyName.textContent = county["county"];
    countyName.onclick = function() {
      displayAllCityResults(county);
    };

    // pick a random city in the county
    let randomCityNum = Math.floor(
      Math.random() * jsonObj["counties"][i]["cities"].length
    );
    let randomCity = jsonObj["counties"][i]["cities"][randomCityNum];

    // pick a random item in the city
    let randomItemNum = Math.floor(Math.random() * randomCity["items"].length);
    let randomItem = randomCity["items"][randomItemNum];

    // get the first/cover thumbnail image for this city
    let imgUrl = randomItem["thumbnail_urls"][0];
    let image = document.createElement("img");
    image.src = imgUrl;

    // add elements to the div container then add to the section on the page
    div.appendChild(countyName);
    div.appendChild(image);

    results.appendChild(div);
  }
}

// this function creates the display for all the state results of the country, in alphabetical order except DC at the end.
// shows one randomly selected image from each state - more info on random selection in the code.
// takes in a parameter of the entire data object.
function displayAllStateResults(jsonObj) {
  removeAll(results);
  removeAll(city);
  removeAll(county);
  removeAll(state);

  let l = jsonObj.length;
  for (let i = 0; i < l; i++) {
    let stateObj = jsonObj[i];

    let div = document.createElement("div"); // create container for name and image
    let stateName = document.createElement("p"); // create text element for name
    stateName.textContent = stateObj["state"];
    stateName.onclick = function() {
      displayAllCountyResults(stateObj);
    };
    
    // pick a random county in the state
    let randomCountyNum = Math.floor(
      Math.random() * jsonObj[i]["counties"].length
    );
    let randomCounty = jsonObj[i]["counties"][randomCountyNum];

    // pick a random city in the county
    let randomCityNum = Math.floor(
      Math.random() * randomCounty["cities"].length
    );
    let randomCity = randomCounty["cities"][randomCityNum];

    // pick a random item in the city
    let randomItemNum = Math.floor(Math.random() * randomCity["items"].length);
    let randomItem = randomCity["items"][randomItemNum];

    // get the first/cover thumbnail image for this city
    let imgUrl = randomItem["thumbnail_urls"][0];
    let image = document.createElement("img");
    image.src = imgUrl;

    // add elements to the div container then add to the section on the page
    div.appendChild(stateName);
    div.appendChild(image);

    results.appendChild(div);
  }
}

// this function removes everything previously inside the input container
function removeAll(container) {
  while (container.hasChildNodes()) {
    container.removeChild(container.firstChild);
  }
}

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
