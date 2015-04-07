var myself = 38926;
var messages = getMsg(myself).split(';');
var minimalDistanceToFriend = 2;
var chosenMove = null;
var newDistanceToFriend = null;
var minimalVerticalDistanceToEnemy = null, minimalHorizontalDistanceToEnemy = null;
var closestFriend = null;
var closestEnemy = null;
var possibleVictims = [];
var possibleMoves = [
    {newX: x, newY: y},
    {newX: x + 1, newY: y},
    {newX: x - 1, newY: y},
    {newX: x + 1, newY: y - 1},
    {newX: x - 1, newY: y - 1},
    {newX: x - 1, newY: y + 1},
    {newX: x + 1, newY: y + 1}
];

var calculateDistance = function(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

var iAmInDanger = function(meX, meY, himX, himY) {
    return (Math.abs(meY - himY) === 1 && Math.abs(meX - himX) <= 1);
};

var iCanKillHim = function(meX, meY, himX, himY) {
    return (Math.abs(meX - himX) === 1 && Math.abs(meY - himY) <= 1);
};

var setMessage = function() {
    messages[0] = ("000" + x).substr(-3, 3);
    messages[1] = ("000" + y).substr(-3, 3);
    setMsg(messages.join(';'));
}

for (i = 0; i < possibleMoves.length; i++) {
    if (possibleMoves[i].newX < 0 || possibleMoves[i].newY < 0 || possibleMoves[i].newX > 127 || possibleMoves[i].newY > 127) {
        possibleMoves[i] = null;
    }
}

for (var i = 0; i < eNear.length; i++) {
    if (closestEnemy === null || calculateDistance(x, y, closestEnemy.x, closestEnemy.y) > calculateDistance(x, y, eNear[i].x, eNear[i].y)) {
        closestEnemy = eNear[i];
    }
    if (Math.abs(x - eNear[i].x) <= 2 && Math.abs(y - eNear[i].y) <= 2) {
        possibleVictims.push(eNear[i]);
    }
}

for (i = 0; i < tNear.length; i++) {
    if (closestFriend === null || calculateDistance(x, y, closestFriend.x, closestFriend.y) > calculateDistance(x, y, tNear[i].x, tNear[i].y)) {
        closestFriend = tNear[i];
    }
}    

for (i = 0; i < possibleMoves.length; i++) {
    for (var j = 0; j < possibleVictims.length; j++) {
        if (possibleMoves[i] !== null && iAmInDanger(possibleMoves[i].newX, possibleMoves[i].newY, possibleVictims[j].x, possibleVictims[j].y)) {
            possibleMoves[i] = null;
        }
    }
}

for (i = 0; i < possibleMoves.length; i++) {
    for (j = 0; j < possibleVictims.length; j++) {
        if (possibleMoves[i] !== null && possibleMoves[i].newX === possibleVictims[j].x && possibleMoves[i].newY === possibleVictims[j].y) {
            messages[2] = 0;
            setMessage();
            return i;
        }
    }
}

if (possibleVictims.length > 0) {
    if (iAmInDanger(x, y, possibleVictims[0].x, possibleVictims[0].y)) {
        if (closestFriend !== null) {
            for (i = 0; i < possibleMoves.length; i++) {
                if (possibleMoves[i] !== null) {
                    var distance = calculateDistance(possibleMoves[i].newX, possibleMoves[i].newY, closestFriend.x, closestFriend.y);
                    if (newDistanceToFriend === null || (distance < newDistanceToFriend && distance >= minimalDistanceToFriend)) {
                        newDistanceToFriend = distance;
                        chosenMove = i;
                    }
                }
            }
            messages[2] = 0;
            setMessage();
            return chosenMove;
        }
        else {
            var aggressiveMoves = [];
            var randomMoves = [];

            for (i = 0; i < possibleMoves.length; i++) {
                if (possibleMoves[i] !== null) {
                    if (iCanKillHim(possibleMoves[i].newX, possibleMoves[i].newY, possibleVictims[0].x, possibleVictims[0].y)) {
                        aggressiveMoves.push(i);
                    }
                    randomMoves.push(i);
                }
            }
            var approachCount = messages[2] || 0;
            if (approachCount < 5 && aggressiveMoves.length > 0) {
                messages[2] = approachCount + 1;
                chosenMove = aggressiveMoves[Math.floor(Math.random() * aggressiveMoves.length)];
                setMessage();
                return chosenMove;
            } 
            else {
                chosenMove = randomMoves[Math.floor(Math.random() * randomMoves.length)];
                setMessage();
                return chosenMove;
            }
        }
    }
}

if (closestEnemy != null) {
    for (i = 1; i < possibleMoves.length; i++) {
        if (possibleMoves[i] !== null) {
            var verticalDistance = Math.abs(possibleMoves[i].newY - closestEnemy.y);
            var horizontalDistance = Math.abs(possibleMoves[i].newX - closestEnemy.x);
            if (minimalVerticalDistanceToEnemy === null || verticalDistance <= minimalVerticalDistanceToEnemy) {
                if (minimalVerticalDistanceToEnemy !== null && verticalDistance === minimalVerticalDistanceToEnemy) {
                    if (minimalHorizontalDistanceToEnemy === null || horizontalDistance <= minimalHorizontalDistanceToEnemy) {
                        minimalHorizontalDistanceToEnemy = horizontalDistance;
                        chosenMove = i;
                    }
                }
                else {
                    minimalVerticalDistanceToEnemy = verticalDistance;
                    minimalHorizontalDistanceToEnemy = horizontalDistance;
                    chosenMove = i;
                }                                        
            }
        }            
    }
    messages[2] = 0;
    setMessage();
    return chosenMove;
}

var seekStatus = messages[3] || 0;
var seekCount = messages[4] || 0;
seekStatus = parseInt(seekStatus, 10);
seekCount = parseInt(seekCount, 10);

switch (seekStatus) {
    case 0:
        if (x < 16) {
            seekCount = 0;
            if (y > 111) {
                seekStatus = 4;
            }
            else {
                seekStatus = 1;
            }                
        }
        else {
            chosenMove = 2;
        }
        break;
    case 1:
        seekCount++;
        if (y > 111 || seekCount > 31) {
            seekStatus = 2;
        }            
        else {
            if (seekCount % 2 === 0) {
                chosenMove = 5;
            }
            else {
                chosenMove = 6;
            }
        }
        break;
    case 2:
        if (x > 111) {
            seekCount = 0;
            if (y > 111) {
                seekStatus = 4;
            }
            else {
                seekStatus = 3;
            }                   
        }
        else {
            chosenMove = 1;
        }
        break;
    case 3:
        seekCount++;
        if (y > 111 || seekCount > 31) {
            seekStatus = 0;
        }
        else {
            if (seekCount % 2 === 0) {
                chosenMove = 5;
            }
            else {
                chosenMove = 6;
            }
        }
        break;
    case 4:
        seekCount++;
        if (y < 16) {
            if (x > 63) {
                seekStatus = 0;
            }
            else {
                seekStatus = 2;
            }
        }
        else {
            if (seekCount % 2 === 0) {
                chosenMove = 3;
            }
            else {
                chosenMove = 4;
            }
        }
        break;
}

messages[2] = 0;
messages[3] = seekStatus;
messages[4] = seekCount;    

setMessage();
return chosenMove;
