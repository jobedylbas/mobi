// Function to render the index with the connection and data
module.exports.index = function (application, req, res){
  res.render("index");
}

// Function to render the sidebar with the metrics
module.exports.sidebar = function(application, req, res){

  // Conecta com o banco
  var connection = application.config.dbConnection;
  var monitorDAO = new application.app.models.monitorDAO(connection);
  
  monitorDAO.getPC(res);

}

module.exports.plot = function(application, req, res){
  var connection = application.config.dbConnection;
  var monitorDAO = new application.app.models.monitorDAO(connection);
  
  monitorDAO.getData(req.body, res);
  
}

