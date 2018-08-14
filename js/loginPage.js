/**
 * 
 */

$('#btnLogin').click(function() {
	var userName = $("#usrName").val();
	var password = $("#pwd").val();
	if(login_validation(userName,password)){
		var param = {};
		param.userid = userName,
		param.pass   = password;
		getLogin(param);
	}else {
		alert("Enter mandatory field !!! ....")
	}
	
});

function login_validation(username,password){
	var isValied = true;
	if(typeof(username) == "undefined" || typeof(password) == "undefined"){
		isValied = false;
	}else if(username.trim().length < 1 || password.trim().length < 1){
		isValied = false;
	}
	return isValied;
}