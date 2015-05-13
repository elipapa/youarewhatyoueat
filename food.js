'use strict';

/* jshint globalstrict: true */
/* global dc,d3,crossfilter,colorbrewer */

    
var categoryChart = dc.rowChart('#category-chart');
var mealChart = dc.pieChart('#meal-chart');
var timechart = dc.barChart("#time-chart");
var mealList = dc.dataTable("#dc-data-table");
	
d3.csv('fooddata_plot.json', function (data) {
    /* since its a csv file we need to format the data a bit */
    var dateFormat = d3.time.format('%Y%m%d');

    data.forEach(function (d) {
        d.dd = dateFormat.parse(d.date);
        d.week = d3.time.week(d.dd); // pre-calculate week for better performance
        d.calories = +d.calories; // coerce to number
        d.sugars_g = +d.sugars_g;
    });

    var ndx = crossfilter(data);
    
    var dateDim = ndx.dimension(function (d) { return d.dd;  });
    var weekDim = ndx.dimension(function (d) { return d.week; });
    var categoryDim = ndx.dimension( function (d) { return d.category; });
    var mealDim = ndx.dimension( function (d) { return d.meal;});
    
    var categoryGroup = categoryDim.group();
    var mealGroup = mealDim.group();

    var all = ndx.groupAll();
    var calByDate = dateDim.group().reduceSum(function (d) {
    	return d.calories;
    });


	mealChart.width(200)
	        .height(200)
	        .radius(90)
	        .innerRadius(40)
	        .dimension(mealDim)
	        .group(mealGroup);

	categoryChart.width(400)
	        .height(400)
	        .margins({top: 20, left: 10, right: 10, bottom: 20})
	        .group(categoryGroup)
	        .dimension(categoryDim)
	        // assign colors to each value in the x scale domain
	        // title sets the row text
	        .renderLabel(true)
	        .renderTitle(true)
	        .elasticX(true)
	        .xAxis().ticks(4);

	timechart
	    .width(750)
	    .height(160)
	    .margins({top: 10, right: 50, bottom: 30, left: 50})
	    .dimension(dateDim)
	    .group(calByDate)
	    .transitionDuration(500)
	    .x(d3.time.scale().domain([new Date(2014, 9, 18), new Date(2015, 3, 19)]))
	    .elasticY(true)
	    .xAxisLabel("Date")
	    .yAxis().ticks(4);

	mealList
        .dimension(dateDim)
        .group(function (d) {
            return d.meal;
        })
        .size(25) // (optional) max number of records to be shown, :default = 25
        // There are several ways to specify the columns; see the data-table documentation.
        // This code demonstrates generating the column header automatically based on the columns.
        .columns([
        function(d) {
            return d.date;
        },
        function(d) {
            return d.brand;
        },
        function(d) {
            return d.fooditem;
        },
        function(d) {
            return d.category;
        },
        function(d) {
            return d.calories;
        }
    	])
    	.renderlet(function (table) {
            table.selectAll('.dc-table-group').classed('info', true);
        });

	dc.renderAll();

});