queue()
    .defer(d3.csv, "data/Salaries.csv")         // Load data - first argument is format of file, second is file path and name
    .await(makeGraphs);                         // will wait for data to download and then call makeGraphs (or whatever name we call it)
    

function makeGraphs(error, salaryData) {        // The first argument is an error response and the second is a variable that the data from the CSV file will be passed into by queue.js.
   var ndx = crossfilter(salaryData);           // Load salary data into crossfilter

   show_gender_balance(ndx);                    // Pass ndx (the crossfilter) to the function that will create the graph
   
   dc.renderAll();                              // render the graph
   
}

function show_gender_balance(ndx) {
    var dim = ndx.dimension(dc.pluck('sex'));          // create a dimension based on sex. Pluck function is in dc.min.js
    var group = dim.group();                           // create a group based on sex
    
    dc.barChart("#gender-balance")                  // attach the bar chart to the relevant div and set its attributes
    .width(400)
    .height(300)
    .margins({top: 10, right: 50, bottom: 30, left: 50})     // set margins - notice the curly brackets!!
    .dimension(dim)                                          // specify the dimension
    .group(group)                                            // specify the group
    .transitionDuration(500)                                 // how quickly the chart animates when we filter
    .x(d3.scale.ordinal())                                   // ordinal - because the dimension consists of the words male / female
    .xUnits(dc.units.ordinal)
    .elasticY(true)
//    .xAxisLabel("Gender")                                    // x axis label
    .yAxis().ticks(20);                                        // the number of ticks that should appear on the u asis
}