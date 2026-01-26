// ============================================
// STATE
// ============================================
let currentAudio = null;
let currentButtonId = null;
let currentExercise = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Detect which page we're on
    const exerciseGrid = document.getElementById('exerciseGrid');
    const buttonGrid = document.getElementById('buttonGrid');
    
    if (exerciseGrid) {
        // We're on the index page
        initIndexPage();
    } else if (buttonGrid) {
        // We're on the player page
        initPlayerPage();
    }
});

// Handle browser back button
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page === 'player') {
        // Navigating forward to player
        const exerciseIndex = event.state.exerciseIndex;
        loadExercise(exerciseIndex, false);
    } else if (event.state && event.state.page === 'index') {
        // Navigating back to index
        goToIndex(false);
    } else {
        // Default: go to index
        goToIndex(false);
    }
});

// ============================================
// INDEX PAGE
// ============================================
function initIndexPage() {
    // Set initial history state
    history.replaceState({ page: 'index' }, '', 'index.html');
    
    const grid = document.getElementById('exerciseGrid');
    grid.innerHTML = '';
    
    // Create exercise buttons
    EXERCISES.forEach((exercise, index) => {
        const button = createExerciseButton(exercise.exerciseName, index);
        grid.appendChild(button);
    });
}

function createExerciseButton(name, index) {
    const button = document.createElement('button');
    button.className = 'exercise-button';
    button.textContent = name;
    button.addEventListener('click', () => openExercise(index));
    
    // For iPad Safari
    button.addEventListener('touchstart', () => {}, { passive: true });
    
    return button;
}

function openExercise(index) {
    // Push state to history for back button support
    history.pushState({ page: 'player', exerciseIndex: index }, '', `player.html?exercise=${index}`);
    
    // Navigate to player page
    window.location.href = `player.html?exercise=${index}`;
}

// ============================================
// PLAYER PAGE
// ============================================
function initPlayerPage() {
    // Get exercise index from URL
    const urlParams = new URLSearchParams(window.location.search);
    const exerciseIndex = parseInt(urlParams.get('exercise'), 10);
    
    // Validate exercise index
    if (isNaN(exerciseIndex) || exerciseIndex < 0 || exerciseIndex >= EXERCISES.length) {
        goToIndex(true);
        return;
    }
    
    // Set history state
    history.replaceState({ page: 'player', exerciseIndex: exerciseIndex }, '', `player.html?exercise=${exerciseIndex}`);
    
    // Load the exercise
    loadExercise(exerciseIndex, false);
    
    // Setup back button
    setupBackButton();
}

function loadExercise(index, pushState) {
    currentExercise = EXERCISES[index];
    
    if (!currentExercise) {
        goToIndex(true);
        return;
    }
    
    // Update title
    const titleElement = document.getElementById('exerciseTitle');
    if (titleElement) {
        titleElement.textContent = `🎵 ${currentExercise.exerciseName} 🎵`;
    }
    
    // Update page title
    document.title = `${currentExercise.exerciseName} - Music Player`;
    
    // Create sound buttons
    const grid = document.getElementById('buttonGrid');
    if (grid) {
        grid.innerHTML = '';
        
        Object.keys(currentExercise.sounds).forEach(id => {
            const button = createSoundButton(id);
            grid.appendChild(button);
        });
    }
    
    // Push state if needed
    if (pushState) {
        history.pushState({ page: 'player', exerciseIndex: index }, '', `player.html?exercise=${index}`);
    }
}

function setupBackButton() {
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            stopCurrentSound();
            goToIndex(true);
        });
        
        // For iPad Safari
        backButton.addEventListener('touchstart', () => {}, { passive: true });
    }
}

function goToIndex(navigate) {
    stopCurrentSound();
    
    if (navigate) {
        window.location.href = 'index.html';
    }
}

// ============================================
// SOUND BUTTONS
// ============================================
function createSoundButton(id) {
    const button = document.createElement('button');
    button.className = 'sound-button';
    button.dataset.id = id;
    button.innerHTML = id;
    button.addEventListener('click', () => handleSoundButtonClick(id));
    
    // For iPad Safari - enable audio on touch
    button.addEventListener('touchstart', () => {}, { passive: true });
    
    return button;
}

function handleSoundButtonClick(id) {
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

// ============================================
// AUDIO PLAYBACK
// ============================================
function playSound(id) {
    if (!currentExercise) return;
    
    const soundFile = currentExercise.sounds[id];
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
