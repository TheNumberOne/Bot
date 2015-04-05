function moveMe(move, x, y, tCount, eCount, tNear, eNear, setMsg, getMsg) {
	
	var myId = 32700;
	var twinId = 10766;
	var moveParity = move % 2;
	var moves={
			'-1':{'-1':4,'0':0,'1':3},
			'0':{'-1':2,'0':0,'1':1},
			'1':{'-1':5,'0':0,'1':6}
	};
	var chosenMove;


    const moveSet = [[0, 0], [1, 0], [-1, 0], [1, -1], [-1, -1], [-1, 1], [1, 1]];
    const enemyMoveSet = [[0, 0], [0, 1], [0, -1], [1, -1], [-1, -1], [-1, 1], [1, 1]];

	function utfToDec( charCode ) {
		return charCode.charCodeAt() - 174;
	}
	function decToUtf( character ) {
		return String.fromCharCode( character + 174 );
	}

	function addEnemy(enemy){
		var i,e;
		for (i = 0; i < eNear.length; i++) {
			e = eNear[i];
			if (enemy.x == e.x && enemy.y == e.y) {
				return;
			}
			if (enemy.id == e.id){
				enemy.id++;
				addEnemy(enemy); //I'm lazy :)
				return;
			}
		}
		eNear.push(enemy);
	}

	function distance(x1, y1, x2, y2){
		return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
	}

	function mergeSort(array,compare) {//http://stackoverflow.com/a/7730507/4230423

		var length = this.length,
		middle = Math.floor(length / 2);

		if (!compare) {
			compare = function(left, right) {
				if (left < right){
					return -1;
				}
				if (left == right){
					return 0;
				}
				return 1;
			};
		}

		if (length < 2){
			return array;
		}

		return merge(
				mergeSort(array.slice(0, middle), compare),
				mergeSort(array.slice(middle, length), compare),
				compare);
	}

	function merge(left, right, compare) {

		var result = [];

		while (left.length > 0 || right.length > 0) {
			if (left.length > 0 && right.length > 0) {
				if (compare(left[0], right[0]) <= 0) {
					result.push(left[0]);
					left = left.slice(1);
				} else {
					result.push(right[0]);
					right = right.slice(1);
				}
			} else if (left.length > 0) {
				result.push(left[0]);
				left = left.slice(1);
			} else if (right.length > 0) {
				result.push(right[0]);
				right = right.slice(1);
			}
		}
		return result;
	}

	function setMessage(){
		var m = "";
		m += decToUtf(x + chosenMove[0]);
		m += decToUtf(y + chosenMove[1]);
		m += moveParity;
		for (var i = 0; i < allEnemies.length && m.length < 60; i++){
			var enemy = allEnemies[i];
			m += decToUtf(enemy.id / 256) + decToUtf(enemy.id % 256);
			m += decToUtf(enemy.x, enemy.y);
		}
	}

	function surveillance(){

		for (var i = 0; i < tNear.length; i++){
			var friend = tNear[i];
			var message = getMsg(friend.id);

			if (message){
				try {
					var m;
					try {
						m = JSON.parse(message);
					} catch (e) {
					}

					if (!m){
						m = JSON.parse("{" + message + "}");
					}

					if (m){
						var command = null;
						for (var j = 0; j < classes.length; j++) {
							c = classes[j];
							if (m[c]){
								if (m[c].t) {
									target = m[c].t;
									launcherId = friend.id;
								}
							}
							try{
								if (m.e){
									var enemyString = m.e;
									if (enemyString.length < 2) {
										continue;
									}
									if (enemyString.charCodeAt(1) < 256 + 32){
										if (enemyString.length % 2 == 0){
											for (var k = 0; k < enemyString.length; k += 2) {
												var ex = enemyString.charCodeAt(k) - 32;
												var ey = enemyString.charCodeAt(k) - 32;
												addEnemy({"id":0,"x":ex,"y":ey});
											}
										}
									} else {
										if (enemyString.length % 2 == 1){
											if (enemyString.length % 4 == 1){
												for (var k = 1; k < enemyString.length; k += 4){
													var id = utfToDec(enemyString.charAt(k)) * 256 + utfToDec(enemyString.charAt(k+1));
													var ex = utfToDec(enemyString.charAt(k+2));
													var ey = utfToDec(enemyString.charAt(k+3));
													addEnemy({"id":id,"x":ex,"y":ey});
												}
											}
										} else {
											for (var k = 0; k < enemyString.length; k += 2) {
												var ex = utfToDec(enemyString.charAt(k));   
												var ey = utfToDec(enemyString.charAt(k+1));
												addEnemy({"id":0,"x":ex,"y":ey});
											}
										}
									}
								}
							} catch (e){}
							try {
								if (m.f){
									var friendString = m.f;
									for (var k = 0; k < friendString.length; k += 2){
										var id = utfToDec(friendString.charAt(k)) * 256 + utfToDec(friendString.charAt(k+1));
										tNear.push({"id":id, "x":0, "y":0});
									}
								}
							} catch (e){}
						}
					}
				} catch (e){}
			}
		}
	}

	surveillance();

	if (getMsg(twinId) == ""){
		
	}
}
