export default function(selector, data_source) {
    d3.json(data_source, function(error, data) {
        if (error) throw error;

        $(selector).empty();
        var pieChartConfig = {
            mainDiv: selector,
            data: _.orderBy(data, ['value'], ['asc']),
            xAxis: 'name',
            label: {
                xAxis: '%',
            },
            maxWidth: 500,
            requireLegend: true,
        };
        var groupChart = new pieChart(pieChartConfig);
    });
}

function pieChart(config) {
    function setReSizeEvent(config) {
        var resizeTimer;
        var interval = 500;
        window.removeEventListener('resize', function() {});
        window.addEventListener('resize', function(event) {
            if (resizeTimer !== false) {
                clearTimeout(resizeTimer);
            }
            resizeTimer = setTimeout(function() {
                $(config.mainDiv).empty();
                drawPieChart(config);
                clearTimeout(resizeTimer);
            }, interval);
        });
    }
    drawPieChart(config);
    setReSizeEvent(config);
}

function drawPieChart(config) {
    let xAxis = config.xAxis;
    let mainDiv = config.mainDiv;
    let mainDivName = mainDiv.substr(1, mainDiv.length);
    let label = config.label;
    let legendItemHeight = 10;
    let requireLegend = config.requireLegend;

    let svgWidth = Math.round($(mainDiv).width() * 0.95);

    let width = Math.round(svgWidth * 0.9);
    let svgHeight = width;
    if (width > config.maxWidth) {
        width = config.maxWidth;
    }
    let height = width*0.9;

    let svg = d3
        .select(mainDiv)
        .append('svg')
        .attr('class', 'pie')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g').
            attr('transform', 'translate(' + svgWidth / 2 + ',' + svgHeight / 2 + ')');

    let radius = Math.min(width, height) / 2;

    let fader = function(color) {
            return d3.interpolateRgb(color, '#fff')(0.2);
        },
        color = d3.scaleOrdinal(d3.schemeCategory20.map(fader));

    let pie = d3
        .pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

    let data = pie(config.data);

    var path = d3
        .arc()
        .outerRadius(radius*0.95)
        .innerRadius(radius*0.45);

    var arc = svg
        .selectAll('.arc')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'arc')
        .attr('data-index', function(d, i) {
            return d.data.name.replace(/[^\w]/g, '-') + '_' + d.index;
        });

    let paths = arc
        .append('path')
        .attr('d', path)
        .attr('fill', function(d, i) {
            return color(i);
        });

    svg.selectAll("text")
    .data(data)
    .enter()
    .append('text')
    .attr("text-anchor", "middle")
    .attr("x", function(d) {
        var a = d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
        d.cx = Math.cos(a) * (radius/2 + radius/5); //  + radius*0.1
        return d.x = Math.cos(a) * (radius + radius*0.02); //+ radius*0.01
    })
    .attr("y", function(d) {
        var a = d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
        d.cy = Math.sin(a) * (radius/2 + radius/5); //  + radius*0.1
        return d.y = Math.sin(a) * (radius + radius*0.02); //+ radius*0.01
    })
    .attr('class', 'pie-chart-label')
    .text(function(d) {
        return d.data.name;
    })
    .each(function(d) {
        var bbox = this.getBBox();
        // add max width
        if (bbox.width > 60) {
            bbox.width = 60;
        }
        d.sx = d.x - bbox.width/2 - 2;
        d.ox = d.x + bbox.width/2 + 2;
            d.sy = d.oy = d.y + 5;
    });

    svg.append("defs").append("marker")
    .attr("id", "circ")
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("refX", 3)
    .attr("refY", 3)
    .append("circle")
        .attr("cx", 3)
        .attr("cy", 3)
        .attr("r", 3);


    svg.selectAll("path.pointer")
        .data(data)
      .enter()
      .append("path")
      .attr("class", "pointer")
      .style("fill", "none")
      .style("stroke", "black")
      .attr("marker-end", "url(#circ)")
      .attr("d", function(d) {
        if(d.cx > d.ox) {
            return "M" + d.sx + "," + d.sy + "L" + d.ox + "," + d.oy + " " + d.cx + "," + d.cy;
        } else {
            return "M" + d.ox + "," + d.oy + "L" + d.sx + "," + d.sy + " " + d.cx + "," + d.cy;
        }
      });

    let pieObject = {};
    pie.svg = d3.select(mainDiv + " svg");
    pie.cssPrefix = 'pieGroup0_';
    // pie.arc = arc;
    // pie.path = path;
    pie.radius = radius;
    pie.data = data;
    // pie.keys = keys;
    pie.height = svgHeight;
    pie.width = svgWidth;
    pie.label = label;
    pie.color = color;
    // pie.yAxis = yAxis;
    pie.xAxis = xAxis;
    tooltip.add(pie);

    arc.on('mouseover', function() {
        var currentEl = d3.select(this);
        var index = currentEl.attr('data-index');
        tooltip.showTooltip(pie, index);
    });

    arc.on('mouseout', function() {
        var currentEl = d3.select(this);
        var index = currentEl.attr('data-index');
        tooltip.hideTooltip(pie, index);
    });

    arc.on('mousemove', function() {
        tooltip.moveTooltip(pie);
    });
}

