/*
MIT License

Copyright (c) [2017] [DIGI-CORP]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

export default function(selector, data) {
    var groupChartData = [{ "2614": 8, "over": 1 }, { "2614": 7, "over": 2 }, { "2614": 4, "over": 3 }, { "2614": 19, "over": 4 }, { "2614": 3, "over": 5 }, { "2614": 6, "over": 6 }, { "2614": 7, "over": 7 }, { "2614": 13, "over": 8 }, { "2614": 1, "over": 9 }, { "2614": 8, "over": 10 }];
    var columnsInfo = { "2614": "Team A" };

    $(selector).empty();
    var barChartConfig = {
        mainDiv: selector,
        colorRange: ["#2a98cd", "#df7247"],
        data: groupChartData,
        columnsInfo: columnsInfo,
        xAxis: "runs",
        yAxis: "over",
        label: {
            xAxis: "Runs",
            yAxis: "Over"
        },
        requireLegend: true
    };
    var groupChart = new horizontalGroupBarChart(barChartConfig);
}

function horizontalGroupBarChart(config) {
    function setReSizeEvent(data) {
        var resizeTimer;
        var interval = 500;
        window.removeEventListener('resize', function() {});
        window.addEventListener('resize', function(event) {
            if (resizeTimer !== false) {
                clearTimeout(resizeTimer);
            }
            resizeTimer = setTimeout(function() {
                $(data.mainDiv).empty();
                drawHorizontalGroupBarChartChart(data);
                clearTimeout(resizeTimer);
            }, interval);
        });
    }

    drawHorizontalGroupBarChartChart(config);
    setReSizeEvent(config);
}

function drawHorizontalGroupBarChartChart(config) {
    var data = config.data;
    var columnsInfo = config.columnsInfo;
    var xAxis = config.xAxis;
    var yAxis = config.yAxis;
    var colorRange = config.colorRange;
    var mainDiv = config.mainDiv;
    var mainDivName = mainDiv.substr(1, mainDiv.length);
    var label = config.label;
    var requireLegend = config.requireLegend;
    d3
        .select(mainDiv)
        .append('svg')
        .attr('width', $(mainDiv).width())
        .attr('height', $(mainDiv).width() * 0.6);
    var svg = d3.select(mainDiv + ' svg'),
        margin = { top: 20, right: 20, bottom: 40, left: 40 },
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var y0 = d3
        .scaleBand()
        .rangeRound([height, 0])
        .paddingInner(0.1);

    var y1 = d3.scaleBand().padding(0.05);

    var x = d3.scaleLinear().rangeRound([0, width]);

    var z = d3.scaleOrdinal().range(colorRange);

    var keys = Object.keys(columnsInfo);
    y0.domain(
        data.map(function(d) {
            return d[yAxis];
        })
    );
    y1.domain(keys).rangeRound([0, y0.bandwidth()]);
    x
        .domain([
            0,
            d3.max(data, function(d) {
                return d3.max(keys, function(key) {
                    return d[key];
                });
            }),
        ])
        .nice();
    var maxTicks = d3.max(data, function(d) {
        return d3.max(keys, function(key) {
            return d[key];
        });
    });
    var element = g
        .append('g')
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', function(d) {
            return 'translate(0,' + y0(d[yAxis]) + ')';
        });
    var rect = element
        .selectAll('rect')
        .data(function(d, i) {
            return keys.map(function(key) {
                return { key: key, value: d[key], index: key + '_' + i + '_' + d[yAxis] };
            });
        })
        .enter()
        .append('rect')
        .attr('y', function(d) {
            return y1(d.key);
        })
        .attr('width', function(d) {
            return x(d.value);
        })
        .attr('data-index', function(d, i) {
            return d.index;
        })
        .attr('height', y1.bandwidth())
        .attr('fill', function(d) {
            return z(d.key);
        });
    //CBT:add
    var self = {};
    self.svg = svg;
    self.cssPrefix = 'horgroupBar0_';
    self.data = data;
    self.keys = keys;
    self.height = height;
    self.width = width;
    self.label = label;
    self.yAxis = yAxis;
    self.xAxis = xAxis;
    horBarTooltip.add(self);

    rect.on('mouseover', function() {
        var currentEl = d3.select(this);
        var index = currentEl.attr('data-index');
        horBarTooltip.showTooltip(self, index);
    });

    rect.on('mouseout', function() {
        var currentEl = d3.select(this);
        var index = currentEl.attr('data-index');
        horBarTooltip.hideTooltip(self, index);
    });

    rect.on('mousemove', function() {
        horBarTooltip.moveTooltip(self);
    });

    g
        .append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x).ticks(maxTicks))
        .append('text')
        .attr('x', width / 2)
        .attr('y', margin.bottom * 0.7)
        .attr('dx', '0.32em')
        .attr('fill', '#000')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'start')
        .text(label.xAxis);

    g
        .append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y0).ticks(null, 's'))
        .append('text')
        .attr('x', height * 0.4 * -1)
        .attr('y', margin.left * 0.8 * -1) //y(y.ticks().pop()) + 0.5)
        .attr('dy', '0.71em')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('font-weight', 'bold')
        // .attr("text-anchor", "start")
        .text(label.yAxis);
}

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
var horBarTooltip = {
    add: function(pie) {
        var keys = pie.keys;
        // group the label groups (label, percentage, value) into a single element for simpler positioning
        var element = pie.svg
            .append('g')
            .selectAll('g')
            .data(pie.data)
            .enter()
            .append('g')
            .attr('class', function(d, i) {
                return pie.cssPrefix + 'tooltips' + '_' + i;
            });

        var tooltips = element
            .selectAll('g')
            .data(function(d, i) {
                return keys.map(function(key) {
                    return { key: key, value: d[key], index: key + '_' + i + '_' + d[pie.yAxis] };
                });
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
                return keys.map(function(key) {
                    return { key: key, value: d[key], index: key + '_' + i + '_' + d[pie.yAxis] };
                });
            })
            .append('text')
            .attr('fill', function(d) {
                return '#efefef';
            })
            .style('font-size', function(d) {
                return 10;
            })
            .style('font-family', function(d) {
                return 'arial';
            })
            .text(function(d, i) {
                var caption = '' + pie.label.xAxis + ':{value}';

                return horBarTooltip.replacePlaceholders(pie, caption, i, {
                    value: d.value,
                });
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
        if (horBarTooltip.currentTooltip === index) {
            fadeInSpeed = 1;
        }

        horBarTooltip.currentTooltip = index;
        d3
            .select('#' + pie.cssPrefix + 'tooltip' + index)
            .transition()
            .duration(fadeInSpeed)
            .style('opacity', function() {
                return 1;
            });

        horBarTooltip.moveTooltip(pie);
    },

    moveTooltip: function(pie) {
        d3
            .selectAll('#' + pie.cssPrefix + 'tooltip' + horBarTooltip.currentTooltip)
            .attr('transform', function(d) {
                var mouseCoords = d3.mouse(this.parentNode);
                var x = mouseCoords[0] + 4 + 2;
                var y = mouseCoords[1] - 2 * 4 - 2;
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
            .select('#' + pie.cssPrefix + 'tooltip' + horBarTooltip.currentTooltip)
            .attr('transform', function(d, i) {
                // klutzy, but it accounts for tooltip padding which could push it onscreen
                var x = pie.width + 1000;
                var y = pie.height + 1000;
                return 'translate(' + x + ',' + y + ')';
            });
    },

    replacePlaceholders: function(pie, str, index, replacements) {
        var replacer = function() {
            return function(match) {
                var placeholder = arguments[1];
                if (replacements.hasOwnProperty(placeholder)) {
                    return replacements[arguments[1]];
                } else {
                    return arguments[0];
                }
            };
        };
        return str.replace(/\{(\w+)\}/g, replacer(replacements));
    },
};
