//
// setup a listener and attach a content server to it
//

//var hostname = 'localhost';
var port = process.env.PORT || 1338;  // for Heroku runtime compatibility
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

function mysqlDB()
{

    var mysql      = require('mysql');
    var statement = 'SELECT * from table1';

    //var statement = 'insert into table1 SET ?';
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