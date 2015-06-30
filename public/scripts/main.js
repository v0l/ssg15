//Site scripts
function getXHR(url, async, cb) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4 && xhr.status == 200){
			cb(xhr.response);
		}
	}
	xhr.open("GET",url,async);
	xhr.send();
}

function ShowGames(div){
	var s = [ "Invalid", "Waiting For Players", "Running", "Ended" ];
	
	getXHR('/data/rooms', true, function(data) {
		var e = document.getElementById(div);
		
		var tbody = "";
		var roomlist = JSON.parse(data);
		for(var x=0;x<roomlist.roomlist.length;x++){
			var room = roomlist.roomlist[x];
			var row = "<tr><td>"+ room.roomId +"</td><td>" + room.data.level + "</td><td>" + room.stats.num_active_players + "/" + room.stats.num_players + "</td><td>" + s[room.data.status] + "</td><td><input type=\"button\" onclick=\"JoinGame(" + room_data.roomId + ")\" value=\"Join Game\"/></td></tr>"; 
			tbody += row;
		}
		e.innerHTML = tbody;
	});
}

function JoinGame(id){
	getXHR("/data/joinroom/"+id, true, function(data){
		var msg = JSON.parse(data);
		
		if(msg.ok){
			window.location.href = '/TowerAttack';
		}else{
			alert(msg.msg);
		}
	});
}

function JoinNew(){
	var i = document.getElementById("roomId");
	JoinGame(i.value);
}