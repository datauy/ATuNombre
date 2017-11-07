// Import libs
import Accordion from "rollerskate";
import jquery from "jquery";
import L from "leaflet";
import lodash from "lodash";
import * as d3 from "d3";
import * as d3_scale from "d3-scale";

// Initialize
window.$ = window.jQuery = jquery;
window.L = L;
window._ = lodash;
window.d3 = d3;

// Global vars
var mujeres = [],
  mymap,
  accordion;

$(document).ready(function() {
  var all_bounds = [],
    feature_bounds = {},
    feature_layers = {},
    features = {};

  // Add map to the DOM
  mymap = L.map("map-container").setView([-34.906557, -56.199769], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      "Map data &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a>",
    maxZoom: 18,
    id: "map-container"
  }).addTo(mymap);

  /**
     * PROFILES
     */
  // Fill up a profile template with the woman's info
  var fillTemplate = function(template, mujer) {
    // Remove id from template
    template.attr("id", mujer.COD_NOMBRE);
    // Add some useful data
    template.data("index", mujeres.indexOf(mujer));
    template.data("id-nomenclator", mujer.COD_NOMBRE);
    template.data("name", mujer.extra_nombre);
    // Fill up attrs
    if (mujer.extra_imagen) {
      template.find(".image img").attr("src", mujer.extra_imagen);
      template.find(".card-header-title").text(mujer.extra_nombre);
    }
    template.find(".card-header-title").text(mujer.extra_nombre);
    template.find(".title").text(mujer.extra_nombre);
    template.find(".subtitle").text(mujer.extra_nombre_subtipo);
    template.find(".content").text(mujer.extra_significado_via);
    template.show();
    template.click(toggleAccordion);
  };

  // Open or close the profiles
  var toggleAccordion = function() {
    if (accordion.item($(this).data("index")).open) {
      $(this)
        .find(".arrow-closed")
        .show();
      $(this)
        .find(".arrow-open")
        .hide();
      $(this)
        .find(".card-header")
        .show();
      accordion.item($(this).data("index")).collapse();
    } else {
      $(this)
        .find(".arrow-closed")
        .hide();
      $(this)
        .find(".arrow-open")
        .show();
      $(this)
        .find(".card-header")
        .hide();
      accordion.item($(this).data("index")).expand();
    }
  };

  var collapseAll = function() {
    $("div[data-accordion-item]").each(function() {
      $(this)
        .find(".arrow-closed")
        .show();
      $(this)
        .find(".arrow-open")
        .hide();
      $(this)
        .find(".card-header")
        .show();
      accordion.item($(this).data("index")).collapse();
    });
  };
  /***************************/

  // Load geojson
  $.getJSON("/data/mujeres.json", function(geojson) {
    L.geoJSON(geojson.features, { onEachFeature: onEachFeature }).addTo(mymap);
    mymap.fitBounds(all_bounds);

    let ids = [];
    // Add profiles
    for (let calle of geojson.features) {
      var id = calle.properties.COD_NOMBRE;
      if (ids.indexOf(id) === -1) {
        mujeres.push(calle.properties);
        ids.push(id);
      }
    }
    mujeres = _.sortBy(mujeres, "extra_nombre", "asc");

    for (let mujer of mujeres) {
      var template = $("#profile-card-item-template").clone();
      fillTemplate(template, mujer);
      $("#profiles").append(template);
    }
    getStats(mujeres);
    $("#profile-card-item-template").remove();

    accordion = new Accordion(window);
    accordion.collapseAll();
  });

  /**
     *  MAP
     */

  // Add click event to streets on the map and store extra info
  var onEachFeature = function onEachFeature(feature, layer) {
    // Add click event and popup
    if (feature.properties && feature.properties.extra_nombre) {
      // TODO: Add more info to the popup
      layer.bindPopup(feature.properties.extra_nombre);
      layer.on("click", function(e) {
        $searchInput.val(feature.properties.extra_nombre);
        resetList();
        search(feature.properties.extra_nombre);
        $("#" + feature.properties.COD_NOMBRE).click();
      });
    }

    // Set default style for layers
    resetLayerStyle(layer);

    // Store all layers under their street ID
    if (Array.isArray(feature_layers[feature.properties.COD_NOMBRE])) {
      feature_layers[feature.properties.COD_NOMBRE].push(layer);
    } else {
      feature_layers[feature.properties.COD_NOMBRE] = [layer];
    }
    // Store all bounds from street under their street ID (in order to change map's zoom)
    if (Array.isArray(feature_bounds[feature.properties.COD_NOMBRE])) {
      feature_bounds[feature.properties.COD_NOMBRE].push(layer.getBounds());
    } else {
      feature_bounds[feature.properties.COD_NOMBRE] = [layer.getBounds()];
    }
    all_bounds.push(layer.getBounds());

    // Store all features under their street id
    if (Array.isArray(features[feature.properties.COD_NOMBRE])) {
      features[feature.properties.COD_NOMBRE].push(feature);
    } else {
      features[feature.properties.COD_NOMBRE] = [feature];
    }
  };

  var highlightFeatures = function(feature_ids) {
    var bounds = [];
    removeAllStreets();
    feature_ids.forEach(function(feature_id) {
      // Highlight the street
      feature_layers[feature_id].forEach(layer => {
        layer.setStyle({
          color: "#FF00B2",
          stroke: "#FF00B2",
          weight: 5,
          dashArray: ""
        });
      });
      bounds.push(feature_bounds[feature_id]);
    });

    // Zoom into the street
    if (bounds.length > 0) {
      mymap.fitBounds(bounds);
    } else {
      mymap.fitBounds(all_bounds);
    }
  };

  var removeAllStreets = function() {
    for (let street_id in feature_layers) {
      if (feature_layers.hasOwnProperty(street_id)) {
        feature_layers[street_id].forEach(layer => {
          layer.setStyle({
            weight: 2,
            stroke: "#1F1FFF",
            color: "#1F1FFF"
          });
        });
      }
    }
  };

  var resetLayerStyles = (window.testReset = function() {
    for (let street_id in feature_layers) {
      if (feature_layers.hasOwnProperty(street_id)) {
        feature_layers[street_id].forEach(layer => {
          resetLayerStyle(layer);
        });
      }
    }
  });

  var resetLayerStyle = function(layer) {
    layer.setStyle({
      stroke: "#0000ff",
      color: "#0000ff",
      weight: 3,
      dashArray: ""
    });
  };
  /************************/

  // Search
  var timer;
  var $searchInput = $("#search-field input");
  $searchInput.on("keyup", function(e) {
    timer && clearTimeout(timer);
    var query = $(this).val();
    timer = setTimeout(function() {
      resetLayerStyles();
      resetList();
      if (query.length > 0) {
        search(query);
      } else {
        resetLayerStyles();
        mymap.fitBounds(all_bounds);
      }
    }, 400);
  });

  var search = function(query) {
    var results_found = [];
    // Hide the non-matching results
    $("#profiles .card").each(function() {
      if (
        $(this)
          .data("name")
          .toLowerCase()
          .indexOf(query.toLowerCase()) === -1
      ) {
        $(this).addClass("is-gone");
      } else {
        results_found.push($(this).data("id-nomenclator"));
      }
    });
    // Show results on the map
    highlightFeatures(results_found);
  };

  // Get back the profile list ot it's original state (all profiles shown and all cards collapsed)
  var resetList = function() {
    $("#profiles .card").each(function() {
      $(this).removeClass("is-gone");
    });

    collapseAll();
  };

  /**
     * STATS AND BOTTOM GRAPH
     */
    var dataStats = {'name': 'root', 'children': [{'name':'Tipos de mujeres', 'children':[]}]};
  // Get stats
    var getStats = function(mujeres) {
        var stats = {};
        for (let mujer of mujeres) {
            if (stats[mujer.extra_nombre_subtipo] == undefined) {
                stats[mujer.extra_nombre_subtipo] = 1;
            } else {
                stats[mujer.extra_nombre_subtipo]++;
            }
        }
        for (let tipo in stats) {
            dataStats.children[0].children.push({'name': tipo, 'size': stats[tipo]});
        }

        renderChart(dataStats);
    };

  /****************************/

  var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

  var fader = function(color) {
      return d3.interpolateRgb(color, "#fff")(0.2);
    },
    color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
    format = d3.format(",d");

  var treemap = d3
    .treemap()
    .tile(d3.treemapResquarify)
    .size([width, height])
    .round(true)
    .paddingInner(1);

  var renderChart = function(data) {
      var root = d3
        .hierarchy(data)
        .eachBefore(function(d) {
            console.log(d);
          d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
        })
        .sum(sumBySize)
        .sort(function(a, b) {
          return b.height - a.height || b.value - a.value;
        });

      treemap(root);

      var cell = svg
        .selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", function(d) {
          return "translate(" + d.x0 + "," + d.y0 + ")";
        });

      cell
        .append("rect")
        .attr("id", function(d) {
          return d.data.id;
        })
        .attr("width", function(d) {
          return d.x1 - d.x0;
        })
        .attr("height", function(d) {
          return d.y1 - d.y0;
        })
        .attr("fill", function(d) {
          return color(d.parent.data.id);
        });

      cell
        .append("clipPath")
        .attr("id", function(d) {
          return "clip-" + d.data.id;
        })
        .append("use")
        .attr("xlink:href", function(d) {
          return "#" + d.data.id;
        });

      cell
        .append("text")
        .attr("clip-path", function(d) {
          return "url(#clip-" + d.data.id + ")";
        })
        .selectAll("tspan")
        .data(function(d) {
          return d.data.name.split(/(?=[A-Z][^A-Z])/g);
        })
        .enter()
        .append("tspan")
        .attr("x", 4)
        .attr("y", function(d, i) {
          return 13 + i * 10;
        })
        .text(function(d) {
          return d;
        });

      cell.append("title").text(function(d) {
        return format(d.value) + ' mujeres en la categoría ' + d.name;
      });

      d3
        .selectAll("input")
        .data([sumBySize, sumByCount], function(d) {
          return d ? d.name : this.value;
        })
        .on("change", changed);

      var timeout = d3.timeout(function() {
        d3
          .select('input[value="sumByCount"]')
          .property("checked", true)
          .dispatch("change");
      }, 2000);

      function changed(sum) {
        timeout.stop();

        treemap(root.sum(sum));

        cell
          .transition()
          .duration(750)
          .attr("transform", function(d) {
            return "translate(" + d.x0 + "," + d.y0 + ")";
          })
          .select("rect")
          .attr("width", function(d) {
            return d.x1 - d.x0;
          })
          .attr("height", function(d) {
            return d.y1 - d.y0;
          });
      }
    };

    function sumByCount(d) {
      return d.children ? 0 : 1;
    }

    function sumBySize(d) {
      return d.size;
    }
});
