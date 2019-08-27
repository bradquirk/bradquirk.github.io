       var formatInteger = d3.format("d");
        var oldUserStories50th = 0,
            oldUserStories85th = 0,
            oldUserStories95th = 0,
            oldSprints50th = 0,
            oldSprints85th = 0,
            oldSprints95th = 0;

        // //****** PREPARE DATA ******//

        //initialise data
        outputData = updateData();

        //****** END PREPARE DATA ******//

        //****** CREATE CHART ******//
        var cadenceWidth = d3.select('#cadenceType1').node().getBoundingClientRect().width - (parseFloat($('#cadenceType1').css('padding-left')) * 3),
            cadenceHeight = d3.select('#cadenceType1').node().getBoundingClientRect().height;

        for (i = 1; i <= 10; i++) {
            d3.select("#cadenceType" + i)
                .append("svg")
                .attr("width", cadenceWidth)
                .attr("height", cadenceHeight)
                .append("text")
                .text("Sprint " + i)
                .attr("y", cadenceHeight / 2)
                .attr("dy", "0.35em")
                .style("fill", "white");
        }

        // set the dimensions and margins of the graph
        var margin = {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            },
            width = d3.select('#chart').node().getBoundingClientRect().width - margin.left - margin.right,
            height = d3.select('#dataInput').node().getBoundingClientRect().height - (margin.top * 3) - margin.bottom;

        // append the svg obgect to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        var storiesSVG = d3.select("#chartStories")
            .append("svg")
            .attr("width", width)
            .attr("transform", "translate(" + margin.left + ",0)");

        var gradientSVG = d3.select("#chartGradient")
            .append("svg")
            .attr("width", width)
            .attr("height", (height + margin.top + margin.bottom) * 0.2)
            .attr("transform", "translate(" + margin.left + ",0)");

        var percentageSVG = d3.select("#chartPercentage")
            .append("svg")
            .attr("width", width)
            .attr("transform", "translate(" + margin.left + ",0)");

        //create x axis range
        var xAxisColour = d3.scaleSequential().interpolator(piecewise(d3.interpolateRgb, ["#D85D6C", "#E8BF61", "#2EB86B"])).domain([0, 1]);
        var xAxisRange = d3.scaleLinear().range([0, 1]).domain([0, 1]);
        var xAxis = d3.scaleLinear().range([0, width]).domain([0, 1]);

        //Container for the gradient
        var defs = gradientSVG.append("defs");
        //Append a linear horizontal gradient
        var linearGradientSprints = defs.append("linearGradient")
            .attr("id", "gradientSprints") //unique id for reference
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0");

        var linearGradientStories = defs.append("linearGradient")
            .attr("id", "gradientStories") //unique id for reference
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0");

        linearGradientSprints.append("stop").attr('id', 'gradSprintsLeft').attr("offset", 0).attr("stop-color", xAxisColour(0));
        linearGradientSprints.append("stop").attr('id', 'gradSprints1st').attr("offset", 0.5).attr("stop-color", xAxisColour(0.5));
        linearGradientSprints.append("stop").attr('id', 'gradSprints2nd').attr("offset", 0.85).attr("stop-color", xAxisColour(0.85));
        linearGradientSprints.append("stop").attr('id', 'gradSprints3rd').attr("offset", 0.95).attr("stop-color", xAxisColour(0.95));
        linearGradientSprints.append("stop").attr('id', 'gradSprintsRight').attr("offset", 1).attr("stop-color", xAxisColour(1));

        linearGradientStories.append("stop").attr('id', 'gradStoriesLeft').attr("offset", 0).attr("stop-color", xAxisColour(1));
        linearGradientStories.append("stop").attr('id', 'gradStories1st').attr("offset", 0.05).attr("stop-color", xAxisColour(0.95));
        linearGradientStories.append("stop").attr('id', 'gradStories2nd').attr("offset", 0.15).attr("stop-color", xAxisColour(0.85));
        linearGradientStories.append("stop").attr('id', 'gradStories3rd').attr("offset", 0.50).attr("stop-color", xAxisColour(0.50));
        linearGradientStories.append("stop").attr('id', 'gradStoriesRight').attr("offset", 1).attr("stop-color", xAxisColour(0));

        percentage50th = percentageSVG.append('text')
            .attr('dominant-baseline', 'baseline')
            .attr('x', 0)
            .style('fill', 'white')
            .text('50%');

        percentage85th = percentageSVG.append('text')
            .attr('dominant-baseline', 'baseline')
            .attr('x', 0)
            .style('fill', 'white')
            .text('85%');

        percentage95th = percentageSVG.append('text')
            .attr('dominant-baseline', 'baseline')
            .attr('x', 0)
            .style('fill', 'white')
            .text('95%');

        stories50th = storiesSVG
            .append('text')
            .attr('dominant-baseline', 'hanging')
            .attr('x', 0)
            .attr('dy', '0.35em')
            .style('fill', 'white');

        stories85th = storiesSVG.append('text')
            .attr('dominant-baseline', 'hanging')
            .attr('x', 0)
            .attr('dy', '0.35em')
            .style('fill', 'white');

        stories95th = storiesSVG.append('text')
            .attr('dominant-baseline', 'hanging')
            .attr('x', 0)
            .attr('dy', '0.35em')
            .style('fill', 'white');

        textHeight = percentage50th.node().getBBox().height;
        textWidth = percentage50th.node().getBBox().width;

        storiesSVG.attr('height', textHeight * 3);
        percentageSVG.attr('height', textHeight * 3);

        percentage50th.attr('y', textHeight * 3 - 5);
        percentage85th.attr('y', textHeight * 3 - 5);
        percentage95th.attr('y', textHeight * 3 - 5);

        percentageLeftVal = percentageSVG.append('text')
            .attr('dominant-baseline', 'baseline')
            .attr('x', 0)
            .attr('y', textHeight * 3)
            .attr('dy', '-0.35em')
            .style('fill', xAxisColour(0));

        percentageLeftText = percentageSVG.append('text')
            .attr('dominant-baseline', 'baseline')
            .attr('x', 0)
            .attr('y', textHeight * 2)
            .attr('dy', '-0.35em')
            .style('fill', xAxisColour(0));

        percentageRightVal = percentageSVG.append('text')
            .attr('dominant-baseline', 'baseline')
            .attr('text-anchor', 'end')
            .attr('x', $('#chart').width() - margin.left - margin.right)
            .attr('y', textHeight * 3)
            .attr('dy', '-0.35em')
            .style('fill', xAxisColour(1));

        percentageRightText = percentageSVG.append('text')
            .attr('dominant-baseline', 'baseline')
            .attr('text-anchor', 'end')
            .attr('x', $('#chart').width() - margin.left - margin.right)
            .attr('y', textHeight * 2)
            .attr('dy', '-0.35em')
            .style('fill', xAxisColour(1));

        storiesLeftValue = storiesSVG
            .append('text')
            .attr('dominant-baseline', 'hanging')
            .attr('x', 0)
            .attr('dy', '0.35em')
            .style('fill', xAxisColour(0))
            .style('text-anchor', 'start');

        storiesLeftText = storiesSVG
            .append('text')
            .attr('dominant-baseline', 'hanging')
            .attr('x', 0)
            .attr('y', textHeight)
            .attr('dy', '0.35em')
            .style('fill', xAxisColour(0))
            .style('text-anchor', 'start')
            .text('Sprints');

        storiesRightValue = storiesSVG
            .append('text')
            .attr('dominant-baseline', 'hanging')
            .attr('x', $('#chart').width() - margin.left - margin.right)
            .attr('dy', '0.35em')
            .style('fill', xAxisColour(1))
            .style('text-anchor', 'end');

        storiesRightText = storiesSVG
            .append('text')
            .attr('dominant-baseline', 'hanging')
            .attr('x', $('#chart').width() - margin.left - margin.right)
            .attr('y', textHeight)
            .attr('dy', '0.35em')
            .style('fill', xAxisColour(1))
            .style('text-anchor', 'end')
            .text('Sprints');

        gradient = gradientSVG.append('rect')
            .attr('width', $('#chart').width() - margin.left - margin.right)
            .attr('height', (height + margin.top + margin.bottom) * 0.2)
            .attr('fill', 'url(#gradientSprints)');

        line50th = gradientSVG.append('line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', $('#chart').height())
            .attr('y2', 0)
            .style('stroke', 'white')
            .style('stroke-width', '2');

        line85th = gradientSVG.append('line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', $('#chart').height())
            .attr('y2', 0)
            .style('stroke', 'white')
            .style('stroke-width', '2');

        line95th = gradientSVG.append('line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', $('#chart').height())
            .attr('y2', 0)
            .style('stroke', 'white')
            .style('stroke-width', '2');

        updateChart();

        //****** END CREATE CHART ******//

        //****** HELPER FUNCTIONS ******//

        //update cadenceLength type when dropdown is changed
        function cadenceTypeChange() {
            var dropdownValue = d3.select('#configCadenceTypeButton')._groups[0][0].textContent;
            var typeValue, lengthHeaderValue, lengthValue;

            //determine text for each dropdown value
            if (dropdownValue == 'Sprints') {
                typeValue = 'Sprint';
                lengthHeaderValue = 'Days';
                lengthValue = 10;
            } else if (dropdownValue == 'Days') {
                typeValue = 'Day';
                lengthHeaderValue = 'Hours';
                lengthValue = 8;
            } else if (dropdownValue == 'Weeks') {
                typeValue = 'Week';
                lengthHeaderValue = 'Days';
                lengthValue = 5;
            } else if (dropdownValue == 'Months') {
                typeValue = 'Month';
                lengthHeaderValue = 'Days';
                lengthValue = 20;
            }

            if (typeof typeValue === "undefined") {
                typeValue = 'Sprint',
                    lengthHeaderValue = 'Days',
                    lengthValue = 10;
            }

            //update #cadenceType
            for (var i = 1; i <= 10; i++) {
                d3.select('#cadenceType' + i).select("text")
                    .text(typeValue + ' ' + i);

                d3.select('#inputLength' + i)
                    .transition()
                    .duration(2500)
                    .on("start", function() {
                        d3.active(this)
                            .attrTween("value", function() {
                                var that = d3.select(this).property('value');
                                return d3.interpolateRound(that, lengthValue);
                            });
                    });
            }

            // update #configCadenceLength
            d3.select('#configCadenceLength')
                .transition()
                .duration(2500)
                .on("start", function() {
                    d3.active(this)
                        .attrTween("value", function() {
                            var that = d3.select(this).property('value');
                            return d3.interpolateRound(that, lengthValue);
                        });
                });

            //update #input-cadenceLengthHeader
            d3.select('#labelConfigCadenceLength')
                .html(typeValue + ' Length <br>(Work ' + lengthHeaderValue + ')');

            //update #input-simDataLengthHeader
            d3.select('#labelInputLength')
                .html(typeValue + ' Length <br>(Work ' + lengthHeaderValue + ')');

            updateChart();

        };


        function leastSquares(X, Y, computeError, ret) {
            if (typeof computeError == 'object') {
                ret = computeError
                computeError = false
            }

            if (typeof ret == 'undefined') ret = {}

            var sumX = 0
            var sumY = 0
            var sumXY = 0
            var sumXSq = 0
            var N = X.length

            for (var i = 0; i < N; ++i) {
                sumX += X[i]
                sumY += Y[i]
                sumXY += X[i] * Y[i]
                sumXSq += X[i] * X[i]
            }

            ret.m = ((sumXY - sumX * sumY / N)) / (sumXSq - sumX * sumX / N)
            ret.b = sumY / N - ret.m * sumX / N

            if (computeError) {
                var varSum = 0
                for (var j = 0; j < N; ++j) {
                    varSum += (Y[j] - ret.b - ret.m * X[j]) * (Y[j] - ret.b - ret.m * X[j])
                }

                var delta = N * sumXSq - sumX * sumX
                var vari = 1.0 / (N - 2.0) * varSum

                ret.bErr = Math.sqrt(vari / delta * sumXSq)
                ret.mErr = Math.sqrt(N / delta * vari)
            }

            return function(x) {
                return ret.m * x + ret.b
            }
        }

        function closestValue(num, arr) {
            var curr = arr[0];
            var diff = Math.abs(num - curr);
            for (var val = 0; val < arr.length; val++) {
                var newdiff = Math.abs(num - arr[val]);
                if (newdiff < diff) {
                    diff = newdiff;
                    curr = arr[val];
                }
            }
            return curr;
        }

        function pathTween(d1, precision) {
            return function() {
                var path0 = this,
                    path1 = path0.cloneNode(),
                    n0 = path0.getTotalLength(),
                    n1 = (path1.setAttribute("d", d1), path1).getTotalLength();

                // Uniform sampling of distance based on specified precision.
                var distances = [0],
                    i = 0,
                    dt = precision / Math.max(n0, n1);
                while ((i += dt) < 1) distances.push(i);
                distances.push(1);

                // Compute point-interpolators at each distance.
                var points = distances.map(function(t) {
                    var p0 = path0.getPointAtLength(t * n0),
                        p1 = path1.getPointAtLength(t * n1);
                    return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
                });

                return function(t) {
                    return t < 1 ? "M" + points.map(function(p) {
                        return p(t);
                    }).join("L") : d1;
                };
            };
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

        function updateData() {
            //get sim input values
            var inputStories = +d3.select('#configWorkItems').property('value');
            var inputFocus = parseFloat(d3.select('#configGoalFocus').property('value')) / 100.0;
            var inputLength = +d3.select('#configCadenceLength').property('value');
            var configCadence = d3.select('#configCadenceType').select('button')._groups[0][0].textContent;
            var configConstraint = d3.select('#configConstraintType').select('button')._groups[0][0].textContent;
            var configWorkItem = d3.select('#configWorkItemType').select('button')._groups[0][0].textContent;
            var totalCount = 0,
                xValues = [];

            //determine number of non-empty values
            for (var i = 1; i <= 10; i++) {
                if (+d3.select('#inputThroughput' + i).property('value') > 0) {
                    totalCount++;
                    xValues.push((+d3.select('#inputLength' + i).property('value')) / (+d3.select('#inputThroughput' + i).property('value')));
                }
            }


            //sort by x
            xValues.sort((a, b) => {
                return d3.ascending(a, b);
            })

            //collect data from input fields
            var data = [],
                logX = [],
                logDifference = [];
            for (var i = 0; i < totalCount; i++) {
                data.push({
                    x: xValues[i],
                    fX: +(0.05 + (1 / totalCount) * i).toFixed(2),
                });

                logX.push(Math.log(xValues[i]));
                logDifference.push(Math.log(-Math.log(1 - +(0.05 + (1 / totalCount) * i).toFixed(2))));
            }

            //compute least squares on logX and logDifference
            var bestFit = {};
            leastSquares(logX, logDifference, true, bestFit);

            //get step, y-intercept, shape and scale values
            step = (d3.max(data, d => d.x) - d3.min(data, d => d.x)) / 1000;
            yIntercept = bestFit.b;
            shape = bestFit.m;
            scale = Math.pow(Math.E, (-yIntercept / shape));

            //calculate weibullPDF and weibullCDF for each X value (granularity = 1000, but this can be increased)
            var weibullX = [],
                weibullCDF = [],
                weibullPDF = [];
            for (var i = 0; i < 1000; i++) {
                weibullX.push(parseFloat((i * step).toFixed(3)));
                weibullPDF.push((shape / scale) * Math.pow(weibullX[i] / scale, shape - 1) * Math.pow(Math.E, -Math.pow((weibullX[i] / scale), shape)));
                weibullCDF.push(1 - Math.pow(Math.E, -Math.pow((weibullX[i] / scale), shape)));
            }

            var randomIndexValue = 0,
                randomValue = 0,
                simTotalCycleTime = 0,
                simTaktTime = 0,
                simOutcome = [];
            //generate 1000 random simulations based on Weibull curve
            for (var i = 0; i < 10000; i++) {

                //each simulation will take totalCount number of cycle times, sum them, then divide by totalCount to get takt time
                for (var j = 0; j < totalCount; j++) {
                    //take a random value between 0 and 1, and find the index of the nearest weibullCDF value, then map that to find weibullX
                    randomIndexValue = weibullCDF.indexOf(closestValue(Math.random(), weibullCDF));
                    randomValue = weibullX[randomIndexValue];
                    simTotalCycleTime += randomValue;
                }

                //calculate takt time
                simTaktTime = simTotalCycleTime / totalCount;

                //push the cycle time output
                if (configConstraint == "Scope") {
                    simOutcome.push(Math.ceil((inputStories * simTaktTime) / (inputFocus * inputLength)));

                    d3.select("#labelConfigWorkItems").text("No. of " + configWorkItem);

                } else if (configConstraint == "Time") {
                    simOutcome.push(Math.floor((inputStories * inputFocus * inputLength) / simTaktTime));

                    d3.select("#labelConfigWorkItems").text("No. of " + configCadence);

                }

                //reset simTotalCycleTime
                simTotalCycleTime = 0;

            }

            //group simOutcome data into bins
            var outputData = d3.nest()
                .key(d => {
                    return d;
                })
                .rollup(d => {
                    return {
                        total: d.length,
                    };
                })
                .entries(simOutcome);

            //sort outputData by key
            outputData.sort((a, b) => {
                return d3.ascending(+a.key, +b.key);
            })

            //add confidencePDF and confidenceCDF to outputData values
            outputData.forEach((d, i) => {
                d.value.confidencePDF = d.value.total / simOutcome.length;
                if (configConstraint == "Scope") {
                    if (i == 0) {
                        d.value.confidenceCDF = d.value.confidencePDF;
                    } else d.value.confidenceCDF = d.value.confidencePDF + outputData[i - 1].value.confidenceCDF;
                } else if (configConstraint == "Time") {
                    if (i == 0) {
                        d.value.confidenceCDF = 1;
                    } else d.value.confidenceCDF = outputData[i - 1].value.confidenceCDF - d.value.confidencePDF;
                }

            });

            //find 50th,85th,95th percentile value

            //determine summary values
            if (configConstraint == "Scope") {
                outputData["sprints10th"] = +outputData.find(d => {
                    return d.value.confidenceCDF >= 0.10
                }).key;
                outputData["sprints20th"] = +outputData.find(d => {
                    return d.value.confidenceCDF >= 0.20
                }).key;
                outputData["sprints30th"] = +outputData.find(d => {
                    return d.value.confidenceCDF >= 0.30
                }).key;
                outputData["sprints40th"] = +outputData.find(d => {
                    return d.value.confidenceCDF >= 0.40
                }).key;
                outputData["sprints50th"] = +outputData.find(d => {
                    return d.value.confidenceCDF >= 0.50
                }).key;
                outputData["sprints60th"] = +outputData.find(d => {
                    return d.value.confidenceCDF >= 0.60
                }).key;
                outputData["sprints70th"] = +outputData.find(d => {
                    return d.value.confidenceCDF >= 0.70
                }).key;
                outputData["sprints80th"] = +outputData.find(d => {
                    return d.value.confidenceCDF >= 0.80
                }).key;
                outputData["sprints85th"] = +outputData.find(d => {
                    return d.value.confidenceCDF >= 0.85
                }).key;
                outputData["sprints90th"] = +outputData.find(d => {
                    return d.value.confidenceCDF >= 0.90
                }).key;
                outputData["sprints95th"] = +outputData.find(d => {
                    return d.value.confidenceCDF >= 0.95
                }).key;
                var type = 'Stories',
                    xAxisValue = configCadence,
                    userStories50th = inputStories,
                    userStories85th = inputStories,
                    userStories95th = inputStories,
                    sprints50th = outputData["sprints50th"],
                    sprints85th = outputData["sprints85th"],
                    sprints95th = outputData["sprints95th"];
            } else if (configConstraint == "Time") {
                outputData["stories10th"] = +outputData.find(d => {
                    return d.value.confidenceCDF <= 0.10
                }).key;
                outputData["stories20th"] = +outputData.find(d => {
                    return d.value.confidenceCDF <= 0.20
                }).key;
                outputData["stories30th"] = +outputData.find(d => {
                    return d.value.confidenceCDF <= 0.30
                }).key;
                outputData["stories40th"] = +outputData.find(d => {
                    return d.value.confidenceCDF <= 0.40
                }).key;
                outputData["stories50th"] = +outputData.find(d => {
                    return d.value.confidenceCDF <= 0.50
                }).key;
                outputData["stories60th"] = +outputData.find(d => {
                    return d.value.confidenceCDF <= 0.60
                }).key;
                outputData["stories70th"] = +outputData.find(d => {
                    return d.value.confidenceCDF <= 0.70
                }).key;
                outputData["stories80th"] = +outputData.find(d => {
                    return d.value.confidenceCDF <= 0.80
                }).key;
                outputData["stories85th"] = +outputData.find(d => {
                    return d.value.confidenceCDF <= 0.85
                }).key;
                outputData["stories90th"] = +outputData.find(d => {
                    return d.value.confidenceCDF <= 0.90
                }).key;
                outputData["stories95th"] = +outputData.find(d => {
                    return d.value.confidenceCDF <= 0.95
                }).key;
                var type = 'Sprints',
                    xAxisValue = configWorkItem,
                    userStories50th = outputData["stories50th"],
                    userStories85th = outputData["stories85th"],
                    userStories95th = outputData["stories95th"],
                    sprints50th = inputStories,
                    sprints85th = inputStories,
                    sprints95th = inputStories;
            }

            //            updateSummary(oldUserStories50th, userStories50th, oldUserStories85th, userStories85th,
            //                oldUserStories95th, userStories95th, oldSprints50th, sprints50th,
            //                oldSprints85th, sprints85th, oldSprints95th, sprints95th);
            //
            //            oldUserStories50th = userStories50th;
            //            oldUserStories85th = userStories85th;
            //            oldUserStories95th = userStories95th;
            //            oldSprints50th = sprints50th;
            //            oldSprints85th = sprints85th;
            //            oldSprints95th = sprints95th;

            //update text to #input-cadenceLengthHeader   
            d3.select('#input-simDataNoStoriesHeader')
                .html('No. of ' + type);

            //update text to #input-cadenceLengthHeader   
            d3.select('#input-simDataNoStoriesHeader')
                .html('No. of ' + type);
            //        
            d3.select('text#xAxisLabel')
                .html('Number of ' + xAxisValue);

            return outputData;

        }

        function updateOutputPercentage(id, value) {

            d3.select(id)
                .transition()
                .duration(2500)
                .on("start", function() {
                    d3.active(this)
                        .tween("text", function() {
                            var that = d3.select(this),
                                i = d3.interpolateNumber(that.text(), value);
                            return function(t) {
                                that.text(formatPercentage(i(t)));
                            };
                        });
                });
        }

        function updateOutputInteger(id, value, type) {
            var configConstraint = d3.select('#configConstraintType').select('button')._groups[0][0].textContent;
            var colour;

            if ((configConstraint == "Scope" && type == "story") || (configConstraint == "Time" && type == "sprint")) {
                colour = '#FDBB32';
            } else colour = 'white';

            d3.select(id)
                .transition()
                .duration(2500)
                .style("color", colour)
                .on("start", function() {
                    d3.active(this)
                        .tween("text", function() {
                            var that = d3.select(this),
                                i = d3.interpolateNumber(that.text(), value);
                            return function(t) {
                                that.html(formatInteger(i(t)));
                            };
                        });
                });
        }

        function updateChart() {

            var configConstraint = d3.select('#configConstraintType').select('button')._groups[0][0].textContent;

            //get the data
            outputData = updateData();

            console.log(outputData);

            console.log(xAxisRange.domain());
            console.log(xAxisRange(outputData.sprints50th));

            //push the cycle time output
            if (configConstraint == "Scope") {

                //update xAxis domains
                xAxisRange.domain(d3.extent(outputData, d => +d.key));
                xAxis.domain(d3.extent(outputData, d => +d.key));

                //update gradient stops
                d3.select("#gradSprintsLeft").transition().duration(1000).attr('offset', 0);
                d3.select("#gradSprints1st").transition().duration(1000).attr('offset', xAxisRange(outputData.sprints50th));
                d3.select("#gradSprints2nd").transition().duration(1000).attr('offset', xAxisRange(outputData.sprints85th));
                d3.select("#gradSprints3rd").transition().duration(1000).attr('offset', xAxisRange(outputData.sprints95th));
                d3.select("#gradSprintsRight").transition().duration(1000).attr('offset', 1);

                gradient.attr('opacity', 0);
                gradient.attr('fill', 'url(#gradientSprints)').attr('opacity', 1);

                stories50th.transition().duration(1000)
                    .attr('x', xAxis(outputData.sprints50th))
                    //                    .style('opacity', {
                    //                    //return 0.5
                    //                })
                    .text(outputData.sprints50th);

                stories85th.transition().duration(1000)
                    .attr('x', xAxis(outputData.sprints85th))
                    .text(outputData.sprints85th);

                stories95th.transition().duration(1000)
                    .attr('x', xAxis(outputData.sprints95th))
                    .text(outputData.sprints95th);

                line50th.transition().duration(1000)
                    .attr('x1', xAxis(outputData.sprints50th))
                    .attr('x2', xAxis(outputData.sprints50th));

                line85th.transition().duration(1000)
                    .attr('x1', xAxis(outputData.sprints85th))
                    .attr('x2', xAxis(outputData.sprints85th));

                line95th.transition().duration(1000)
                    .attr('x1', xAxis(outputData.sprints95th))
                    .attr('x2', xAxis(outputData.sprints95th));

                percentage50th.transition().duration(1000)
                    .attr('x', xAxis(outputData.sprints50th))
                    .text('50%');

                percentage85th.transition().duration(1000)
                    .attr('x', xAxis(outputData.sprints85th))
                    .text('85%');

                percentage95th.transition().duration(1000)
                    .attr('x', xAxis(outputData.sprints95th))
                    .text('95%');

                storiesLeftValue
                    .style('fill', xAxisColour(0))
                    .text(xAxis.domain()[0]);

                storiesRightValue
                    .style('fill', xAxisColour(1))
                    .text(xAxis.domain()[1]);

                storiesLeftText
                    .style('fill', xAxisColour(0))
                    .text('Sprints');

                storiesRightText
                    .style('fill', xAxisColour(1))
                    .text('Sprints');

                percentageLeftText
                    .style('fill', xAxisColour(0))
                    .text('Low Confidence');

                percentageRightText
                    .style('fill', xAxisColour(1))
                    .text('High Confidence');

                percentageLeftVal
                    .style('fill', xAxisColour(0))
                    .text('0%');

                percentageRightVal
                    .style('fill', xAxisColour(1))
                    .text('100%');

            } else if (configConstraint == "Time") {

                //update xAxis domains
                xAxisRange.domain(d3.extent(outputData, d => +d.key));
                xAxis.domain(d3.extent(outputData, d => +d.key));

                console.log('xAxisRange(outputData.stories95th): ' + xAxisRange(outputData.stories95th))
                console.log('xAxisRange(outputData.stories85th): ' + xAxisRange(outputData.stories85th))
                console.log('xAxisRange(outputData.stories50th): ' + xAxisRange(outputData.stories50th))

                //update gradient stops
                d3.select("#gradStoriesLeft").transition().duration(1000).attr('offset', 0);
                d3.select("#gradStories1st").transition().duration(1000).attr('offset', xAxisRange(outputData.stories95th));
                d3.select("#gradStories2nd").transition().duration(1000).attr('offset', xAxisRange(outputData.stories85th));
                d3.select("#gradStories3rd").transition().duration(1000).attr('offset', xAxisRange(outputData.stories50th));
                d3.select("#gradStoriesRight").transition().duration(1000).attr('offset', 1);

                gradient.attr('opacity', 0);
                gradient.attr('fill', 'url(#gradientStories)').attr('opacity', 1);

                stories50th.transition().duration(1000)
                    .attr('x', xAxis(outputData.stories50th))
                    .text(outputData.stories50th);

                stories85th.transition().duration(1000)
                    .attr('x', xAxis(outputData.stories85th))
                    .text(outputData.stories85th);

                stories95th.transition().duration(1000)
                    .attr('x', xAxis(outputData.stories95th))
                    .text(outputData.stories95th);

                line50th.transition().duration(1000)
                    .attr('x1', xAxis(outputData.stories50th))
                    .attr('x2', xAxis(outputData.stories50th));

                line85th.transition().duration(1000)
                    .attr('x1', xAxis(outputData.stories85th))
                    .attr('x2', xAxis(outputData.stories85th));

                line95th.transition().duration(1000)
                    .attr('x1', xAxis(outputData.stories95th))
                    .attr('x2', xAxis(outputData.stories95th));

                percentage50th.transition().duration(1000)
                    .attr('x', xAxis(outputData.stories50th))
                    .text('50%');

                percentage85th.transition().duration(1000)
                    .attr('x', xAxis(outputData.stories85th))
                    .text('85%');

                percentage95th.transition().duration(1000)
                    .attr('x', xAxis(outputData.stories95th))
                    .text('95%');

                storiesLeftValue
                    .style('fill', xAxisColour(1))
                    .text(xAxis.domain()[1]);

                storiesRightValue
                    .style('fill', xAxisColour(0))
                    .text(xAxis.domain()[0]);

                storiesLeftText
                    .style('fill', xAxisColour(1))
                    .text('Stories');

                storiesRightText
                    .style('fill', xAxisColour(0))
                    .text('Stories');

                percentageLeftText
                    .style('fill', xAxisColour(1))
                    .text('High Confidence');

                percentageRightText
                    .style('fill', xAxisColour(0))
                    .text('Low Confidence');

                percentageLeftVal
                    .style('fill', xAxisColour(1))
                    .text('100%');

                percentageRightVal
                    .style('fill', xAxisColour(0))
                    .text('0%');
            }


        }

        function updateMouseOver(mouse, table) {
            //            var offsetLeft = document.getElementById("chart").offsetLeft;
            //            var accuracy = 1; //lower is better but slower;
            //            var padding = 2;
            //            var lineNode = linePath.node();
            //            var PathLength = lineNode.getTotalLength();
            //            var bisect = d3.bisector(d => d.key).right;
            //            var maxLength = Math.max(PathLength);
            //            var maxTextBox = Math.max(d3.select("text#HoverText").node().getBBox().width);
            //
            //            //get x value based on mouse value
            //            var x = d3.event.pageX - offsetLeft - margin.left - parseFloat($('#chart').css('padding-left'));
            //
            //            //get other values for given x value
            //            var Item = table[bisect(table, xAxisLine.invert(x - (xAxis.bandwidth() / 2)))];
            //
            //            // UPDATE X VALUE //
            //
            //            //use x position to update text position
            //            d3.select("text#DateText")
            //                .style("opacity", 1)
            //                .attr("x", x)
            //                .attr("y", (height) + (margin.bottom / 2) + 5)
            //                .attr("dy", "0.1em")
            //                .attr("text-anchor", "middle")
            //                .text(Item.key);
            //
            //            //use x position to update rect position
            //            d3.select("rect#DateRect")
            //                .style("opacity", 1)
            //                .attr("x", x)
            //                .attr("y", (height) + (margin.bottom / 2) + 5)
            //                .attr("width", d3.select("text#DateText").node().getBBox().width + padding)
            //                .attr("height", d3.select("text#DateText").node().getBBox().height + padding)
            //                .attr("transform", "translate(" + -(d3.select("text#DateText").node().getBBox().width / 2) + ",-15)");
            //
            //            // END UPDATE X VALUE //
            //
            //            // UPDATE HOVER VALUES//
            //
            //            //update Path coordinates
            //            for (i = x; i < PathLength; i += accuracy) {
            //                var Pos = lineNode.getPointAtLength(i);
            //                if (Pos.x >= x) {
            //                    break;
            //                }
            //            }
            //
            //            //if the text box leaves the screen across the x-axis, fix it
            //            if (width - Pos.x < 30) {
            //                var XDelta = -15 - d3.select("text#HoverText").node().getBBox().width;
            //            } else {
            //                XDelta = 10;
            //            }
            //
            //            //update Cycle Path hover node
            //            d3.select("circle#Circle")
            //                .style("fill", "white")
            //                .style("stroke", "white")
            //                .style("opacity", 1)
            //                .attr("cx", x - 1)
            //                .attr("cy", Pos.y);
            //
            //            //update Cycle Path hover text
            //            d3.select("text#HoverText")
            //                .style("opacity", 1)
            //                .attr("x", x)
            //                .attr("y", Pos.y)
            //                .attr("dx", XDelta)
            //                .attr("dy", "0.25em")
            //                //.text("Confidence: " + d3.format(".0%")(Item.value.confidenceCDF))
            //                .text("Confidence: " + d3.format(".0%")(yAxisCDFConfPer(Pos.y)));
            //
            //            //update Cycle Path hover background
            //            d3.select("rect#HoverRect")
            //                .style("opacity", 1)
            //                .attr("x", x)
            //                .attr("y", Pos.y)
            //                .attr("width", d3.select("text#HoverText").node().getBBox().width + padding)
            //                .attr("height", d3.select("text#HoverText").node().getBBox().height + padding)
            //                .attr("transform", "translate(" + XDelta + ",-12.5)");
            //
            //            //draw line for each mouse update
            //            d3.selectAll("#mouse-line-x")
            //                .attr("x1", 0)
            //                .attr("x2", Pos.x)
            //                .attr("y1", Pos.y)
            //                .attr("y2", Pos.y);
            //
            //            d3.selectAll("#mouse-line-y")
            //                .attr("x1", mouse[0])
            //                .attr("x2", mouse[0])
            //                .attr("y1", height)
            //                .attr("y2", Pos.y);
            //
            //            // END UPDATE CYCLE HOVER //
            //
            //            d3.select("circle#Circle50th")
            //                .style("fill", "white")
            //                .style("stroke", "white")
            //                .style("opacity", 1)
            //                .attr("cx", x - 1)
            //                .attr("cy", Pos.y);

        }

        //****** END HELPER FUNCTIONS ******//