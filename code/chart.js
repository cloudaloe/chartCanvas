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

     var chartRect = new Kinetic.Rect({
	  x: 0,
	  y: 0,
	  width: chartBox.width,
	  height: chartBox.height,
	  fill: "hsl(240, 20%, 95%)",
	  stroke: "black",
	  strokeWidth: 0.01
  	});

    chartRect.on("mouseover", function() {
        chartRect.setFill("hsl(240,15%,93%)");
		 layer.draw();
        });

    chartRect.on("mouseout", function() {
        chartRect.setFill("hsl(240,20%,95%)");
        layer.draw();
    });

    // add the shape to the layer
	layer.add(chartRect);

	// add the layer to the stage
	stage.add(layer);
     draw(layer, chartBox.height, chartBox.width);
}

	function initTimeframe()
{
	timeframe.min = Math.min(series.series[0].minDate, series.series[1].minDate);
	timeframe.max = Math.max(series.series[0].maxDate, series.series[1].maxDate);
	console.log("timeframe:");
	console.dir(timeframe);
}

function draw(layer, height, width)
{
	//
	//  construct scales that would be used for
	//  projecting data values to chart space pixels.
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

    var position = {x:0, y:0};

    function line(x, y, toX, toY)
    {
           var line = new Kinetic.Line({
            points: [ widthScaler(x), heightScaler(y),  widthScaler(toX), heightScaler(toY)],
            stroke: "orange",
            strokeWidth: 3,
            lineCap: "round",
            lineJoin: "round"
        });
        console.log(x, y, toX, toY);
        layer.add(line);
    }

    function plot(data)
    {
        data.forEach(function (i)
        {
            debugger;
            line(position.x,  position.y , i.x, i.y);
            position = {x: i.x,  y:i.y};
        });
    }

	//
	// plot each serie
	//
	 plot(series.series[0].data);

	 //plot(series.series[1].data);

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

    //drawAxes();
}