var playAudio = {

    movementAudio: new Audio('../audio/movement.mp3'),
    crashAudio: new Audio('../audio/crash.mp3'),

    movementSound: function () {
        this.movementAudio.play()
        this.crashAudio.pause()
        this.crashAudio.currentTime = 0.0
    },

    crashSound: function () {
        this.crashAudio.play()
        this.movementAudio.pause()
        this.movementAudio.currentTime = 0.0
    },

    stopAudio: function () {
        this.crashAudio.pause()
        this.crashAudio.currentTime = 0.0
        this.movementAudio.pause()
        this.movementAudio.currentTime = 0.0
    }

}