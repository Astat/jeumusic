// ============================================
// MUSIC PLAYER APP
// ============================================

class MusicPlayerApp {
    constructor() {
        this.currentExercise = null;
        this.audioElements = {};
        
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
        this.stopAllSounds();
        this.playerPage.classList.add('hidden');
        this.indexPage.classList.remove('hidden');
        window.location.hash = '';
    }
    
    showPlayer(exerciseIndex, animate = true) {
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
            button.textContent = key;
            button.addEventListener('click', () => this.playSound(key, button));
            this.soundButtonsContainer.appendChild(button);
        });
    }
    
    preloadSounds() {
        this.audioElements = {};
        
        Object.entries(this.currentExercise.sounds).forEach(([key, path]) => {
            const audio = new Audio(path);
            audio.preload = 'auto';
            this.audioElements[key] = audio;
        });
    }
    
    playSound(key, button) {
        const audio = this.audioElements[key];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play failed:', e));
            
            button.classList.remove('playing');
            void button.offsetWidth;
            button.classList.add('playing');
        }
    }
    
    stopAllSounds() {
        Object.values(this.audioElements).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayerApp();
});
