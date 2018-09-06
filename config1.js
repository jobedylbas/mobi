var path = require('path');

const config = {
	app: {
		port: process.env.PORT || 3000,
		appRoot: path.resolve(__dirname),
		defaultDatabase: 'test',
		defaultUri: 'mongodb://mongodb:27017',
		defaultPCCol: 'pcs' 
	}
};

module.exports = config;