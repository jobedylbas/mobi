function monitorDAO(connection){
  this._connection = connection();
}

// Pega os computadores disponíveis
monitorDAO.prototype.getPC = function (res) { 
  // Abre a conexão com o DB
  this._connection.open( function(err, mongoclient){
    // Para manipular os documentos na coleção
    mongoclient.collection("pcs", function (err, collection){
      collection.find().toArray(function(err, result){
        
        var pcs = [];        
        pcs = result.map(function(pc){
          return { "hostname": pc.hostname, "datatype": pc.datatype};
        })
        
        mongoclient.close();
        //res.render("sidebar", {"pcs": pcs});
        res.render("pcslist", {"pcs": pcs});
      
      });
    });
  });
}

monitorDAO.prototype.getData = function (req, res){
  // Abre a conexão com o DB
  this._connection.open( function(err, mongoclient){
    
    // Get the collection name
    var colName = req.id.split(":")[0];
    //console.log(colName)
    // Get the data type
    var dataType = req.id.split(":")[1];
    //console.log(datatype);
    // Get the data key
    var dataKey = req.id.split(":")[2];

    // Get the granularity of the data
    var granularity = parseInt(req.granularity);
    //console.log(granularity);
    
    mongoclient.collection( colName, function (err, collection){ // recuperar a partir do id
      // granularity == 0 => All data
      if(granularity==0){
        collection.count(function (err, result) {
          granularity = result;   
        });
      };
      
      collection.find().sort({$natural: -1}).limit(granularity).toArray(function(err, result){
        //console.log(result)
        var timestamp = [];
        var data = [];
        
        // Get the data from the newest to oldest
        for (var i = 0; i < result.length; i++){
          // Last timestamp
          data.push(result[i][dataType][dataKey]);
          timestamp.push(result[i].timestamp);
        }
        
        //console.log(JSON.stringify(jsonObj));
        mongoclient.close();

        //application.get('io').emit('dataChanged', JSON.stringify(jsonObj));
        res.send(JSON.stringify({ "timestamp": timestamp, dataKey: data}));
      });
    });
  });
}

monitorDAO.prototype.getNData = function (req, res){
  // Abre a conexão com o DB
  this._connection.open( function(err, mongoclient){
    
    // Get the collection name
    var colName = req.id.split(":")[0];
    //console.log(colName)
    // Get the data type
    var dataType = req.id.split(":")[1];
    //console.log(datatype);
    // Get the data key
    var dataKey = req.id.split(":")[2];

    // Get the granularity of the data
    var granularity = parseInt(req.granularity);
    //console.log(granularity);
    
    mongoclient.collection( colName, function (err, collection){ // recuperar a partir do id
      // granularity == 0 => All data
      if(granularity==0){
        collection.count(function (err, result) {
          granularity = result;   
        });
      };
      
      collection.find().sort({$natural: -1}).limit(granularity).toArray(function(err, result){
        //console.log(result)
        var timestamp = [];
        var data = [];
        
        // Get the data from the newest to oldest
        for (var i = 0; i < result.length; i++){
          // Last timestamp
          data.push(result[i][dataType][dataKey]);
          timestamp.push(result[i].timestamp);
        }
        
        //console.log(JSON.stringify(jsonObj));
        mongoclient.close();

        //application.get('io').emit('dataChanged', JSON.stringify(jsonObj));
        res.send(JSON.stringify({ "timestamp": timestamp, dataKey: data}));
      });
    });
  });
}



monitorDAO.prototype.download = function(req, res){
    this._connection.open( function(err, mongoclient){
    
    // Get the collection name
    var colName = req.id.split(":")[0];
    // Get the data type
    var dataType = req.id.split(":")[1];
    //console.log(datatype);
    // Get the data key
    var dataKey = req.id.split(":")[2];

    // Get the granularity of the data
    var granularity = parseInt(req.granularity);
    //console.log(granularity);
    
    mongoclient.collection( colName, function (err, collection){ // recuperar a partir do id
      // granularity == 0 => All data
      if(granularity==0){
        collection.count(function (err, result) {
          granularity = result;   
        });
      };
      
      collection.find().sort({$natural: -1}).limit(granularity).toArray(function(err, result){
        //console.log(result)
        var timestamp = [];
        var data = [];
        
        // Get the data from the newest to oldest
        for (var i = 0; i < result.length; i++){
          // Last timestamp
          data.push(result[i][dataType][dataKey]);
          timestamp.push(result[i].timestamp);
        }
        
        //console.log(JSON.stringify(jsonObj));
        mongoclient.close();

        //application.get('io').emit('dataChanged', JSON.stringify(jsonObj));
        res.send(JSON.stringify({"data": data, "timestamp": timestamp}));
      });
    });
  });
}

module.exports = function(){
  return monitorDAO;
}
