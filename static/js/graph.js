queue()
    .defer(d3.csv, "data/Salaries.csv") // Load data - first argument is format of file, second is file path and name
    .await(makeGraphs); // will wait for data to download and then call makeGraphs (or whatever name we call it)


function makeGraphs(error, salaryData) { // The first argument is an error response and the second is a variable that the data from the CSV file will be passed into by queue.js.
    var ndx = crossfilter(salaryData); // Load salary data into crossfilter

    salaryData.forEach(function(d) { // extract salary data
        d.salary = parseInt(d.salary); // make it numeric
    })

    show_discipline_selector(ndx); // select discipline

    show_percent_that_are_professors(ndx, "Female", "#percentage-women-professors");    // show female professors using the crossfilter
    show_percent_that_are_professors(ndx, "Male", "#percentage-men-professors");        // show male professors using the crossfilter

    show_gender_balance(ndx); // Pass ndx (the crossfilter) to the function that will create the graph

    show_average_salary(ndx); // show average salary
    show_rank_distribution(ndx); // show average salary

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
        //        .elasticY(true)
        .xAxisLabel("Gender") // x axis label
        .yAxis().ticks(4); // the number of ticks that should appear on the u asis
}

function show_rank_distribution(ndx) {

    var dim = ndx.dimension(dc.pluck('sex')); // create a dimension based on sex - male & female. Pluck function is in dc.min.js
    var profByGender = rankByGender(dim, "Prof");
    var asstProfByGender = rankByGender(dim, "AsstProf");
    var assocProfByGender = rankByGender(dim, "AssocProf");

    dc.barChart("#rank-distribution")
        .width(400)
        .height(300)
        .dimension(dim)
        .group(profByGender, "Prof")
        .stack(asstProfByGender, "Asst Prof")
        .stack(assocProfByGender, "Assoc Prof")
        .valueAccessor(function(d) {
            if (d.value.total > 0) {
                return (d.value.match / d.value.total) * 100;
            }
            else {
                return 0;
            }
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .legend(dc.legend().x(320).y(20).itemHeight(15).gap(5))
        .margins({ top: 10, right: 100, bottom: 30, left: 30 });

    // Functions used by show_rank_distribution  

    function rankByGender(dimension, rank) {
        return dim.group().reduce(
            function(p, v) {
                p.total++
                if (v.rank == rank) {
                    p.match++
                }

                return p;
            },
            function(p, v) {
                p.total--
                if (v.rank == rank) {
                    p.match--
                }

                return p;
            },
            function() {
                return { total: 0, match: 0 };

            }

        );

    }
}




// Functions used by above functions

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


function show_percent_that_are_professors(ndx, gender, element) {
    var percentageThatAreProf = ndx.groupAll().reduce (
        function(p, v) {
            if (v.sex === gender) {
                p.count++;
                if (v.rank === "Prof")
                    p.are_prof++;
            }
            return p;
        },

        function(p, v) {
            if (v.sex === gender) {
                p.count--;
                if (v.rank === "Prof")
                    p.are_prof--;
            }
            return p;
        },

        function() {
            return { count: 0, are_prof: 0 };

        }

    );

    dc.numberDisplay(element)                   // this will be the relevent div "percentage-women-professors", "percentage-men-professors"
        .formatNumber(d3.format(".2%"))
        .valueAccessor(function (d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                console.log("d.are_prof = "+d.are_prof)
                console.log("d.count = "+d.count)
                return (d.are_prof / d.count);
            }
        })

        .group(percentageThatAreProf);


}
