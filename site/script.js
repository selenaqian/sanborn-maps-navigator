let requestURL =
  "https://cdn.glitch.com/1153fcbd-92b3-4373-8225-17ad609ee2fa%2Fsanborn-maps-data-all.json?v=1591818314615";
let request = new XMLHttpRequest();
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

request.open("GET", requestURL);
request.responseType = "json";
request.send();
request.onload = function() {
  const data = request.response;
  let l = data.length;
  updateVisual(data, "state");
  displayAllStateResults(data);
  country.onclick = function() {
    displayAllStateResults(data);
  };
};

// TODO: this will change to the map later!
// currently changes the available buttons on the visual
function updateVisual(jsonList, parameter) {
  removeAll(map);
  let l = jsonList.length;
  for (let i = 0; i < l; i++) {
    let item = jsonList[i];
    let myButton = document.createElement("button");
    if (parameter == "county") {
      myButton.textContent = item["county"];
    } else if (parameter == "state") {
      myButton.textContent = item["state"];
    } else if (parameter == "city") {
      myButton.textContent = item["city"];
    }
    map.appendChild(myButton);
    myButton.onclick = function() {
      if (parameter == "county") {
        displayAllCityResults(item);
      } else if (parameter == "state") {
        displayAllCountyResults(item);
      } else if (parameter == "city") {
        displayAllItemResults(item);
      }
    };
  }
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

  updateVisual(jsonObj, "item");

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

  updateVisual(jsonObj["cities"], "city");

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
  let myH3 = document.createElement("h3");
  myH3.textContent = "> " + jsonObj["state"];
  myH3.onclick = function() {
    displayAllCountyResults(jsonObj);
  };
  state.appendChild(myH3);

  updateVisual(jsonObj["counties"], "county");

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

  updateVisual(jsonObj, "state");

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
