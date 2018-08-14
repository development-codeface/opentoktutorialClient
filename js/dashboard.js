/**
 * @author irshad illias
 */
function updateCharUserList(){
	var userListUI = "";
	if(userList == null){
		var userListUI = "No user online";
	}else {
		for(var key in userList){		
			userListUI += '<div id="chatname">'+userList[key]+'</div> <button class="btnChat" data-username='+userList[key]+'>chat</button>'
		}
	}
	console.log(userListUI);
	$('#chatuser').html(userListUI);
}

function setPageUI (){
	$('#dashboardUserName').html(myUserName);
}

updateCharUserList();
setPageUI();


$('.btnChat').click(function() {
	initiatechat($(this).data( "username"));
});

$('#rejectCall').click(function() {
	rejectCallUser();
});

$('.answerCall').click(function() {
	answerCall();
});

$('.endCall').click(function() {
    endCall("Call ended by remote", false);
    enableCallBtns();
});

function rejectCallUser(){
	var userdata = $('#calleeInfo').data();
	wsChat.send(JSON.stringify({
        action: 'callRejected',
        userid: myUserName,
        touser: userdata["incomeuser"],
        sessionId: SESSIONID
    }));
    
    document.getElementById("rcivModal").style.display = 'none';
    
    document.getElementById('callerTone').pause();
}

function initiatechat(userName){
	initializeSession(SESSIONID);
	var callerInfo = document.getElementById('callerInfo');
	if(checkUserMediaSupport){
		callerInfo.style.color = 'black';
        callerInfo.innerHTML = 'Video call to'+userName;

        //start calling tone
        document.getElementById('callerTone').play();
        
		wsChat.send(JSON.stringify({
	        action: 'initiateVideoCall',
	        userid: myUserName,
	        touser: userName,
	        sessionId: SESSIONID
	    }));
		disableCallBtns();

        //wait for response for 30secs
        awaitingResponse = setTimeout(function(){
            endCall("Call ended due to lack of response",touser,myUserName, true);
        }, 30000);
		
	}else{
        callerInfo.style.color = 'red';
        callerInfo.innerHTML = "Your browser/device does not have the capability to make call";
    }
	document.getElementById("callModal").style.display = 'block';
	
}

function endCall(msg, touser,fromUser,setTimeOut){
    wsChat.send(JSON.stringify({
        action: 'endcall',
        userid: fromUser,
        touser: touser,
        sessionId: SESSIONID
    }));

    if(setTimeOut){
        //display message
        document.getElementById("callerInfo").style.color = 'red';
        document.getElementById.innerHTML = "<i class='fa fa-exclamation-triangle'></i> No response";
        
        setTimeout(function(){
            document.getElementById("callModal").style.display = 'none';
        }, 3000);
        
        enableCallBtns();
    }
    
    else{
        document.getElementById("callModal").style.display = 'none';
    }
    
    clearTimeout(awaitingResponse);

    document.getElementById('callerTone').pause();
}

function enableCallBtns(){
   /* var initCallElems = document.getElementsByClassName('initCall');
    for(let i = 0; i < initCallElems.length; i++){
        initCallElems[i].removeAttribute('disabled');
    }
    document.getElementById('terminateCall').setAttribute('disabled', true);*/
}

function disableCallBtns(){
    /*var initCallElems = document.getElementsByClassName('initCall');
    for(let i = 0; i < initCallElems.length; i++){
        initCallElems[i].setAttribute('disabled', true);
    }
    document.getElementById('terminateCall').removeAttribute('disabled');*/
}

function answerCall(){
    //check whether user can use webrtc and use that to determine the response to send
	var userdata = $('#calleeInfo').data();
	session = userdata["session"];
    if(checkUserMediaSupport){
    	  getServiceInvokation('room/'+userdata["incomeuser"],subscribetheSession);
    	  wsChat.send(JSON.stringify({
              action: 'startCall',
              userid: myUserName,
              touser: userdata["incomeuser"]
       }));
    }
    else{
        //inform caller and current user (i.e. receiver) that he cannot use webrtc, then dismiss modal after a while
     	wsChat.send(JSON.stringify({
            action: 'callRejected',
            userid: myUserName,
            touser: userdata["incomeuser"],
            sessionId: SESSIONID
        }));

        document.getElementById("calleeInfo").innerHTML = "Your browser/device does not meet the minimum requirements needed to make a call";

        setTimeout(function(){
            document.getElementById("rcivModal").style.display = 'none';
        }, 3000);
    }
    document.getElementById("rcivModal").style.display = 'none';
    document.getElementById('callerTone').pause();
}
function subscribetheSession(res){
	TOKEN = res.token;
	initializeSession(res.sessionId);
}
