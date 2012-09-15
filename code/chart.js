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

    chartBoxFactor =4/5;
     var chartBox = {
            width: width * chartBoxFactor,
            height: height * chartBoxFactor,
            x: width * (1-(chartBoxFactor))/2,
            y: height * (1-(chartBoxFactor))/2,
     };

    var chartBoxRect = new Kinetic.Rect($.extend(chartBox,{
        fill: "hsl(240, 20%, 95%)",
        stroke: "black",
        strokeWidth: 0.01
    }));

    //
    // just explicitly  calculate  dimensions
    // that could otherwise be spontaneously used inline
    //
    chartBox.startX = chartBox.x;
    chartBox.startY= chartBox.y;
    chartBox.endX = chartBox.startX+chartBox.width;
    chartBox.endY = chartBox.startY+chartBox.height;

    //
    //  construct scales that would be used for
    //  projecting data values to chart space pixels.
    //
    //  the arguments are the target pixel range
    //
    chartBox.widthScaler = d3.time.scale();
    chartBox.widthScaler.range([chartBox.startX, chartBox.endX]);
    chartBox.widthScaler.domain([timeframe.min, timeframe.max]);

    chartBox.heightScaler = d3.scale.linear();
    chartBox.heightScaler.range([chartBox.endY, chartBox.startY]);
    chartBox.heightScaler.domain([0, Math.max(series.series[0].max, series.series[1].max)]);

    //var stage = new Kinetic.Stage($.extend({container: chartArea}, chartBox));
	var stage = new Kinetic.Stage($.extend({container: chartArea},{height: height, width: width}));
    var layer = new Kinetic.Layer();

    chartBoxRect.on('mousemove', function() {
        var pos = stage.getMousePosition();
        console.log('x: ' + pos.x + ', y: ' + pos.y);
    });

    chartBoxRect.on("mouseover", function() {
        //chartRect.setFill("hsl(240,15%,93%)");
        this.setFill("black");
		 layer.draw();
        });

    chartBoxRect.on("mouseout", function() {
        this.setFill("hsl(240,20%,95%)");
        layer.draw();
    });

    // add the shape to the layer
	layer.add(chartBoxRect);

	// add the layer to the stage
	stage.add(layer);
     draw(layer, chartBox);
}

	function initTimeframe()
{
	timeframe.min = Math.min(series.series[0].minDate, series.series[1].minDate);
	timeframe.max = Math.max(series.series[0].maxDate, series.series[1].maxDate);
	//console.log("timeframe:");
	//console.dir(timeframe);
}

function draw(layer, drawBox)
{

    function line(drawBox, x, y, toX, toY)
    {
            var line = new Kinetic.Line({
            points: [ drawBox.widthScaler(x), drawBox.heightScaler(y),  drawBox.widthScaler(toX), drawBox.heightScaler(toY)],
            stroke: "orange",
            strokeWidth: 1,
            lineCap: "mitter",
            lineJoin: "mitter"
        });
        layer.add(line);
    }

    function plot(drawBox, data)
    {
        for (i=0; i<data.length-1; i++)
        {
            line(drawBox, data[i].x, data[i].y, data[i+1].x, data[i+1].y)
        }
    }

	//
	// plot each serie
	//

    plot(drawBox, series.series[0].data);

	 plot(drawBox, series.series[1].data);

    layer.draw();

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