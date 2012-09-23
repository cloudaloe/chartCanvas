//
// setup a listener and attach a content server to it
//

//var hostname = 'localhost';
var port = process.env.PORT || 1338;  // for Heroku runtime compatibility
var staticPath = './code';
var mysql = require('mysql');
var mysqlConnection = null;

var geoip = require('geoip-lite');
var queryString = require('querystring');
var server = require('http').createServer(requestHandler);
var static = require('node-static'); 
staticContentServer = new static.Server(staticPath, { cache: false });

function requestHandler(request, response) {

    //
    // IP to Geolocation translation package
    // Note that for proper utilization, it should only check
    // the IP upon a new TCP connection, not every http request
    //
    // var geo = geoip.lookup(request.connection.remoteAddress);
    // console.log(request.connection.remoteAddress, geo);
    //

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
        // so we handle parsing and  responding ourselves
        //
        console.log('Handling post request from client ' + request.connection.remoteAddress +
            ' (port ' + request.connection.remotePort +')');
        //console.log('Request headers are:' + JSON.stringify(request.headers));

        //request.setEncoding("utf8");
        var data = '';

        request.on('data', function(chunk) {
            data += chunk.toString();
        });

        request.on('end', function() {
            var postObject = queryString.parse(data);
            console.log('data', data);
            console.log('json', JSON.stringify(postObject))
            switch(postObject.version)
            {
                case undefined:
                    response.writeHead(400, 'Error:an  API version is not specified in the client request');
                    response.end();
                    break;
                 case '0.1':
                    response.writeHead(200, null);
                    response.end();
                default:
                    response.writeHead(400, 'Error: the API version specified by the client request is not supported');
                    response.end();
            }
        });
    }
}
		
server.listen(port, null, null, function(){ 
	console.log('Server listening on' + ': '  + port);});

function mysqlPush(statement)
{
    mysqlVerifyConnection();
    mysqlConnection.query(statement, function(err, result) {
        if (err)
        {
            console.log('Error encountered executing DDL: \n', err);
            return err;
        }
    });
}

function mysqlGet(statement)
{
    mysqlVerifyConnection();

    mysqlConnection.query(statement, function(err, result) {
        if (err)
        {
            console.log('Error encountered executing mysql query: \n', err);
            return err;
        }
        else
        {
            for (i=0; i<result.length; i++)
            {
                console.log(result[i]);
            }
            return result;
        }
    });
}


function mysqlInitDB()
{
    mysqlVerifyConnection();

    //
    // valuesTableID will be used as a table name, hence its length set according to
    // http://stackoverflow.com/questions/6868302/maximum-length-of-a-table-name-in-mysql
    //
    var statement = 'create table master (apiKey BIGINT UNSIGNED UNIQUE, identifier VARCHAR(20), unit VARCHAR(100), valuesTableID VARCHAR(64))';
     mysqlPush(statement);
}

function mysqlNewEntityInit(name)
{
    //
    //  first, get a unique ID to use for the new table
    // this ID determines the name of the table in which
    // the datums of the entity will be stored

    var valuesTableID = mysqlGet('select max(valuesTableID)  as max from master').max;



    // create entries in the master table

    name += parseString()
    // create a table for the metric values
    mysqlPush('create table ' + name + ' (timestamp TIMESTAMP, value float)');
}

function mysqlVerifyConnection()
{
    if (!mysqlConnection)
    {
         mysqlConnection = mysql.createConnection({
            debug   : false,
            host     : 'instance22681.db.xeround.com',
            port    : '14944',
            user     : 'cloudaloe',
            password : 'cloudaloe',
            database: 'hack'
         });
        mysqlConnection.connect(function(err){
            if (err)
            {
                console.log('Failed connecting to mysql \n', err);
            }
            else
                console.log('Connected to mysql');
        });
    }
}

function stupidTestMysqlDB()
{
    //var statement = 'SELECT * from table1';
    var statement = 'insert into table1 SET ?';
    //var statement = 'create table data (timestamp TIMESTAMP, value float)'

    var values  = {id: 5, name: 555};

    mysqlVerifyConnection();

    mysqlConnection.query(statement, values, function(err, result, fields) {
        //console.log(statement, values, rows.length, err);
        if (err) throw err;
        for (i=0; i<result.length; i++)
        {
            console.log(result[i]);
        }
    });
    mysqlConnection.end();
}

//mysqlInitDB();
//mysqlNewEntityInit('metric69498');
//stupidTestMysqlDB();
var valuesTableID = mysqlGet('select max(valuesTableID)  as max from master');
debugger;

