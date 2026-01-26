// ============================================
// MUSIC PLAYER APP
// ============================================

class MusicPlayerApp {
    constructor() {
        this.currentExercise = null;
        this.audioElements = {};
        this.currentAudio = null;
        this.currentButtonKey = null;
        
        this.indexPage = document.getElementById('index-page');
        this.playerPage = document.getElementById('player-page');
        this.exerciseList = document.getElementById('exercise-list');
        this.exerciseTitle = document.getElementById('exercise-title');
        this.soundButtonsContainer = document.getElementById('sound-buttons');
        this.backButton = document.getElementById('back-button');
        
        this.init();
    }
    
    init() {
        this.renderExerciseList();
        this.setupEventListeners();
        this.handleInitialState();
    }
    
    renderExerciseList() {
        this.exerciseList.innerHTML = '';
        
        EXERCISES.forEach((exercise, index) => {
            const button = document.createElement('button');
            button.className = 'exercise-button';
            button.textContent = exercise.exerciseName;
            button.addEventListener('click', () => this.openExercise(index));
            this.exerciseList.appendChild(button);
        });
    }
    
    setupEventListeners() {
        this.backButton.addEventListener('click', () => this.goBack());
        
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page === 'player') {
                this.showPlayer(event.state.exerciseIndex, false);
            } else {
                this.showIndex(false);
            }
        });
    }
    
    handleInitialState() {
        const hash = window.location.hash;
        if (hash.startsWith('#exercise-')) {
            const index = parseInt(hash.replace('#exercise-', ''), 10);
            if (!isNaN(index) && index >= 0 && index < EXERCISES.length) {
                this.showPlayer(index, false);
                history.replaceState({ page: 'player', exerciseIndex: index }, '');
                return;
            }
        }
        history.replaceState({ page: 'index' }, '');
    }
    
    openExercise(index) {
        history.pushState({ page: 'player', exerciseIndex: index }, '', `#exercise-${index}`);
        this.showPlayer(index, true);
    }
    
    goBack() {
        history.back();
    }
    
    showIndex(animate = true) {
        this.stopCurrentSound();
        this.playerPage.classList.add('hidden');
        this.indexPage.classList.remove('hidden');
        window.location.hash = '';
    }
    
    showPlayer(exerciseIndex, animate = true) {
        this.stopCurrentSound();
        this.currentExercise = EXERCISES[exerciseIndex];
        this.exerciseTitle.textContent = this.currentExercise.exerciseName;
        
        this.renderSoundButtons();
        this.preloadSounds();
        
        this.indexPage.classList.add('hidden');
        this.playerPage.classList.remove('hidden');
    }
    
    renderSoundButtons() {
        this.soundButtonsContainer.innerHTML = '';
        
        const soundKeys = Object.keys(this.currentExercise.sounds).sort((a, b) => a - b);
        
        soundKeys.forEach(key => {
            const button = document.createElement('button');
            button.className = 'sound-button';
            button.dataset.key = key;
            button.textContent = key;
            button.addEventListener('click', () => this.handleButtonClick(key));
            this.soundButtonsContainer.appendChild(button);
        });
    }
    
    preloadSounds() {
        this.audioElements = {};
        
        Object.entries(this.currentExercise.sounds).forEach(([key, path]) => {
            const audio = new Audio(path);
            audio.preload = 'auto';
            
            // When audio ends, reset button to number
            audio.addEventListener('ended', () => {
                if (this.currentButtonKey === key) {
                    this.updateButtonState(key, false);
                    this.currentAudio = null;
                    this.currentButtonKey = null;
                }
            });
            
            this.audioElements[key] = audio;
        });
    }
    
    handleButtonClick(key) {
        // If clicking the currently playing button, stop it
        if (this.currentButtonKey === key && this.currentAudio) {
            this.stopCurrentSound();
            return;
        }
        
        // Stop any currently playing sound
        this.stopCurrentSound();
        
        // Play the new sound
        this.playSound(key);
    }
    
    playSound(key) {
        const audio = this.audioElements[key];
        if (!audio) return;
        
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
        
        this.currentAudio = audio;
        this.currentButtonKey = key;
        this.updateButtonState(key, true);
    }
    
    stopCurrentSound() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }
        
        if (this.currentButtonKey) {
            this.updateButtonState(this.currentButtonKey, false);
        }
        
        this.currentAudio = null;
        this.currentButtonKey = null;
    }
    
    updateButtonState(key, isPlaying) {
        const button = this.soundButtonsContainer.querySelector(`[data-key="${key}"]`);
        if (!button) return;
        
        if (isPlaying) {
            button.innerHTML = '<div class="stop-icon"></div>';
            button.classList.add('playing');
        } else {
            button.textContent = key;
            button.classList.remove('playing');
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayerApp();
});
