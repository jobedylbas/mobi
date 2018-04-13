// Custom library to monitor

var granularity = 11;

// Create a socket connection with the URL


var renderSidebar = function(){
    $.ajax({
      url: '/sidebar',
      method: "get",
      success: function(data){
        $("#sidebar").html(data);

        var socket;

        $("#sidebar :checkbox").on("click", function(){
      	// Create a plot
	  		if(this.checked==true){
	  			// Create a div to the plot
	  			var divId = "plot:"+this.id;
	  			//console.log(this.id);
	  			$('<div>',{ id: divId, class: 'plot'}).appendTo('#plots');
	  			
	  			// Create a websocket connection
				socket = io('http://localhost:5000');
				
				var chartTypeList = [];
        		$('#chartTypeDiv .active').each(function(){
        			chartTypeList.push(this.value);
        		});
        		//console.log(chartTypeList);

				// Render the plot
				//console.log(this.id);
				renderPlot(this.id, granularity, chartTypeList, divId);	

			}
 			// Erase the plot and close the socket connection
 			else{
 				var thisId;
 				Plotly.purge("plot:"+this.id);
 				thisId = this.id.replace(/:/g, '\\:');
 				$("#plot\\:"+thisId).remove();
 				socket.emit('disconnect');
 				socket.disconnect(true);
 			}
  		});
      }
    });
}

// Render all the plots again
var reRenderPlot = function() {
	// Get again the data that user wants
	$("#sidebar input:checkbox:checked").each(function(){
		var chartTypeList = [];
        $('#chartTypeDiv .active').each(function(){
        	chartTypeList.push(this.value);
        		//console.log(chartTypeList);
        });
		renderPlot(this.id, granularity, chartTypeList, "plot:"+this.id);
	});	
}

var matchChartType = function(array, obj){
	array.forEach(function(item){
		if(item == obj){
			return true;
		}
	});
	return false;
}

// Render a plot
var Plot = function(json, plotType, divId) {

	// Change the scale by the datatype
	//console.log(divId)
	var rangeY=[];
	var titleY= "";
	var jsonData = Object.keys(json)[1]; 
	if(divId.search("cpu") != -1){
		rangeY=[0,100];
		titleY="CPU(%)"
	}
	else{
		if(divId.search("mem") != -1){
			rangeY=[0,8.128];
			titleY="Memory(Gb)";
			for(var i = 0; i < json[jsonData].length; i++)
				json[jsonData][i] = ((json[jsonData][i]/1024)/1024)/1024; 
		}
		if(divId.search("net") != -1){
			rangeY = [0,2048];
			titleY="Network received(Kbits)";
			for(var i = 0; i<json[jsonData].length; i++)
				json[jsonData][i] = (json[jsonData][i])/1024;
		}
	}

	// Adapt the timestamp
	//console.log(json.timestamp);
	lastTimestamp = json.timestamp[0]
	for(var i = 0; i < json.timestamp.length; i++){
		json.timestamp[i] = (json.timestamp[i] - lastTimestamp)* (-1);
	}
	
	// Set the range of the x Axis
	if( granularity == 0)
		rangeX = [json.timestamp[json.timestamp.length-1],0];
	else
		rangeX = [granularity-1,0];

	// set the layout of chart
	var layout = {
		title: divId.split(':')[1],
		xaxis:{
			showline: true,
			range: rangeX,
			title: 'time(s)'
		},
		yaxis:{
			showline: false,
			range: rangeY,
			title: titleY
		},
		height: 190,
		margin: {
			l: 50,
			r: 50,
			b: 50,
			t: 30,
			pad: 4
		},
	};
	
	var trace1 = {
		x: json.timestamp,
		y: json[jsonData]
	}
	// Creating the type of plot
	if(plotType.length == 1){
		if(matchChartType(plotType, 'area')){
			trace1.type = 'scatter';
			trace1.fill = 'tozeroy';
			trace1.mode = 'none';
		}
		else{
			trace1.type = plotType[0];	
			
		}
		data = [trace1]
	}
	else{
		if(matchChartType(plotType, 'bar')){
			trace1.type = plotType[0];
			var trace2 = {
				x: json.timestamp,
				y: json[jsonData],
				type: plotType[1]
			}
			var data = [trace1, trace2];
		}
		else{
			trace1.type = 'scatter';
			trace1.fill = 'tozeroy';
			var data = [trace1]
		}
	}
	Plotly.newPlot(divId, data, layout);
	// Create the informations of the plot
	plotIdJs = '#'+divId;
	plotIdJs = plotIdJs.replace(/:/g, '\\:');	
	auxId = '#'+divId+'info';
	auxId = auxId.replace(/:/g, '\\:');

	if($(auxId).length){
		$(auxId).remove();
	}

	$('<div class="row"></div>').appendTo(plotIdJs).attr('id', divId+'info');
	// Min
	$('<p class="col text-left"></div>').appendTo(auxId)
										.attr('id', auxId+'min')
										.text('Min: '+math.min(json[jsonData]).toFixed(2));
	// Med
	$('<p class="col flex text-center"></p>').appendTo(auxId)
										.attr('id', auxId+'med')
										.text('Med: '+math.median(json[jsonData]).toFixed(2));
	// Max
	$('<p class="col text-right"></p>').appendTo(auxId)
										.attr('id', auxId+'max')
										.text('Max: '+math.max(json[jsonData]).toFixed(2));


}

