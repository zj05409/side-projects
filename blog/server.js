'use strict';

var
    fs = require('fs'),
    url = require('url'),
    path = require('path'),
    http = require('http'),
    mysql = require('mysql');

// 从命令行参数获取root目录，默认是当前目录:
var root = path.resolve(process.argv[2] || '.');

console.log('Static root dir: ' + root);

http.createServer(function (request, response) {
    var method = request.method;
    var urlinfo = url.parse(request.url, true);
    console.log("urlinfo:" + JSON.stringify(urlinfo));
    var connection = mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database:'test'
    });
    // 获得URL的path，类似 '/css/bootstrap.css':
    var pathname = urlinfo.pathname;
    // 获得对应的本地文件路径，类似 '/srv/www/css/bootstrap.css':
    var filepath = path.join(root, pathname);
    if (pathname.search("^/blog.json") != -1) {
        if (method == 'GET') {
          var q = urlinfo.query;
          var id = q.id;
          console.log("id="+id);
          if (id == undefined) {
              response.writeHead(200);
              response.end('{"content": ""}');
          } else {
            connection.connect();
            //查询
            connection.query('SELECT content from blog where id = ' + id, function(err, rows, fields) {
                if (err) throw err;
                console.log('The content is: ', rows[0].content);
                response.writeHead(200);
                response.end('{"content": "' + rows[0].content + '"}');
                //关闭连接
                connection.end();
            });
          }
          // fs.createReadStream(filepath).pipe(response);
          console.log("GET SUCC");
        } else if (method == 'POST') {
          var json = '';
          request.on('data', function(data) {
              json += data;
          });
          request.on('end', function(){
              console.log("json:" + json);
              var data = require('querystring').parse(json);
              console.log("data:" + JSON.stringify(data));
              var id = data.id;
              var content = data.content;

              connection.connect();
              if (id == undefined) {
                //查询
                connection.query('INSERT INTO blog(content) values("'+content+'")', function(err, results, fields) {
                    if (err) throw err;
                    console.log('The sql resp is: ', results);
                    id = results.insertId;
                    //关闭连接
                    connection.end();
                });
              } else {
                connection.query('UPDATE blog SET content ="'+content+'" WHERE id = ' + id, function(err, results, fields) {
                    if (err) throw err;
                    console.log('The sql resp is: ', results);
                    //关闭连接
                    connection.end();
                    // id = insertId;
                });
              }

              response.setHeader("Content-Type", "text/json");
              response.setHeader("Access-Control-Allow-Origin", "*");
              response.writeHead(200);
              response.end('{"success":true, "id":'+id+'}');
          });
          console.log("POST SUCC");
        }
    } else {
      // 获取文件状态:
      fs.stat(filepath, function (err, stats) {
        if (!err && stats.isFile()) {
          // 没有出错并且文件存在:
          console.log('200 ' + request.url);
          // 发送200响应:
          response.writeHead(200);
          // 将文件流导向response:
          fs.createReadStream(filepath).pipe(response);
        } else {
            // 出错了或者文件不存在:
          console.log('404 ' + request.url);
          // 发送404响应:
            response.writeHead(404);
            response.end('404 Not Found');
        }
      });
    }
	// 发送 HTTP 头部
	// HTTP 状态值: 200 : OK
	// 内容类型: text/plain
	//response.writeHead(200, {'Content-Type': 'text/plain'});

	// 发送响应数据 "Hello World"
	//response.end('Hello World\n');
}).listen(8888);

// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/');
