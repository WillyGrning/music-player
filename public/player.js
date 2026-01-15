class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.songs = [];
        this.currentSongIndex = 0;
        this.repeatCount = 1;
        this.currentRepeat = 0;
        this.isPlaying = false;
        
        this.init();
    }
    
    async init() {
        // Load songs from PHP API
        await this.loadSongs();
        
        // Setup event listeners
        document.getElementById('play-btn').addEventListener('click', () => this.togglePlay());
        document.getElementById('prev-btn').addEventListener('click', () => this.prevSong());
        document.getElementById('next-btn').addEventListener('click', () => this.nextSong());
        document.getElementById('volume-slider').addEventListener('input', (e) => {
            this.audio.volume = e.target.value / 100;
        });
        document.getElementById('repeat-count').addEventListener('change', (e) => {
            this.repeatCount = parseInt(e.target.value);
        });
        
        // Progress bar
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        document.getElementById('progress-bar').addEventListener('input', (e) => {
            const seekTime = (e.target.value / 100) * this.audio.duration;
            this.audio.currentTime = seekTime;
        });
        
        // Song ended
        this.audio.addEventListener('ended', () => this.onSongEnded());
    }
    
    async loadSongs() {
        try {
            const response = await fetch('/api/songs.php');
            this.songs = await response.json();
            this.renderPlaylist();
            if (this.songs.length > 0) {
                this.loadSong(0);
            }
        } catch (error) {
            console.error('Failed to load songs:', error);
        }
    }
    
    loadSong(index) {
        if (index < 0 || index >= this.songs.length) return;
        
        this.currentSongIndex = index;
        const song = this.songs[index];
        
        this.audio.src = song.file_url;
        document.getElementById('song-title').textContent = song.title;
        document.getElementById('song-artist').textContent = song.artist || 'Unknown Artist';
        
        // Reset repeat counter
        this.currentRepeat = 0;
        
        // Auto play if already playing
        if (this.isPlaying) {
            this.audio.play();
        }
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
            document.getElementById('play-btn').innerHTML = '<i class="fas fa-play"></i>';
        } else {
            this.audio.play();
            document.getElementById('play-btn').innerHTML = '<i class="fas fa-pause"></i>';
        }
        this.isPlaying = !this.isPlaying;
    }
    
    nextSong() {
        this.currentRepeat = 0;
        const nextIndex = (this.currentSongIndex + 1) % this.songs.length;
        this.loadSong(nextIndex);
        if (this.isPlaying) this.audio.play();
    }
    
    prevSong() {
        this.currentRepeat = 0;
        const prevIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        this.loadSong(prevIndex);
        if (this.isPlaying) this.audio.play();
    }
    
    onSongEnded() {
        this.currentRepeat++;
        
        if (this.currentRepeat < this.repeatCount) {
            // Repeat the same song
            this.audio.currentTime = 0;
            this.audio.play();
            console.log(`Repeating song (${this.currentRepeat}/${this.repeatCount})`);
        } else {
            // Move to next song
            this.nextSong();
        }
    }
    
    updateProgress() {
        const percent = (this.audio.currentTime / this.audio.duration) * 100 || 0;
        document.getElementById('progress-bar').value = percent;
        
        // Update time display
        document.getElementById('current-time').textContent = 
            this.formatTime(this.audio.currentTime);
        document.getElementById('duration').textContent = 
            this.formatTime(this.audio.duration);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    renderPlaylist() {
        const list = document.getElementById('song-list');
        list.innerHTML = '';
        
        this.songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="song-item" data-index="${index}">
                    <i class="fas fa-music"></i>
                    <span class="song-title">${song.title}</span>
                    <span class="song-artist">${song.artist || ''}</span>
                </span>
            `;
            
            li.querySelector('.song-item').addEventListener('click', () => {
                this.loadSong(index);
                if (!this.isPlaying) this.togglePlay();
            });
            
            list.appendChild(li);
        });
    }
}

// Initialize player when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.player = new MusicPlayer();
});