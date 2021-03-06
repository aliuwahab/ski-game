$(document).ready(function () {
    let timerInterval
    let gameHasPaused = false

    function pauseGame() {
        playAudio.stopAudio()
        $('.restarttext').text('Game Paused')
        clearTimeout(timerInterval)
        gameHasStarted = false
        startCountingScores(gameHasStarted)
        gameHasPaused = true
    }

    var gameWidth = window.innerWidth
    var gameHeight = window.innerHeight

    var canvas = $('<canvas></canvas>')
        .attr('width', gameWidth * window.devicePixelRatio)
        .attr('height', gameHeight * window.devicePixelRatio)
        .css({
            width: gameWidth + 'px',
            height: gameHeight + 'px'
        })


    let yourCurrentScore = 0
    $(scoreCounterElem).text(yourCurrentScore)
    highScoreElem.text('High Score : ' + localStorage.getItem('highScore') || 0)

    let gameHasStarted = false
    let gameHasEnded = false

    function startCountingScores(gameHasStarted) {

        if (skierDirection !== 5 && gameHasStarted === true) {
            timerInterval = setInterval(function () {
                $(scoreCounterElem).text((yourCurrentScore += 10))
            }, 100)
            gameHasStarted = false
            gameHasEnded = false
        }
    }

    function resetGame() {
        skierDirection = 5
        gameHasStarted = false
        gameHasEnded = false
        yourCurrentScore = 0

        skierMapX = 0
        skierMapY = 0
        obstacles = []
        $('.restarttext').text('')
        $(scoreCounterElem).text(yourCurrentScore)
        highScoreElem.text('High Score : ' + localStorage.getItem('highScore') || 0)

        loadAssets().then(function () {
            placeInitialObstacles()
            animationFrameId = requestAnimationFrame(gameLoop)
        })
    }

    function continueAfterPause() {
        gameHasStarted = true
        playAudio.movementSound()
        startCountingScores(gameHasStarted)
        $('.restarttext').text('')

        loadAssets().then(function () {
            animationFrameId = requestAnimationFrame(gameLoop)
        })
    }

    function stopCountingScoresOnly() {
        playAudio.stopAudio()
        clearInterval(timerInterval)
    }

    function stopCountingScores() {
        playAudio.stopAudio()
        clearInterval(timerInterval)
        cancelAnimationFrame(animationFrameId)
        $(scoreCounterElem).html(
            'Game Over!!!<br> You scored : ' + yourCurrentScore
        )

        let savedHighScore = localStorage.getItem('highScore')
        if (yourCurrentScore > Number(savedHighScore)) {
            $(scoreCounterElem).html(
                'Game Over!!!<br> New High Score : ' + yourCurrentScore
            )
            localStorage.setItem('highScore', yourCurrentScore + '')
            highScoreElem.text('High Score : ' + localStorage.getItem('highScore'))
        } else {
            $(scoreCounterElem).html(
                'Game Over!!!<br> You scored : ' + yourCurrentScore
            )
        }
        $('.restarttext').text('Press any key to restart')

        gameHasEnded = true
    }

    $('body').append(canvas).append(gameDetailsElem)
    $('#gamedetails')
        .append(scoreTextElem)
        .append(highScoreElem)
        .append(scoreCounterElem)
        .append(instructionElement)
        .append(restartTextElem)

    let clickresetHighScore = 0
    $('.highscore').on('click', function () {
        if (clickresetHighScore > 4) {
            localStorage.setItem('highScore', '0')
            highScoreElem.text('High Score : ' + localStorage.getItem('highScore'))
            clickresetHighScore = 0
        }
        clickresetHighScore++
    })

    var ctx = canvas[0].getContext('2d')

    var skierDirection = 5
    var skierMapX = 0
    var skierMapY = 0
    var skierSpeed = 8

    var clearCanvas = function () {
        ctx.clearRect(0, 0, gameWidth, gameHeight)
    }

    var moveSkier = function () {
        switch (skierDirection) {
            case 2: // left
                skierMapX -= Math.round(skierSpeed / 1.4142)
                skierMapY += Math.round(skierSpeed / 1.4142)

                placeNewObstacle(skierDirection)
                break
            case 3: // down
                skierMapY += skierSpeed

                placeNewObstacle(skierDirection)
                break
            case 4: // right
                skierMapX += skierSpeed / 1.4142
                skierMapY += skierSpeed / 1.4142

                placeNewObstacle(skierDirection)
                break

            case 6: // spacebar jump
                skierMapY += skierSpeed

                placeNewObstacle(skierDirection)
                break
        }
    }

    var getSkierAsset = function () {
        var skierAssetName
        switch (skierDirection) {
            case 0:
                skierAssetName = 'skierCrash'
                break
            case 1:
                skierAssetName = 'skierLeft'
                break
            case 2:
                skierAssetName = 'skierLeftDown'
                break
            case 3:
                skierAssetName = 'skierDown'
                break
            case 4:
                skierAssetName = 'skierRightDown'
                break
            case 5:
                skierAssetName = 'skierRight'
                break
            case 6:
                skierAssetName = 'skierJump'
                break
            default:
                skierAssetName = 'skierCrash'
                skierDirection = 0
                break
        }

        return skierAssetName
    }

    var drawSkier = function () {
        var skierAssetName = getSkierAsset()
        var skierImage = loadedAssets[skierAssetName]
        var x = (gameWidth - skierImage.width) / 2 // get the middle x position
        var y = (gameHeight - skierImage.height) / 2 // get the middle y position

        // this always draws the skier in the middle of the screen.
        ctx.drawImage(skierImage, x, y, skierImage.width, skierImage.height)
    }

    var drawObstacles = function () {
        var newObstacles = []

        _.each(obstacles, function (obstacle) {
            var obstacleImage = loadedAssets[obstacle.type]
            var x = obstacle.x - skierMapX - obstacleImage.width / 2
            var y = obstacle.y - skierMapY - obstacleImage.height / 2

            if (x < -100 || x > gameWidth + 50 || y < -100 || y > gameHeight + 50) {
                return
            }

            ctx.drawImage(
                obstacleImage,
                x,
                y,
                obstacleImage.width,
                obstacleImage.height
            )

            newObstacles.push(obstacle)
        })

        obstacles = newObstacles
    }

    var placeInitialObstacles = function () {
        var numberObstacles = Math.ceil(
            _.random(5, 7) * (gameWidth / 800) * (gameHeight / 500)
        )

        var minX = -50
        var maxX = gameWidth + 50
        var minY = gameHeight / 2 + 100
        var maxY = gameHeight + 50

        for (var i = 0; i < numberObstacles; i++) {
            placeRandomObstacle(minX, maxX, minY, maxY)
        }

        obstacles = _.sortBy(obstacles, function (obstacle) {
            var obstacleImage = loadedAssets[obstacle.type]
            return obstacle.y + obstacleImage.height
        })
    }

    var placeNewObstacle = function (direction) {
        var shouldPlaceObstacle = _.random(1, 8)
        if (shouldPlaceObstacle !== 8) {
            return
        }

        var leftEdge = skierMapX
        var rightEdge = skierMapX + gameWidth
        var topEdge = skierMapY
        var bottomEdge = skierMapY + gameHeight

        switch (direction) {
            case 1: // left
                placeRandomObstacle(leftEdge - 50, leftEdge, topEdge, bottomEdge)
                break
            case 2: // left down
                placeRandomObstacle(leftEdge - 50, leftEdge, topEdge, bottomEdge)
                placeRandomObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50)
                break
            case 3: // down
                placeRandomObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50)
                break
            case 4: // right down
                placeRandomObstacle(rightEdge, rightEdge + 50, topEdge, bottomEdge)
                placeRandomObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50)
                break
            case 5: // right
                placeRandomObstacle(rightEdge, rightEdge + 50, topEdge, bottomEdge)
                break
            case 6: // up
                placeRandomObstacle(leftEdge, rightEdge, topEdge - 50, topEdge)
                break
        }
    }

    var placeRandomObstacle = function (minX, maxX, minY, maxY) {
        var obstacleIndex = _.random(0, obstacleTypes.length - 1)

        var position = calculateOpenPosition(minX, maxX, minY, maxY)

        obstacles.push({
            type: obstacleTypes[obstacleIndex],
            x: position.x,
            y: position.y
        })
    }

    var calculateOpenPosition = function (minX, maxX, minY, maxY) {
        var x = _.random(minX, maxX)
        var y = _.random(minY, maxY)

        var foundCollision = _.find(obstacles, function (obstacle) {
            return (
                x > obstacle.x - 50 &&
                x < obstacle.x + 50 &&
                y > obstacle.y - 50 &&
                y < obstacle.y + 50
            )
        })

        if (foundCollision) {
            return calculateOpenPosition(minX, maxX, minY, maxY)
        } else {
            return {
                x: x,
                y: y
            }
        }
    }

    var checkIfSkierHitObstacle = function () {
        var skierAssetName = getSkierAsset()
        var skierImage = loadedAssets[skierAssetName]
        var skierRect = {
            left: skierMapX + gameWidth / 2,
            right: skierMapX + skierImage.width + gameWidth / 2,
            top: skierMapY + skierImage.height - 5 + gameHeight / 2,
            bottom: skierMapY + skierImage.height + gameHeight / 2
        }

        var collision = _.find(obstacles, function (obstacle) {
            var obstacleImage = loadedAssets[obstacle.type]
            var obstacleRect = {
                left: obstacle.x,
                right: obstacle.x + obstacleImage.width,
                top: obstacle.y + obstacleImage.height - 5,
                bottom: obstacle.y + obstacleImage.height
            }

            return intersectRect(skierRect, obstacleRect)
        })

        if (collision) {
            // playAudio.crashAudio.play()
            playAudio.crashSound()
            skierDirection = 0
            stopCountingScores()
            gameHasEnded = true
        }
    }

    var intersectRect = function (r1, r2) {
        return !(r2.left > r1.right ||
            r2.right < r1.left ||
            r2.top > r1.bottom ||
            r2.bottom < r1.top)
    }

    var gameLoop = function () {
        if (gameHasEnded || gameHasPaused) {
            return
        }

        ctx.save()
        // Retina support
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

        clearCanvas()

        moveSkier()

        checkIfSkierHitObstacle()

        drawSkier()

        drawObstacles()

        ctx.restore()

        animationFrameId = requestAnimationFrame(gameLoop)
    }






    var setupKeyhandler = function () {
        $(window).keydown(function (event) {
            if (gameHasEnded) {
                resetGame()
                event.preventDefault()
                return
            }

            if (gameHasPaused) {
                if (event.which == 27) {
                    gameHasPaused = false
                    continueAfterPause()
                }
                event.preventDefault()
                return
            }

            switch (event.which) {
                case 37: // left
                    if (skierDirection === 1) {
                        skierMapX -= skierSpeed
                        placeNewObstacle(skierDirection)
                    } else {
                        if (skierDirection > 1) {}
                        skierDirection--
                    }
                    event.preventDefault()
                    break
                case 39: // right
                    if (skierDirection === 5) {
                        skierMapX += skierSpeed
                        placeNewObstacle(skierDirection)
                    } else {
                        if (skierDirection > -1 && skierDirection < 7) {}
                        skierDirection++
                    }
                    event.preventDefault()
                    break
                case 38: // up
                    if (skierDirection === 1 || skierDirection === 5) {
                        skierMapY -= skierSpeed
                        placeNewObstacle(6)
                    }
                    event.preventDefault()
                    break
                case 40: // down
                    skierDirection = 3
                    event.preventDefault()
                    break

                case 32: // spacebar for jump
                    skierDirection = 6
                    event.preventDefault()
                    break

                case 27: // escape key for pause
                    pauseGame()
                    gameHasStarted = true
                    event.preventDefault()
                    break
            }
            if (skierDirection !== 5 && !gameHasStarted) {
                gameHasStarted = true
                startCountingScores(gameHasStarted) // the game starts from here
                playAudio.movementSound()
            }
        })
    }

    let animationFrameId

    var initGame = function () {
        setupKeyhandler()
        loadAssets().then(function () {
            placeInitialObstacles()

            animationFrameId = requestAnimationFrame(gameLoop)
        })
    }

    initGame(gameLoop)
})