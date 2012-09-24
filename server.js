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

function mysqlPush(statement, queryVars)
{
    mysqlVerifyConnection();
    mysqlConnection.query(statement, queryVars, function(err, result) {
        if (err)
        {
            console.log('Error encountered executing in mysql: \n', statement, err);
            return err;
        }
    });
}


//
// Utility function for running a query that should return a single result value
// It still for now returns a key value pair and not a single value,
// so extract the value of the key from its return
//
function mysqlGetSingleResult(statement, queryVars, doneCallBack)
{
    mysqlGet(statement, queryVars, function(result) {
        debugger;
        //console.log('mysqlGetSingleResult' + result, statement, queryVars);
        if (result.length == 1)
        {
            if (Object.keys(result[0]).length == 1)
                for (key in result[0])
                {
                    // it's javascript, need to skip the standard inherited object properties
                    if (result[0].hasOwnProperty(key))
                        doneCallBack(result[0][key]);
                }
            else
                console.log('Error getting single value from mysql: query result was not a single value as expected. The result follows \n', result);
        }
        else
            if (result.length == 0)
            {
                doneCallBack(null);
            }
            else
            {
                console.log('Error getting single value from mysql: query result was not a single value as expected. The result follows \n', result);
                //doneCallBack(null);
            }
    });
}

function mysqlGet(statement, queryVars, doneCallback)
{
    mysqlVerifyConnection();

    mysqlConnection.query(statement, queryVars, function(err, result) {
        if (err)
        {
            console.log('Error encountered executing in  mysql: \n', statement, err);
        }
        else
        {
            //for (i=0; i<result.length; i++)  {console.log(result[i]);}
            //console.log(JSON.stringify(result));
            //console.log('mysqlGet' + statement + queryVars + result);
             doneCallback(result);
        }
    });
}

function mysqlInitDB()
{
    //
    // Initialize the database - should not be run as part of the normal flow
    // Run once, for dev environments
    //

    mysqlVerifyConnection();

    //
    // valuesTableName will be used as a table name, hence its length set according to
    // http://stackoverflow.com/questions/6868302/maximum-length-of-a-table-name-in-mysql.
    //
    // note that the mysql INT data type is being used, because node-mysql doesn't properly handle BIGINT at present, Sep 2012
    // It doesn't convert them into numbers but strings, and also https://github.com/Sannis/node-mysql-libmysqlclient/issues/110
    // may indicate BIGINT is not supported
    //
    var statement = 'create table masterLevel1 (apiKey INT UNSIGNED, ' +
                                                                                                             'identifier VARCHAR(20), ' +
                                                                                                             'metricID INT UNSIGNED)';


    mysqlPush(statement);

    var statement ='create table masterLevel2 (metricID INT UNSIGNED, ' +
                                                                                                            'unit VARCHAR(100), ' +
                                                                                                            'valuesTableName VARCHAR(64))';

    mysqlPush(statement);
}

function mysqlFindEntity(apiKey, identifiersArray)
{
    mysqlGetSingleResult('select metricID from master where apiKey = ?', apiKey, function(result){
        if (!result)
            console.log('Entity ' + apiKey + ' not defined in mysql database');
        else
            console.log('Entity ' + apiKey + ' found in mysql database, and has entity values table ' + result + ' associated to it');
    });
}

function mysqlNewEntityInit(name)
{
    debugger;
    mysqlGetSingleResult('select max(metricID) from masterLevel1', null, function(metricID) {
        //
        //  first, get a unique ID to use for the new table
        // this ID determines the name of the table in which
        // the datums of the entity will be stored
        //
        console.log(metricID);
        if (!metricID) // master table still empty
            metricID= 1;
         else
            metricID += 1;

        metricValuesTableName = 'mv' + metricID.toString();
        console.log(metricID, ' ', metricValuesTableName);

        // create a table for the metric values
        mysqlPush('create table ' + metricValuesTableName + ' (timestamp TIMESTAMP, value float)');

        // create entries in the master tables
        mysqlPush('insert into masterLevel1 SET ?', {
            apiKey: '9833',
            identifier: 'server3',
            metricID:metricID
        });

        mysqlPush('insert into masterLevel2 SET ?', {
            metricID:metricID,
            Unit:'percent',
            valuesTableName: metricValuesTableName
        });
    });
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


mysqlInitDB();
//mysqlNewEntityInit(null);
//stupidTestMysqlDB();
//mysqlGetSingleResult('select max(metricID) from master', function(result) {console.log(result);});
//if (!mysqlFindEntity(234234349, null))
   mysqlNewEntityInit(234234349);

