queue()
    .defer(d3.csv, "data/salaries.csv")                 // first argument is file type, second is file path and name
    .await(makeGraphs);                                 // will wait for data to download and then call makeGraphs (or whatever name we call it)

function makeGraphs(error, salaryData) {                // The first argument is an error and the second is a variable that the data from the 
                                                        // CSV file will be passed into by queue.js.
}
