import Accordion from 'rollerskate';
import jquery from 'jquery';
import L from 'leaflet';
window.$ = window.jQuery = jquery;
window.L = L;

$(document).ready(function(){
    // Add map
    var mymap = L.map('map-container').setView([-34.906557,-56.199769], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Map data &copy; <a href=\'http://openstreetmap.org\'>OpenStreetMap</a>",
        maxZoom: 18,
        id: "map-container",
    }).addTo(mymap);

    // Load geojson
    $.getJSON("/mujeres.json", function (geojson){
        L.geoJSON(geojson.features).addTo(mymap);

        var ids = [];
        var mujeres = [];
        // Add profiles
        for (let calle of geojson.features) {
            var id = calle.properties.COD_NOMBRE;
            if (ids.indexOf(id) === -1) {
                mujeres.push(calle.properties);
                ids.push(id);
            }
        }
        for (let mujer of mujeres) {
            var template = $("#profile-card-item-template").clone();
            template.attr('id', '');
            template.data('id-nomenclator', mujer.COD_NOMBRE);
            template.data('index', mujeres.indexOf(mujer));
            if (mujer.extra_imagen) {
                template.find('.image img').attr('src', mujer.extra_imagen);
                template.find('.card-header-title').text(mujer.extra_nombre_de_clasificacion);
            }
            template.find('.card-header-title').text(mujer.extra_nombre_de_clasificacion);
            template.find('.title').text(mujer.extra_nombre_de_clasificacion);
            template.find('.subtitle').text(mujer.extra_nombre_subtipo);
            template.find('.content').text(mujer.extra_significado_via);
            template.show();
            template.click(function() {
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
            });
            $('#profiles').append(template);
        }
        $("#profile-card-item").remove();

        const accordion = new Accordion(window);
        accordion.collapseAll();
        // accordion.item(0).expand();
        // accordion.item(1).expand();
    });


});
