module.exports = function (application, req, res){
  application.get('/', function(req,res){
    application.app.controllers.home.index(application, req, res);
  });

  application.get('/sidebar', function(req,res){
    application.app.controllers.home.sidebar(application, req, res);
  });

  application.post('/plot', function(req, res){
    application.app.controllers.home.plot(application, req, res);
  });

  application.post('/download', function (req, res) {
    application.app.controllers.home.download(application, req, res);
  })
};
  
	