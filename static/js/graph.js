queue()
    .defer(d3.csv, "data/Salaries.csv") // Load data - first argument is format of file, second is file path and name
    .await(makeGraphs); // will wait for data to download and then call makeGraphs (or whatever name we call it)


function makeGraphs(error, salaryData) { // The first argument is an error response and the second is a variable that the data from the CSV file will be passed into by queue.js.
    var ndx = crossfilter(salaryData); // Load salary data into crossfilter

    show_discipline_selector(ndx); // select discipline
    show_gender_balance(ndx); // Pass ndx (the crossfilter) to the function that will create the graph

    show_average_salary(ndx); // show average salary

    dc.renderAll(); // render the graphs

}

function show_discipline_selector(ndx) { // select discipline function - A or B
    var dim = ndx.dimension(dc.pluck('discipline')); // create discipline dimension - disciplines A & B
    group = dim.group(); // create a group - group A & group B

    dc.selectMenu("#discipline-selector") // attach to div in html file
        .dimension(dim) // discipline A & B
        .group(group); // group A & Group B - select one or the other

}

function show_gender_balance(ndx) {
    var dim = ndx.dimension(dc.pluck('sex')); // create a dimension based on sex - male & female. Pluck function is in dc.min.js
    var group = dim.group(); // create groups within dimension - group male, group female

    dc.barChart("#gender-balance") // attach the bar chart to the relevant div and set its attributes
        .width(400)
        .height(300)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 }) // set margins - notice the curly brackets!!
        .dimension(dim) // specify the dimension - sex (male, female)
        .group(group) // specify the group - group male, group female
        .transitionDuration(500) // how quickly the chart animates when we filter
        .x(d3.scale.ordinal()) // ordinal - because the dimension consists of the words male / female
        .xUnits(dc.units.ordinal)
        //        .elasticY(true)                               // when this was = 'y' with the select option, the bars didnt move, only the y axis
        .xAxisLabel("Gender") // x axis label
        .yAxis().ticks(20); // the number of ticks that should appear on the u asis
}

function show_average_salary(ndx) {
    var dim = ndx.dimension(dc.pluck('sex'));
    var averageSalaryByGender = dim.group().reduce(add_item, remove_item, initialise);
    console.log("average salary by gender = " + averageSalaryByGender);

    dc.barChart("#average-salary") // attach the bar chart to the relevant div and set its attributes
        .width(400)
        .height(300)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 }) // set margins - notice the curly brackets!!
        .dimension(dim) // specify the dimension - sex (male, female)
        .group(averageSalaryByGender) // specify the group - average salary by male / female
        .valueAccessor(function(d) {
            return d.value.average.toFixed(2);
        })
        .transitionDuration(500) // how quickly the chart animates when we filter
        .x(d3.scale.ordinal()) // ordinal - because the dimension consists of the words male / female
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Gender") // x axis label
        .yAxis().ticks(4); // the number of ticks that should appear on the u asis
}

function add_item(p, v) {
    p.count++;
    p.total += v.salary;
    p.average = p.total / p.count;
    return p;
}

function remove_item(p, v) {
    p.count--;

    if (p.count == 0) {
        p.total = 0;
        p.average = 0;
    }
    else {
        p.total -= v.salary;
        p.average = p.total / p.count;
    }
    return p;
}

function initialise() {
    return { count: 0, total: 0, average: 0 };
}
