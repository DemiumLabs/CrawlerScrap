var municipios = require('./municipios.js');
var provincias = require('./provincias.js');

let locations = [];

var normalize = (function() {
    var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç", 
        to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuuNncc",
        mapping = {};
   
    for(var i = 0, j = from.length; i < j; i++ )
        mapping[ from.charAt( i ) ] = to.charAt( i );
   
    return function( str ) {
        var ret = [];
        for( var i = 0, j = str.length; i < j; i++ ) {
            var c = str.charAt( i );
            if( mapping.hasOwnProperty( str.charAt( i ) ) )
                ret.push( mapping[ c ] );
            else
                ret.push( c );
        }      
        return ret.join( '' );
    }
   
  })();

String.prototype.normalize = function(){ return normalize(this); }



function nmPrepare(text){
    const forbiddenWords = ['EL','LA','LOS','LAS','DE'];
    return (        
        (text.split(',')[0])
        .toUpperCase()
        .replace('/',' ')
        .normalize()
        .split(" ")
        .filter((word) => forbiddenWords.indexOf(word) == -1)
        .join('-')
    );
}


provincias.map(provincia=>
  
    municipios
    .filter(municipio => municipio.id.substring(0,2) == provincia.id)
    .map(municipio => locations.push(nmPrepare(municipio.nm) + '-' + nmPrepare(provincia.nm) ) )

);

// locations =     [
//     'QUART-POBLET-VALENCIA',
//     'VALENCIA',
//     'PATERNA-VALENCIA',
//     'GANDIA-VALENCIA',
//     'ALAQUAS-VALENCIA'
// ];

module.exports = locations;
