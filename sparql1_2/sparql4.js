
function getResources(position){
	console.log("Tomando recursos...");
	document.getElementById("propertiesDiv"+position).innerHTML="";
	document.getElementById("tableDiv"+position).innerHTML="";
	document.getElementById("textAreaQuery"+position).value="";
	document.getElementById("resourcesDiv"+position).innerHTML="";
	var listaEndPoint =  document.getElementById("lista"+position); //Seleccionar lista para consultas open data
    var endpointGeneral = listaEndPoint.options[listaEndPoint.selectedIndex].value; 
    queryGraph = ""; // GLOBAL -> NUNCA CAMBIA
    var sparqlQuery="select distinct ?Concept where {[] a ?Concept FILTER isURI(?Concept )} ";

   //CALLBACK PARA ESPERAR POR LA CONSULTA.
	var callbackQuery = function (resourceData) {
		if ( resourceData!== null)  //Consulta CORRECTA
			createResourceList(resourceData,"resourcesDiv","Concept",endpointGeneral,position);
	};
	launchSPARQLQuery(sparqlQuery,endpointGeneral,callbackQuery);
}


function launchSPARQLQuery(sparqlQuery,endpointGeneral,callback) {
	var queryGraph = "";
	dataQuery = null;
	    $.ajax({
     	data:{ query:sparqlQuery,format:'application/sparql-results+json'},
        url: endpointGeneral,
        cache: false,
      	// crossDomain: true,
      	dataType: 'json',
       /**/	type: 'GET',
        statusCode: {400: function(error){ alert("Error al lanzar la consulta. \n"+sparqlQuery+" \n");}  },
        success : 
        function(data) {
			dataQuery=data.results.bindings;
			callback(dataQuery);
		}

	});

}

// function launchSPARQLQuery2(sparqlQuery,puntoDeConsulta,callback) {
// 	var queryGraph = "";
// 	dataQuery = null;
// 	console.log("launchSPARQLQuery");
// 	var test="hola";
// 	console.log(sparqlQuery);
// 	    $.ajax({
//      	data:{ query:sparqlQuery,format:'application/sparql-results+json'},
//         url: puntoDeConsulta,
//         cache: false,
//       	crossDomain: true,
//       	dataType: 'jsonp',
//       	isLocal: false,
//        	type: 'GET',
//        	async:false,
//         statusCode: {400: function(error){ alert("Error al lanzar la consulta. "+sparqlQuery+" \n");}  },
//         success : 
//         function(data) {
// 			dataQuery=data.results.bindings;
// 			callback(dataQuery);
			
// 		}

// 	});

// }

function createResourceList(resourceData,divToInsert,columName,endpointGeneral,position) {
		var div = document.getElementById(divToInsert+position),
		frag = document.createDocumentFragment(),
		select = document.createElement("select");
		console.log(divToInsert+position);
		select.id="resourceList"+position;
		var valor = "";
		for (var i = 0; i < resourceData.length; i++) {
			valor = resourceData[i][columName].value;
			//valorLimpio = valor.split("#");
			select.options.add(new Option(valor, valor));
		}
		frag.appendChild(select);
		div.appendChild(frag);
		espacio = document.createTextNode("      ");
 		div.appendChild(espacio);

		createButton(div,null,"Seleccionar recurso","selectResources",position);
		document.getElementById("buttonselectResources"+position).onclick = function() {
		getPropertiesOfResources(resourceData, position,endpointGeneral); };

}
var test;
function getPropertiesOfResources(resourceData, position, endpointGeneral) {
	console.log("getPropertiesOfResources() "+position);
	document.getElementById("propertiesDiv"+position).innerHTML="";
	document.getElementById("tableDiv"+position).innerHTML="";
	document.getElementById("textAreaQuery"+position).value="";
	var	resource=document.getElementById("resourceList"+position);
	test=resource;
	if(resource.selectedIndex<0)
    		alert('Error');
	else {
   	 	var selectedValue=resourceData[resource.selectedIndex].Concept.value;
   	 	console.log(resourceData[resource.selectedIndex].Concept.value);
   		var sparqlQuery =   "select distinct ?property where {"+
         "?instance a <"+selectedValue+"> . "+
         "?instance ?property ?obj . }";
        console.log("Consulta para atributos :" + sparqlQuery);

    var callbackQueryProperties = function (propData) {
		if (propData!==null) { //Consulta CORRECTA
			var div=document.getElementById("propertiesDiv"+position);
			generateCheckBox(propData,resourceData,"property",div,position,endpointGeneral);
		}
	};
    launchSPARQLQuery(sparqlQuery,endpointGeneral,callbackQueryProperties);    
	}
}

function generateCheckBox(propData,resourceData,columName,div,posicion,endpointGeneral) {
	console.log("generateCheckBox en Posición: "+ posicion);
	var propOntologyData=[];
	var valorLimpio=null;
	for ( var i in propData) {
		var valor = propData[i][columName].value; //Contiene todo el string.
		if ( valor.search("#")!=-1) { 
			valorLimpio = valor.split("#");
			generateCheckBox2(valor,"#",valorLimpio.length-1,div,posicion);
		} else {
			valorLimpio = valor.split("/");
			generateCheckBox2(valor,"/",valorLimpio.length-1,div,posicion);
		}
		//Creo array con ontologia y atributo.
		propOntologyData.push({ ontologia: valor, atributo: valorLimpio[valorLimpio.length-1] });
	}	
	// function(){ return changeViewMode(myvar); }
	createButton(div,function(){ return buildQuery(resourceData,posicion,propOntologyData,endpointGeneral); },"Consultar en punto de consulta","buttonbuildQuery",posicion);
}

