// ===================================================================================
// MATCH STATE & HISTORY
// ===================================================================================
let match = {
    team1: '',
    team2: '',
    toss: { winner: '', decision: '' },
    innings: 1,
    maxOvers: 3,
    current: {
        battingTeam: '',
        bowlingTeam: '',
        score: { runs: 0, wickets: 0, extras: 0 },
        overs: 0,
        balls: 0,
        striker: null,
        nonStriker: null,
        currentBowler: null,
        thisOver: [],
        target: null
    },
    allBatters: [],
    allBowlers: [],
    commentary: []
};

let matchHistory = [];
let isExtraBall = false;

// ===================================================================================
// SETUP PAGE FUNCTION
// ===================================================================================
function startMatch() {
    const details = {
        team1: document.getElementById('team1').value,
        team2: document.getElementById('team2').value,
        tossWinner: document.getElementById('tossWinner').value,
        tossDecision: document.getElementById('tossDecision').value,
        maxOvers: parseInt(document.getElementById('maxOvers').value) || 3
    };
    
    if (!details.team1 || !details.team2 || !details.tossWinner || !details.tossDecision || !details.maxOvers) {
        alert('Please fill all fields!');
        return;
    }
    
    localStorage.removeItem('matchData');
    localStorage.setItem('matchDetails', JSON.stringify(details));
    window.location.href = 'live.html';
}

// ===================================================================================
// LIVE MATCH INITIALIZATION
// ===================================================================================
async function initMatch() {
    const storedMatchData = localStorage.getItem('matchData');
    if (storedMatchData) {
        match = JSON.parse(storedMatchData);
        updateDisplay();
        return;
    }

    const stored = JSON.parse(localStorage.getItem('matchDetails'));
    if (!stored) {
        alert('Match details missing! Redirecting to setup...');
        window.location.href = 'setup.html';
        return;
    }
    
    match.team1 = stored.team1;
    match.team2 = stored.team2;
    match.toss = { winner: stored.tossWinner, decision: stored.tossDecision };
    match.maxOvers = stored.maxOvers || 3;
    match.innings = 1;
    
    match.current.battingTeam = stored.tossDecision === 'bat' ? stored.tossWinner : (stored.tossWinner === 'team1' ? 'team2' : 'team1');
    match.current.bowlingTeam = match.current.battingTeam === 'team1' ? 'team2' : 'team1';
    
    const strikerName = await getPlayerFromModal("Enter striker's name:");
    const nonStrikerName = await getPlayerFromModal("Enter non-striker's name:");
    const bowlerName = await getPlayerFromModal("Enter opening bowler's name:");
    
    match.current.striker = createBatter(strikerName, true);
    match.current.nonStriker = createBatter(nonStrikerName, false);
    match.current.currentBowler = createBowler(bowlerName);
    
    match.allBatters.push(match.current.striker, match.current.nonStriker);
    match.allBowlers.push(match.current.currentBowler);
    
    updateDisplay();
}

// ===================================================================================
// PLAYER & LIST MANAGEMENT HELPERS
// ===================================================================================
function createBatter(name, isStriker) {
    return { name, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, striker: isStriker, dismissal: '' };
}

function createBowler(name) {
    return { name, overs: 0, maidens: 0, runs: 0, wickets: 0, balls: 0 };
}

function isPlayerInList(list, player) {
    return list.some(p => p.name === player.name);
}

function updatePlayerInList(list, player) {
    const index = list.findIndex(p => p.name === player.name);
    if (index > -1) list[index] = player;
}

function findOrCreatePlayer(list, name, createFn) {
    let player = list.find(p => p.name === name);
    if (!player) {
        player = createFn(name);
        list.push(player);
    }
    return player;
}

function swapStrike() {
    [match.current.striker, match.current.nonStriker] = [match.current.nonStriker, match.current.striker];
    match.current.striker.striker = true;
    match.current.nonStriker.striker = false;
}

