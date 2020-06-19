var riMap = new Map();
const header = document.querySelector('header');
const resultsSection = document.querySelector('section');

let requestURL = "https://cdn.glitch.com/1153fcbd-92b3-4373-8225-17ad609ee2fa%2Fri-test.json?v=1591366421224"
let request = new XMLHttpRequest();

request.open('GET', requestURL);
request.responseType = 'json';
request.send();
request.onload = function() {
  const riData = request.response;
  let myButton = document.createElement('button');
  myButton.textContent = 'Show Rhode Island Counties';
  resultsSection.appendChild(myButton);
  myButton.onclick = function() { displayAllCountyResults(riData); }
}

// this function creates the display for all the city results of one county.
// shows one randomly selected image from each city - more info on random selection in the code.
// takes in a parameter of the entire county object.
function displayAllCityResults(jsonObj) {
  removeAll(header);
  removeAll(resultsSection);
  
  let myH3 = document.createElement('h3');
  myH3.textContent = jsonObj['county'];
  header.appendChild(myH3);
  
  for (let i = 0; i < jsonObj['cities'].length; i++) {
    let city = jsonObj['cities'][i];

    let div = document.createElement('div'); // create container for name and image
    let cityName = document.createElement('p'); // create text element for name
    cityName.textContent = city['city'];
        
    // pick a random item in the city
    let randomItemNum = Math.floor(Math.random()*city['items'].length);
    let randomItem = city['items'][randomItemNum];
    
    // get the first/cover thumbnail image for this city
    let imgUrl = randomItem['thumbnail_urls'][0];
    let image = document.createElement('img');
    image.src = imgUrl;
    
    // add elements to the div container then add to the section on the page
    div.appendChild(cityName);
    div.appendChild(image);
    
    resultsSection.appendChild(div);
  }
}

// this function creates the display for all the county results of one state.
// shows one randomly selected image from each county - more info on random selection in the code.
// takes in a parameter of the entire state object.
function displayAllCountyResults(jsonObj) {
  removeAll(header);
  removeAll(resultsSection);
  
  let myH3 = document.createElement('h3');
  myH3.textContent = jsonObj['state'];
  header.appendChild(myH3);
  
  for (let i = 0; i < jsonObj['counties'].length; i++) {
    let county = jsonObj['counties'][i];
    
    let div = document.createElement('div'); // create container for name and image
    let countyName = document.createElement('p'); // create text element for name
    countyName.textContent = county['county'];
    countyName.onclick = function(){ displayAllCityResults(county)}
    
    // pick a random city in the county
    let randomCityNum = Math.floor(Math.random()*jsonObj['counties'][i]['cities'].length);
    let randomCity = jsonObj['counties'][i]['cities'][randomCityNum];
    
    // pick a random item in the city
    let randomItemNum = Math.floor(Math.random()*randomCity['items'].length);
    let randomItem = randomCity['items'][randomItemNum];
    
    // get the first/cover thumbnail image for this city
    let imgUrl = randomItem['thumbnail_urls'][0];
    let image = document.createElement('img');
    image.src = imgUrl;
    
    // add elements to the div container then add to the section on the page
    div.appendChild(countyName);
    div.appendChild(image);
    
    resultsSection.appendChild(div);
  }
}

// this function removes everything previously inside the input container
function removeAll(container) {
  while (container.hasChildNodes()) {  
    container.removeChild(container.firstChild);
  }
}