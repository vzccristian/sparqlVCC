
function getRecursos(posicion){
	console.log("Tomando recursos...");
	document.getElementById("divPropiedades"+posicion).innerHTML="";
	document.getElementById("divTabla"+posicion).innerHTML="";
	document.getElementById("textAreaConsulta"+posicion).value="";
	document.getElementById("divRecursos"+posicion).innerHTML="";
	var listaEndPoint =  document.getElementById("lista"+posicion); //Seleccionar lista para consultas open data
    endpointGeneral = listaEndPoint.options[listaEndPoint.selectedIndex].value; //GLOBAL -> SELECCIONAR PUNTO DE CONSULTA SELECCIONADO EN DESPLEGABLE.
    queryGraph = ""; // GLOBAL -> NUNCA CAMBIA
    var sparqlQuery="select distinct ?Concept where {[] a ?Concept FILTER isURI(?Concept )} ";

   //CALLBACK PARA ESPERAR POR LA CONSULTA.
	var callbackQuery = function (data) {
		if ( data!== null) { //Consulta CORRECTA
			datosRecursos=data; //GLOBAL
			var columName="Concept";
			crearDesplegableRecursos(data,"divRecursos",columName,posicion);
		}
	};
	lanzarConsultaSPARQL(sparqlQuery,endpointGeneral,callbackQuery);
}


