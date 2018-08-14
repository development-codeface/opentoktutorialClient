/**
 * @Author : irshadillias
 * @description : Video streaming service implimetation.
 */

// (optional) add server code here
var APIKEY 		= "";
var SESSIONID 	= "";
var TOKEN     	= "";
var SERVER_BASE_URL = 'http://localhost:8080';
const wsChat = new WebSocket("ws://localhost:8086/comm");
var userList;
var myUserName;
wsChat.onopen = function(){
    //subscribe to room
	console.log("Connection established!");
};
function getServiceInvokation(serviceUrl,serviceCallback){
	fetch(SERVER_BASE_URL + '/'+serviceUrl).then(function(res) {
		  return res.json()
		}).then(function(res) {
			serviceCallback(res);
		}).catch(handleError);
}
function getPostInvocation (serviceUrl,param,serviceCallback){
	$.ajax({
	    contentType: 'application/json',
	    data: JSON.stringify(param),
	    dataType: 'json',
	    success: function(data){
	    	serviceCallback(data)
	    },
	    error: function(){
	        app.log("Device control failed");
	    },
	    processData: false,
	    type: 'POST',
	    url: SERVER_BASE_URL + '/'+serviceUrl
	});
}
function getsessionDetails(){
	getServiceInvokation('room/'+myUserName,getSessionDetailsCallback);
}

function getSessionDetailsCallback(res){
	APIKEY = res.apiKey;
	SESSIONID = res.sessionId;
	TOKEN = res.token;
	//initializeSession();
}
function getLogin(param){
	getPostInvocation('login',param,loginCallBack);	
}
function loginCallBack(res){
	window.location.hash = "home_Page";
	wsChat.send(JSON.stringify({
        action: 'subscribe',
        userid: res.username
    }));
	myUserName = res.username;
	getsessionDetails();
	
}
//Handling all of our errors here by alerting them
function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

function initializeSession(sessionid) {
  var session = OT.initSession(APIKEY, sessionid);
  // Subscribe to a newly created stream
  session.on('streamCreated', function(event) {
	  session.subscribe(event.stream, 'subscriber', {
	    insertMode: 'append',
	    width: '100%',
	    height: '100%'
	  }, handleError);
	});

  // Create a publisher
  var publisher = OT.initPublisher('publisher', {
    insertMode: 'append',
    width: '100%',
    height: '100%'
  }, handleError);

  // Connect to the session
  session.connect(TOKEN, function(error) {
    // If the connection is successful, publish to the session
    if (error) {
      handleError(error);
    } else {
      session.publish(publisher, handleError);
    }
  });
}

function subscribeVideo(sessionId){
	var session = OT.initSession(APIKEY, sessionId);
	session.on('streamCreated', function(event) {
		  session.subscribe(event.stream, 'subscriber', {
		    insertMode: 'append',
		    width: '100%',
		    height: '100%'
		  }, handleError);
		});
}

wsChat.onerror = function(){
    showSnackBar("Unable to connect to the chat server! Kindly refresh", 20000);
};

wsChat.onmessage = function(e){
    var data = JSON.parse(e.data);
    switch(data.action){
    		case 'subscribe':getUserList(data); break;
    		case 'newSub' : newUserSubcribe(data);break;
    		case 'incomeVideoCall':showAcceptMessage(data);break;
    		case 'endcall' : endCallfromUser(data);break;
    		case 'callRejected' :callRejectedval(data); break;
    		case 'startCall': calltaken(data);break;
    }
}
function calltaken(data){
	startCall(false);//to start call when callee gives the go ahead (i.e. answers call)
    document.getElementById("callModal").style.display = 'none';//hide call modal    
    clearTimeout(awaitingResponse);//clear timeout  
    //stop tone
    document.getElementById('callerTone').pause();
}
function startCall(){
	
}
function callRejectedval(data){
	document.getElementById("callerInfo").style.color = 'red';
    document.getElementById("callerInfo").innerHTML = data.msg;
    setTimeout(function(){
        document.getElementById("callModal").style.display = 'none';
    }, 3000);
    //stop tone
    document.getElementById('callerTone').pause();
    //enable call buttons
    enableCallBtns();
}
function getUserList(data){
	userList = Object.keys(data['userList']);
}
function newUserSubcribe(data){
	userList = Object.keys(data['userList']);
	if(typeof(updateCharUserList) != "undefined"){
		updateCharUserList();
	}
}
function showSnackBar(msg, displayTime){
    console.log(msg);
}

function showAcceptMessage(data){
	document.getElementById('calleeInfo').style.color = 'black';
    document.getElementById('calleeInfo').innerHTML = data.userid+"Calling You !!!!";
    $('#calleeInfo').data( "incomeuser", data.userName );
    $('#calleeInfo').data( "session", data.sessionId );
    document.getElementById("rcivModal").style.display = 'block';   
    document.getElementById('callerTone').play();
    
    //minimise chat pane if it is maximised to prevent it from covering the page on small screens
    if (!$(".icon_minim").hasClass('panel-collapsed')) {
        $(".icon_minim").parents('.panel').find('.panel-body').slideUp();
        $(".icon_minim").addClass('panel-collapsed');
        $(".icon_minim").removeClass('fa-minus').addClass('fa-plus');
    }
}

function endCallfromUser(data){
	document.getElementById("calleeInfo").style.color = 'red';
    document.getElementById("calleeInfo").innerHTML = data.msg;

    setTimeout(function(){
        document.getElementById("rcivModal").style.display = 'none';
    }, 3000);
    document.getElementById('callerTone').pause();
    
    break;
}

function checkUserMediaSupport(){
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
}
                