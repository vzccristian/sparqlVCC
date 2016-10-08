function getRecursos(){
	console.log("Tomando recursos...");
	document.getElementById("divRecursos").innerHTML="";
	// Obtengo el punto sparql al que se quiere acceder.
    var listaEndPoint =  document.getElementById("lista");
    var endpoint = listaEndPoint.options[listaEndPoint.selectedIndex].value;
    var queryGraph = "";
    if (endpoint=="http://opendata.caceres.es/sparql/") {
    	    var sparqlQuery =   "select distinct ?Concept where {[] a ?Concept"+
     " FILTER regex(?Concept , \"ontomunicipio\")} ";
    }
    else {
     	    var sparqlQuery =   "select distinct ?Concept where {[] a ?Concept"+
     " FILTER regex(?Concept , \"ontouniversidad\")}";   	
    }

   console.log(sparqlQuery);
    $.ajax({
     	data:{"default-graph-uri":queryGraph, query:sparqlQuery, format:'json'},
        url: endpoint,
        cache: false,
        statusCode: {400: function(error){alert("ERROR");}  },

        success : function(data) {
        //Introducir desplegable con todas las posibles opciones.
		var datos = data.results.bindings;
		var div = document.querySelector("#divRecursos"),
		frag = document.createDocumentFragment(),
		select = document.createElement("select");
		var valor = datos[0].Concept.value;
		var valorLimpio = valor.split("#");
		select.options.add(new Option(valorLimpio[1], "AU", true, true));
		for (var i = 1; i < datos.length; i++) {
			valor = datos[i].Concept.value;
			valorLimpio = valor.split("#");
			select.options.add(new Option(valorLimpio[1], "AU"));
		}

		frag.appendChild(select);
		div.appendChild(frag);
		espacio = document.createTextNode("      ");
 		divRecursos.appendChild(espacio);
		createButton(divRecursos,null,"Seleccionar recurso","selectResources");
		document.getElementById("selectResources").onclick = function() {getPropertys()};
		}
	});

}
function getPropertys() {
	console.log("Tomando propiedades...");
	document.getElementById("divPropiedades").innerHTML="";
	// Obtengo el punto sparql al que se quiere acceder.
    var listaEndPoint =  document.getElementById("lista");
    var endpoint = listaEndPoint.options[listaEndPoint.selectedIndex].value;
    var queryGraph = "";
    var sparqlQuery =   "select distinct ?property where {"+
         "?instance a om:Museo . "+
         "?instance ?property ?obj . }";
    console.log(sparqlQuery);
	$.ajax({
		data : {
			"default-graph-uri" : queryGraph,
			query : sparqlQuery,
			format : 'json'
		},
		url : endpoint,
		cache : false,
		statusCode : {
			400 : function(error) {
				alert("ERROR");
			}
		},
		success : function(data) {
			var datos = data.results.bindings;
			generarTabla(datos);
		}
	});

}
function createButton(context, func, valor, id){
    var button = document.createElement("input");
    button.type = "button";
    button.value = valor;
    button.onclick = func;
    button.id=id;
    context.appendChild(button);
}

function getDataConsulta() {
	var listaEndPoint = document.getElementById("lista");
	var endpoint = listaEndPoint.options[listaEndPoint.selectedIndex].value;
	var queryGraph = "";
	var sparqlQuery = document.getElementById("textAreaConsultaLimpia").value;
	console.log(sparqlQuery);

	$.ajax({
		data : {
			"default-graph-uri" : queryGraph,
			query : sparqlQuery,
			format : 'json'
		},
		url : endpoint,
		cache : false,
		statusCode : {
			400 : function(error) {
				alert("ERROR");
			}
		},
		success : function(data) {
			var datos = data.results.bindings;
			generarTabla(datos);
		}
	});

}

   function getData(){
      	// Obtengo el punto sparql al que se quiere acceder.
      	var listaEndPoint =  document.getElementById("lista");
      	var endpoint = listaEndPoint.options[listaEndPoint.selectedIndex].value;
        var queryGraph = "";
        var sparqlQuery =   "select ?nomFarma where {"+
                            "?x a schema:Pharmacy."+
                            "?x schema:name ?nomFarma."+
                            "} ORDER BY ASC (?nomFarma) LIMIT 50";
        $.ajax({
            data:{"default-graph-uri":queryGraph, query:sparqlQuery, format:'json'},
            url: endpoint,
            cache: false,
            statusCode: {
                400: function(error){
                    alert("ERROR");
                }
            },   
		  success : function(data) {
			var datos = data.results.bindings;
			generarTabla(datos);
		}
        });

    }
   
   function generarTabla(datos) {

		//GENERACION DE TABLA
		if (document.getElementById("tablaSPARQL")==null) {
		// Obtener la referencia del elemento body
		var body = document.getElementById("divTabla");
		
		// Crea un elemento <table> y un elemento <tbody>
		var tabla   = document.createElement("table");
		tabla.id=("tablaSPARQL");
		var tblBody = document.createElement("tbody");
		
		
		for ( var i in datos) {
			// Crea las hileras de la tabla
		    var hilera = document.createElement("tr");
		    var celda = document.createElement("td");
		 //  var nom=datos[i];
		 //TODO PROBLEMAS PARA COGER LAS PROPIEDADES.

		    console.log(datos[i]);
		    var valor = datos[i].nomFarma.value;
		    var textoCelda = document.createTextNode(valor);
		    celda.appendChild(textoCelda);
		    hilera.appendChild(celda);
		    tblBody.appendChild(hilera);   
		}
		   // posiciona el <tbody> debajo del elemento <table>
		   tabla.appendChild(tblBody);
		   // appends <table> into <body>
		   body.appendChild(tabla);
		   // modifica el atributo "border" de la tabla y lo fija a "2";
		   tabla.setAttribute("border", "2");
		}
	 }
//window.alert("Hola");
//window.onload = getData();