function lanzarConsultaSPARQL(sparqlQuery,puntoDeConsulta,callback) {
	var queryGraph = "";
	dataQuery = null;
	    $.ajax({
     	data:{ query:sparqlQuery,format:'application/sparql-results+json'},
        url: puntoDeConsulta,
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

// function lanzarConsultaSPARQL2(sparqlQuery,puntoDeConsulta,callback) {
// 	var queryGraph = "";
// 	dataQuery = null;
// 	console.log("lanzarConsultaSPARQL");
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

function crearDesplegableRecursos(datos,divInsertar,columName,posicion) {
		var div = document.getElementById(divInsertar+posicion),
		frag = document.createDocumentFragment(),
		select = document.createElement("select");
		console.log(divInsertar+posicion);
		select.id="desplegableRecursos"+posicion;
		var valor = "";
		for (var i = 0; i < datos.length; i++) {
			valor = datos[i][columName].value;
			//valorLimpio = valor.split("#");
			select.options.add(new Option(valor, valor));
		}
		frag.appendChild(select);
		div.appendChild(frag);
		espacio = document.createTextNode("      ");
 		div.appendChild(espacio);

		createButton(div,null,"Seleccionar recurso","selectResources",posicion);
		document.getElementById("buttonselectResources"+posicion).onclick = function() {
		getPropertiesOfResources(posicion); };

}

function getPropertiesOfResources(posicion) {
	console.log("getPropertiesOfResources() "+posicion);
	document.getElementById("divPropiedades"+posicion).innerHTML="";
	document.getElementById("divTabla"+posicion).innerHTML="";
	document.getElementById("textAreaConsulta"+posicion).value="";
	var	resource=document.getElementById("desplegableRecursos"+posicion);

	if(resource.selectedIndex<0)
    		alert('Error');
	else {
   	 	var valorSeleccionado=datosRecursos[resource.selectedIndex].Concept.value;
   	 	console.log(datosRecursos[resource.selectedIndex].Concept.value);
   		var sparqlQuery =   "select distinct ?property where {"+
         "?instance a <"+valorSeleccionado+"> . "+
         "?instance ?property ?obj . }";
        console.log("Consulta para atributos :" + sparqlQuery);

    var callbackQueryProperties = function (data) {
		if (data!==null) { //Consulta CORRECTA
			generarForm(data,"property","divPropiedades",posicion);
		}
	};
    lanzarConsultaSPARQL(sparqlQuery,endpointGeneral,callbackQueryProperties);    
	}
}

function generarForm(datos,columName,div,posicion) {
	console.log("generarForm en Posición: "+ posicion);
	datosOntologia=[];
	var valorLimpio=null;
	for ( var i in datos) {
		var valor = datos[i][columName].value; //Contiene todo el string.
		if ( valor.search("#")!=-1) { 
			valorLimpio = valor.split("#");
			generarForm2(valor,"#",valorLimpio.length-1,div,posicion);
		} else {
			valorLimpio = valor.split("/");
			generarForm2(valor,"/",valorLimpio.length-1,div,posicion);
		}
		//Creo array con ontologia y atributo.
		datosOntologia.push({ ontologia: valor, atributo: valorLimpio[valorLimpio.length-1] });
	}	
	// function(){ return changeViewMode(myvar); }
	createButton(container,function(){ return construirConsulta(posicion); },"Consultar en punto de consulta","buttonConstruirConsulta",posicion);
}

function generarForm2(valor,separador,posicion,div,posicionBody) {
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
	container=document.getElementById(div+posicionBody);
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


var tester;
function construirConsulta(posicion) {
	console.log("Construyendo consulta");
	var	container=document.getElementById("divPropiedades"+posicion);
	var	resource=document.getElementById("desplegableRecursos"+posicion);
	var	textArea=document.getElementById("textAreaConsulta"+posicion);

	var checkedBoxes = getCheckedBoxes("checkboxForm"+posicion);
	var checkedValue = null; 
	if (checkedBoxes!==null) {
	tester=checkedBoxes;
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

	var valorSeleccionado=datosRecursos[resource.selectedIndex]["Concept"].value;
	consulta+="?x a <"+valorSeleccionado+"> . \n";
	//ATRIBUTOS
	for(var j=0; checkedBoxes[j]; ++j){
		consulta+="?x ";
     // datosOntologia
     encontrado=false;
     var ontURL=null;
      for (i = 0; i < datosOntologia.length && !encontrado; i++) {
      	if (datosOntologia[i].atributo==checkedBoxes[j].value) {
      		ontURL=datosOntologia[i].ontologia;
      		encontrado=true;
     		}
     	 }
     	if (encontrado)
     		consulta+="<"+ontURL+"> ?var"+checkedBoxes[j].value+" . \n";
	}
	consulta+=" }";

	textArea.value=consulta;
	consulta+=" LIMIT 500";
	enviarConsulta(consulta,checkedBoxes,posicion);
	} else {
		console.log("**ERROR** No hay atributos seleccionados.");
	}
}

function enviarConsulta(consulta,encabezados,posicionBody) {
	console.log("Enviando consulta...");
	var callbackSendQuery = function (data) {
		if (data!==null) { //Consulta CORRECTA
			generarTabla(data,encabezados,posicionBody);
		}
	};
    lanzarConsultaSPARQL(consulta,endpointGeneral,callbackSendQuery);  
}

function createButton(context, func, valor, id,posicion){
    var button = document.createElement("input");
    button.type = "button";
    button.value = valor+" "+posicion;
    button.onclick = func;
    button.id="button"+id+posicion;
    context.appendChild(button);
}


function generarTabla(datos,encabezados,posicionBody) {
	console.log("Generando tabla...");
	datosTabla=datos; //GLOBALES TABLA Y ENCABEZADOS.
	encabezadosTabla=encabezados;

	var divActual="divTabla"+posicionBody; 
	var tablaActual="tablaSPARQL"+posicionBody;

	var borrar= document.getElementById(tablaActual);
	if (borrar!==null)
		document.getElementById(tablaActual).innerHTML="";
	

	var body = document.getElementById(divActual);
	console.log(divActual);
	var tabla   = document.createElement("table");
	tabla.id=(tablaActual);
	tabla.className="tablaSPARQL";
	var tblBody = document.createElement("tbody");
	 
	//CREACION DE CABECERAS DE LA TABLA
	var hilera = document.createElement("tr");
	 for  (var j in encabezados) {
			var celda = document.createElement("th");
			var atrib = encabezados[j].value;
			var textoCelda = document.createTextNode(atrib);
			celda.appendChild(textoCelda);
			hilera.appendChild(celda);
			tblBody.appendChild(hilera);  
	}

	//CREACION DE TABLA
	for ( var i in datos) {
		hilera = document.createElement("tr");
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