// ===================================================================================
// CORE SCORING LOGIC
// ===================================================================================
function addRuns(runs) {
    saveState();
    match.current.striker.runs += runs;
    match.current.striker.balls++;
    match.current.score.runs += runs;
    match.current.currentBowler.runs += runs;
    
    if (runs === 4) match.current.striker.fours++;
    if (runs === 6) match.current.striker.sixes++;
    
    if (runs % 2 !== 0) swapStrike();
    
    match.current.thisOver.push(runs);
    addCommentary(`${match.current.striker.name} scores ${runs} run${runs !== 1 ? 's' : ''}!`);
    updateBall();
}

async function addWicket() {
    saveState();
    const dismissalType = prompt("Enter dismissal type (e.g., Caught, Bowled, Run Out):") || 'Wicket';
    const outBatterName = match.current.striker.name;

    match.current.score.wickets++;
    if (!dismissalType.toLowerCase().includes('run out')) {
        match.current.currentBowler.wickets++;
    }

    match.current.striker.balls++;
    match.current.striker.out = true;
    match.current.striker.dismissal = dismissalType;
    
    updatePlayerInList(match.allBatters, match.current.striker);
    
    match.current.thisOver.push('W');
    addCommentary(`WICKET! ${outBatterName} is out (${dismissalType})!`);
    updateBall();

    if (match.current.score.wickets >= 10) {
        addCommentary(`All out! End of innings.`);
        endInnings();
        return;
    }
    
    const newBatterName = await getPlayerFromModal("Enter new batter's name:");
    const newBatter = createBatter(newBatterName, true);
    match.current.striker = newBatter;
    if (!isPlayerInList(match.allBatters, newBatter)) {
        match.allBatters.push(newBatter);
    }
    
    updateDisplay();
}

function addExtra(type) {
    saveState();
    match.current.score.extras++;
    match.current.score.runs++;
    match.current.currentBowler.runs++;
    
    const messages = { 'wide': "Wide (+1 run)", 'no-ball': "No Ball (+1 run)", 'bye': "Bye (+1 run)", 'leg-bye': "Leg Bye (+1 run)" };
    const overIcons = { 'wide': 'Wd', 'no-ball': 'Nb', 'bye': 'B', 'leg-bye': 'Lb' };
    
    match.current.thisOver.push(overIcons[type]);
    addCommentary(messages[type]);
    
    if (type === 'wide' || type === 'no-ball') {
        isExtraBall = true;
        updateDisplay();
    } else {
        updateBall();
    }
}

async function updateBall() {
    if (!isExtraBall) {
        match.current.balls++;
        match.current.currentBowler.balls++;
    }
    isExtraBall = false;
    
    if (match.current.balls >= 6) {
        match.current.overs++;
        match.current.balls = 0;
        match.current.currentBowler.overs++;
        match.current.thisOver = [];
        
        swapStrike();
        updatePlayerInList(match.allBowlers, match.current.currentBowler);
        
        const newBowlerName = await getPlayerFromModal("Enter new bowler's name:");
        match.current.currentBowler = findOrCreatePlayer(match.allBowlers, newBowlerName, createBowler);
    }
    
    if (match.current.overs >= match.maxOvers || match.current.score.wickets >= 10) {
        endInnings();
    } else {
        updateDisplay();
    }
}

async function endInnings() {
    updatePlayerInList(match.allBatters, match.current.striker);
    updatePlayerInList(match.allBatters, match.current.nonStriker);
    updatePlayerInList(match.allBowlers, match.current.currentBowler);

    if (match.innings === 1) {
        alert("End of Innings 1!");
        match.current.target = match.current.score.runs + 1;
        match.innings = 2;
        
        [match.current.battingTeam, match.current.bowlingTeam] = [match.current.bowlingTeam, match.current.battingTeam];
        
        match.current.score = { runs: 0, wickets: 0, extras: 0 };
        match.current.overs = 0;
        match.current.balls = 0;
        match.current.thisOver = [];
        
        const strikerName = await getPlayerFromModal("Enter new striker:");
        const nonStrikerName = await getPlayerFromModal("Enter new non-striker:");
        const bowlerName = await getPlayerFromModal("Enter new bowler:");
        
        match.current.striker = findOrCreatePlayer(match.allBatters, strikerName, createBatter);
        match.current.nonStriker = findOrCreatePlayer(match.allBatters, nonStrikerName, createBatter);
        match.current.currentBowler = findOrCreatePlayer(match.allBowlers, bowlerName, createBowler);
        match.current.striker.striker = true;
        
        updateDisplay();
    } else {
        localStorage.setItem('matchData', JSON.stringify(match));
        window.location.href = 'summary.html';
    }
}

