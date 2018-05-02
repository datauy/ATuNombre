// Import libs
import Accordion from 'rollerskate';
import jquery from 'jquery';
import L from 'leaflet';
import lodash from 'lodash';
import * as d3 from 'd3';
import * as d3_scale from 'd3-scale';
import renderTreeMap from './treemap.js';
import renderPieChart from './piechart.js';
import renderHorizontalBar from './horizontalBar.js';
import addClearables from './clearables.js';

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
    mymap = L.map('map-container').setView([-34.906557, -56.199769], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
            "Map &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> | Data &copyleft <a href='http://www.datauy.org/'>DataUY</a>",
        maxZoom: 18,
        id: 'map-container',
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
        if (mujer.extra_bio_externa) {
            template.find('.content').text(mujer.extra_bio_externa);
        } else {
            template.find('.content').text(mujer.extra_significado_via);
        }
        template.show();
        template.click(toggleAccordion);
    };

    // Open or close the profiles
    var toggleAccordion = function() {
        if (accordion.item($(this).data('index')).open) {
            $(this)
                .find('.arrow-closed')
                .show();
            $(this)
                .find('.arrow-open')
                .hide();
            $(this)
                .find('.card-header')
                .show();
            accordion.item($(this).data('index')).collapse();
        } else {
            $(this)
                .find('.arrow-closed')
                .hide();
            $(this)
                .find('.arrow-open')
                .show();
            $(this)
                .find('.card-header')
                .hide();
            accordion.item($(this).data('index')).expand();
        }
    };

    var collapseAll = function() {
        $('div[data-accordion-item]').each(function() {
            $(this)
                .find('.arrow-closed')
                .show();
            $(this)
                .find('.arrow-open')
                .hide();
            $(this)
                .find('.card-header')
                .show();
            accordion.item($(this).data('index')).collapse();
        });
    };
    /***************************/

    // Load geojson
    $.getJSON('/data/mujeres.json', function(geojson) {
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
        mujeres = _.sortBy(mujeres, 'extra_nombre', 'asc');

        for (let mujer of mujeres) {
            var template = $('#profile-card-item-template').clone();
            fillTemplate(template, mujer);
            $('#profiles').append(template);
        }
        getStats(mujeres);
        $('#profile-card-item-template').remove();

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
            layer.bindPopup(getPopupForWoman(feature.properties), { maxWidth: 500 });
            layer.on('click', function(e) {
                $searchInput.val(feature.properties.extra_nombre);
                $searchInput.addClass('x');
                resetList();
                $('#' + feature.properties.COD_NOMBRE).click();
                scrollToCard(feature.properties.COD_NOMBRE);
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
                    color: '#714691',
                    stroke: '#714691',
                    weight: 5,
                    dashArray: '',
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

    var getPopupForWoman = function(woman) {
        var template = $('#popup-card-item-template').clone();

        // Remove id from template
        template.attr('id', woman.COD_NOMBRE);
        // Add some useful data
        template.data('name', woman.extra_nombre);
        // Fill up attrs
        if (woman.extra_imagen) {
            template.find('.image img').attr('src', woman.extra_imagen);
        }
        template.find('.nombre').text(woman.extra_nombre);
        template.find('.subtipo').text(woman.extra_nombre_subtipo);
        template.find('.descripcion').text(woman.extra_significado_via);
        return template.html();
    };

    var removeAllStreets = function() {
        for (let street_id in feature_layers) {
            if (feature_layers.hasOwnProperty(street_id)) {
                feature_layers[street_id].forEach(layer => {
                    layer.setStyle({
                        weight: 2,
                        stroke: '#1F1FFF',
                        color: '#1F1FFF',
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
            stroke: '#0000ff',
            color: '#0000ff',
            weight: 3,
            dashArray: '',
        });
    };
    /************************/

    // Search
    var timer;
    var $searchInput = $('#search-field-input');
    $searchInput
        .on('keyup', function(e) {
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
        })
        .on('change', function(e) {
            if ($(this).val().length == 0) {
                resetList();
                resetLayerStyles();
                mymap.fitBounds(all_bounds);
            }
        });
    addClearables('.clearable');

    var search = function(query) {
        var results_found = [];
        // Hide the non-matching results
        $('#profiles .card').each(function() {
            if (
                $(this)
                    .data('name')
                    .toLowerCase()
                    .indexOf(query.toLowerCase()) === -1
            ) {
                $(this).addClass('is-gone');
            } else {
                results_found.push($(this).data('id-nomenclator'));
            }
        });
        // Show results on the map
        highlightFeatures(results_found);
    };

    // Get back the profile list to its original state (all profiles shown and all cards collapsed)
    var resetList = function() {
        $('#profiles .card').each(function() {
            $(this).removeClass('is-gone');
        });

        collapseAll();
    };

    var scrollToCard = function(elId) {
        var card = document.getElementById(elId);
        var topPos = card.offsetTop;
        card.parentElement.scrollTop = topPos - card.parentElement.offsetTop;
    };

    /**
     * STATS AND BOTTOM GRAPH
     */
    var dataStats = { name: 'root', children: [] };
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
            dataStats.children.push({ name: tipo.toUpperCase(), size: stats[tipo] });
        }

        renderTreeMap(dataStats);
    };

    var loadPopulationGraphs = function() {
        if ($('#women-population-graph').children().length == 0) {
            renderPieChart('#women-population-graph', 'data/population.json');
        }
        if ($('#women-occupation-graph').children().length == 0) {
            renderHorizontalBar('#women-occupation-graph', 'data/occupation.json');
        }
        if ($('#women-education-graph').children().length == 0) {
            renderHorizontalBar('#women-education-graph', 'data/education.json');
        }
        if ($('#women-homemakers-graph').children().length == 0) {
            renderPieChart('#women-homemakers-graph', 'data/homemakers.json');
        }
    };

    /****************************/
    /**      NAVIGATION       **/
    var toggleNavbarVisibility = function(scrollLimit) {
        if ($(window).scrollTop() > scrollLimit) {
            $('#top-navbar').show();
        } else {
            $('#top-navbar').hide();
        }
    };

    var showSection = function(nextSection) {
        $('ul.nav-elements > li.is-active').removeClass('is-active');
        $('ul.nav-elements > li')
            .filter('[data-section="' + nextSection + '"]')
            .addClass('is-active');
        // Hide all tabs
        $('.tab').hide();
        // Show the proper one
        $('#section-' + nextSection).show();

        if (nextSection == 'poblacion') {
            loadPopulationGraphs();
        }
        let headerEl = $('header.hero');
        let scrollPoint =
            headerEl.offset().top + headerEl.height() - $('#top-navbar').height() * 0.7;

        $(window).scrollTop(scrollPoint);
    };

    $('#top-navbar').hide();
    let headerBodyEl = $('.hero-body > .container');
    var headerBottom = headerBodyEl.offset().top + headerBodyEl.height();
    $(window).scroll(function() {
        toggleNavbarVisibility(headerBottom);
    });

    $('.button.continuar').click(function(e) {
        // Navigation tabs
        let nextSection = $(this)
            .data('next')
            .replace(/section-/, '');
        showSection(nextSection);
    });

    $('ul.nav-elements > li').click(function(e) {
        if ($(this).hasClass('is-active')) {
            return;
        }
        showSection($(this).data('section'));
    });

    // It's necessary to show the tabs in order to dynamically calculate the width
    $('.tab').hide();
    $('.tab')
        .first()
        .show();
});
