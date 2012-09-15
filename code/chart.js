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
            y: height * (1-(chartBoxFactor))/2
     };

	//var stage = new Kinetic.Stage($.extend({container: chartArea}, chartBox));
	var stage = new Kinetic.Stage($.extend({container: chartArea},{height: height, width: width}));

     //console.log(height,width);
     //console.log(chartBox) ;
     //console.log(stage.getHeight(), stage.getWidth(), stage.getSize());

    var layer = new Kinetic.Layer();

     var chartBoxRect = new Kinetic.Rect($.extend(chartBox,{
	  fill: "hsl(240, 20%, 95%)",
	  stroke: "black",
	  strokeWidth: 0.01
  	}));

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
	console.log("timeframe:");
	console.dir(timeframe);
}

function draw(layer, drawBox)
{
    //console.log(height, width);
	//
	//  construct scales that would be used for
	//  projecting data values to chart space pixels.
	//
	// the arguments are the target pixel range, as computed by the caller.
	//

     drawBox.startX=drawBox.x;
     drawBox.endX=drawBox.x+drawBox.width;
     drawBox.startY=drawBox.y;
    drawBox. endY=drawBox.y+drawBox.height;

	var widthScaler = d3.time.scale();
	widthScaler.range([drawBox.startX, drawBox.endX]);
	widthScaler.domain([timeframe.min, timeframe.max]);
	
	var heightScaler = d3.scale.linear();
	heightScaler.range([drawBox.endY, drawBox.startY]);
	heightScaler.domain([0, Math.max(series.series[0].max, series.series[1].max)]);
	
	 function line(x, y, toX, toY)
    {
           console.log(heightScaler(toY));
           var line = new Kinetic.Line({
            points: [ widthScaler(x), heightScaler(y),  widthScaler(toX), heightScaler(toY)],
            stroke: "orange",
            strokeWidth: 1,
            lineCap: "mitter",
            lineJoin: "mitter"
        });
        //console.log(x, y, toX, toY);
        layer.add(line);
    }

    function plot(data)
    {
        debugger;
        for (i=0; i<data.length-1; i++)
        {
            line(data[i].x, data[i].y, data[i+1].x, data[i+1].y)
        }
    }

	//
	// plot each serie
	//

    plot(series.series[0].data);

	 plot(series.series[1].data);

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