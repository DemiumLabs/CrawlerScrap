var Curl = require('node-libcurl').Curl;
var DomParser = require('dom-parser');
var Client = require('node-rest-client').Client;
var config = require('./config.js');
const crypto = require('crypto');
const fs = require('fs');
var sanitizeHtml = require('sanitize-html');




module.exports = {

    getFirstLevelRoute(activity){
        return "http://empresite.eleconomista.es/Actividad/"+ activity.toUpperCase() +"/";
    },

    getListRoute:(activity,page,location)=>{
        return "http://empresite.eleconomista.es/Actividad/"+ activity.toUpperCase() +"/localidad/" + location +"/PgNum-" + page+ "/";
    },


    getDomFromRoute:(route)=>{
        return new Promise((resolve,reject)=>{
            var parser = new DomParser();

            let file = 'files/' + crypto.createHash('md5').update(route).digest("hex");
            if( fs.existsSync(file, 'utf8')){
                config.wait = 10;
                fs.readFile(file, 'utf8', (err, contents) => {
                    let dom  = parser.parseFromString(contents);
                    if(dom.getElementById('form_capados_recaptcha')){ 
                        fs.unlink(file);
                        console.log('capado');
                        reject('capado');
                    }else{
                        resolve({file:file,cache:true, parser: dom });
                    }
                });
            }else{
                var curl = new Curl();
                
                curl.setOpt('URL', route);
                curl.setOpt('FOLLOWLOCATION', true);
                curl.setOpt('USERAGENT', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.12');
                config.wait = config.waitEmpresite;
                curl.on('end', function(statusCode, body, headers) {  
                    let dom  = parser.parseFromString((body));
                    if(dom.getElementById('form_capados_recaptcha')){ 
                        console.log('capado');
                        reject('capado');
                    }else{
                        fs.writeFile(file,body,()=>{});   
                        resolve({ file:file,cache:false, parser:dom });
                        this.close();
                    }
                });   
                curl.on('error', curl.close.bind(curl));
                curl.perform();
            }
        });

    },

    extractArticle: (node)=>{
            return {
                name: node.getElementsByTagName('a')[0].innerHTML,
                route: node.getElementsByTagName('a')[0].getAttribute('href'),
                type: 'article'
            };  
    },

    extractDomicilio:(node)=>{
        return {
            countryName: node.getElementsByClassName('country-name')[0].innerHTML,
            streetAddress: node.getElementsByClassName('street-address')[0].innerHTML,
            localityAddress: node.getElementsByClassName('locality')[0].innerHTML,
            postalCode: node.getElementsByClassName('postal-code')[0].innerHTML,
            regionAddress: node.getElementsByClassName('region')[0].innerHTML
        }
    },

    getMorePages(node,level){
        return node.parser.getElementsByTagName('option')
        .map((option)=> {return{route:option.getAttribute('value'),type:level}})
        .filter((value)=> String(value.route).search('http') != -1);
    },

    postArticles:(articles,cb)=>{
        var client = new Client();
        let args = {data:articles,headers: { "Content-Type": "application/json" } };
        client.post(config.empresiteArticle,args,cb);
    }

}
