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
    // Add map to the DOM
    mymap = L.map('map-container').setView([-34.906557,-56.199769], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Map data &copy; <a href=\'http://openstreetmap.org\'>OpenStreetMap</a>",
        maxZoom: 18,
        id: "map-container",
    }).addTo(mymap);

    var geojson_features;

    // Search
    var resetList = function() {
        $('#profiles .card').each(function() {
            $(this).removeClass('is-gone');
        });
        accordion.collapseAll();
    };

    var search = function(query) {
        var results_found = [];
        $('#profiles .card').each(function() {
            if ($(this).data('name').toLowerCase().indexOf(query.toLowerCase()) === -1) {
                $(this).addClass('is-gone');
            } else {
                results_found.push($(this).data('id-nomenclator'));
            }
        });
        highlightFeatures(results_found);
    };

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
            // accordion.collapseAll();
            accordion.item($(this).data('index')).expand();
        }
    };

    // Add click event to streets on the map
    var onEachFeature = function onEachFeature(feature, layer) {
        // does this feature have a name?
        if (feature.properties && feature.properties.extra_nombre) {
            layer.bindPopup(feature.properties.extra_nombre);
            layer.on('click', function(e) {
                $searchInput.val(feature.properties.extra_nombre);
                resetList();
                search(feature.properties.extra_nombre);
                $('#'+feature.properties.COD_NOMBRE).click();
            });
        }
        layer._street_id = feature.properties.COD_NOMBRE;
    };



    var highlightFeatures = function(feature_ids) {
        geojson_features.eachLayer((layer) => {
            if ($.inArray(layer._street_id, feature_ids) !== -1) {
                //TODO: Zoom to a level where you can see them all??s
                layer.setStyle({
                    color: '#FF0000',
                    weight: 8,
                    dashArray: '',
                });
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                    layer.bringToFront();
                }
            }
        });
    };

    var removeAllStreets = function() {
        geojson_features.eachLayer((layer) => {
            layer.setStyle({
                stroke: "",
            });
        });
    };

    var resetLayerStyle = function(layer) {
        layer.setStyle({
            stroke: '#3388ff',
            color: '#3388ff',
            weight: 3,
            dashArray: '',
        });
    };

    var resetLayerStyles = function() {
        geojson_features.eachLayer((layer) => {
            resetLayerStyle(layer);
        });
    };

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

    // Load geojson
    $.getJSON("/mujeres.json", function (geojson) {

        geojson_features = L.geoJSON(
            geojson.features, {onEachFeature: onEachFeature}
        ).addTo(mymap);

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

    // Search
    var timer;
    var $searchInput = $('#search-field input');
    $searchInput.on("keyup", function(e) {
        timer && clearTimeout(timer);
        var query = $(this).val();
        timer = setTimeout(function() {
            resetLayerStyles();
            resetList();
            if (query.length > 1) {
                search(query);
            }
        }, 300);
    });

});
