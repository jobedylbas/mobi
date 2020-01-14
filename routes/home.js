module.exports = function (application, req, res){
  application.get('/', function(req,res){
    application.controllers.home.index(application, req, res);
  });

  application.get('/index', function(req, res){
    application.controllers.home.index(application, req, res);
  });

  application.get('/charts', function(req, res){
    application.controllers.home.charts(application, req, res);
  });

  application.get('/sidebar', function(req, res){
    application.controllers.home.sidebar(application, req, res);
  });

  application.get('/plot', function(req, res){
    application.controllers.home.plot(application, req, res);
  });

  application.post('/download', function (req, res) {
    application.controllers.home.download(application, req, res);
  })

  application.get('/about', function(req, res){
    application.controllers.home.about(application, req, res);
  })
};
  
	