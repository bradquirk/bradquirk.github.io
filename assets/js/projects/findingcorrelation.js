// Get the data
d3.csv("/assets/csv/projects/findingcorrelation.csv")
    .then(function(data) {
        //format data
        //****** PREPARE DATA ******//

        //the v4 version of parseTime
        var parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S");
        var formatDate = d3.timeFormat("%Y-%m-%d");
        var parseTime = d3.timeParse("%Y-%m-%d");
        var cleanDate = d3.timeFormat("%e %b '%y");
        var emptyDate = formatDate(parseDate(0));
        var dataTable, colourScheme;
        var dimensions = [];
        var brushSelection = [];

        data = addRealKey(data);

        //****** END PREPARE DATA ******//

        var margin = {
                top: 50,
                right: 100,
                bottom: 10,
                left: 100
            },
            width = d3.select('#chart').node().getBoundingClientRect().width - margin.left - margin.right,
            height = $(window).innerHeight() * 0.4 - margin.top - margin.bottom,
            innerHeight = height - 2;

        var devicePixelRatio = window.devicePixelRatio || 1;

        var colour = d3.scaleSequential().interpolator(piecewise(d3.interpolateHcl, ["#A0FE65", "#FA016D"])).domain([0, data.length - 1]);

        var types = {
            "Number": {
                key: "Number",
                coerce: function(d) {
                    return +d;
                },
                extent: d3.extent,
                within: function(d, extent, dim) {
                    return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1];
                },
                defaultScale: d3.scaleLinear().range([innerHeight, 0])
            },
            "String": {
                key: "String",
                coerce: String,
                extent: function(data) {
                    return data.sort();
                },
                within: function(d, extent, dim) {
                    return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1];
                },
                defaultScale: d3.scalePoint().range([0, innerHeight])
            },
            "Date": {
                key: "Date",
                coerce: function(d) {
                    return new Date(d);
                },
                extent: d3.extent,
                within: function(d, extent, dim) {
                    return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1];
                },
                defaultScale: d3.scaleTime().range([0, innerHeight])
            }
        };

        dimensions = getUnique(createDimensions(), 'key');

        var xscale = d3.scalePoint()
            .domain(d3.range(dimensions.length))
            .range([0, width]);

        $("#chart").height(height + margin.top + margin.bottom);
        $("#table").height((height + margin.top + margin.bottom) / 2);

        var container = d3.select("#chart");

        var svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var canvas = container.append("canvas")
            .attr("width", width * devicePixelRatio)
            .attr("height", height * devicePixelRatio)
            .style("width", width + "px")
            .style("height", height + "px")
            .style("margin-top", margin.top + "px")
            .style("margin-left", margin.left + "px");

        var ctx = canvas.node().getContext("2d");
        //ctx.globalCompositeOperation = 'lighten';
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 1.5;
        ctx.scale(devicePixelRatio, devicePixelRatio);

        var output = d3.select("#table").append("pre");

        data.forEach(function(d) {
            dimensions.forEach(function(p) {
                d[p.key] = !d[p.key] ? null : p.type.coerce(d[p.key]);
            });

            // truncate long text strings to fit in data table
            for (var key in d) {
                if (d[key] && d[key].length > 35) d[key] = d[key].slice(0, 36);
            }
        });

        // type/dimension default setting happens here
        dimensions.forEach(function(dim) {
            if (!("domain" in dim)) {
                // detect domain using dimension type's extent function
                dim.domain = d3_functor(dim.type.extent)(data.map(function(d) {
                    return d[dim.key];
                }));
            }
            if (!("scale" in dim)) {
                // use type's default scale for dimension
                dim.scale = dim.type.defaultScale.copy();
            }
            dim.scale.domain(dim.domain);
        });


        // shuffle the data
        data = d3.shuffle(data);

        var render = renderQueue(draw).rate(data.length / 50);

        ctx.clearRect(0, 0, width, height);
        render(data);

        var axes = svg.selectAll(".axis")
            .data(dimensions)
            .enter().append("g")
            .attr("class", function(d) {
                return "axis " + d.key.replace(/ /g, "_");
            })
            .attr("transform", function(d, i) {
                return "translate(" + xscale(i) + ")";
            });

        axes.append("g")
            .each(function(d) {
                var renderAxis = "axis" in d ?
                    d.axis.scale(d.scale) // custom axis
                    :
                    d3.axisLeft().scale(d.scale); // default axis
                d3.select(this).call(renderAxis);
            })
            .append("text")
            .attr("class", "title")
            .attr("text-anchor", "start")
            .text(function(d) {
                return "description" in d ? d.description : d.key;
            });

        // Add and store a brush for each axis.
        axes.append("g")
            .attr("class", "brush")
            .each(function(d) {
                d3.select(this).call(d.brush = d3.brushY()
                    .extent([
                        [-10, 0],
                        [10, height]
                    ])
                    .on("start", brushstart)
                    .on("brush", brush)
                    .on("end", brush)
                )
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);
            
        output.text(d3.tsvFormat(data.slice()));

        function project(d) {
            return dimensions.map(function(p, i) {
                // check if data element has property and contains a value
                if (!(p.key in d) ||
                    d[p.key] === null
                ) return null;

                return [xscale(i), p.scale(d[p.key])];
            });
        };

        function draw(d) {
            ctx.strokeStyle = colour(d.index);
            ctx.beginPath();
            var coords = project(d);
            coords.forEach(function(p, i) {
                // this tricky bit avoids rendering null values as 0
                if (p === null) {
                    // this bit renders horizontal lines on the previous/next
                    // dimensions, so that sandwiched null values are visible
                    if (i > 0) {
                        var prev = coords[i - 1];
                        if (prev !== null) {
                            ctx.moveTo(prev[0], prev[1]);
                            ctx.lineTo(prev[0] + 6, prev[1]);
                        }
                    }
                    if (i < coords.length - 1) {
                        var next = coords[i + 1];
                        if (next !== null) {
                            ctx.moveTo(next[0] - 6, next[1]);
                        }
                    }
                    return;
                }

                if (i == 0) {
                    ctx.moveTo(p[0], p[1]);
                    return;
                }

                ctx.lineTo(p[0], p[1]);
            });
            ctx.stroke();
        }

        function brushstart() {
            d3.event.sourceEvent.stopPropagation();
        }

        // Handles a brush event, toggling the display of foreground lines.
        function brush() {
            render.invalidate();

            var actives = [];
            svg.selectAll(".axis .brush")
                .filter(function(d) {
                    return d3.brushSelection(this);
                })
                .each(function(d) {
                    actives.push({
                        dimension: d,
                        extent: d3.brushSelection(this)
                    });
                });

            var selected = data.filter(function(d) {
                if (actives.every(function(active) {
                        var dim = active.dimension;
                        // test if point is within extents for each active brush
                        return dim.type.within(d[dim.key], active.extent, dim);
                    })) {
                    return true;
                }
            });

            // show ticks for active brush dimensions
            // and filter ticks to only those within brush extents

            svg.selectAll(".axis")
                .filter(function(d) {
                    return actives.indexOf(d) > -1 ? true : false;
                })
                .classed("active", true)
                .each(function(dimension, i) {
                    var extent = extents[i];
                    d3.select(this)
                        .selectAll(".tick text")
                        .style("display", function(d) {
                            var value = dimension.type.coerce(d);
                            return dimension.type.within(value, extent, dimension) ? null : "none";
                        });
                });

            // reset dimensions without active brushes
            svg.selectAll(".axis")
                .filter(function(d) {
                    return actives.indexOf(d) > -1 ? false : true;
                })
                .classed("active", false)
                .selectAll(".tick text")
                .style("display", null);


            ctx.clearRect(0, 0, width, height);
            render(selected);

            output.text(d3.tsvFormat(selected.slice()));

            brushSelection = selected;
        }

        function d3_functor(v) {
            return typeof v === "function" ? v : function() {
                return v;
            };
        };

        function camelise(str) {
            return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
                if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
                return index == 0 ? match.toLowerCase() : match.toUpperCase();
            });
        }

        function piecewise(interpolate, values) {
            var i = 0,
                n = values.length - 1,
                v = values[0],
                I = new Array(n < 0 ? 0 : n);
            while (i < n) I[i] = interpolate(v, v = values[++i]);
            return function(t) {
                var i = Math.max(0, Math.min(n - 1, Math.floor(t *= n)));
                return I[i](t - i);
            };
        }

        function createDimensions() {
            var dimensions = [];
            if (new Set(data.map(d => d.key)).size > 1) {
                dimensions.push({
                    key: "key",
                    description: "Jira Key",
                    type: types["String"],
                    axis: d3.axisLeft()
                        .tickFormat(function(e, i) {
                            //only return 10 axis values
                            let size = Math.ceil(new Set(data.map(d => d.key)).size / 10);
                            if (i % size == 0)
                                return e;
                        })
                })
            };
            if (new Set(data.map(d => d['Epic Name'])).size > 1) {
                dimensions.push({
                    key: "Epic Name",
                    description: "Epic Name",
                    type: types["String"],
                    axis: d3.axisLeft()
                        .tickFormat(function(e, i) {
                            //only return 10 axis values
                            let size = Math.ceil(new Set(data.map(d => d['Epic Name'])).size / 10);
                            if (i % size == 0)
                                return e.substring(0, 15) + "...";
                        })
                })
            };
            if (new Set(data.map(d => d['Cost of Delay'])).size > 1) {
                dimensions.push({
                    key: "Cost of Delay",
                    description: "Cost of Delay",
                    type: types["String"],
                    axis: d3.axisLeft()
                        .tickFormat(function(e, i) {
                            //only return 10 axis values
                            let size = Math.ceil(new Set(data.map(d => d['Cost of Delay'])).size / 10);
                            if (i % size == 0)
                                return e;
                        })
                })
            };
            if (new Set(data.map(d => d['Resolved Name'])).size > 1) {
                dimensions.push({
                    key: "Resolved Name",
                    description: "Resolution",
                    type: types["String"],
                    axis: d3.axisLeft()
                        .tickFormat(function(e, i) {
                            //only return 10 axis values
                            let size = Math.ceil(new Set(data.map(d => d['Resolved Name'])).size / 10);
                            if (i % size == 0)
                                return e;
                        })
                })
            };
            if (new Set(data.map(d => d['Story Points'])).size > 1) {
                dimensions.push({
                    key: "Story Points",
                    description: "Story Points",
                    type: types["Number"],
                    scale: d3.scaleSqrt().range([innerHeight, 0])
                })
            };
            if (new Set(data.map(d => d['Cycle Time (Bus. Days)'])).size > 1) {
                dimensions.push({
                    key: "Cycle Time (Bus. Days)",
                    description: "Cycle Time",
                    type: types["Number"],
                    scale: d3.scaleSqrt().range([innerHeight, 0])
                })
            };
            if (new Set(data.map(d => d['Lead Time (Bus. Days)'])).size > 1) {
                dimensions.push({
                    key: "Lead Time (Bus. Days)",
                    description: "Lead Time",
                    type: types["Number"],
                    scale: d3.scaleSqrt().range([innerHeight, 0])
                })
            };
            if (new Set(data.map(d => d['Created Date'])).size > 1) {
                dimensions.push({
                    key: "Created Date",
                    description: "Created Date",
                    type: types["Date"],
                    // axis: d3.axisLeft()
                    //         .tickFormat(function(d, i) {
                    //             return d;
                    //         })
                })
            };
            if (new Set(data.map(d => d['First In Progress Date'])).size > 1) {
                dimensions.push({
                    key: "First In Progress Date",
                    description: "In Progress Date",
                    type: types["Date"],
                    // axis: d3.axisLeft()
                    //         .tickFormat(function(d, i) {
                    //             return d;
                    //         })
                })
            };
            if (new Set(data.map(d => d['Last Resolved Date'])).size > 1) {
                dimensions.push({
                    key: "Last Resolved Date",
                    description: "Resolved Date",
                    type: types["Date"],
                    // axis: d3.axisLeft()
                    //         .tickFormat(function(d, i) {
                    //             return d;
                    //         })
                })
            };

            return dimensions;
        }

        function getUnique(arr, comp) {

            const unique = arr
                .map(e => e[comp])

            // store the keys of the unique objects
            .map((e, i, final) => final.indexOf(e) === i && i)

            // eliminate the dead keys & store unique objects
            .filter(e => arr[e]).map(e => arr[e]);

            return unique;
        }

        function addRealKey(data) {
            data.forEach((d, i) => {
                var maxNumber = d3.max(data, e => +e['Key'].substring(e['Key'].indexOf('-') + 1, e['Key'].length).length)
                key = d['Key'].substring(0, d['Key'].indexOf('-')),
                    number = d['Key'].substring(d['Key'].indexOf('-') + 1, d['Key'].length);

                for (k = number.length; k < maxNumber; k++) {
                    number = '0' + number;
                }

                //add new key
                d.key = key + '-' + number;
            })

            //sort array based on real key
            data.sort((a, b) => {
                var projectA = a['Key'].substring(0, a['Key'].indexOf('-')),
                    projectB = b['Key'].substring(0, b['Key'].indexOf('-')),
                    numberA = +a['Key'].substring(a['Key'].indexOf('-') + 1, a['Key'].length),
                    numberB = +b['Key'].substring(b['Key'].indexOf('-') + 1, b['Key'].length);
                //first compare projects, then keys
                if (projectA < projectB) return -1;
                if (projectA > projectB) return 1;
                if (numberA < numberB) return -1;
                if (numberA > numberB) return 1;
                return 0;
            });

            //now add an index to reference when data is randomised
            data.forEach((d, i) => {
                d.index = i;
            })

            return data;
        }
        
    });
    var renderQueue = (function(func) {
        var _queue = [],                  // data to be rendered
            _rate = 1000,                 // number of calls per frame
            _invalidate = function() {},  // invalidate last render queue
            _clear = function() {};       // clearing function
      
        var rq = function(data) {
          if (data) rq.data(data);
          _invalidate();
          _clear();
          rq.render();
        };
      
        rq.render = function() {
          var valid = true;
          _invalidate = rq.invalidate = function() {
            valid = false;
          };
      
          function doFrame() {
            if (!valid) return true;
            var chunk = _queue.splice(0,_rate);
            chunk.map(func);
            timer_frame(doFrame);
          }
      
          doFrame();
        };
      
        rq.data = function(data) {
          _invalidate();
          _queue = data.slice(0);   // creates a copy of the data
          return rq;
        };
      
        rq.add = function(data) {
          _queue = _queue.concat(data);
        };
      
        rq.rate = function(value) {
          if (!arguments.length) return _rate;
          _rate = value;
          return rq;
        };
      
        rq.remaining = function() {
          return _queue.length;
        };
      
        // clear the canvas
        rq.clear = function(func) {
          if (!arguments.length) {
            _clear();
            return rq;
          }
          _clear = func;
          return rq;
        };
      
        rq.invalidate = _invalidate;
      
        var timer_frame = window.requestAnimationFrame
          || window.webkitRequestAnimationFrame
          || window.mozRequestAnimationFrame
          || window.oRequestAnimationFrame
          || window.msRequestAnimationFrame
          || function(callback) { setTimeout(callback, 17); };
      
        return rq;
      });