var tooltip = {
    add: function(pie) {
        // group the label groups (label, percentage, value) into a single element for simpler positioning
        var element = pie.svg
            .append('g')
            .selectAll('g')
            .data(pie.data)
            .enter()
            .append('g')
            .attr('class', function(d, i) {
                return pie.cssPrefix + 'tooltip' + '_' + i;
            });

        var tooltips = element
            .selectAll('g')
            .data(function(d, i) {
                return [
                    { key: d.data.name, value: d.value, index: d.data.name.replace(/[^\w]/g, '-') + '_' + i },
                ];
            })
            .enter()
            .append('g')
            .attr('class', pie.cssPrefix + 'tooltip')
            .attr('id', function(d, i) {
                return pie.cssPrefix + 'tooltip' + d.index;
            })
            .style('opacity', 0)
            .append('rect')
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('x', -2)
            .attr('opacity', 0.71)
            .style('fill', '#000000');

        element
            .selectAll('g')
            .data(function(d, i) {
                return [
                    { key: d.data.name, value: d.value, index: d.data.name.replace(/[^\w]/g, '-') + '_' + i },
                ];
            })
            .append('text')
            .attr('fill', function(d) {
                return '#efefef';
            })
            .attr('class', 'tooltip')
            .text(function(d, i) {
                return d.key + ' (' + d.value + pie.label.xAxis + ')';
            });

        element
            .selectAll('g rect')
            .attr('width', function(d, i) {
                var dims = helpers.getDimensions(pie.cssPrefix + 'tooltip' + d.index);
                return dims.w + 2 * 4;
            })
            .attr('height', function(d, i) {
                var dims = helpers.getDimensions(pie.cssPrefix + 'tooltip' + d.index);
                return dims.h + 2 * 4;
            })
            .attr('y', function(d, i) {
                var dims = helpers.getDimensions(pie.cssPrefix + 'tooltip' + d.index);
                return -(dims.h / 2) + 1;
            });
    },

    showTooltip: function(pie, index) {
        var fadeInSpeed = 250;
        if (tooltip.currentTooltip === index) {
            fadeInSpeed = 1;
        }

        tooltip.currentTooltip = index;
        d3
            .select('#' + pie.cssPrefix + 'tooltip' + index)
            .transition()
            .duration(fadeInSpeed)
            .style('opacity', function() {
                return 1;
            });

        tooltip.moveTooltip(pie);
    },

    moveTooltip: function(pie) {
        d3
            .selectAll('#' + pie.cssPrefix + 'tooltip' + tooltip.currentTooltip)
            .attr('transform', function(d) {
                var mouseCoords = d3.mouse(this.parentNode);
                var x = mouseCoords[0] - 20;
                var y = mouseCoords[1] - 10;
                return 'translate(' + x + ',' + y + ')';
            });
    },

    hideTooltip: function(pie, index) {
        d3.select('#' + pie.cssPrefix + 'tooltip' + index).style('opacity', function() {
            return 0;
        });

        // move the tooltip offscreen. This ensures that when the user next mouseovers the segment the hidden
        // element won't interfere
        d3
            .select('#' + pie.cssPrefix + 'tooltip' + tooltip.currentTooltip)
            .attr('transform', function(d, i) {
                // klutzy, but it accounts for tooltip padding which could push it onscreen
                var x = pie.width + 1000;
                var y = pie.height + 1000;
                return 'translate(' + x + ',' + y + ')';
            });
    },
};

var helpers = {
    getDimensions: function(id) {
        var el = document.getElementById(id);
        var w = 0,
            h = 0;
        if (el) {
            var dimensions = el.getBBox();
            w = dimensions.width;
            h = dimensions.height;
        } else {
            console.log('error: getDimensions() ' + id + ' not found.');
        }
        return { w: w, h: h };
    },
};
