//
// the real stuff
//

chart = new Object(); 		// container for chart properties
timeframe = new Object();	// container for time frame properties
xAxisHeight=20;
yAxisWidth=40;

function seriesReady()
{
	initTimeframe();
	initChart();
}

function initChart()
{
	var chartArea = document.getElementById('chartContainer');
	var width = parseFloat(getComputedStyle(chartArea).width);
	var height = parseFloat(getComputedStyle(chartArea).height);

    chartBoxFactor = 7/8;
     var chartBox = {
            width: width * chartBoxFactor,
            height: height * chartBoxFactor,
            x: width * (1-chartBoxFactor),
            y: height * (1-chartBoxFactor)
            };

	var stage = new Kinetic.Stage($.extend( {container: "chartContainer"}, chartBox));

    var layer = new Kinetic.Layer();

     var rect = new Kinetic.Rect({
	  x: 0,
	  y: 0,
	  width: chartBox.width,
	  height: chartBox.height,
	  fill: "#00D2FF",
	  stroke: "black",
	  strokeWidth: 0.1
  	});
	
	rect.on("mousemove", function() {
         rect.setStrokeWidth(rect.getStrokeWidth()+0.5);
		 layer.draw();
        });

	rect.on("touchstart, touchmove", function() {
         rect.setStrokeWidth(rect.getStrokeWidth()+0.5);
		 layer.draw();
        });

		
	
	// add the shape to the layer
	layer.add(rect);

	// add the layer to the stage
	stage.add(layer);
	
	// var svgArea = chartArea.append("svg:svg");
	// svgArea.attr("width", widthPixels).attr("height", heightPixels);
	
	// chart.svgElem = svgArea.append("svg:g");
	// chart.svgElem.attr("width", widthPixels).attr("height", heightPixels);	

	// draw(parseFloat(heightPixels) - xAxisHeight, parseFloat(widthPixels) - yAxisWidth);
}

function initTimeframe()
{
	timeframe.min = Math.min(series.series[0].minDate, series.series[1].minDate);
	timeframe.max = Math.max(series.series[0].maxDate, series.series[1].maxDate);
	console.log("timeframe:");
	console.dir(timeframe);
}

function draw(height, width)
{
	//
	// construct scales that the plot function will use 
	// for projecting data values to chart space pixels.
	//
	// the arguments are the target pixel range, as computed by the caller.
	// 
	var widthScaler = d3.time.scale();
	widthScaler.range([0, width]);
	widthScaler.domain([timeframe.min, timeframe.max]);
	
	var heightScaler = d3.scale.linear();
	heightScaler.range([height, 0]);
	heightScaler.domain([0, Math.max(series.series[0].max, series.series[1].max)]);
	
	var plotCalc = d3.svg.line()
    .interpolate("monotone")
    .x(function(i) { return widthScaler(i.x); })
    .y(function(i) { return heightScaler(i.y); });

	//
	// plot each serie
	//
	seriesPlot1 = chart.svgElem.append("path");
	seriesPlot1.attr("d", plotCalc(series.series[0].data));

	seriesPlot2 = chart.svgElem.append("path");
	seriesPlot2.attr("d", plotCalc(series.series[1].data));

    function drawAxes()
    {
        var xAxis = d3.svg.axis().scale(widthScaler).orient("bottom");
       chart.svgElem.append("g")
            .attr("class","Axis")
            .attr("transform", "translate(0," + (height) + ")")
            .call(xAxis);

        var yAxis = d3.svg.axis().scale(heightScaler).orient("right");
        chart.svgElem.append("g")
            .attr("class","Axis")
            .attr("transform", "translate(" + (width) + ",0)")
            .call(yAxis);

    }

    drawAxes();
}