/**
 * 
 */
 $("#include").load("views/Login_view.html");
var includeDiv = $("#include");
           
$(window).on('hashchange', function() {
    if(typeof(location.hash.slice(1)) == undefined){
    		includeDiv.load('views/Login_view.html');
    } 
    var href = location.hash.slice(1) +".html";
    includeDiv.load('views/' + href);
    onHashChangeVal(location.hash.slice(1));
});

function onHashChangeVal(hashVal){
	switch(hashVal){
	case 'home_Page':
		
	}
}
