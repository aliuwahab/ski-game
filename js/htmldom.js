/* Scoreboard Elements */
let gameDetailsElem = $('<div id="gamedetails"></div>')
let scoreTextElem = $('<h2 class="scoretext">SCORE</h2>')
let highScoreElem = $(
    '<p class="highscore" title="Click 5 times to reset"></p>'
)
let scoreCounterElem = $('<p class="timer"></p>')
let instructionElement = $(
    '<p class="instruction">Use the arrows keys for directions <br> Left Arrow ==>  Left Move<br> Right Arrow ==> Right Move <br> Down Arrow ==> Down Move<br> SpaceBar ==> Jump <br> Escape key ==> Pause</p>'
)


let restartTextElem = $('<div class="restarttext"></div>')