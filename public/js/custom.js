
const addChartEvents = function() {

	$('#charts').on('click', function(){
		emptyMain();
	});

	$('#about').on('click', function(){
		renderAbout();
	});
}

const emptyMain = function(){
	$('#main').html('');
}

// Create a socket connection with the URL
const renderListofPC = function(){
	$.ajax({
		url: '/sidebar',
		method: 'get',
		success: function(data){
			$("#pcList").html(data);

			$("#pcList :checkbox").on("click", function(){
      			// Create a plot
		  		if(this.checked===true){
		  			renderChart(this.id);
				}
	 			// Erase the plot and close the socket connection
	 			else{
	 				$("#card\\:"+this.id.replace(/:/g, '\\:')).remove();
 				}
  			});
      }
    });
}

const renderChart = function (chartReg){
	$.ajax({
		url: '/charts',
		method: 'get',
		success: function(data){
			$("#main").prepend(data);
			$("#card-id").attr('id', 'card:'+chartReg);
			let chart = $("#chart-id"),
				granularity = 11;

			$('#pcName').append(chartReg.split(':')[0]);
			
			// Ajax call to get data to plot
		    $.ajax({
		    	url: '/plot',
		    	method: 'post',
		    	datatype: "json",
		    	data: {"id": chartReg, "granularity": granularity},
		    	success: function(res){
		    		let	chart_type = 'line',		    		
		    			config = setChartConfig(res, granularity, chart_type),
		    			ctx =  new Chart(chart, config);
  					console.log(config);
  					$('#min-id').text('Min: ' + math.min(res.data).toFixed(2));
					$('#av-id').text('Ave: ' + math.median(res.data).toFixed(2));
					$('#max-id').text('Max: ' + math.max(res.data).toFixed(2));
					
					// Add events to granularity menu
					$('.granularity').on('click', function(){
				  		$(this).siblings().removeClass('active');
				  		$(this).addClass('active');
				  		granularity = $(this).val();
				    });

					// Event for change chart type
			    	$('#chart-type').children().on('click', function(){
			    		$(this).siblings().removeClass('active');
				  		$(this).addClass('active');
				  		
				  		chart_type = $(this).val();
		 				
				  		let chartJsType = setChartJsType(chart_type);

		 				config.data.datasets[0].fill = chartJsType.fill;
		 				
		 				config.type = chartJsType.type;
		 				
		 				ctx.destroy();

		 				ctx = new Chart(chart, config);
					});

			    	// Event to download
			    	$('#down-type').children().on('click', function(){
			  			let temp = res;
			  			let type = $(this).val();
			  			if( type === 'json' || type === 'csv'){
			  				let dataName = chartReg.split(':');
			    			temp[dataName[0]+'-'+dataName[2]] = temp.data;
			    			delete temp.data;
			    			createFile(type, temp);
			  			}
			  			else{
			  				let img = chart[0].toDataURL('image/png');
			  				let file = document.createElement('a');
			  				file.href = img;
							file.setAttribute('download', 'download.png');
							file.style.display = 'none';

							file.click();
			  			}
		    		
				    });

				}
			});
			chartId = 'chart:'+chartReg;
			chart.attr('id', chartId);
		}
	});
}

// Define the size of xAxis
const xAxis = (granularity, time)=>{
	if(granularity === 0) return time;
	else return Array(granularity).fill().map((x,i)=>i);
}


const toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

// Set the chart configurations
const setChartConfig = function(data, granularity, chartType){
	let config = {};
	
	config['data'] = {};
	config.data['labels'] = xAxis(granularity, data[Object.keys(data)[0]]);
	
	config.data['datasets'] = {};
	config.data['datasets'] = [chartStyle(data[Object.keys(data)[1]])];
	
	let chartJsType = setChartJsType(chartType);

	config.data.datasets[0]['fill'] = chartJsType.fill;
	config['type'] = chartJsType.type;
	config['options'] = {};
	
	config.options['responsive'] = true;
	config.options['maintainAspectRatio'] = false;
	
	config.options['legend'] = {};
	config.options.legend['display'] = false;
	
	config.options['scales'] = {};
	config.options.scales['xAxes'] = [{scaleLabel: {
						    				display: true,
						    				labelString: 'Time (s)',
						    			}
						    		}];
	config.options.scales['yAxes'] = [{scaleLabel: {
						    				display: true,
						    				labelString: 'CPU Total usage (%)',
						    			},
					    				ticks:{
					    					beginAtZero: true,
					    					steps: 10,
					    					stepSize: 10,
					    					max: 100,
					    					min: 0
					    				}
						    		}];
	return config;
}

// Set the chart type
const setChartJsType = function(chart_type){
	switch(chart_type){
		case 'area':
			return {type: 'line', fill: 'origin'};
		case 'bar':		
			return {type: 'bar', fill: false};
		default:
			return {type: 'line', fill: false};
	}
}

// Set the chart Style
const chartStyle = (data)=>{
	let config = {};
		
	config['data'] = data;
	config['borderColor'] = '#3e95cd';
	config['backgroundColor'] = '#3e95cd';

	return config;
}

// Create a file and download
const createFile = function (type, data) {

	let file = document.createElement('a');
	if(type==='json'){
		file.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
		file.setAttribute('download', 'download.json');
	}
	// Data to csv
	else
	{	
		let str = '', 
			keys = Object.keys(data),
			i;
		
		str += 'timestamp,'+keys[1]+'\n';
		
		for(let i = 0; i < data.timestamp.length; i++){
			str += data.timestamp[i]+','+data[keys[1]][i]+'\n';
		}

		file.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(str));
		file.setAttribute('download', 'download.csv');
	}

		
	file.style.display = 'none';
	document.body.appendChild(file);
	file.click();

	document.body.removeChild(file);
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

var renderAbout = function(){
	$.ajax({
		url: '/about',
		method: 'get',
		success: function(data){
			$("#main").html('');
			$("#main").html(data);
		}
	});
}

// Old js

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

$(document).ready(function (){
	//socket = io('http://localhost:3000');
	
	//renderSidebar();
	Chart.plugins.register({
    	beforeDraw: function(c) {
        	var ctx = c.chart.ctx;
        	ctx.fillStyle = 'white';
        	ctx.fillRect(0, 0, c.chart.width, c.chart.height);
    	}
	});

	renderListofPC();


	// Control the granularity menu



	// // To choose the file type
	// $('.multchoice-btn').on('click', function () {
	// 	if ($(this).hasClass('active')){
	// 		$(this).removeClass('active');
	// 	}
	// 	else{
	// 		$(this).addClass('active');	
	// 	}
	// 	reRenderPlot();
	// });

	// $('#downbtn').on('click', function(){
	// 	//console.log($('#downloadsheet'));
	// 	$("#sidebar input:checkbox:checked").each(function(){
	// 		downList('#downlist', this.id);
	// 	});
	// });

	// $('#export').on('click', function(){
	// 	if($('#jsontype').hasClass('active')){
	// 		$('#downlist input:checkbox:checked').each(function(){
	// 			download( this.id, granularity, 'json');
	// 		});
	// 	}
	// 	if($('#csvtype').hasClass('active')){
	// 		$('#downlist input:checkbox:checked').each(function(){
	// 			download( this.id, granularity, 'csv');
	// 		});
	// 	}
	// });

	// $('#chartTypeDiv').children().on('click', function(){
	// 	if($('#area').hasClass('active') || $('#line').hasClass('active')){
	// 		$('#bar').removeClass('active');
	// 		reRenderPlot();
	// 	}
	// });



	// setInterval(reRenderPlot, 200);

});