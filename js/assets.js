assets = {
    skierCrash: 'img/skier_crash.png',
    skierLeft: 'img/skier_left.png',
    skierLeftDown: 'img/skier_left_down.png',
    skierDown: 'img/skier_down.png',
    skierRightDown: 'img/skier_right_down.png',
    skierRight: 'img/skier_right.png',
    skierJump: 'img/skier_jump_1.png',
    tree: 'img/tree_1.png',
    treeCluster: 'img/tree_cluster.png',
    rock1: 'img/rock_1.png',
    rock2: 'img/rock_2.png',
}


var loadedAssets = {}
var obstacleTypes = ['tree', 'treeCluster', 'rock1', 'rock2'];
var obstacles = [];

var loadAssets = function () {
    var assetPromises = []

    _.each(assets, function (asset, assetName) {
        var assetImage = new Image()
        var assetDeferred = new $.Deferred()

        assetImage.onload = function () {
            assetImage.width /= 2
            assetImage.height /= 2

            loadedAssets[assetName] = assetImage
            assetDeferred.resolve()
        }
        assetImage.src = asset

        assetPromises.push(assetDeferred.promise())
    })

    return $.when.apply($, assetPromises)
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