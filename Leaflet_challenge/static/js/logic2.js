var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
var satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
  });

// Define the map and tile layer
var map = L.map('map').setView([0, 0], 2);
var tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

// Define the color scale for the depth
var depthColorScale = d3.scaleLinear()
  .domain([-10, 10, 50, 100, 200, 300, 500, 700])
  .range(['#00FFFF', '#008080', '#FFFF00', '#FFA500', '#FF4500', '#FF0000', '#800080', '#4B0082']);

// Load the GeoJSON data and add circle markers for each earthquake
d3.json(earthquakeUrl).then(function(data) {
  var earthquakes = L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      var mag = feature.properties.mag;
      var depth = feature.geometry.coordinates[2];
      var radius = Math.sqrt(mag) * 5; // Adjust the radius based on the magnitude
      var color = depthColorScale(depth); // Assign the color based on the depth
      return L.circleMarker(latlng, {
        radius: radius,
        color: color,
        fillOpacity: 0.7
      });
    },
    onEachFeature: function(feature, layer) {
      var title = feature.properties.title;
      layer.bindPopup("<h4>Time: " + feature.properties.time + "<br>Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place + "<br>Depth: " + feature.geometry.coordinates[2] + "</h4>");
    }
  }).addTo(map);

  // Define the legend
  var legend = L.control({ position: 'bottomright' });
  legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend');
    var depths = [-10, 10, 50, 100, 200, 300, 500, 700];
    div.innerHTML += '<h4>Depth</h4>';
    for (var i = 0; i < depths.length; i++) {
      div.innerHTML += '<i style="background:' + depthColorScale(depths[i]) + '"></i> ';
      if (depths[i + 1]) {
        div.innerHTML += depths[i] + '&ndash;' + depths[i + 1] + '<br>';
      } else {
        div.innerHTML += depths[i] + '+';
      }
    }
    return div;
  };
  legend.addTo(map);

  // Add tectonic plates overlay
  d3.json(platesUrl).then(function(data) {
    var plates = L.geoJSON(data, {
      style: {
        color: "orange",
        weight: 2
      }
    });
    var overlayMaps = {
      "Tectonic Plates": plates,
      "Earthquakes": earthquakes,
      "Satellite": satelliteMap
    };
    L.control.layers(null, overlayMaps).addTo(map);
  }).catch(function(error){
    console.log(erro);
  })
});
