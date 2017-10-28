import Accordion from 'rollerskate';
const accordion = new Accordion(window);
accordion.collapseAll();

import jquery from 'jquery';
window.$ = window.jQuery = jquery;

$.getJSON("mujeres.geojson", function(geojson) {
    // geojson has all the data
});
