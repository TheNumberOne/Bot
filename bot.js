
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

    var moveToward = function(allowedMoves, pieceX, pieceY) {
        var bestMove = 0;

        var currentDistance = [Infinity, Infinity];

        for (var i = 0; i < moveSet.length; i++) {
            if (!allowedMoves[i]){
                continue;
            }
            
            var newX = x + moveSet[i][0];
            var newY = y + moveSet[i][1];

            if (newX == -1 || newX == 128 || newY == -1 || newY == 128) {
                continue;
            }
            
            var newDistance = [Math.abs(newX - pieceX), Math.abs(newY - pieceY)];

            if(newDistance[1] < currentDistance[1] || (newDistance[1] == currentDistance[1] && newDistance[0] < currentDistance[0]))
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

    var enemyCanKillAtPos = function(moveSig, joined, ignoreSphi) {
        for (var enemy in eNear) {
            for (var enemyMove in enemyMoveSet){
            
                var enemyX = enemy.x + enemyMove[0];
                var enemyY = enemy.y + enemyMove[1];
            
                if (joined){
                    
                    if (ignoreSphi && (enemy.id == 2867 || enemy.id == 21487)){
                        continue;
                    }
                    
                    var leftX = position == "R" ? x - 1 : x;
                    var leftY = y;
                    
                    leftX += moveSet[moveSig][0];
                    leftY += moveSet[moveSig][1];
                    
                    var rightX = leftX + 1;
                    
                    if ((leftX == enemyX || rightX == enemyX) && leftY == enemyY){
                        return true;
                    }
                } else if (x + moveSet[moveSig][0] == enemyX && y + moveSet[moveSig][1] == enemyY) {
                    return true;
                }
            }
        }
        return false;
    };
    
    var moveTowardEnemy = function(safe, targetX, targetY){
        
        var best = 0;
        
        var currentDistances = [Infinity, Infinity];

        for (var i = 1; i < moveSet.length; i++) {
            
            if (!safe[i]){
                continue;
            }
            
            var adjustedX = x + moveSet[i][0];
            var adjustedY = y + moveSet[i][1];
            
            var distances = [Math.abs(targetX - adjustedX), Math.abs(targetY - adjustedY)];
            
            if (distances[1] < currentDistances[1] || (distances[1] == currentDistances[1] && ((distances[1] == 0) ^ (distances[0] > currentDistances[0])))){
                best = i;
                currentDistances = distances;
            }
        }
        
        return best;
    };

    var setMessage = function(chosenMove) {
        var normalized = normalizeMove(chosenMove);
        if (normalized != chosenMove){
            position = position == "R" ? "L" : "R";
        }
        x += moveSet[normalized][0];
        y += moveSet[normalized][1];

        setMsg(decToUtf(x) + decToUtf(y) + parity + position);
        
        return normalized;
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
    
    var searchPattern = function(){
        var minosMessage = getMsg(38926);

        if (minosMessage != "X") {
            var minosX = parseInt(message.substring(0, 3), 10);
            var minosY = parseInt(message.substring(4, 7), 10);

            return {x:minosX, y:minosY};
        }

        if (x == 11 && y == 123) {
            restartPatrol = true;
        }

        if (x == 11 && y == 11) {
            restartPatrol = false;
        }

        if (restartPatrol) {
            return {x:11, y:11};
        }

        if ((x == 11 && y in [27, 59, 91, 123]) || 
            (x == 123 && y in [11, 43, 75, 107])) {
            return {x:x, y:y + 1};
        }

        if (y in [11, 43, 75, 107] && x > 11 && x < 116) {
            return {x:x + 1, y:y};
        }

        if (y in [27, 59, 91, 123] && x > 11 && x < 116) {
            return {x:x - 1, y:y};
        }

        if (x in [11, 123]) {
            return {x:x, y:y + 1};
        }
    };

    var message = getMsg(buddyBot);

    if (message == "") {
        var safe = [1, 1, 1, 1, 1, 1, 1, 0, 0];
        for (var i = 1; i < 7; i++){
            if (!enemyCanKillAtPos(i, false, false)){
                return setMessage(i);      
            }
        }
        return setMessage(0);
    } else if (!message || message == "X"){
        var safe = [1, 1, 1, 1, 1, 1, 1, 0, 0];
        var target;
        if (eNear.length == 0){
            target = searchPattern();
            var chosenMove = moveToward(safe, target.x, target.y);
            return setMessage(chosenMove);      
        } else {
            target = pickTarget(false);
        }
        if (canKillEnemy() != -1){
            var chosenMove = canKillEnemy();
            return setMessage(chosenMove);
        }
        
        
        for (var i = 0; i < 7; i++){
            if (enemyCanKillAtPos(i, false, false)){
                safe[i] = 0;
            }
        }
        var chosenMove = moveTowardEnemy(safe, target.x, target.y);
        return setMessage(chosenMove);		
    } else {

        var buddyX = utfToDec(message[0]);
        var buddyY = utfToDec(message[1]);
        var buddyParity = parseInt(message[2]);
        var buddyPosition = message.substring(3, 4);

        /*var buddyX = parseInt(message.substring(0, 3), 10);
        var buddyY = parseInt(message.substring(4, 7), 10);
        var buddyParity = parity == 0 ? 1 : 0;
        var buddyPosition = "L";*/
        
        position = buddyPosition == "L" ? "R" : "L";
        
        var leftX = position == "L" ? x : x - 1;
        var leftY = y;
        
        var neededPosition = [position == "L" ? buddyX - 1 : buddyX + 1, buddyY];
        
        if (parity == buddyParity || x != neededPosition[0] || y != neededPosition[1]) {
            if ((Math.abs(neededPosition[0] - x) == 1 && Math.abs(neededPosition[1] - y) <= 1) || 
                    (neededPosition[0] == x && neededPosition[1] == y)) {
                var safe = [1, 1, 1, 1, 1, 1, 1, 0, 0];
                var chosenMove = moveToward(safe, neededPosition[0], neededPosition[1]);
                return setMessage(chosenMove);
            } else {
                var safe = [1, 1, 1, 1, 1, 1, 1, 0, 0];
                for (var i = 0; i < 7; i++){
                    if (enemyCanKillAtPos(i, false, false)){
                        safe[i] = 0;
                    }
                }
                var chosenMove = moveToward(safe, neededPosition[0], neededPosition[1]);
                return setMessage(chosenMove);
            }
        }
        
        var safe = [1, 1, 1, 1, 1, 1, 1, 1, 1];
        
        var canFindSphi = false;
        var isWhole = false;
        var sphiTopX = 0;
        var sphiTopY = 0;
        
        for (var enemy in eNear){
            if (enemy.id == 2867 || enemy.id == 21487) {
                if (enemy.x == sphiTopX && enemy.y == sphiTopY){
                    continue;
                }
                if (canFindSphi){
                    isWhole = true;
                }
                canFindSphi = true;
                sphiTopX = enemy.x;
                sphiTopY = Math.min(enemy.y, sphiTopY);
            }
        }
        
        if (canFindSphi) {
            var deltaX = sphiTopX - leftX;
            var deltaY = sphiTopY - leftY;
            
            if (deltaX >= -1 && deltaX <= 2 && (isWhole ? deltaY >= -2 && deltaY <= 1 : Math.abs(deltaY) <= 1)) { // Kill sphi!!!!
                var enemyX = sphiTopX;
                var enemyY;
                if (deltaY == -2){
                    enemyY = sphiTopY + 1;
                } else {
                    enemyY = sphiTopY;
                }
                var chosenMove = moveToward(safe, enemyX, enemyY);
                return setMessage(chosenMove);
            }
            
            for (var i = 0; i < safe.length; i++){
                if (enemyCanKillAtPos(i, true, true)){
                    safe[i] = 0;
                }
            }
            var chosenMove = moveTowardEnemy(safe, sphiTopX, sphiTopY);
            return setMessage(chosenMove);
        }
        
        for (var i = 0; i < safe.length; i++){
            if (enemyCanKillAtPos(i, true, false)){
                safe[i] = 0;
            }
        }
        
        var target;
        
        if (eNear.length == 0) {
            target = searchPattern();
            var chosenMove = moveToward(safe, target.x, target.y);
            return setMessage(chosenMove);
        } else {
            target = eNear[0];
            var chosenMove = moveTowardEnemy(safe, target.x, target.y);
            return setMessage(chosenMove);
        }
        
        //TODO
        
        for (var i = 0; i < safe.length; i++){
            if (enemyCanKillAtPos(i, true, false)){
                safe[i] = 0;
            }
        }
        
    }

}
