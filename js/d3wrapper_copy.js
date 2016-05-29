// see: http://bl.ocks.org/ameyms/9184728
var D3WRAP = { REVISION: '1' };

// D3WRAP.ZoomableSunburst Object
D3WRAP.ZoomableSunburst = function(container, dataset, params){
    this.container = container;
	this.dataset = dataset;
	this.params = params;
	var self = this;

	// Provide parameter defaults if they are missing
	var barConfig = {
		width : params.width || 960,
		height : params.height ||700,
		radius : Math.min(params.width, params.height) / 2 || 350,
		leftMargin : params.leftMargin || 20,
		topMargin : params.topMargin || 20,
		chartWidth: params.chartWidth || 960,
		chartHeight : params.chartHeight || 700
	}

    // Select the DOM element into which we will insert the chart
	var c1 = d3.select(container);
	// Append an SVG to the DOM element with an offset from the upper left corner
	var svg = c1.append("svg")
		.attr("width", barConfig.width)
		.attr("height", barConfig.height)
		.append("g")
		.attr("transform", "translate(" + barConfig.width / 2 + "," + (barConfig.height / 2 + 10) + ")")
		;

    var x = d3.scale.linear()
        .range([0, 2 * Math.PI]);

    var y = d3.scale.linear()
        .range([0, barConfig.radius]);

    var color = d3.scale.category20c();

    var partition = d3.layout.partition()
        .value(function(d) {return d.CPI_W; });

    var arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, y(d.y)); })
        .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

      var g = svg.selectAll("g")
          .data(partition.nodes(dataset))
        .enter().append("g");
        console.log(partition.nodes(dataset));
        console.log(g);

      var path = g.append("path")
        .attr("d", arc)
        .style("fill", function(d) {  return color((d.children ? d : d.parent).Expenditure_Category); })
        .on("click", click);

      var text = g.append("text")
        .attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
        .attr("x", function(d) { return y(d.y); })
        .attr("dx", "6") // margin
        .attr("dy", ".35em") // vertical-align
        .text(function(d) { return d.Expenditure_Category; });

      function click(d) {
        // fade out all text elements
        text.transition().attr("opacity", 0);

        path.transition()
          .duration(750)
          .attrTween("d", arcTween(d))
          .each("end", function(e, i) {
              // check if the animated element's data e lies within the visible angle span given in d
              if (e.x >= d.x && e.x < (d.x + d.dx)) {
                // get a selection of the associated text element
                var arcText = d3.select(this.parentNode).select("text");
                // fade in the text element and recalculate positions
                arcText.transition().duration(750)
                  .attr("opacity", 1)
                  .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
                  .attr("x", function(d) { return y(d.y); });
              }
          });
      }
