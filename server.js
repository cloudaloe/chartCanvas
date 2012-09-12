//
// setup a listener and attach a content server to it
//

//var hostname = 'localhost';
var port = process.env.PORT || 1338;
var staticPath = './code';

var server = require('http').createServer(requestHandler);
var static = require('node-static'); 
staticContentServer = new static.Server(staticPath, { cache: false });

function requestHandler(request, response) {
	if (request.method == 'GET') 
		staticContentServer.serve(request, response, function (err, res) {
            if (err) { 
                console.error("Error serving " + staticPath + request.url + " - " + err.message);
                response.writeHead(err.status, err.headers);
                response.end(); }
			else
                console.log("Served " + staticPath + request.url)});}
		
server.listen(port, null, null, function(){ 
	console.log('Server listening on' + ': '  + port);});
		