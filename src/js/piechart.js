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
            maxWidth: 400,
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
    let data = config.data;
    let xAxis = config.xAxis;
    let mainDiv = config.mainDiv;
    let mainDivName = mainDiv.substr(1, mainDiv.length);
    let label = config.label;
    let requireLegend = config.requireLegend;

    var width = $(mainDiv).width();
    if (width > config.maxWidth) {
        width = config.maxWidth;
    }
    // Add some extra margin for tooltips
    width + $(mainDiv).width() * 0.1;
    var height = width * 0.9;

    d3
        .select(mainDiv)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    var svg = d3.select(mainDiv + ' svg'),
        width,
        height;

    var radius = Math.min(width, height) / 2,
        g = svg.append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    var fader = function(color) {
            return d3.interpolateRgb(color, '#fff')(0.2);
        },
        color = d3.scaleOrdinal(d3.schemeCategory10.map(fader));

    var pie = d3
        .pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

    var path = d3
        .arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var label_chart = d3
        .arc()
        .outerRadius(radius)
        .innerRadius(radius / 4);

    var arc = g
        .selectAll('.arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc')
        .attr('data-index', function(d, i) {
            return d.data.name.replace(/[^\w]/g, '-') + '_' + d.index;
        });

    let paths = arc
        .append('path')
        .attr('d', path)
        .attr('fill', function(d) {
            return color(d.data.name);
        });

    arc
        .append('text')
        .attr('transform', function(d) {
            return 'translate(' + label_chart.centroid(d) + ')';
        })
        .attr('dy', '0.35em')
        .attr('class', 'pie-chart-label')
        .text(function(d) {
            return d.data.name;
        });

    var self = {};
    self.svg = svg;
    self.cssPrefix = 'pieGroup0_';
    self.data = data;
    // self.keys = keys;
    self.height = height;
    self.width = width;
    self.label = label;
    // self.yAxis = yAxis;
    self.xAxis = xAxis;
    tooltip.add(self);

    // let paths = arc.selectAll('path');

    arc.on('mouseover', function() {
        var currentEl = d3.select(this);
        var index = currentEl.attr('data-index');
        tooltip.showTooltip(self, index);
    });

    arc.on('mouseout', function() {
        var currentEl = d3.select(this);
        var index = currentEl.attr('data-index');
        tooltip.hideTooltip(self, index);
    });

    arc.on('mousemove', function() {
        tooltip.moveTooltip(self);
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
                    { key: d.name, value: d.value, index: d.name.replace(/[^\w]/g, '-') + '_' + i },
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
                    { key: d.name, value: d.value, index: d.name.replace(/[^\w]/g, '-') + '_' + i },
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
