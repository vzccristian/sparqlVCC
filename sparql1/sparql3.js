function getRecursos(){
	console.log("Tomando recursos...");
	// Obtengo el punto sparql al que se quiere acceder.
    var listaEndPoint =  document.getElementById("lista");
    var endpoint = listaEndPoint.options[listaEndPoint.selectedIndex].value;
    var queryGraph = "";
    if (endpoint=="http://opendata.caceres.es/sparql/") {
    	    var sparqlQuery =   "select distinct ?Concept where {[] a ?Concept"+
     " FILTER regex(?Concept , \"ontomunicipio\")} LIMIT 100 ";
    }
    else {
     	    var sparqlQuery =   "select distinct ?Concept where {[] a ?Concept"+
     " FILTER regex(?Concept , \"ontouniversidad\")} LIMIT 100 ";   	
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
		select.options.add(new Option(valor, "AU", true, true));
		for (var i = 1; i < datos.length; i++) {
			valor = datos[i].Concept.value;
			select.options.add(new Option(valor, "AU"));
		}
		frag.appendChild(select);
		div.appendChild(frag);
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
            
            

		  success : function(data) {
			var datos = data.results.bindings;
//			console.log(datos);
			var divDatos = document.getElementById("divSparql");
			
			//GENERACION DE TABLA
			// Obtener la referencia del elemento body
			var body = document.getElementsByTagName("body")[0];
			
			// Crea un elemento <table> y un elemento <tbody>
			var tabla   = document.createElement("table");
			var tblBody = document.createElement("tbody");
			
			
			for ( var i in datos) {
				// Crea las hileras de la tabla
			    var hilera = document.createElement("tr");
			    var celda = document.createElement("td");
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
        });

    }
   
   function genera_tabla() {
	   // Obtener la referencia del elemento body
	   var body = document.getElementsByTagName("body")[0];
	  
	   // Crea un elemento <table> y un elemento <tbody>
	   var tabla   = document.createElement("table");
	   var tblBody = document.createElement("tbody");
	  
	   // Crea las celdas
	   for (var i = 0; i < 2; i++) {
	     // Crea las hileras de la tabla
	     var hilera = document.createElement("tr");
	     
	  
	     for (var j = 0; j < 2; j++) {
	       // Crea un elemento <td> y un nodo de texto, haz que el nodo de
	       // texto sea el contenido de <td>, ubica el elemento <td> al final
	       // de la hilera de la tabla
	       var celda = document.createElement("td");
	       var textoCelda = document.createTextNode("celda en la hilera "+i+", columna "+j);
	       celda.appendChild(textoCelda);
	       hilera.appendChild(celda);
	     }
	  
	     // agrega la hilera al final de la tabla (al final del elemento tblbody)
	     tblBody.appendChild(hilera);
	   }
	  
	   // posiciona el <tbody> debajo del elemento <table>
	   tabla.appendChild(tblBody);
	   // appends <table> into <body>
	   body.appendChild(tabla);
	   // modifica el atributo "border" de la tabla y lo fija a "2";
	   tabla.setAttribute("border", "2");
	 }
//window.alert("Hola");
//window.onload = getData();
