var PORT = 80;
var webroot = './webroot::80';

var http = require('http');
var request = require('request');
var url=require('url');
var fs=require('fs');
var mine=require('./mine').types;
var _id=require('./id').id;
var path=require('path');
var querystring=require('querystring');


/** *
http.get('http://www.google.com/index.html', (res) => {
  console.log(`Got response: ${res.statusCode}`);
  // consume response body
  res.resume();
}).on('error', (e) => {
  console.log('Got error: ${e.message}');
});

**/

var DOMAIN = 'wechat.51zx.com';
var URI = 'http://'+ DOMAIN +'/index.php?m=Client&a=getSignData&&sid=79804&mp_config=MG&';

function getData(id){

	console.log(id);
    http.get(URI + 'id=' + id, (res) => {



const statusCode = res.statusCode;
  const contentType = res.headers['content-type'];

  let error;
  if (statusCode !== 200) {
    error = new Error(`Request Failed.\n` +
                      `Status Code: ${statusCode}`);
  } 
/**
else if (!/^application\/json/.test(contentType)) {
    error = new Error(`Invalid content-type.\n` +
                      `Expected application/json but received ${contentType}`);
  }
**/
  if (error) {
    console.log(error.message);
    // consume response data to free up memory
    res.resume();
    return;
  }




    	res.setEncoding('utf8');
	    res.on('data', (chunk) => {	
		var data = JSON.parse(chunk);
		if(!data.status){
			console.log(data);
			setTimeout(function(){getData(id);},3000);
			 return false;
		}

		    data.hurl = querystring.parse(data.headimgurl).url;
		    
		    if(data.hurl == ''){
		        getData(data.id);
		        return false;
		    }
		        //写数据
		        fs.appendFile('./res/data.json', JSON.stringify(data) + ',\n', (err) => {
		            console.log(err);
		        });
		        
		    //写图片
		    var imgName = 'hh' + data.id + '.jpg';
		    var req = request(data.hurl);
			try{
				req.pipe(fs.createWriteStream( './res/' + imgName ));
				    
			}catch(e){
				req.pipe(fs.createWriteStream( './res/' + imgName ));
				    
			}
		    req.on('end',function(){
				console.log('ok:'+imgName);
				fs.writeFile('id.js', `exports.id=${data.id};`, (err) => {
				  if (err) throw err;
				  //console.log('It\'s saved!');
				});
				getData(data.id);
			});
		    
	    });
    }).on('error', (e) => {
	  console.log(`Got error: ${e.message}`);
	});

}
/****/
var arguments = process.argv.splice(2);
if(arguments.length)_id = arguments[0];


getData(_id);