function generateCheckBox2(valor,separador,posicion,div,posicionBody) {
	var valorLimpio = valor.split(separador);
	var checkbox = document.createElement('input');
	checkbox.type = "checkbox";
	checkbox.name = "checkboxForm"+posicionBody;
	checkbox.value = valorLimpio[posicion];
	checkbox.id = valorLimpio[posicion];
	//Etiqueta
	var label = document.createElement('label');
	label.htmlFor = "id";
	var pElement = document.createElement("p");
	label.appendChild(document.createTextNode(valorLimpio[posicion]));
	pElement.appendChild(checkbox);
	pElement.appendChild(label);
	div.appendChild(pElement);
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

function buildQuery(resourceData,position,propOntologyData,endpointGeneral) {
	console.log("Construyendo consulta");
	var	container=document.getElementById("propertiesDiv"+position);
	var	resource=document.getElementById("resourceList"+position);
	var	textArea=document.getElementById("textAreaQuery"+position);
	var checkedBoxes = getCheckedBoxes("checkboxForm"+position);
	var checkedValue = null; 
	if (checkedBoxes!==null) {
	var query="PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n "+
				"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n "+
				"PREFIX owl: <http://www.w3.org/2002/07/owl#> \n "+
				"PREFIX dc: <http://purl.org/dc/elements/1.1/> \n " +
				// "PREFIX om: <http://opendata.caceres.edds/def/ontomunicipio> \n "+
				"Select "
				;

	for(var i=0; checkedBoxes[i]; ++i){
		query+="?var"+checkedBoxes[i].value+" ";
      }
		query+="where { \n";

	var valorSeleccionado=resourceData[resource.selectedIndex]["Concept"].value;
	query+="?x a <"+valorSeleccionado+"> . \n";

	//ATRIBUTOS
	for(var j=0; checkedBoxes[j]; ++j){
		query+="?x ";
     // propOntologyData
     encontrado=false;
     var ontURL=null;
      for (i = 0; i < propOntologyData.length && !encontrado; i++) {
      	if (propOntologyData[i].atributo==checkedBoxes[j].value) {
      		ontURL=propOntologyData[i].ontologia;
      		encontrado=true;
     		}
     	 }
     	if (encontrado)
     		query+="<"+ontURL+"> ?var"+checkedBoxes[j].value+" . \n";
	}
	query+=" }";
	query+=" LIMIT 500";
	textArea.value=query;
	sendQuery(query,checkedBoxes,position,endpointGeneral);
	} else {
		console.log("**ERROR** No hay atributos seleccionados.");
	}
}

function sendQuery(query,encabezados,posicionBody,endpointGeneral) {
	console.log("Enviando consulta...");
	var callbackSendQuery = function (data) {
		if (data!==null) { //Consulta CORRECTA
			generateTable(data,encabezados,posicionBody);
		}
	};
    launchSPARQLQuery(query,endpointGeneral,callbackSendQuery);  
}

function createButton(context, func, valor, id,posicion){
	console.log(context);
    var button = document.createElement("input");
    button.type = "button";
    button.value = valor+" "+posicion;
    button.onclick = func;
    button.id="button"+id+posicion;
    button.className="typeButton";
    context.appendChild(button);
}


function generateTable(propData,encabezados,posicionBody) {
	console.log("Generando tabla...");
	var currentDiv="tableDiv"+posicionBody; 
	var currentTable="tablaSPARQL"+posicionBody;
	document.getElementById("tableDiv"+posicionBody).innerHTML="";
	var del= document.getElementById(currentTable);
	if (del!==null)
		document.getElementById(currentTable).innerHTML="";
	
	var body = document.getElementById(currentDiv);
	console.log(currentDiv+" "+currentTable);
	var table   = document.createElement("table");
	table.id=(currentTable);
	table.className="SPARQLtable";
	// var tblBody = document.createElement("tbody");
	var tblHead = document.createElement("thead");
	//CREACION DE CABECERAS DE LA TABLA
	var row = document.createElement("tr");
	 for  (var j in encabezados) {
			var cell = document.createElement("th");
			var atrib = encabezados[j].value;
			var cellText = document.createTextNode(atrib);
			cell.appendChild(cellText);
			row.appendChild(cell);
			tblBody.appendChild(row);  
	}

	//CREACION DE TABLA
	for ( var i in propData) {
		row = document.createElement("tr");
		for  (var j in encabezados) {
		    var cell = document.createElement("td");
		    var atrib="var"+encabezados[j].value;
		    var valor = propData[i][atrib].value;
		    console.log(valor);
		    var cellText = document.createTextNode(valor);
		    cell.appendChild(cellText);
		    row.appendChild(cell);
		    tblBody.appendChild(row);  

		}
	}
   // posiciona el <tbody> debajo del elemento <table>
   table.appendChild(tblBody);
   // appends <table> into <body>
   body.appendChild(table);
   // modifica el atributo "border" de la tabla y lo fija a "2";
   table.setAttribute("border", "2");
	
 }
