   function getData(){

        var endpoint = "http://opendata.unex.es/sparql/"
        var queryGraph = "";
        var sparqlQuery =   "select distinct ?centro where{"+
                            "?uri a ou:Centro."+
                            "?uri foaf:name ?centro."+
                            "}";
        $.ajax({
            data:{"default-graph-uri":queryGraph, query:sparqlQuery, format:'json'},
            url: endpoint,
            cache: false,
            statusCode: {
                400: function(error){
                    alert("ERROR");
                }
            },
            
            success: function(data){
                var centros = data.results.bindings;
                var divCentros = document.getElementById("divSparql");
                for(var i in centros){
                    var p = document.createElement("p");
                    p.appendChild(document.createTextNode(centros[i].centro.value));
                    console.log(p);
                    divCentros.appendChild(p);
                }
            }
        });

    }
//window.alert("Hola");
window.onload = getData();