// ===================================================================================
// UI & DISPLAY
// ===================================================================================
function updateDisplay() {
    const battingTeamName = match.current.battingTeam === 'team1' ? match.team1 : match.team2;
    
    document.getElementById('scoreDisplay').innerHTML = `
        <h2>${battingTeamName} ${match.current.score.runs}/${match.current.score.wickets}</h2>
        <p>Overs: ${match.current.overs}.${match.current.balls}</p>
        ${match.innings === 2 ? `<p>Target: ${match.current.target}</p>` : ''}
    `;

    document.getElementById('battersDisplay').innerHTML = `
        <div class="batter ${match.current.striker.striker ? 'striker' : ''}">
            🏏 ${match.current.striker.name}<br>
            ${match.current.striker.runs} (${match.current.striker.balls})
        </div>
        <div class="batter ${match.current.nonStriker.striker ? 'striker' : ''}">
            ${match.current.nonStriker.name}<br>
            ${match.current.nonStriker.runs} (${match.current.nonStriker.balls})
        </div>
    `;

    document.getElementById('bowlersDisplay').innerHTML = `
        <div class="bowler">
            🎯 ${match.current.currentBowler.name}<br>
            ${match.current.currentBowler.overs}.${match.current.currentBowler.balls} O, ${match.current.currentBowler.runs} R, ${match.current.currentBowler.wickets} W
        </div>
    `;

    const thisOverHtml = match.current.thisOver.map(ball => `<span class="ball-event">${ball}</span>`).join(' ');
    document.getElementById('thisOverBalls').innerHTML = thisOverHtml;

    localStorage.setItem('matchData', JSON.stringify(match));
}

function addCommentary(text) {
    const over = `${match.current.overs}.${match.current.balls}`;
    const entry = document.createElement('div');
    entry.className = 'commentary-entry';
    entry.textContent = `${over} - ${text}`;
    document.getElementById('commentary').prepend(entry);
}

function getPlayerFromModal(title) {
    return new Promise(resolve => {
        const modal = document.getElementById('playerModal'), input = document.getElementById('modalInput');
        document.getElementById('modalTitle').textContent = title;
        modal.style.display = 'flex';
        input.value = '';
        input.focus();
        document.getElementById('modalConfirm').onclick = () => {
            if (input.value.trim()) {
                modal.style.display = 'none';
                resolve(input.value.trim());
            }
        };
    });
}

// ===================================================================================
// NAVIGATION & STATE HISTORY (UNDO)
// ===================================================================================
function saveState() {
    matchHistory.push(JSON.parse(JSON.stringify(match)));
    if (matchHistory.length > 20) matchHistory.shift();
}

function undoLastAction() {
    if (matchHistory.length > 0) {
        match = matchHistory.pop();
        updateDisplay();
        const commentaryBox = document.getElementById('commentary');
        if (commentaryBox.firstChild) commentaryBox.removeChild(commentaryBox.firstChild);
    } else {
        alert("No more actions to undo!");
    }
}

function goToScorecard() {
    localStorage.setItem('matchData', JSON.stringify(match));
    window.location.href = 'scorecard.html';
}

function resetMatch() {
    localStorage.removeItem('matchData');
    localStorage.removeItem('matchDetails');
    window.location.href = 'setup.html';
}

window.onload = function() {
    if(window.location.pathname.includes('live.html')) {
        initMatch();
    }
};