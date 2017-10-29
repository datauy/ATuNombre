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
var mujeres = [];
var mymap;
var accordion;

$(document).ready(function(){
    // Add map
    mymap = L.map('map-container').setView([-34.906557,-56.199769], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Map data &copy; <a href=\'http://openstreetmap.org\'>OpenStreetMap</a>",
        maxZoom: 18,
        id: "map-container",
    }).addTo(mymap);

    var fillTemplate = function(template, mujer) {
        // Remove id from template
        template.attr('id', '');
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

    // Load geojson
    $.getJSON("/mujeres.json", function (geojson) {
        L.geoJSON(geojson.features).addTo(mymap);

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
        $("#profile-card-item-template").remove();

        accordion = new Accordion(window);
        accordion.collapseAll();
    });

    // Search
    var resetList = function() {
        $('#profiles div').each(function() {
            $(this).removeClass('is-gone');
        });
    };

    var search = function(query) {
        $('#profiles .card').each(function() {
            if ($(this).data('name').toLowerCase().indexOf(query.toLowerCase()) === -1) {
                $(this).addClass('is-gone');
            }
        });
    };

    var timer;
    var $searchInput = $('#search-field input');
    $searchInput.on("keyup", function(e) {
        timer && clearTimeout(timer);
        var query = $(this).val();
        timer = setTimeout(function() {
            resetList();
            if (query.length > 1) {
                search(query);
            }
        }, 300);
    });

});
