function getRecursos(){
	console.log("Tomando recursos...");
	document.getElementById("divRecursos").innerHTML="";
	// Obtengo el punto sparql al que se quiere acceder.
    var listaEndPoint =  document.getElementById("lista"); //Seleccionar lista para consultas open data
    endpointGeneral = listaEndPoint.options[listaEndPoint.selectedIndex].value;
    queryGraph = "";
    if (endpointGeneral=="http://opendata.caceres.es/sparql/") {
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
        url: endpointGeneral,
        cache: false,
        statusCode: {400: function(error){alert("ERROR");}  },

        success : function(data) {
        //Introducir desplegable con todas las posibles opciones.
		var datos = data.results.bindings;
		var columName="Concept";
		crearDesplegable(datos,"#divRecursos",columName)
		}
	});

}

function crearDesplegable(datos,divInsertar,columName) {
		var div = document.querySelector(divInsertar),
		frag = document.createDocumentFragment(),
		select = document.createElement("select");
		select.id="desplegableRecursos";
		var valor = "";
		for (var i = 0; i < datos.length; i++) {
			valor = datos[i][columName].value;
			valorLimpio = valor.split("#");
			select.options.add(new Option(valorLimpio[1], valorLimpio[1]));
		}
		frag.appendChild(select);
		div.appendChild(frag);
		espacio = document.createTextNode("      ");
 		divRecursos.appendChild(espacio);
		createButton(divRecursos,null,"Seleccionar recurso","selectResources");
		document.getElementById("buttonselectResources").onclick = function() {getPropertiesOfResources()};
}

function getPropertiesOfResources() {
	console.log("Tomando propiedades...");
	document.getElementById("divPropiedades").innerHTML="";
	resource=document.getElementById("desplegableRecursos");

	if(resource.selectedIndex<0)
    		alert('Error');
	else {
   	 	var valorSeleccionado=resource.options[resource.selectedIndex].value;
   		var sparqlQuery =   "select distinct ?property where {"+
         "?instance a om:"+valorSeleccionado+" . "+
         "?instance ?property ?obj . }";

	$.ajax({
     	data:{"default-graph-uri":queryGraph, query:sparqlQuery, format:'json'},
        url: endpointGeneral,
        cache: false,
        statusCode: {400: function(error){alert("ERROR");}  },
		success : function(data) {
			console.log(data);
			var datos = data.results.bindings;
			generarForm(datos,"property","divPropiedades");
		}
	});
	}


}

function generarForm(datos,columName,div) {
	for ( var i in datos) {
		//Checkbox
		var valor = datos[i][columName].value;
		if (valor.search("#")!=-1) { 
		var valorLimpio = valor.split("#");
		var checkbox = document.createElement('input');
		checkbox.type = "checkbox";
		checkbox.name = valorLimpio[1];
		checkbox.value = valorLimpio[1];
		checkbox.id = valorLimpio[1];
		//Etiqueta
		var label = document.createElement('label');
		label.htmlFor = "id";
		label.appendChild(document.createTextNode(valorLimpio[1]));
		var pElement = document.createElement("p");
		pElement.appendChild(checkbox);
		pElement.appendChild(label);
		var container=document.getElementById(div);
		container.appendChild(pElement);
		}
	}	
}

function construirConsulta() {

}

function mostrarConsulta() {


}

function enviarConsulta() {
	
}

function createButton(context, func, valor, id){
    var button = document.createElement("input");
    button.type = "button";
    button.value = valor;
    button.onclick = func;
    button.id="button"+id; ;
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
		  	console.log(data);
		  	var datos = data.results.bindings;
		  	var columName="nomFarma";
			generarTabla(datos,columName);
		}
        });

    }
   
   function generarTabla(datos,columName) {
		//GENERACION DE TABLA A MENOS QUE YA HAYA SIDO CREADA. 
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
		    console.log(datos[i]);
		    console.log(columName);
		    var valor = datos[i][columName].value;
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
