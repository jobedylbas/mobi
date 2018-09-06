var config = require('../config1.js');
var DB = require('../db/dbConnection');

// Function to render the index with the connection and data
module.exports.index = function (application, req, res){
  res.render("index1");
}

// Function to render the sidebar with the metrics
module.exports.sidebar = function(application, req, res){

  // Conecta com o banco
  var database = new DB;
  database.connect(config.app.defaultUri, config.app.defaultDatabase)
  .then(
    function(){
      return database.getPClist(config.app.defaultPCCol);    
    })
  .then(
      function(json){
        return {"pcs": json};
      },
      function(err){
        console.log("Failed to get the pc list: " + err);
        return {};
      }
  )
  .then(
    function(resultObject){
      // console.log(resultObject);
      database.close();
      res.render('pcslist', resultObject);
    }
  )

}

module.exports.plot = function(application, req, res){
  var database = new DB;
  database.connect(config.app.defaultUri, config.app.defaultDatabase)
  .then(
    function(){
      let data = req.body.id.split(':');
          machine = data[0];
          datatype = data[1];
          datakey = data[2];
      return database.getAllData({'datatype': datatype, 'datakey': datakey, 'pccoll': machine});
    }
  )
  .then(
      function(json){
        console.log(json);
        database.close();
        res.send(json);
      },
      function(err){
        console.log("Failed to get all the data: " + err);
      }
  )
  database.close();
}


module.exports.charts = function (application, req, res){
  res.render("charts");
}

module.exports.about = function(application, req, res){
	res.render("about");
}