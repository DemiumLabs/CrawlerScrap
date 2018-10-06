
var locations = require('./locations.js');
var functionsLibrary = require('./library.js');
var config = require('./config.js');


let activity = process.argv.pop();

var timer = 0;

var pages = []; // queue;



function periodicall() {
    console.info(timer, pages.length, config.wait);
    if(!pages[timer]) config.wait = 10000;
    else{
        let currentPage = pages[timer++];
        switch(currentPage.type){
            case 'secondLevel':secondLevelPage(currentPage.route); break;
            case 'thirdLevel':thirdLevelPage(currentPage.route); break;
            case 'article':article(currentPage.route); break;
            case 'paginationPage':paginationPage(currentPage.route); break;
            default: console.log('tipo no reconocido',currentPage.type); break;
        }
    }
    
    //if(pages[timer]) recursivePage(pages[timer++]);
    setTimeout(periodicall, config.wait);
};
periodicall();



firstLevelPage(activity);



// locations
// .map( (location) => {
//     pages.push({activity:activity, page:1, location:location});
//     //recursivePage(activity,1,location);
// });


function firstLevelPage(activity){
    let route = functionsLibrary.getFirstLevelRoute(activity);
    functionsLibrary.getDomFromRoute(route)
    .then(dom => {
        let nodes  = dom.parser.getElementsByClassName('text-capitalize');
        pages = pages.concat(
            nodes
                .filter(element=>element.getAttribute('href'))
                .map(element=>{return{route:element.getAttribute('href'),type:'secondLevel'}})
        );
        let more = functionsLibrary.getMorePages(dom,'secondLevel');
        pages = pages.concat(more);
    })
    .catch((error)=>{console.log(error)});
}


function secondLevelPage(route){
    console.log('secondLevelPage',route);
    functionsLibrary.getDomFromRoute(route)
    .then(dom => {
         let nodes  = dom.parser.getElementsByClassName('text-capitalize');      
         pages = pages.concat(
             nodes
                 .filter(element=>element.getAttribute('href'))
                 .map(element=>{return{route:element.getAttribute('href'),type:'thirdLevel'}})
         );
         let more = functionsLibrary.getMorePages(dom,'thirdLevel');
         pages = pages.concat(more);
    })
    .catch((error)=>{console.log(error)});
}


function thirdLevelPage(route){
    console.log('thirdLevelPage',route);
    functionsLibrary.getDomFromRoute(route)
    .then(dom => {
         let nodes  = dom.parser.getElementsByTagName('a')
         .map((e) => e.getAttribute('href') + '')
         .filter((href) => href.search('PgNum')!=-1)
         .map(route=>{return{route:route,type:'paginationPage'}});      
         pages = pages.concat(nodes);

         let articles = dom.parser.getElementsByTagName('article');
         articles = (articles.length > 1) ? articles.map(functionsLibrary.extractArticle): [];
         
         pages = pages.concat(articles);
    })
    .catch((error)=>{console.log(error)});
}

function paginationPage(route){
    console.log('paginationPage',route);
    functionsLibrary.getDomFromRoute(route)
    .then(dom => {
         let articles = dom.parser.getElementsByTagName('article');
         articles = (articles.length > 1) ? articles.map(functionsLibrary.extractArticle): [];
         pages = pages.concat(articles);
    })
    .catch((error)=>{console.log(error)});
}


function article(route){
    console.log('article',route);
    functionsLibrary.getDomFromRoute(route)
    .then(dom => {
       let article = {};
       dom.parser.getElementsByTagName('li')
       .forEach((li) => {
           switch(li.getAttribute('class')){
               case 'ico-razon':     article.bussinesName = li.getElementsByTagName('span')[0].innerHTML; break;
               case 'ico-email':     article.email = li.getElementsByTagName('span')[0].innerHTML; break;
               case 'ico-telefono':  article.phone = li.getElementsByTagName('span')[0].innerHTML; break;
               case 'ico-web':       article.web = li.getElementsByTagName('a')[0].getAttribute('href'); break;
              // case 'ico-forma':     article.forma = li.outerHTML; break;
               case 'ico-domicilio': article.address = functionsLibrary.extractDomicilio(li); break;
           }       
       });
       article.activity = activity;
       //functionsLibrary.postArticles(article,(result)=>console.log(result.id));
       //console.log(article);
    })
    .catch((error)=>{console.log(error)});
}



// function recursivePage(page){

//     let route = functionsLibrary.getListRoute(page.activity,page.page,page.location);

//     console.log(route);

//     functionsLibrary.getDomFromRoute(route)
//     .then(dom => {
        
//        if(dom.parser.getElementById('form_capados_recaptcha')) console.log('capado');
//        // if(dom.cache) wait = 0; else wait = 5000;
//        //console.log(dom.file);
//         let articles = dom.parser.getElementsByTagName('article');
//         articles = (articles.length > 1) ? articles.map(functionsLibrary.extractArticle): [];

//         functionsLibrary.postArticles(articles,(result)=>console.log(result));

//         if(articles.length){
//             pages.push({activity:page.activity, page: page.page +1, location:page.location});
//         }

//     })
//     .catch((error)=>{console.log(error)});
// }
