
function moveMe(move, x, y, tCount, eCount, tNear, eNear, setMsg, getMsg) {
    
    var buddyBot = 38926, me = 32700;
    var parity = move % 2;
    var position = "R";
    var combined = false;

    const moveSet = [[0, 0], [1, 0], [-1, 0], [1, -1], [-1, -1], [-1, 1], [1, 1], [0, 1], [0, -1]];
    const enemyMoveSet = [[0, 0], [0, 1], [0, -1], [1, -1], [-1, -1], [-1, 1], [1, 1]];


    var addEnemy = function(enemy){		
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
    };
    
    var distance = function(x1, y1, x2, y2){      
        return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);       
    };

    var surveillance = function(){

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
    };

    surveillance();

    var utfToDec = function(character) {
        return character.charCodeAt() - 174;
    };

    var decToUtf = function(character) {
        return String.fromCharCode(character + 174);
    };

    var findDangerousEnemies = function() {
        var dangerous = [];

        for (var i = 0; i < eNear.length - 1; i++) {
            for (var j = i + 1; j < eNear.length; j++) {
                if (eNear[i].x == eNear[j].x && Math.abs(eNear[i].y - eNear[j].y) == 1){
                    dangerous.push(eNear[i], eNear[j]);
                    eNear[i].buddy = eNear[j];
                    eNear[j].buddy = eNear[i];
                    eNear[i].dangerous = true;
                    eNear[j].dangerous = true;
                }
            }
        }

        return dangerous;
    };

    var moveToward = function(allowedMoves, pieceX, pieceY) {
        var bestMove = 0;
        var xDifference = Math.abs(x - pieceX);
        var yDifference = Math.abs(y - pieceY);

        var currentDistance = Math.sqrt(Math.pow(xDifference, 2) + Math.pow(yDifference, 2));

        for (var i = 0; i < moveSet.length; i++) {
            if (!allowedMoves[i]){
                continue;
            }
            var newDistancePair = [Math.abs(x + moveSet[i][0] - pieceX), Math.abs(y + moveSet[i][1] - pieceY)];

            var newDistance = Math.sqrt(Math.pow(newDistancePair[0], 2) + Math.pow(newDistancePair[1], 2));

            if(currentDistance > newDistance)
            {
                bestMove = i;
                currentDistance = newDistance;
            }
        }
        return bestMove;
    };

    var canKillEnemy = function(moveSet) {
        for (var enemy in eNear) {
            for (var i = 1; i < moveSet.length; i++) {
                if (x == enemy.x && y == enemy.y) {
                    return i;
                }
            }
        }
        return -1;
    };

    var enemyCanKillAtPos = function(moveSig) {
        for (var enemy in eNear) {
            if (x + moveSet[moveSig][0] == enemy.x && y + moveSet[moveSig][1] == enemy.y) {
                return true;
            }
        }
        return false;
    };

    var setMessage = function(chosenMove) {
        var normalized = normalizeMove(chosenMove);
        if (normalized != chosenMove){
            position = position == "R" ? "L" : "R";
        }
        x += moveSet[normalized][0];
        y += moveSet[normalized][1];

        setMsg(decToUtf(x) + decToUtf(y) + parity + position);
    };

    var normalizeMove = function(move) {
        if (move > 6){
            if (move == 7){
                if (position == "R"){
                    return 5;
                } else {
                    return 6;
                }
            } else { //move == 8
                if (position == "R"){
                    return 4;
                } else {
                    return 3;
                }
            }
        }
        return move;
    };

    var pickTarget = function(joined) {
        var dangerous = findDangerousEnemies();
        if (joined && dangerous.length > 0) {
            var best = dangerous[0];
            for (var enemy in dangerous){
                if (distance(best.x, best.y, x, y) > distance(enemy.x, enemy.y, x, y)){
                    best = enemy;
                }
            }
            return best;
        }
        var best = eNear[0];
        for (var enemy in eNear) {
            if (enemy.dangerous){
                continue; //Avoid danger.
            }
            if (distance(best.x, best.y, x, y) > distance(enemy.x, enemy.y, x, y)){
                best = enemy;
            }
        }
        return best;
    };
    
    var moveTowardEnemy = function(target){ //Only use when joined.
        var leftX = x;
        var leftY = y;
        if (position == "R"){
            leftX--;
        }
        var rightX = leftX + 1;
        var rightY = leftY;
            
        var targetX = target.x;
        var targetY = target.y;
        
        var safe = [1, 1, 1, 1, 1, 1, 1, 1];
        
        for (var i = 0; i < 8; i++){
            for (var enemy in eNear) {
                if (enemy.dangerous && Math.abs(target.y - enemy.y) <= 1 && target.x == enemy.x) {//Enable approach to Sph3000 bots.
                    continue;
                }
                if ((leftX + moveSet[i][0] == enemy.x && leftY + moveSet[i][1] == enemy.y) ||
                        (rightX + moveSet[i][0] == enemy.x && rightY + moveSet[i][1] == enemy.y)){
                    safe[i] = 0;
                }
            }
        }
        
        //TODO
        
        
    };
    
    var searchPattern = function(){
        return {
            x:64,
            y:64
            };
    };

    var message = getMsg(buddyBot);

    if (message == "") {
        var safe = [1, 1, 1, 1, 1, 1, 0, 0];
        for (var i = 0; i < 6; i++){
            if (!enemyCanKillAtPos(i)){
                setMessage(i);
                return normalizeMove(i);
            }
        }
        setMessage(0);
        return 0;
    } else if (!message || message == "X"){
        var safe = [1, 1, 1, 1, 1, 1, 1, 0, 0];
        var target;
        if (eNear.length == 0){
            target = searchPattern();
        } else {
            target = pickTarget(false);
        }
        for (var i = 0; i < 6; i++){
            if (enemyCanKillAtPos(i)){
                safe[i] = 0;
            }
        }
        var chosenMove = moveToward(safe, target.x, target.y);//Not the best targetting.
        setMessage(chosenMove);
        return normalizeMove(chosenMove);		
    } else {

        /*var buddyX = utfToDec(message[0]);
        var buddyY = utfToDec(message[1]);
        var buddyParity = parseInt(message[2]);
        var buddyPosition = message.substring(3, 4);*/
        


        var buddyX = parseInt(message.substring(0, 3), 10);
        var buddyY = parseInt(message.substring(4, 7), 10);
        var buddyParity = parity == 0 ? 1 : 0;
        var buddyPosition = "L";
        
        position = buddyPosition == "L" ? "R" : "L";
        
        var neededPosition = [position == "L" ? buddyX - 1 : buddyX + 1, buddyY];
        
        if (parity == buddyParity || x != neededPosition[0] || y != neededPosition[1]) {
            if ((Math.abs(neededPosition[0] - x) == 1 && Math.abs(neededPosition[1] - y) <= 1) || 
                    (neededPosition[0] == x && neededPosition[1] == y)) {
                var safe = [1, 1, 1, 1, 1, 1, 1, 0, 0];
                var chosenMove = moveToward(safe, neededPosition[0], neededPosition[1]);
                setMessage[chosenMove];
                return normalizeMove(chosenMove);
            } else {
                var safe = [1, 1, 1, 1, 1, 1, 1, 0, 0];
                for (var i = 0; i < 6; i++){
                    if (enemyCanKillAtPos(i)){
                        safe[i] = 0;
                    }
                }
                var chosenMove = moveToward(safe, neededPosition[0], neededPosition[1]);
                setMessage(chosenMove);
                return chosenMove;
            }
        }
        
        return Math.floor(Math.random() * 7);
        
    }

}