//    });

    d3.select(self.frameElement).style("height", barConfig.height + "px");

   // Interpolate the scales!
    function arcTween(d) {
      var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
          yd = d3.interpolate(y.domain(), [d.y, 1]),
          yr = d3.interpolate(y.range(), [d.y ? 20 : 0, barConfig.radius]);
      return function(d, i) {
        return i
            ? function(t) { return arc(d); }
            : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
      };
    }

    function computeTextRotation(d) {
      return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
    }

}
/*
// Bar Chart Object
D3WRAP.SimpleBarChart = function(container, dataset, params) {
	this.container = container;
	this.dataset = dataset;
	this.params = params;
	var self = this;
	// Provide parameter defaults if they are missing
	this.barConfig = {
		width : params.width || 290,
		height : params.height ||320,
		leftMargin : params.leftMargin || 20,
		topMargin : params.topMargin || 20,
		yScale : params.yScale || 6.0,
		xScale : params.xScale || 35.0,
		barWidth : params.barWidth || 30.0,
		chartWidth: params.chartWidth || 250,
		chartHeight : params.chartHeight || 250
	}

	// Function to adjust scales
	this.adjustScales = function() {
		self.yScale = d3.scale.linear()
			.domain([0, d3.max(self.dataset, function(d){return d.v;})])
			.range([self.barConfig.chartHeight, 0])
			;
		self.xScale = d3.scale.linear()
			.domain([0, self.dataset.length])
			.range([0, self.barConfig.chartWidth])
			;
	}
	
	// Select the DOM element into which we will insert the chart
	this.c1 = d3.select(container);
	// Append an SVG to the DOM element with an offset from the upper left corner
	this.svg1 = this.c1.append("svg")
		.attr("width", this.barConfig.width)
		.attr("height", this.barConfig.height)
		.append("g")
		.attr("transform", "translate(" + this.barConfig.leftMargin + "," + this.barConfig.topMargin + ")")
		;
	
	this.adjustScales();
	
	// Create axes and append to SVG
	this.xAxis = d3.svg.axis().scale(this.xScale).orient("bottom");
	this.yAxis = d3.svg.axis().scale(this.yScale).orient("left");
	this.svg1.append("g").attr("class", "xaxis axis")
		.attr("transform", "translate(0," + this.barConfig.chartHeight + ")")
		.call(this.xAxis)
		;
	this.svg1.append("g").attr("class", "yaxis axis").call(this.yAxis);
	
	// Creation of DOM elements in SVG from initial data
	this.svg1.selectAll("rect")
		.data(this.dataset,function(d){return d.key;})
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d,i){return self.xScale(i);})
		.attr("y", function(d,i){return self.yScale(d.v);})
		.attr("width", function(d,i){return self.barConfig.chartWidth/self.dataset.length-4;})
		.attr("height", function(d,i) {return self.barConfig.chartHeight-self.yScale(d.v);})
		;
	this.svg1.selectAll("text.btext")
		.data(this.dataset,function(d){return d.key;})
		.enter().append("text")
		.attr("class", "btext")
		.attr("x", function(d,i){return self.xScale(i)+5;})
		.attr("y", function(d,i){return self.yScale(d.v)+15;})
		.text(function(d,i){return Math.round(d.v);})
		;

	// Update function
	this.update = function(dataset) {
		self.dataset = dataset;
		// recompute the scales
		self.adjustScales();
		// adjust the axes
		self.xAxis = d3.svg.axis().scale(self.xScale).orient("bottom");
		self.yAxis = d3.svg.axis().scale(self.yScale).orient("left");
		self.svg1.selectAll("g.xaxis.axis").transition().duration(500).call(self.xAxis);
		self.svg1.selectAll("g.yaxis.axis").transition().duration(500).call(self.yAxis);
		// Bind the new dataset
		var dataJoin = self.svg1.selectAll("rect")
			.data(self.dataset,function(d){return d.key;});
		var textJoin = self.svg1.selectAll("text.btext")
			.data(self.dataset,function(d){return d.key;});
		// The "enter" set consists of new data in the data array
		// The bar is initially set with zero height so it can transition later
		dataJoin.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d,i){return self.xScale(i);})
			.attr("y", function(d,i){return self.barConfig.chartHeight;})
			.attr("width", function(d,i){return self.barConfig.chartWidth/self.dataset.length-4;})
			.attr("height", function(d,i) {return 0;})
			;
		textJoin.enter().append("text")
			.attr("class", "btext")
			.attr("x", function(d,i){return self.xScale(i)+5;})
			.attr("y", function(d,i){return self.barConfig.chartHeight+15;})
			.text(function(d,i){return Math.round(d.v);})
			;
		// The "update" set now includes the "enter" set
		// A transition is applied to smootly change the data
		dataJoin.transition().duration(500)
			.attr("x", function(d,i){return self.xScale(i);})
			.attr("y", function(d,i){return self.yScale(d.v);})
			.attr("width", function(d,i){return self.barConfig.chartWidth/self.dataset.length-4;})
			.attr("height", function(d,i) {return self.barConfig.chartHeight-self.yScale(d.v);})
			;
		textJoin.transition().duration(500)
			.attr("class", "btext")
			.attr("x", function(d,i){return self.xScale(i)+5;})
			.attr("y", function(d,i){return self.yScale(d.v)+15;})
			.text(function(d,i){return Math.round(d.v);})
			;
		// The "exit" set is transitioned to zero height and removed
		dataJoin.exit().transition().duration(500)
			.attr("y", function(d,i){return self.barConfig.chartHeight;})
			.attr("height", function(d,i) {return 0;})
			.remove()
			;
		textJoin.exit().transition().duration(500)
			.attr("y", function(d,i){return self.barConfig.chartHeight+15;})
			.remove();
			;
	}
	
}
D3WRAP.SimpleBarChart.prototype = Object.create(Object.prototype);
D3WRAP.SimpleBarChart.prototype.constructor = D3WRAP.SimpleBarChart;


D3WRAP.NeedleGauge = function(container, params) {
	this.container = container;
	this.params = params;
	this.el = d3.select(container);
}
D3WRAP.NeedleGauge.prototype = Object.create(Object.prototype);
D3WRAP.NeedleGauge.prototype.constructor = D3WRAP.NeedleGauge;
D3WRAP.NeedleGauge.prototype.setvalue = function (value) {
	this.value = value;
}*/