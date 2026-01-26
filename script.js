// ============================================
// CONFIGURATION - Edit this map to add/remove sounds
// ============================================
const SOUND_MAP = {
      1: 'sounds/Cordes/Exercice1/1.m4a',
      2: 'sounds/Cordes/Exercice1/2.m4a',
      3: 'sounds/Cordes/Exercice1/3.m4a',
      4: 'sounds/Cordes/Exercice1/4.m4a',
      5: 'sounds/Cordes/Exercice1/5.mp3'
};
// ============================================

// State
let currentAudio = null;
let currentButtonId = null;

// Initialize the player
function init() {
    const grid = document.getElementById('buttonGrid');
    grid.innerHTML = '';
    
    // Create buttons based on SOUND_MAP
    Object.keys(SOUND_MAP).forEach(id => {
        const button = createButton(id);
        grid.appendChild(button);
    });
}

// Create a single button
function createButton(id) {
    const button = document.createElement('button');
    button.className = 'sound-button';
    button.dataset.id = id;
    button.innerHTML = id;
    button.addEventListener('click', () => handleButtonClick(id));
    
    // For iPad Safari - enable audio on touch
    button.addEventListener('touchstart', () => {}, { passive: true });
    
    return button;
}

// Handle button click
function handleButtonClick(id) {
    // If clicking the same button that's playing, stop it
    if (currentButtonId === id && currentAudio && !currentAudio.paused) {
        stopCurrentSound();
        return;
    }
    
    // Stop any currently playing sound
    stopCurrentSound();
    
    // Play the new sound
    playSound(id);
}

// Play a sound
function playSound(id) {
    const soundFile = SOUND_MAP[id];
    if (!soundFile) return;
    
    currentAudio = new Audio(soundFile);
    currentButtonId = id;
    
    // Update button to show stop icon
    updateButtonState(id, true);
    
    // Handle sound ending
    currentAudio.addEventListener('ended', () => {
        stopCurrentSound();
    });
    
    // Handle errors
    currentAudio.addEventListener('error', () => {
        console.error(`Error loading sound: ${soundFile}`);
        stopCurrentSound();
    });
    
    // Play the sound
    currentAudio.play().catch(error => {
        console.error('Playback error:', error);
        stopCurrentSound();
    });
}

// Stop current sound
function stopCurrentSound() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    
    if (currentButtonId) {
        updateButtonState(currentButtonId, false);
        currentButtonId = null;
    }
}

// Update button appearance
function updateButtonState(id, isPlaying) {
    const button = document.querySelector(`.sound-button[data-id="${id}"]`);
    if (!button) return;
    
    if (isPlaying) {
        button.innerHTML = '<div class="stop-icon"></div>';
        button.classList.add('playing');
    } else {
        button.innerHTML = id;
        button.classList.remove('playing');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
