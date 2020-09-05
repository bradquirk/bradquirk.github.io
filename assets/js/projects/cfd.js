// Get the data
d3.csv("/assets/csv/projects/cfd.csv")
    .then(function (baseTable) {
        //format knimeDataTable data
        var parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S");
        var formatDate = d3.timeFormat("%Y-%m-%d");
        var formatPercentage = d3.format(".2p");
        var parseTime = d3.timeParse("%Y-%m-%d");
        var colourScheme;
        var emptyDate = formatDate(parseDate(0));

        baseTable.forEach(d => {
            d.historyDate = formatDate(parseDate(d['History End']));
            d.key = d['Key'];
            d.historyKey = d.key + d['History End'];
            d.ToDoIn = parseFloat(d['To Do In']);
            d.ToDoOut = parseFloat(d['To Do Out']);
            d.InProgressIn = parseFloat(d['In Progress In']);
            d.InProgressOut = parseFloat(d['In Progress Out']);
            d.DoneIn = parseFloat(d['Done In']);
            d.DoneOut = parseFloat(d['Done Out']);
        });

        //summarise data by history end date and key, then grab In / Out
        var historyDateTableSummary = d3.nest()
            .key(d => {
                return d.historyDate;
            }).sortKeys(d3.ascending)
            .key(d => {
                return d.historyKey;
            })
            .rollup(d => {
                return {
                    "ToDoIn": d3.max(d, d => d.ToDoIn),
                    "ToDoOut": d3.max(d, d => d.ToDoOut),
                    "InProgressIn": d3.max(d, d => d.InProgressIn),
                    "InProgressOut": d3.max(d, d => d.InProgressOut),
                    "DoneIn": d3.max(d, d => d.DoneIn),
                    "DoneOut": d3.max(d, d => d.DoneOut)
                };
            })
            .entries(baseTable);

        //remove first row  (1970-01-01)
        if (historyDateTableSummary[0].key == emptyDate) {
            historyDateTableSummary.shift();
        }

        //determine In/Out values
        var historyDateTable = d3.nest()
            .key(d => {
                return d['key'];
            })
            .rollup(d => {
                return {
                    "ToDoIn": d3.sum(d[0]['values'], d => d.value.ToDoIn),
                    "ToDoOut": d3.sum(d[0]['values'], d => d.value.ToDoOut),
                    "InProgressIn": d3.sum(d[0]['values'], d => d.value.InProgressIn),
                    "InProgressOut": d3.sum(d[0]['values'], d => d.value.InProgressOut),
                    "DoneIn": d3.sum(d[0]['values'], d => d.value.DoneIn),
                    "DoneOut": d3.sum(d[0]['values'], d => d.value.DoneOut),
                };
            })
            .entries(historyDateTableSummary);

        //calculate total values
        var ToDoTotal = 0,
            InProgressTotal = 0,
            DoneTotal = 0;
        historyDateTable.forEach((d, i) => {
            ToDoTotal += historyDateTable[i]['value']['ToDoIn'] - historyDateTable[i]['value']['ToDoOut'];
            InProgressTotal += historyDateTable[i]['value']['InProgressIn'] - historyDateTable[i]['value']['InProgressOut'];
            DoneTotal += historyDateTable[i]['value']['DoneIn'] - historyDateTable[i]['value']['DoneOut'];

            d.key = parseTime(d.key);
            d.toDo = ToDoTotal;
            d.inProgress = InProgressTotal;
            d.done = DoneTotal;

            //remove unformatted data
            delete d.value;
        });

        //calculate percentage values
        var total = 0;
        historyDateTable.forEach((d, i) => {
            total = d.toDo + d.inProgress + d.done;
            d.toDoPercentage = d.toDo / total;
            d.inProgressPercentage = d.inProgress / total;
            d.donePercentage = d.done / total;
        });

        var bisect = d3.bisector(d => d.key).right;

        //****** END PREPARE DATA ******//

        //****** CREATE CHART ******//

        // set the dimensions and margins of the graph
        var margin = {
                top: 20,
                right: 50,
                bottom: 40,
                left: 50
            },
            width = d3.select('#volumeChart').node().getBoundingClientRect().width - margin.left - margin.right,
            height = $(window).innerHeight() * 0.3
        textHeightOffset = 0;

        // VOLUME CHART //

        // append the svg obgect to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        var volumeSVG = d3.select("#volumeChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        var volumeG = volumeSVG
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var volumeDefs = volumeSVG.append("defs");

        var toDoVolumeGradient = volumeDefs
            .append("linearGradient")
            .attr("id", "toDoVolumeGradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");
        toDoVolumeGradient.append("stop")
            .attr('class', 'toDoStart')
            .attr("offset", "0%")
            .attr("stop-opacity", 1);
        toDoVolumeGradient.append("stop")
            .attr('class', 'toDoEnd')
            .attr("offset", "100%")
            .attr("stop-opacity", 1);

        var inProgressVolumeGradient = volumeDefs
            .append("linearGradient")
            .attr("id", "inProgressVolumeGradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");
        inProgressVolumeGradient.append("stop")
            .attr('class', 'inProgressStart')
            .attr("offset", "0%")
            .attr("stop-opacity", 1);
        inProgressVolumeGradient.append("stop")
            .attr('class', 'inProgressEnd')
            .attr("offset", "100%")
            .attr("stop-opacity", 1);

        var doneVolumeGradient = volumeDefs
            .append("linearGradient")
            .attr("id", "doneVolumeGradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");
        doneVolumeGradient.append("stop")
            .attr('class', 'doneStart')
            .attr("offset", "0%")
            .attr("stop-opacity", 1);
        doneVolumeGradient.append("stop")
            .attr('class', 'doneEnd')
            .attr("offset", "100%")
            .attr("stop-opacity", 1);

        var volumeX = d3.scaleTime()
            .rangeRound([0, width]);

        var volumeY = d3.scaleLinear()
            .rangeRound([height, 0]);

        //determine area chart values
        var toDoVolumeArea = d3.area()
            .x(d => {
                return volumeX(d.key);
            })
            .y0(d => {
                return volumeY(d.inProgress + d.done);
            })
            .y1(d => {
                return volumeY(d.toDo + d.inProgress + d.done);
            });

        var inProgressVolumeArea = d3.area()
            .x(d => {
                return volumeX(d.key);
            })
            .y0(d => {
                return volumeY(d.done);
            })
            .y1(d => {
                return volumeY(d.inProgress + d.done);
            });

        var doneVolumeArea = d3.area()
            .x(d => {
                return volumeX(d.key);
            })
            .y0(height)
            .y1(d => {
                return volumeY(d.done);
            });

        //determine line chart values (for mouseover)
        var toDoVolumeLineSchema = d3.line()
            .x(d => volumeX(d.key))
            .y(d => volumeY(d.toDo + d.inProgress + d.done));

        var inProgressVolumeLineSchema = d3.line()
            .x(d => volumeX(d.key))
            .y(d => volumeY(d.inProgress + d.done));

        var doneVolumeLineSchema = d3.line()
            .x(d => volumeX(d.key))
            .y(d => volumeY(d.done));

        //add toDo area path
        volumeG.append("path")
            .attr('id', 'toDo')
            .style("fill", "url(#toDoVolumeGradient)");

        //add inProgress area path
        volumeG.append("path")
            .attr('id', 'inProgress')
            .style("fill", "url(#inProgressVolumeGradient)");

        //add done area path
        volumeG.append("path")
            .attr('id', 'done')
            .style("fill", "url(#doneVolumeGradient)");

        //add x axis
        volumeG.append("g")
            .attr('id', 'x')
            .attr('class', 'axis')
            .attr("transform", "translate(0," + height + ")");

        //add y axis
        volumeG.append("g")
            .attr('id', 'y')
            .attr('class', 'axis')
            .append("text")
            .attr("fill", "#FFF")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("No. of Work Items");

        //add to do highlight line
        var toDoVolumeLine = volumeG.append("path")
            .attr("id", "toDoVolumeLine")
            .attr("class", "mouseLine");

        //add in progress highlight line
        var inProgressVolumeLine = volumeG.append("path")
            .attr("id", "inProgressVolumeLine")
            .attr("class", "mouseLine");

        //add done highlight line
        var doneVolumeLine = volumeG.append("path")
            .attr("id", "doneVolumeLine")
            .attr("class", "mouseLine");

        // END VOLUME CHART //

        // PERCENTAGE CHART //

        // append the svg obgect to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        var percentageSVG = d3.select("#percentageChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        var percentageG = percentageSVG
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var percentageDefs = percentageSVG.append("defs");

        var toDoPercentageGradient = percentageDefs
            .append("linearGradient")
            .attr("id", "toDoPercentageGradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");
        toDoPercentageGradient.append("stop")
            .attr('class', 'toDoStart')
            .attr("offset", "0%")
            .attr("stop-opacity", 1);
        toDoPercentageGradient.append("stop")
            .attr('class', 'toDoEnd')
            .attr("offset", "100%")
            .attr("stop-opacity", 1);

        var inProgressPercentageGradient = percentageDefs
            .append("linearGradient")
            .attr("id", "inProgressPercentageGradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");
        inProgressPercentageGradient.append("stop")
            .attr('class', 'inProgressStart')
            .attr("offset", "0%")
            .attr("stop-opacity", 1);
        inProgressPercentageGradient.append("stop")
            .attr('class', 'inProgressEnd')
            .attr("offset", "100%")
            .attr("stop-opacity", 1);

        var donePercentageGradient = percentageDefs
            .append("linearGradient")
            .attr("id", "donePercentageGradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");
        donePercentageGradient.append("stop")
            .attr('class', 'doneStart')
            .attr("offset", "0%")
            .attr("stop-opacity", 1);
        donePercentageGradient.append("stop")
            .attr('class', 'doneEnd')
            .attr("offset", "100%")
            .attr("stop-opacity", 1);

        var percentageX = d3.scaleTime()
            .rangeRound([0, width]);

        var percentageY = d3.scaleLinear()
            .rangeRound([height, 0]);

        var toDoPercentageArea = d3.area()
            .x(d => {
                return percentageX(d.key);
            })
            .y0(d => {
                return percentageY(d.inProgressPercentage + d.donePercentage);
            })
            .y1(d => {
                return percentageY(d.toDoPercentage + d.inProgressPercentage + d.donePercentage);
            });

        var inProgressPercentageArea = d3.area()
            .x(d => {
                return percentageX(d.key);
            })
            .y0(d => {
                return percentageY(d.donePercentage);
            })
            .y1(d => {
                return percentageY(d.inProgressPercentage + d.donePercentage);
            });

        var donePercentageArea = d3.area()
            .x(d => {
                return percentageX(d.key);
            })
            .y0(height)
            .y1(d => {
                return percentageY(d.donePercentage);
            });

        //determine line chart values (for mouseover)
        var toDoPercentageLineSchema = d3.line()
            .x(d => percentageX(d.key))
            .y(d => percentageY(d.toDoPercentage + d.inProgressPercentage + d.donePercentage));

        var inProgressPercentageLineSchema = d3.line()
            .x(d => percentageX(d.key))
            .y(d => percentageY(d.inProgressPercentage + d.donePercentage));

        var donePercentageLineSchema = d3.line()
            .x(d => percentageX(d.key))
            .y(d => percentageY(d.donePercentage));

        percentageX.domain(d3.extent(historyDateTable, d => {
            return d.key;
        }));
        percentageY.domain([0, 1]);

        //add to do percentage area
        percentageG.append("path")
            .attr('id', 'toDo')
            .attr('class', 'area')
            .style("fill", "url(#toDoPercentageGradient)");

        //add in progress percentage area
        percentageG.append("path")
            .attr('id', 'inProgress')
            .attr('class', 'area')
            .style("fill", "url(#inProgressPercentageGradient)");

        //add done percentage area
        percentageG.append("path")
            .attr('id', 'done')
            .attr('class', 'area')
            .style("fill", "url(#donePercentageGradient)");

        //add x axis
        percentageG.append("g")
            .attr('id', 'x')
            .attr('class', 'axis')
            .attr("transform", "translate(0," + height + ")");

        //add y axis
        percentageG.append("g")
            .attr('id', 'y')
            .attr('class', 'axis')
            .append("text")
            .attr("fill", "#FFF")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("% of Work Items");

        //add to do highlight line
        var toDoPercentageLine = percentageG.append("path")
            .attr("id", "toDoPercentageLine")
            .attr("class", "mouseLine");

        //add in progress highlight line
        var inProgressPercentageLine = percentageG.append("path")
            .attr("id", "inProgressPercentageLine")
            .attr("class", "mouseLine");

        //add done highlight line
        var donePercentageLine = percentageG.append("path")
            .attr("id", "donePercentageLine")
            .attr("class", "mouseLine");

        updateChart("All");

        // END PERCENTAGE CHART //

        // MOUSE OVER TOOLTIPS //

        var mouseVolumeG = volumeSVG.append("g")
            .attr("class", "mouse-over-effects")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var lineVolumeHover = mouseVolumeG.append("line")
            .attr("class", "mouse-line")
            .style("stroke-width", "1px")
            .style("opacity", "0");

        var volumeHoverCircle = mouseVolumeG
            .selectAll("circle")
            .data(["toDoVolume", "inProgressVolume", "doneVolume"])
            .enter()
            .append("circle")
            .attr("id", d => d)
            .attr("r", 7)
            .style("stroke-width", "1px")
            .style("opacity", "0");

        var volumeHoverCircleBackground = mouseVolumeG
            .selectAll("rect")
            .data(["toDoVolume", "inProgressVolume", "doneVolume", "dateVolume"])
            .enter()
            .append("rect")
            .attr("id", d => d + "Rect")
            .attr("class", "rectBackground");

        var volumeHoverCircleText = mouseVolumeG
            .selectAll("text")
            .data(["toDoVolume", "inProgressVolume", "doneVolume", "dateVolume"])
            .enter()
            .append("text")
            .attr("id", d => d + "Text")
            .style("fill", "white");

        var mousePercentageG = percentageSVG.append("g")
            .attr("class", "mouse-over-effects")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var linePercentageHover = mousePercentageG.append("line")
            .attr("class", "mouse-line")
            .style("stroke-width", "1px")
            .style("opacity", "0");

        var circlePercentageHover = mousePercentageG
            .selectAll("circle")
            .data(["toDoPercentage", "inProgressPercentage", "donePercentage"])
            .enter()
            .append("circle")
            .attr("id", d => d)
            .attr("r", 7)
            .style("stroke-width", "1px")
            .style("opacity", "0");

        var percentageHoverCircleBackground = mousePercentageG
            .selectAll("rect")
            .data(["toDoPercentage", "inProgressPercentage", "donePercentage", "datePercentage"])
            .enter()
            .append("rect")
            .attr("id", d => d + "Rect")
            .attr("class", "rectBackground");

        var circlePercentageHoverText = mousePercentageG
            .selectAll("text")
            .data(["toDoPercentage", "inProgressPercentage", "donePercentage", "datePercentage"])
            .enter()
            .append("text")
            .attr("id", d => d + "Text")
            .style("fill", "white");

        mouseVolumeG.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mouseout", function () {
                lineVolumeHover.style("opacity", "0");
                linePercentageHover.style("opacity", "0");
                volumeHoverCircle.style("opacity", "0");
                circlePercentageHover.style("opacity", "0");
                volumeHoverCircleBackground.style("opacity", "0");
                volumeHoverCircleText.style("opacity", "0");
                circlePercentageHoverText.style("opacity", "0");
                percentageHoverCircleBackground.style("opacity", "0");
            })
            .on("mouseover", function () {
                lineVolumeHover.style("opacity", "1");
                linePercentageHover.style("opacity", "1");
                volumeHoverCircle.style("opacity", "1");
                circlePercentageHover.style("opacity", "1");
                volumeHoverCircleText.style("opacity", "1");
                circlePercentageHoverText.style("opacity", "1");
                percentageHoverCircleBackground.style("opacity", "0.5");
            })
            .on("mousemove", function () {
                updateMouseOver(d3.mouse(this), historyDateTable);
            });

        mousePercentageG.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mouseout", function () {
                lineVolumeHover.style("opacity", "0");
                linePercentageHover.style("opacity", "0");
                volumeHoverCircle.style("opacity", "0");
                circlePercentageHover.style("opacity", "0");
                volumeHoverCircleBackground.style("opacity", "0");
                volumeHoverCircleText.style("opacity", "0");
                circlePercentageHoverText.style("opacity", "0");
                percentageHoverCircleBackground.style("opacity", "0");
            })
            .on("mouseover", function () {
                lineVolumeHover.style("opacity", "1");
                linePercentageHover.style("opacity", "1");
                volumeHoverCircle.style("opacity", "1");
                circlePercentageHover.style("opacity", "1");
                volumeHoverCircleBackground.style("opacity", "1");
                volumeHoverCircleText.style("opacity", "1");
                circlePercentageHoverText.style("opacity", "1");
                percentageHoverCircleBackground.style("opacity", "0.5");
            })
            .on("mousemove", function () {
                updateMouseOver(d3.mouse(this), historyDateTable);
            });

        // END MOUSE OVER TOOLTIP //

        updateChart("All");

        //canary call
        //document.getElementById("chart").innerHTML = JSON.stringify(historyDateTable);
        //alert(JSON.stringify(historyDateTable));
        //****** END CREATE CHART ******//

        //****** HELPER FUNCTIONS ******//

        function updateChart(team) {

            //filter data based on selected value
            if (team != "All") {
                var filteredTable = baseTable.filter(d => d.projectName == team);
            } else var filteredTable = baseTable;

            //summarise data by history end date and key, then grab In / Out
            historyDateTableSummary = d3.nest()
                .key(d => {
                    return d.historyDate;
                }).sortKeys(d3.ascending)
                .key(d => {
                    return d.historyKey;
                })
                .rollup(d => {
                    return {
                        "ToDoIn": d3.max(d, d => d.ToDoIn),
                        "ToDoOut": d3.max(d, d => d.ToDoOut),
                        "InProgressIn": d3.max(d, d => d.InProgressIn),
                        "InProgressOut": d3.max(d, d => d.InProgressOut),
                        "DoneIn": d3.max(d, d => d.DoneIn),
                        "DoneOut": d3.max(d, d => d.DoneOut)
                    };
                })
                .entries(filteredTable);

            //remove first row  (1970-01-01)
            if (historyDateTableSummary[0].key == emptyDate) {
                historyDateTableSummary.shift();
            }

            //determine In/Out values
            historyDateTable = d3.nest()
                .key(d => {
                    return d['key'];
                })
                .rollup(d => {
                    return {
                        "ToDoIn": d3.sum(d[0]['values'], d => d.value.ToDoIn),
                        "ToDoOut": d3.sum(d[0]['values'], d => d.value.ToDoOut),
                        "InProgressIn": d3.sum(d[0]['values'], d => d.value.InProgressIn),
                        "InProgressOut": d3.sum(d[0]['values'], d => d.value.InProgressOut),
                        "DoneIn": d3.sum(d[0]['values'], d => d.value.DoneIn),
                        "DoneOut": d3.sum(d[0]['values'], d => d.value.DoneOut),
                    };
                })
                .entries(historyDateTableSummary);

            //calculate total values
            ToDoTotal = 0,
                InProgressTotal = 0,
                DoneTotal = 0;
            historyDateTable.forEach((d, i) => {
                ToDoTotal += historyDateTable[i]['value']['ToDoIn'] - historyDateTable[i]['value']['ToDoOut'];
                InProgressTotal += historyDateTable[i]['value']['InProgressIn'] - historyDateTable[i]['value']['InProgressOut'];
                DoneTotal += historyDateTable[i]['value']['DoneIn'] - historyDateTable[i]['value']['DoneOut'];

                d.key = parseTime(d.key);
                d.toDo = ToDoTotal;
                d.inProgress = InProgressTotal;
                d.done = DoneTotal;

                //remove unformatted data
                delete d.value;
            });

            //calculate percentage values
            total = 0;
            historyDateTable.forEach((d, i) => {
                total = d.toDo + d.inProgress + d.done;
                d.toDoPercentage = d.toDo / total;
                d.inProgressPercentage = d.inProgress / total;
                d.donePercentage = d.done / total;
            });

            //update volume domains
            volumeX.domain(d3.extent(historyDateTable, d => {
                return d.key;
            }));
            volumeY.domain([0, d3.max(historyDateTable, d => {
                return d.toDo + d.inProgress + d.done;
            })]);

            //update toDo volume area
            volumeG.select("#toDo")
                .datum(historyDateTable)
                .attr("d", toDoVolumeArea);

            //update inProgress volume area
            volumeG.select("#inProgress")
                .datum(historyDateTable)
                .attr("d", inProgressVolumeArea);

            //update done area 
            volumeG.select("#done")
                .datum(historyDateTable)
                .attr("d", doneVolumeArea);

            //update x axis
            volumeG.select("#x")
                .call(d3.axisBottom(volumeX).tickFormat(d3.timeFormat("%b %y")));

            //update y axis
            volumeG.select("#y")
                .call(d3.axisLeft(volumeY));

            //update to do highlight line
            toDoVolumeLine
                .datum(historyDateTable)
                .attr("d", toDoVolumeLineSchema);

            //update in progress highlight line
            inProgressVolumeLine
                .datum(historyDateTable)
                .attr("d", inProgressVolumeLineSchema);

            //update done highlight line
            doneVolumeLine
                .datum(historyDateTable)
                .attr("d", doneVolumeLineSchema);

            //update percentage domains
            percentageX.domain(d3.extent(historyDateTable, d => {
                return d.key;
            }));
            percentageY.domain([0, 1]);

            //update to do percentage area
            percentageG.select("#toDo")
                .datum(historyDateTable)
                .attr("d", toDoPercentageArea);

            //update in progress percentage area
            percentageG.select("#inProgress")
                .datum(historyDateTable)
                .attr("d", inProgressPercentageArea);

            //update done percentage area
            percentageG.select("#done")
                .datum(historyDateTable)
                .attr("d", donePercentageArea);

            //update x axis
            percentageG.select("#x")
                .call(d3.axisBottom(percentageX));

            //update y axis
            percentageG.select("#y")
                .call(d3.axisLeft(percentageY).tickFormat(d3.format(".0%")));

            //update to do highlight line
            toDoPercentageLine
                .datum(historyDateTable)
                .attr("d", toDoPercentageLineSchema);

            //update in progress highlight line
            inProgressPercentageLine
                .datum(historyDateTable)
                .attr("d", inProgressPercentageLineSchema);

            //update done highlight line
            donePercentageLine
                .datum(historyDateTable)
                .attr("d", donePercentageLineSchema);

            return historyDateTable;

        }

        function updateMouseOver(mouse, table) {

            var offsetLeft = document.getElementById("volumeChart").getBoundingClientRect().left + 14; //14 == circle diameter
            var accuracy = 1; //lower is better but slower;
            var padding = 0;
            var toDoVolumeNode = toDoVolumeLine.node();
            var toDoVolumePathLength = toDoVolumeNode.getTotalLength();
            var inProgressVolumeNode = inProgressVolumeLine.node();
            var inProgressVolumePathLength = inProgressVolumeNode.getTotalLength();
            var doneVolumeNode = doneVolumeLine.node();
            var doneVolumePathLength = doneVolumeNode.getTotalLength();
            var toDoPercentageNode = toDoPercentageLine.node();
            var toDoPercentagePathLength = toDoPercentageNode.getTotalLength();
            var inProgressPercentageNode = inProgressPercentageLine.node();
            var inProgressPercentagePathLength = inProgressPercentageNode.getTotalLength();
            var donePercentageNode = donePercentageLine.node();
            var donePercentagePathLength = donePercentageNode.getTotalLength();
            var bisect = d3.bisector(d => d.key).right;
            var maxTextBox = Math.max(d3.select("text#doneVolumeText").node().getBBox().width,
                d3.select("text#inProgressVolumeText").node().getBBox().width,
                d3.select("text#toDoVolumeText").node().getBBox().width,
                d3.select("text#donePercentageText").node().getBBox().width,
                d3.select("text#inProgressPercentageText").node().getBBox().width,
                d3.select("text#toDoPercentageText").node().getBBox().width);

            //draw line for each mouse update
            lineVolumeHover
                .attr("x1", mouse[0])
                .attr("x2", mouse[0])
                .attr("y1", height)
                .attr("y2", 0);

            linePercentageHover
                .attr("x1", mouse[0])
                .attr("x2", mouse[0])
                .attr("y1", height)
                .attr("y2", 0);

            //get x value based on mouse value
            var x = d3.event.pageX - offsetLeft - margin.left + 15;

            //get other values for given x value
            var item = table[bisect(table, volumeX.invert(x))];

            if (item) {
                //use Done x position to update Date position
                d3.select("text#dateVolumeText")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", height + (margin.bottom / 2))
                    .attr("text-anchor", "middle")
                    .text(d3.timeFormat("%d-%b-%y")(item.key));

                //use Done x position to update Date position
                d3.select("rect#dateVolumeRect")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", height + (margin.bottom / 2))
                    .attr("width", d3.select("text#dateVolumeText").node().getBBox().width + padding)
                    .attr("height", d3.select("text#dateVolumeText").node().getBBox().height + padding)
                    .attr("transform", "translate(" + -(d3.select("text#dateVolumeText").node().getBBox().width / 2) + "," + (-18) + ")");

                //****** WHEN POSITIONING THE CIRCLES/TEXT THE ORDER GOES DONE>IN PROG>TO DO FOR VOLUME AND TO DO>IN PROG>DONE FOR PERCENTAGE.
                //****** THIS IS BECAUSE THE TEXT WILL BE ANCHORED TO THE BOTTOM / TOP OF THE CHART RESPECTIVELY

                //update Done Path coordinates
                for (i = x; i < doneVolumePathLength; i += accuracy) {
                    var pos = doneVolumeNode.getPointAtLength(i);
                    if (pos.x >= x) {
                        break;
                    }
                }

                //if the text box leaves the screen across the x-axis, fix it
                if (doneVolumePathLength - pos.x - maxTextBox < 45) {
                    var toDoVolumeXDelta = -15 - d3.select("text#toDoVolumeText").node().getBBox().width;
                    var inProgressVolumeXDelta = -15 - d3.select("text#inProgressVolumeText").node().getBBox().width;
                    var doneVolumeXDelta = -15 - d3.select("text#doneVolumeText").node().getBBox().width;
                    var toDoPercentageXDelta = -15 - d3.select("text#toDoPercentageText").node().getBBox().width;
                    var inProgressPercentageXDelta = -15 - d3.select("text#inProgressPercentageText").node().getBBox().width;
                    var donePercentageXDelta = -15 - d3.select("text#donePercentageText").node().getBBox().width;
                } else {
                    toDoVolumeXDelta = 10;
                    inProgressVolumeXDelta = 10;
                    doneVolumeXDelta = 10;
                    toDoPercentageXDelta = 10;
                    inProgressPercentageXDelta = 10;
                    donePercentageXDelta = 10;
                }

                var doneVolumeYPos = pos.y;

                //update Done Path hover node
                d3.select("circle#doneVolume")
                    .style("opacity", 1)
                    .attr("cx", x)
                    .attr("cy", pos.y);

                //update Done Path hover text
                d3.select("text#doneVolumeText")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", pos.y)
                    .attr("dx", doneVolumeXDelta)
                    .attr("dy", textHeightOffset)
                    .text("Done: " + item.done);

                //update Done Path hover background
                d3.select("rect#doneVolumeRect")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", pos.y)
                    .attr("width", d3.select("text#doneVolumeText").node().getBBox().width + padding)
                    .attr("height", d3.select("text#doneVolumeText").node().getBBox().height + padding)
                    .attr("transform", "translate(" + doneVolumeXDelta + ",-17.5)");

                //update In Progress Path coordinates
                for (i = x; i < inProgressVolumePathLength; i += accuracy) {
                    var pos = inProgressVolumeNode.getPointAtLength(i);
                    if (pos.x >= x) {
                        break;
                    }
                }

                var inProgressVolumeYPos = pos.y;

                if (doneVolumeYPos - inProgressVolumeYPos < 20) {
                    var inProgressVolumeDelta = -20 + doneVolumeYPos - inProgressVolumeYPos;
                } else inProgressVolumeDelta = 0;

                // var inProgressPercentageYPos = pos.y;

                // if (inProgressPercentageYPos - toDoPercentageYPos < 15) {
                //   var inProgressPercentageDelta = 15 + toDoPercentageYPos - inProgressPercentageYPos;
                // } else inProgressPercentageDelta = 0;

                //update In Progress Path hover node
                d3.select("circle#inProgressVolume")
                    .style("opacity", 1)
                    .attr("cx", x)
                    .attr("cy", pos.y);

                //update In Progress Path hover text
                d3.select("text#inProgressVolumeText")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", pos.y)
                    .attr("dx", inProgressVolumeXDelta)
                    .attr("dy", inProgressVolumeDelta + textHeightOffset)
                    .text("In Progress: " + item.inProgress);

                //update In Progress Path hover background
                d3.select("rect#inProgressVolumeRect")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", pos.y)
                    .attr("width", d3.select("text#inProgressVolumeText").node().getBBox().width + padding)
                    .attr("height", d3.select("text#inProgressVolumeText").node().getBBox().height + padding)
                    .attr("transform", "translate(" + inProgressVolumeXDelta + "," + (-17.5 + inProgressVolumeDelta) + ")");

                //update To Do Path coordinates
                for (i = x; i < toDoVolumePathLength; i += accuracy) {
                    var pos = toDoVolumeNode.getPointAtLength(i);
                    if (pos.x >= x) {
                        break;
                    }
                }

                var toDoVolumeYPos = pos.y;

                if ((inProgressVolumeYPos + inProgressVolumeDelta - toDoVolumeYPos) < 20) {
                    var toDoVolumeDelta = -20 + inProgressVolumeYPos + inProgressVolumeDelta - toDoVolumeYPos;
                } else toDoVolumeDelta = 0;

                //update To Do Path hover node
                d3.select("circle#toDoVolume")
                    .style("opacity", 1)
                    .attr("cx", x)
                    .attr("cy", pos.y);

                //update To Do Path hover node
                d3.select("text#toDoVolumeText")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", pos.y)
                    .attr("dx", toDoVolumeXDelta)
                    .attr("dy", toDoVolumeDelta + textHeightOffset)
                    .text("To Do: " + item.toDo);

                //update To Do Path hover background
                d3.select("rect#toDoVolumeRect")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", pos.y)
                    .attr("width", d3.select("text#toDoVolumeText").node().getBBox().width + padding)
                    .attr("height", d3.select("text#toDoVolumeText").node().getBBox().height + padding)
                    .attr("transform", "translate(" + toDoVolumeXDelta + "," + (-17.5 + toDoVolumeDelta) + ")");

                //update To Do Path coordinates
                for (i = x; i < toDoPercentagePathLength; i += accuracy) {
                    var pos = toDoPercentageNode.getPointAtLength(i);
                    if (pos.x >= x) {
                        break;
                    }
                }

                var toDoPercentageYPos = pos.y;

                //update To Do Path hover node
                d3.select("circle#toDoPercentage")
                    .style("opacity", 1)
                    .attr("cx", x)
                    .attr("cy", pos.y);

                //update To Do Path hover node
                d3.select("text#toDoPercentageText")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", pos.y)
                    .attr("dx", toDoPercentageXDelta)
                    .attr("dy", textHeightOffset)
                    .text("To Do %: " + formatPercentage(item.toDoPercentage));

                //update To Do Path hover background
                d3.select("rect#toDoPercentageRect")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", pos.y)
                    .attr("width", d3.select("text#toDoPercentageText").node().getBBox().width + padding)
                    .attr("height", d3.select("text#toDoPercentageText").node().getBBox().height + padding)
                    .attr("transform", "translate(" + toDoPercentageXDelta + "," + (-25) + ")");

                //use To Do x position to update Date position also
                d3.select("text#datePercentageText")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", height + (margin.bottom / 2))
                    .attr("text-anchor", "middle")
                    .text(d3.timeFormat("%d-%b-%y")(item.key));

                //use To Do x position to update Date position also
                d3.select("rect#datePercentageRect")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", height + (margin.bottom / 2))
                    .attr("width", d3.select("text#datePercentageText").node().getBBox().width + padding)
                    .attr("height", d3.select("text#datePercentageText").node().getBBox().height + padding)
                    .attr("transform", "translate(" + -(d3.select("text#datePercentageText").node().getBBox().width / 2) + ",-18)");

                //update In Progress Path coordinates
                for (i = x; i < inProgressPercentagePathLength; i += accuracy) {
                    var pos = inProgressPercentageNode.getPointAtLength(i);
                    if (pos.x >= x) {
                        break;
                    }
                }

                var inProgressPercentageYPos = pos.y;

                if (inProgressPercentageYPos - toDoPercentageYPos < 20) {
                    var inProgressPercentageDelta = 20 + toDoPercentageYPos - inProgressPercentageYPos;
                } else inProgressPercentageDelta = 0;

                //update In Progress Path hover node
                d3.select("circle#inProgressPercentage")
                    .style("opacity", 1)
                    .attr("cx", x)
                    .attr("cy", pos.y);

                //update To Do Path hover node
                d3.select("text#inProgressPercentageText")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", pos.y)
                    .attr("dx", inProgressPercentageXDelta)
                    .attr("dy", inProgressPercentageDelta + textHeightOffset)
                    .text("In Progress %: " + formatPercentage(item.inProgressPercentage));

                //update To Do Path hover background
                d3.select("rect#inProgressPercentageRect")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", pos.y)
                    .attr("width", d3.select("text#inProgressPercentageText").node().getBBox().width + padding)
                    .attr("height", d3.select("text#inProgressPercentageText").node().getBBox().height + padding)
                    .attr("transform", "translate(" + inProgressPercentageXDelta + "," + (-17.5 + inProgressPercentageDelta) + ")");

                //update Done Path coordinates
                for (i = x; i < donePercentagePathLength; i += accuracy) {
                    var pos = donePercentageNode.getPointAtLength(i);
                    if (pos.x >= x) {
                        break;
                    }
                }

                var donePercentageYPos = pos.y;

                if (donePercentageYPos - inProgressPercentageYPos + inProgressPercentageDelta < 20) {
                    var donePercentageDelta = 20 + inProgressPercentageYPos - inProgressPercentageDelta - donePercentageYPos;
                } else donePercentageDelta = 0;

                //update Done Path hover node
                d3.select("circle#donePercentage")
                    .style("opacity", 1)
                    .attr("cx", x)
                    .attr("cy", pos.y);

                //update Done Path hover node
                d3.select("text#donePercentageText")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", pos.y)
                    .attr("dx", donePercentageXDelta)
                    .attr("dy", donePercentageDelta + textHeightOffset)
                    .text("Done %: " + formatPercentage(item.donePercentage));

                //update Done Path hover background
                d3.select("rect#donePercentageRect")
                    .style("opacity", 1)
                    .attr("x", x)
                    .attr("y", pos.y)
                    .attr("width", d3.select("text#donePercentageText").node().getBBox().width + padding)
                    .attr("height", d3.select("text#donePercentageText").node().getBBox().height + padding)
                    .attr("transform", "translate(" + donePercentageXDelta + "," + (-17.5 + donePercentageDelta) + ")");
            }

        }

        //****** END HELPER FUNCTIONS ******//
    });