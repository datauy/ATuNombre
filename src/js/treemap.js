import * as d3 from "d3";
import * as d3_scale from "d3-scale";
import jquery from "jquery";

window.d3 = d3;
window.$ = window.jQuery = jquery;

export default function(data) {
    var root = d3
      .hierarchy(data)
      .eachBefore(function(d) {
        d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
      })
      .sum(function(d) {
          return d.size;
      })
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
        return color(d.data.id);
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
      .style("font-size", function(d) {
        //   console.log(d.data);
        //   console.log(getFontSize((d.x1 - d.x0))+'em');
        return getFontSize((d.x1 - d.x0) )+'em';
      })
      .selectAll("tspan")
          .data(function(d) {
            return d.data.name.split(/(?=[A-Z][^A-Z])/g);
          })
      .enter()
      .append("tspan")
        .text(function(d) {
            return d;
        });

    cell.select('text').attr("x", function(d) {
        let rectangle_width = d.x1 - d.x0;
        let text_width = $(this).get()[0].getBoundingClientRect().width;
        return  rectangle_width/2 - text_width/2;
    })
    .attr("y", function(d) {
        let rectangle_height = (d.y1 - d.y0);
      return  rectangle_height/2;
  });

    cell.append("title").text(function(d) {
      return format(d.value) + ' mujeres en la categoría ' + d.data.name;
    });
  };

  var getFontSize = function(area) {
    // compute font size based on sqrt(area)
    return Math.round(Math.max(9, Math.sqrt(area)))/10;
  };

  var svg = d3.select("#women-roles-treemap");

    svg.attr('width', function() {
        return $(this.parentNode).width() * 0.7;
    });

    svg.attr('height', function() {
        return svg.attr('width')*3/4;
    });

    var width = +svg.attr("width"),
    height = +svg.attr("height");

    var fader = function(color) {
      return d3.interpolateRgb(color, "#fff")(0.2);
    },
    color = d3.scaleOrdinal(d3.schemeCategory10.map(fader)),
    format = d3.format(",d");

  var treemap = d3
    .treemap()
    .tile(d3.treemapResquarify)
    .size([width, height])
    .round(true)
    .paddingInner(1);
