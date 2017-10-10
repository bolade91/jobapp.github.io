var express = require("express"),
    bodyParser = require("body-parser"),
    mysql = require('mysql');
app = express();
var port = process.env.PORT || 2020;
var connection = mysql.createConnection(process.env.JAWSDB_URL);
connection.connect(function(err) {
    if (err) {
        console.log(err);
        console.log("Error connecting database");
    }
});
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

var data = [];
app.get("/", function(req, res) {
    var finalData = {};
    getTableData('brands', '', '', 'brand_id', 'DESC', 6, function (tableData) {
        finalData.brandData = {};        
        finalData.brandData.tableName = 'brands';
        finalData.brandData.tableRecords = tableData;

        getTableData('categories', '', '', 'categories_id', 'DESC', 6, function (tableData) {
            finalData.categoryData = {};        
            finalData.categoryData.tableName = 'categories';
            finalData.categoryData.tableRecords = tableData;

            getTableData('apps_countries', '', '', 'id', 'DESC', 6, function (tableData) {
                finalData.countryData = {};
                finalData.countryData.tableName = 'apps_countries';
                finalData.countryData.tableRecords = tableData;
                console.log(finalData);
                res.render("index", {
                    finalData: finalData
                });
            });
        });
    });    
});

app.get("/about", function(req, res) {});

app.get("/home", function(req, res) {
    res.render("index", {
        data: data
    });
});

var totalRec = 0,
    pageSize = 9,
    pageCount = 0;
var start = 0;
var currentPage = 1;

app.get("/jobs", function(req, res) {
    var countSql = 'SELECT count(*) as numrows FROM apps_countries';
    connection.query(countSql, function(err, countrows, fields) {
        if (err) throw err;

        totalRec = countrows[0]['numrows'];
        pageCount = Math.ceil(totalRec / pageSize);
        if (typeof req.query.page !== 'undefined') {
            currentPage = req.query.page;
        }

        start = (currentPage - 1) * pageSize;
        var sql = 'SELECT * from apps_countries LIMIT '+start+' ,'+pageSize+' ';
        connection.query(sql, function(err, data, fields) {
            if (err) throw err;

            res.render('listjobs', { data: data, pageSize: pageSize, pageCount: pageCount,currentPage: currentPage});
        });
    });
    //res.render("list");
});

app.get("/services", function(req, res) {
	var countSql = 'SELECT count(*) as numrows FROM apps_countries';
	connection.query(countSql, function(err, countrows, fields) {
		if (err) throw err;

		totalRec = countrows[0]['numrows'];
		pageCount = Math.ceil(totalRec / pageSize);
		if (typeof req.query.page !== 'undefined') {
			currentPage = req.query.page;
		}

		start = (currentPage - 1) * pageSize;
		var sql = 'SELECT * from apps_countries LIMIT '+start+' ,'+pageSize+' ';
		connection.query(sql, function(err, data, fields) {
			if (err) throw err;

			res.render('list', { data: data, pageSize: pageSize, pageCount: pageCount,currentPage: currentPage});
		});
	});
    //res.render("list");
});

app.get("/profile/:id", function(req, res) {
    var id = req.params.id;
    console.log("we here " + id);
    var sql = "SELECT * from apps_countries where id = ?";
    connection.query(sql, [id], function(err, data, fields){
        if (err) throw err;
        console.log(data);
        res.render("profile", {
            data: data,
            id: id
        }); 
    });
    
    //res.send("Show page!!");
});

app.listen(port, function() {
    console.log("server listening on port " + port);
});

getTableData = module.exports = function (tableName, whereField, whereValue, orderByField, orderByValue, limitValue, callback) {
    /*console.log("tableName : "+tableName);
    console.log("whereField : "+whereField);
    console.log("whereValue : "+whereValue);
    console.log("orderByField : "+orderByField);
    console.log("orderByValue : "+orderByValue);
    console.log("limitValue : "+limitValue);*/

    var query = "SELECT * FROM "+ tableName;
    if (whereField != '' && whereValue != '') {
        query = query + " WHERE "+ whereField +" = "+ whereValue + " "; 
    }

    if (orderByField != "" && orderByValue != "") {
        query = query +" ORDER BY "+ orderByField +" "+ orderByValue;
    }

    if (limitValue != "") {
        query = query +" LIMIT "+ limitValue;
    }
    /*console.log(query);*/

    connection.query(query, function(err, tableData, fields) {
        if (err) throw err;

        callback(tableData);
    });
}