// Import libs
import Accordion from 'rollerskate';
import jquery from 'jquery';
import L from 'leaflet';
import lodash from 'lodash';

// Initialize
window.$ = window.jQuery = jquery;
window.L = L;
window._ = lodash;

// Global vars
var mujeres = [],
    mymap,
    accordion;

$(document).ready(function(){
    var all_bounds = [],
        feature_bounds = {},
        feature_layers = {},
        features = {};

    // Add map to the DOM
    mymap = L.map('map-container').setView([-34.906557,-56.199769], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Map data &copy; <a href=\'http://openstreetmap.org\'>OpenStreetMap</a>",
        maxZoom: 18,
        id: "map-container",
    }).addTo(mymap);

    /**
     * PROFILES
     */
     // Fill up a profile template with the woman's info
     var fillTemplate = function(template, mujer) {
         // Remove id from template
         template.attr('id', mujer.COD_NOMBRE);
         // Add some useful data
         template.data('index', mujeres.indexOf(mujer));
         template.data('id-nomenclator', mujer.COD_NOMBRE);
         template.data('name', mujer.extra_nombre);
         // Fill up attrs
         if (mujer.extra_imagen) {
             template.find('.image img').attr('src', mujer.extra_imagen);
             template.find('.card-header-title').text(mujer.extra_nombre);
         }
         template.find('.card-header-title').text(mujer.extra_nombre);
         template.find('.title').text(mujer.extra_nombre);
         template.find('.subtitle').text(mujer.extra_nombre_subtipo);
         template.find('.content').text(mujer.extra_significado_via);
         template.show();
         template.click(toggleAccordion);
     };

     // Open or close the profiles
     var toggleAccordion = function() {
         if (accordion.item($(this).data('index')).open) {
             $(this).find('.arrow-closed').show();
             $(this).find('.arrow-open').hide();
             $(this).find('.card-header').show();
             accordion.item($(this).data('index')).collapse();
         } else {
             $(this).find('.arrow-closed').hide();
             $(this).find('.arrow-open').show();
             $(this).find('.card-header').hide();
             accordion.item($(this).data('index')).expand();
         }
     };

     var collapseAll = function() {
         $('div[data-accordion-item]').each(function() {
             $(this).find('.arrow-closed').show();
             $(this).find('.arrow-open').hide();
             $(this).find('.card-header').show();
             accordion.item($(this).data('index')).collapse();
         });
     };
     /***************************/

    // Load geojson
    $.getJSON("/mujeres.json", function (geojson) {

        L.geoJSON(geojson.features, {onEachFeature: onEachFeature}).addTo(mymap);
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
        mujeres = _.sortBy(mujeres, 'extra_nombre', 'asc')

        for (let mujer of mujeres) {
            var template = $("#profile-card-item-template").clone();
            fillTemplate(template, mujer);
            $('#profiles').append(template);
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
            layer.on('click', function(e) {
                 $searchInput.val(feature.properties.extra_nombre);
                 resetList();
                 search(feature.properties.extra_nombre);
                 $('#'+feature.properties.COD_NOMBRE).click();
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
             feature_layers[feature_id].forEach((layer) => {
                 layer.setStyle({
                     color: '#FF00B2',
                     stroke: '#FF00B2',
                     weight: 5,
                     dashArray: '',
                 })
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
        for(let street_id in feature_layers) {
            if (feature_layers.hasOwnProperty(street_id)) {
                feature_layers[street_id].forEach((layer) => {
                    layer.setStyle({
                        weight: 2,
                        stroke: "#1F1FFF",
                        color: "#1F1FFF",
                    });
                });
            }
        }
    };

     var resetLayerStyles = window.testReset =  function() {
         for(let street_id in feature_layers) {
             if (feature_layers.hasOwnProperty(street_id)) {
                 feature_layers[street_id].forEach((layer) => {
                     resetLayerStyle(layer);
                 });
             }
         }
     };

     var resetLayerStyle = function(layer) {
         layer.setStyle({
             stroke: '#0000ff',
             color: '#0000ff',
             weight: 3,
             dashArray: '',
         });
     };
     /************************/


    // Search
    var timer;
    var $searchInput = $('#search-field input');
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
        $('#profiles .card').each(function() {
            if ($(this).data('name').toLowerCase().indexOf(query.toLowerCase()) === -1) {
                $(this).addClass('is-gone');
            } else {
                results_found.push($(this).data('id-nomenclator'));
            }
        });
        // Show results on the map
        highlightFeatures(results_found);
    };

    // Get back the profile list ot it's original state (all profiles shown and all cards collapsed)
    var resetList = function() {
        $('#profiles .card').each(function() {
            $(this).removeClass('is-gone');
        });

        collapseAll();
    };

    /**
     * STATS AND BOTTOM GRAPH
     */

    // Get stats
    var getStats = function(mujeres) {
        var stats = {};
        for(let mujer of mujeres) {
            if(stats[mujer.extra_nombre_subtipo] == undefined) {
                stats[mujer.extra_nombre_subtipo] = 1;
            } else {
                stats[mujer.extra_nombre_subtipo]++;
            }
        }
        console.log(stats);
    };

    /****************************/
});
