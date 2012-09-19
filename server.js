//
// setup a listener and attach a content server to it
//

//var hostname = 'localhost';
var port = process.env.PORT || 1338;  // for Heroku runtime compatibility
var staticPath = './code';

var queryString = require('querystring');
var server = require('http').createServer(requestHandler);
var static = require('node-static'); 
staticContentServer = new static.Server(staticPath, { cache: false });

function requestHandler(request, response) {
	if (request.method == 'GET')
        //
        // a UI client page load
        //  delegated to node-static for serving it
        //
		staticContentServer.serve(request, response, function (err, res) {
            if (err) { 
                console.error("Error serving " + staticPath + request.url + " - " + err.message);
                response.writeHead(err.status, err.headers);
                response.end(); }
			else
                console.log("Served " + staticPath + request.url)});

    if (request.method == 'POST')
    {
        //
        // handle uploading new data
        // not delegated to node-static,
        // so we handle parsing and  responsing ourselves
        //
        console.log('Post request received.');
        var data = '';
        //request.setEncoding("utf8");
        request.on('data', function(chunk) {
            data += chunk.toString();
        });

        request.on('end', function() {
            var dataAsObject = queryString.parse(data);
            console.log(JSON.stringify(dataAsObject))
            response.writeHead(200);
            response.end();
        });
    }
}
		
server.listen(port, null, null, function(){ 
	console.log('Server listening on' + ': '  + port);});

function mysqlDB()
{

    var mysql = require('mysql');
    //var statement = 'SELECT * from table1';
    var statement = 'insert into table1 SET ?';
    //var statement = 'create table data (timestamp TIMESTAMP, value float)'

    var values  = {id: 3, name: 444};

    var connection = mysql.createConnection({
        host     : 'instance22681.db.xeround.com',
        port    : '14944',
        user     : 'cloudaloe',
        password : 'cloudaloe',
        database: 'hack'
    });

    connection.connect();

    connection.query(statement, values, function(err, rows, fields) {
        if (err) throw err;
        for (i=0; i<rows.length; i++)
        {
            console.log(rows[i]);
        }
    });

    connection.end();
}

mysqlDB();