var renderPlot = function(id, time, type, divId){
	$.ajax({
		url:'/plot',
		method: "post",
		dataType: "json",
		data: {"id": id, "granularity": time},
		success: function(res){
			if(res.timestamp.length != 0){
        		Plot(res, type, divId);
        	}
		}					
	});
}

var downList = function(father, plotId){
	var listItem = $('<li class="list-group-item"></li>').appendTo(father).attr('id', plotId);
	var label = $('<label class="custom-control custom-checkbox"></label>').appendTo(listItem)
	$('<input type="checkbox" class="custom-control-input">').appendTo(label).attr('id', plotId);
	$('<span class="custom-control-indicator"></span>').appendTo(label);
	$('<span class="custom-control-description"></span>').text(plotId).appendTo(label);

}	

var download = function(id, time, type){
	$.ajax({
		url:'/plot',
		method: 'post',
		dataType: 'json',
		data: {'id': id, "granularity": time},
		success: function(res){
			createFile(id, type, res);
		}
	});
}

var createFile = function (fileName, type, data) {

	var file = document.createElement('a');
	if(type=='json'){
		file.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
		file.setAttribute('download', fileName+'.json');
	}
	// File is csv
	else{
		var str='';
		var i= 0;
		for(key in data)
			str += key+',';
		str +='\n';
		for(var i = 0; i < data.timestamp.length; i++ ){
			for(key in data){
				str += data[key][i]+',';
			}
			str += '\n';
		}
		file.setAttribute('href', 'data:text/csv;charset=utf-8,');
		file.setAttribute('download', fileName+'.csv');
	}

		
	file.style.display = 'none';
	document.body.appendChild(file);
	file.click();

	document.body.removeChild(file);
}


$(document).ready(function (){
	//socket = io('http://localhost:3000');
	
	renderSidebar();
	
	// Control the granularity menu
	$('.time').on('click', function(){
  		$(this).siblings().removeClass('active');
  		$(this).addClass('active');
  		granularity = $(this).val();

  		reRenderPlot();
    });


	// To choose the file type
	$('.multchoice-btn').on('click', function () {
		if ($(this).hasClass('active')){
			$(this).removeClass('active');
		}
		else{
			$(this).addClass('active');	
		}
		reRenderPlot();
	});

	$('#downbtn').on('click', function(){
		//console.log($('#downloadsheet'));
		$("#sidebar input:checkbox:checked").each(function(){
			downList('#downlist', this.id);
		});
	});

	$('#export').on('click', function(){
		if($('#jsontype').hasClass('active')){
			$('#downlist input:checkbox:checked').each(function(){
				download( this.id, granularity, 'json');
			});
		}
		if($('#csvtype').hasClass('active')){
			$('#downlist input:checkbox:checked').each(function(){
				download( this.id, granularity, 'csv');
			});
		}
	});

	$('#chartTypeDiv').children().on('click', function(){
		if($('#area').hasClass('active') || $('#line').hasClass('active')){
			$('#bar').removeClass('active');
			reRenderPlot();
		}
	});



	setInterval(reRenderPlot, 1000);

});