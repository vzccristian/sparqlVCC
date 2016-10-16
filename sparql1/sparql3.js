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
		datosRecursos = data.results.bindings; //TODOS LOS RECURSOS 
		var columName="Concept";
		crearDesplegableRecursos(datosRecursos,"#divRecursos",columName)
		}
	});

}

function crearDesplegableRecursos(datos,divInsertar,columName) {
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
	console.log("getPropertiesOfResources()");
	document.getElementById("divPropiedades").innerHTML="";
	document.getElementById("divTabla").innerHTML="";
	document.getElementById("textAreaConsultaLimpia").value="";
	var resource=document.getElementById("desplegableRecursos");

	if(resource.selectedIndex<0)
    		alert('Error');
	else {
   	 	var valorSeleccionado=datosRecursos[resource.selectedIndex].Concept.value;
   	 //	var valorSeleccionado=resource.options[resource.selectedIndex].value;
   	 	console.log(datosRecursos[resource.selectedIndex].Concept.value);
   		var sparqlQuery =   "select distinct ?property where {"+
         "?instance a <"+valorSeleccionado+"> . "+
         "?instance ?property ?obj . }";
        console.log("Consulta para atributos :" + sparqlQuery);
	$.ajax({
     	data:{"default-graph-uri":queryGraph, query:sparqlQuery, format:'json'},
        url: endpointGeneral,
        cache: false,
        statusCode: {400: function(error){alert("ERROR");}  },
		success : function(data) {
			console.log(data);
			datosAtributos = data.results.bindings;
			generarForm(datosAtributos,"property","divPropiedades");
		}
	});
	}


}

function generarForm(datos,columName,div) {
	console.log("generarForm()");
	datosOntologia=[];
	var valorLimpio=null;
	for ( var i in datos) {
		var valor = datos[i][columName].value; //Contiene todo el string.
		if ( valor.search("#")!=-1) { 
			valorLimpio = valor.split("#");
			generarForm2(valor,"#",valorLimpio.length-1,div);
		} else {
			valorLimpio = valor.split("/");
			generarForm2(valor,"/",valorLimpio.length-1,div);
		}
		//Creo array con ontologia y atributo.
		datosOntologia.push({ ontologia: valor, atributo: valorLimpio[valorLimpio.length-1] });
	}	
	createButton(container,construirConsulta,"Consultar en punto de consulta","buttonConstruirConsulta");
}

function generarForm2(valor,separador,posicion,div) {
	var valorLimpio = valor.split(separador);
	var checkbox = document.createElement('input');
	checkbox.type = "checkbox";
	checkbox.name = "checkboxForm";
	checkbox.value = valorLimpio[posicion];
	checkbox.id = valorLimpio[posicion];
	//Etiqueta
	var label = document.createElement('label');
	label.htmlFor = "id";
	var pElement = document.createElement("p");
	label.appendChild(document.createTextNode(valorLimpio[posicion]));
	var pElement = document.createElement("p");
	pElement.appendChild(checkbox);
	pElement.appendChild(label);
	container=document.getElementById(div);
	container.appendChild(pElement);
}


// Pass the checkbox name to the function
function getCheckedBoxes(chkboxName) {
  var checkboxes = document.getElementsByName(chkboxName);
  var checkboxesChecked = [];
  // loop over them all
  for (var i=0; i<checkboxes.length; i++) {
     // And stick the checked ones onto an array...
     if (checkboxes[i].checked) {
        checkboxesChecked.push(checkboxes[i]);
     }
  }
  // Return the array if it is non-empty, or null
  return checkboxesChecked.length > 0 ? checkboxesChecked : null;
}



function construirConsulta() {
	console.log("Construyendo consulta");
	container=document.getElementById("divPropiedades");
	checkedBoxes = getCheckedBoxes("checkboxForm");
	var checkedValue = null; 
	consulta="PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n "+
				"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n "+
				"PREFIX owl: <http://www.w3.org/2002/07/owl#> \n "+
				"PREFIX dc: <http://purl.org/dc/elements/1.1/> \n " +
				"PREFIX om: <http://opendata.caceres.edds/def/ontomunicipio> \n "+
				"Select "
				;

	for(var i=0; checkedBoxes[i]; ++i){
		consulta+="?var"+checkedBoxes[i].value+" ";
      }
		consulta+="where { \n";
	//	consulta+"?x a schema:Pharmacy."

	var resource=document.getElementById("desplegableRecursos");
	var valorSeleccionado=datosRecursos[resource.selectedIndex]["Concept"].value;

	consulta+="?x a <"+valorSeleccionado+"> . \n";


	//ATRIBUTOS
	for(var j=0; checkedBoxes[j]; ++j){
		consulta+="?x ";
     // datosOntologia
     encontrado=false;
     var ontURL=null;
      for (var i = 0; i < datosOntologia.length && !encontrado; i++) {
      	if (datosOntologia[i].atributo==checkedBoxes[j].value) {
      		ontURL=datosOntologia[i].ontologia;
      		encontrado=true;
     		}
     	 }
     	if (encontrado)
     		consulta+="<"+ontURL+"> ?var"+checkedBoxes[j].value+" . \n";
	}
	consulta+=" }";

	var textArea=document.getElementById("textAreaConsultaLimpia");
	textArea.value=consulta;
	enviarConsulta(consulta,checkedBoxes);
}


function enviarConsulta(consulta,encabezados) {
	console.log("Enviando consulta...");
	    $.ajax({
     	data:{"default-graph-uri":queryGraph, query:consulta, format:'json'},
        url: endpointGeneral,
        cache: false,
        statusCode: {400: function(error){alert("ERROR");}  },

        success : function(data) {
			var respuestaConsulta = data.results.bindings; 
			generarTabla(respuestaConsulta,encabezados);
		}
	});
}




function createButton(context, func, valor, id){
    var button = document.createElement("input");
    button.type = "button";
    button.value = valor;
    button.onclick = func;
    button.id="button"+id; 
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

   function generarTabla(datos,encabezados) {
		console.log("Generando tabla...")
		datosTabla=datos;
		encabezadosTabla=encabezados;

		var borrar= document.getElementById("tablaSPARQL");
		if (borrar!=null)
			document.getElementById("divTabla").innerHTML="";

		var body = document.getElementById("divTabla");
		var tabla   = document.createElement("table");
		tabla.id=("tablaSPARQL");
		var tblBody = document.createElement("tbody");
		 

		var hilera = document.createElement("tr");
		 for  (var j in encabezados) {
				var celda = document.createElement("th");
				var atrib = encabezados[j].value;
				var textoCelda = document.createTextNode(atrib);
				celda.appendChild(textoCelda);
				hilera.appendChild(celda);
				tblBody.appendChild(hilera);  
		}


		for ( var i in datos) {
			var hilera = document.createElement("tr");
			for  (var j in encabezados) {
			    var celda = document.createElement("td");
			    var atrib="var"+encabezados[j].value;
			    var valor = datos[i][atrib].value;
			    console.log(valor);
			    var textoCelda = document.createTextNode(valor);
			    celda.appendChild(textoCelda);
			    hilera.appendChild(celda);
			    tblBody.appendChild(hilera);  

			}
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
