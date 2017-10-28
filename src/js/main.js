import Accordion from 'rollerskate';
const accordion = new Accordion(window);
accordion.collapseAll();

import jquery from 'jquery';
window.$ = window.jQuery = jquery;

var mujeres;

$.getJSON("mujeres.geojson", function(geojson) {
    // geojson has all the data
    mujeres = geojson;
});
