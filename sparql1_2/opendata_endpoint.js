var async = require('async'), // Do calls in series
    request = require('request'), // Do http request (async)
    cheerio = require('cheerio'); // Get img tags from external url
    NodeCache = require("node-cache"); // Save query results on the cache for one day.

var myCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

module.exports = {

    /**
     * Get all the elements of one particular dataset of Cáceres
     * @param {string} whichDataset - One of { monument, museum, restaurant, parking, theater, cinema }
     */
    getDataCaceres: function(whichDataset, allDoneCallback) {
        async.waterfall(
            [
                // 1. Get all the information of the selected dataset with a query to the SPARQL endpoint of opendata Cáceres
                function(callback) {
                    console.log("opendata.js linea 19");
                    var data;
                    try {
                        data = myCache.get(whichDataset, true);
                        // Finish, since image urls are also included in the cache
                        allDoneCallback(data);
                        console.log("opendata.js linea 25");
                    } catch (err) {
                        // Not in the cache.
                        console.log("opendata.js linea 28");
                        getDataFromEndpoint(whichDataset, function dataObtainedCallback(bindings) {
                            console.log("opendata.js linea 30");
                            callback(null, bindings); // get the images
                        });
                    }
                },

            ],
            // Final callback function
            function(err, results) {
                 console.log("opendata.js linea 39");
                // If this point is reached, results are not in the cache. Store them
                if (results.length) {
                    console.log("opendata.js linea 42");
                    myCache.set(whichDataset, results);
                }
                allDoneCallback(results);
            }
        );

    },
    
};


function getDataFromEndpoint(whichDataset, dataObtainedCallback) {
    console.log("opendata.js linea 53");
    var endpoint = 'http://opendata.caceres.es/sparql/';
    var graph = '';
    var SPARQLquery = '';
    switch (whichDataset) {
        default:
        console.log("default");
            SPARQLquery ="select distinct ?Concept where {[] a ?Concept"+
          " FILTER isURI(?Concept )} ";
            break;
    }
    if (SPARQLquery) {
    console.log("opendata.js linea 65");
        request({
                url: 'http://opendata.caceres.es/sparql/',
                qs: { // Query string data
                    query: SPARQLquery,
                    format: 'application/sparql-results+json'
                },
            },
            function(error, response, body) {
                if (error) {
                    console.log("opendata.js linea 75");
                    console.log(error);
                } else {
                    console.log("opendata.js linea 78");
                    var jsonBody = JSON.parse(body);
                    dataObtainedCallback(jsonBody.results.bindings);
                }
            });

    } else { 
        // return empty object if bad dataset was selected. 
         console.log("opendata.js linea 86");
        dataObtainedCallback([]);
    }
        console.log(SPARQLquery);
}

