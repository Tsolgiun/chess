// Sound effect utility for chess moves
const moveSound = new Audio('/sounds/move.mp3');
const captureSound = new Audio('/sounds/capture.mp3');
const checkSound = new Audio('/sounds/check.mp3');

export const loadSounds = () => {
    // Preload sounds
    [moveSound, captureSound, checkSound].forEach(sound => {
        sound.load();
    });
};

export const playMoveSound = (move, isCheck = false) => {
    try {
        if (isCheck) {
            checkSound.currentTime = 0;
            checkSound.play();
        } else if (move.includes('x')) {
            captureSound.currentTime = 0;
            captureSound.play();
        } else {
            moveSound.currentTime = 0;
            moveSound.play();
        }
    } catch (error) {
        console.warn('Failed to play sound:', error);
    }
};
