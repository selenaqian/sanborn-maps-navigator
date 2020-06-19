var x = "Country";
var index = d3.range(10);
d3.selectAll("h3")
  .style("color", "blue")
  .text(x);

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

let dataset = [1, 2, 3];
d3.select(".news")
  .selectAll('p') //need this part to tell it to create more of these
  .data(dataset)
  .enter()
  .append('p')
  .text(d => d);

let newdata = d3.json(
  "https://cdn.glitch.com/1153fcbd-92b3-4373-8225-17ad609ee2fa%2Fsanborn-maps-data-all.json?v=1591818314615").then(function(data){ console.log(data); });

var width = 400,
    height = 300,
    centered;

var projection = d3.geoAlbersUsa()
    .scale(1070)
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var g = svg.append("g");

d3.json("https://cdn.glitch.com/1153fcbd-92b3-4373-8225-17ad609ee2fa%2Fus.json?v=1592579350323").then(function(us) {
    console.log(us);
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

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}