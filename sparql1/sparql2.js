   function getData(){

        var endpoint = "http://opendata.caceres.es/sparql/"
        var queryGraph = "";
        var sparqlQuery =   "select ?nomFarma where {"+
                            "?x a schema:Pharmacy."+
                            "?x schema:name ?nomFarma."+
                            "} ORDER BY ASC (?nomFarma) LIMIT 50";
        
//        var sparqlQuery = "select distinct ?Concept where {[] a ?Concept} LIMIT 100";

        		
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
                var datos = data.results.bindings;
                console.log(datos);
                var divDatos = document.getElementById("divSparql");
                for(var i in datos){
                    var p = document.createElement("p");
                    var valor = datos[i].nomFarma.value;
                    console.log(valor);
                    p.appendChild(document.createTextNode(valor));
                    console.log(p);
                    divDatos.appendChild(p);
                }
            }
        });

    }
//window.alert("Hola");
window.onload = getData();
