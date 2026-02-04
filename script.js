let teamsData = [];

// Mobile detection for performance optimization
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Shared AudioContext for better performance and GitHub.io compatibility
let audioContext = null;
let audioContextInitialized = false;

// Audio objects for sounds
let welcomeAudio = null;

// Initialize AudioContext on first user interaction (required for GitHub.io)
function initAudioContext() {
    if (!audioContext && typeof window !== 'undefined') {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextInitialized = true;
    }
    // Resume audio context if suspended (required for autoplay policies)
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch(err => console.log('Audio context resume failed:', err));
    }
}

// Initialize audio files
function initAudio() {
    welcomeAudio = new Audio('Welcome.mp3');
    welcomeAudio.volume = 0.7;
    welcomeAudio.preload = 'auto';
}

// Play welcome sound - ONLY on user action (required for GitHub.io)
function playWelcomeSound() {
    if (welcomeAudio) {
        initAudioContext();
        welcomeAudio.currentTime = 0;
        welcomeAudio.play().catch(() => {
            // Silently fail - MP3 might be blocked on some browsers
        });
    }
}

// Play button click sound - lightweight
function playButtonClickSound() {
    if (!audioContextInitialized) {
        initAudioContext();
    }
    
    if (!audioContext || audioContext.state === 'suspended') {
        return; // Skip if audio context not ready
    }
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.log('Could not play button sound:', error);
    }
}

// Play tone sequence (from Commander Military project)
function playToneSequence(audioContext, frequencies, durations) {
    let timeOffset = 0;
    
    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        const startTime = audioContext.currentTime + timeOffset;
        const duration = durations[index] || 0.2;

        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);

        timeOffset += duration;
    });
}

// Play success sound - ascending tone sequence (from Commander Military project)
function playSuccessSound() {
    if (!audioContextInitialized) {
        initAudioContext();
    }
    
    if (!audioContext || audioContext.state === 'suspended') {
        return;
    }
    
    try {
        // Ascending sequence: [440, 554, 659, 880] with durations [0.15, 0.15, 0.15, 0.3]
        playToneSequence(audioContext, [440, 554, 659, 880], [0.15, 0.15, 0.15, 0.3]);
    } catch (error) {
        console.log('Could not play success sound:', error);
    }
}

// Play error sound - descending tone sequence (from Commander Military project)
function playErrorSound() {
    if (!audioContextInitialized) {
        initAudioContext();
    }
    
    if (!audioContext || audioContext.state === 'suspended') {
        return;
    }
    
    try {
        // Descending sequence: [880, 659, 440, 330] with durations [0.1, 0.1, 0.1, 0.2]
        playToneSequence(audioContext, [880, 659, 440, 330], [0.1, 0.1, 0.1, 0.2]);
    } catch (error) {
        console.log('Could not play error sound:', error);
    }
}

// Lightweight typewriter sound - throttled to avoid lag
let typewriterSoundCounter = 0;
function playTypewriterSound() {
    return ;

    // if (!audioContextInitialized) {
    //     initAudioContext();
    // }
    
    // if (!audioContext || audioContext.state === 'suspended') {
    //     return;
    // }
    
    // // Throttle: only play every 3rd character to reduce lag
    // typewriterSoundCounter++;
    // if (typewriterSoundCounter % 3 !== 0) {
    //     return;
    // }
    
    // try {
    //     const oscillator = audioContext.createOscillator();
    //     const gainNode = audioContext.createGain();

    //     oscillator.connect(gainNode);
    //     gainNode.connect(audioContext.destination);

    //     // Lightweight click sound
    //     oscillator.type = 'square';
    //     oscillator.frequency.value = 800 + Math.random() * 100;
    //     gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
    //     gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
        
    //     oscillator.start(audioContext.currentTime);
    //     oscillator.stop(audioContext.currentTime + 0.03);
    // } catch (error) {
    //     // Silently fail to avoid console spam
    // }
}

// Shake animation for invalid input
function shakeInput(inputElement) {
    inputElement.classList.add('shake-animation');
    setTimeout(() => {
        inputElement.classList.remove('shake-animation');
    }, 600);
}

function playSound(isSuccess) {
    if (isSuccess) {
        playSuccessSound();
    } else {
        playErrorSound();
    }
}

function initParticles() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    // Reduce particles on mobile for better performance
    const particleCount = isMobile ? 30 : 80;

    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.color = this.getRandomColor();
        }

        getRandomColor() {
            const colors = ['#00f0ff', '#ff00ff', '#ffff00'];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        // Draw connections - disabled on mobile for better performance
        if (!isMobile) {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.strokeStyle = `rgba(0, 240, 255, ${1 - distance / 100})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Initialize animated flags in background
function initFlags() {
    const flagsContainer = document.getElementById('flagsContainer');
    if (!flagsContainer) return;

    const flags = [
        { code: 'in', name: 'India' },
        { code: 'ph', name: 'Philippines' },
        { code: 'my', name: 'Malaysia' },
        { code: 'th', name: 'Thailand' }
    ];
    
    // Reduce flags on mobile for better performance
    const flagCount = isMobile ? 8 : 16;
    
    function createFlag() {
        const flagData = flags[Math.floor(Math.random() * flags.length)];
        const flagDiv = document.createElement('div');
        flagDiv.className = 'flag-item';
        
        const img = document.createElement('img');
        img.src = `https://flagcdn.com/${flagData.code}.svg`;
        img.width = 40 + Math.random() * 20; // Random size 40-60px
        img.alt = flagData.name;
        img.title = flagData.name;
        
        flagDiv.appendChild(img);
        
        // Random starting position (left side of screen)
        flagDiv.style.left = Math.random() * 100 + '%';
        
        // Random animation duration (20-35 seconds)
        const duration = 20 + Math.random() * 15;
        flagDiv.style.animationDuration = duration + 's';
        
        // Random animation delay (0-3 seconds)
        const delay = Math.random() * 3;
        flagDiv.style.animationDelay = delay + 's';
        
        // Random horizontal drift for more natural movement
        const drift = 30 + (Math.random() - 0.5) * 60; // 0px to 60px
        flagDiv.dataset.drift = drift;
        
        flagsContainer.appendChild(flagDiv);
        
        // Remove flag after animation completes
        setTimeout(() => {
            if (flagDiv.parentNode) {
                flagDiv.remove();
            }
        }, (duration + delay) * 1000);
    }
    
    // Create initial flags with staggered timing
    for (let i = 0; i < flagCount; i++) {
        setTimeout(() => createFlag(), i * 1500);
    }
    
    // Continuously create new flags to maintain constant flow
    setInterval(() => {
        if (flagsContainer.children.length < flagCount) {
            createFlag();
        }
    }, 2500);
}

// Initialize particles and audio when page loads
window.addEventListener('load', () => {
    initParticles();
    initFlags(); // Initialize animated flags
    initAudio();
    loadTeamsData();
    // ❌ REMOVED: Welcome sound on page load (blocked by browsers)
    // ✅ Moved to enterHackathon button click (user action required)
});

// Load teams data from JSON file
async function loadTeamsData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        teamsData = await response.json();
        console.log('Teams data loaded successfully:', teamsData.length, 'teams');
    } catch (error) {
        console.error('Error loading teams data:', error);
        alert('Error loading hackathon data. Please refresh the page.');
    }
}

window.enterHackathon = function() {
    // ✅ FIX 1: Play MP3 ONLY on user action (button click)
    initAudioContext();
    playWelcomeSound();
    playButtonClickSound();
    
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainScreen = document.getElementById('mainScreen');

    welcomeScreen.style.animation = 'fadeOut 0.5s ease-out forwards';

    setTimeout(() => {
        welcomeScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        mainScreen.style.animation = 'fadeInScale 0.6s ease-out forwards';
    }, 500);
}

// Add fadeOut animation to CSS if not present
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.95); }
    }
`;
document.head.appendChild(style);

window.searchTeam = function(event) {
    event.preventDefault();
    playButtonClickSound();

    const teamIdInput = document.getElementById('teamIdInput');
    const teamId = teamIdInput.value.trim().toUpperCase();

    if (!teamId) {
        playErrorSound();
        shakeInput(teamIdInput);
        // Show a nicer error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Please enter a Team ID';
        errorMsg.style.animation = 'fadeInDown 0.3s ease-out';
        
        const inputGroup = document.querySelector('.input-group');
        const existingError = inputGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        inputGroup.appendChild(errorMsg);
        
        setTimeout(() => {
            errorMsg.style.animation = 'fadeOutUp 0.3s ease-out';
            setTimeout(() => errorMsg.remove(), 300);
        }, 2000);
        return;
    }

    // Show loading spinner with animation
    const searchCard = document.querySelector('.search-card');
    searchCard.style.animation = 'fadeOut 0.3s ease-out forwards';
    
    setTimeout(() => {
        searchCard.classList.add('hidden');
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.classList.remove('hidden');
        loadingSpinner.style.animation = 'fadeInScale 0.4s ease-out';
    }, 300);

    // Simulate loading delay for better UX
    setTimeout(() => {
        // Search for team in data
        const team = teamsData.filter(t => t.team_id.toUpperCase() === teamId);


        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.animation = 'fadeOut 0.3s ease-out forwards';

        setTimeout(() => {
            loadingSpinner.classList.add('hidden');

            if (team.length > 0) {
                playSound(true);
                displayResult(team[0]);
            }
             else {
                playSound(false);
                // Shake animation for invalid team ID
                shakeInput(teamIdInput);
                
                // Show error message
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = `Team ID "${teamId}" not found. Please check and try again.`;
                errorMsg.style.animation = 'fadeInDown 0.3s ease-out';
                
                const inputGroup = document.querySelector('.input-group');
                const existingError = inputGroup.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }
                inputGroup.appendChild(errorMsg);
                
                setTimeout(() => {
                    errorMsg.style.animation = 'fadeOutUp 0.3s ease-out';
                    setTimeout(() => errorMsg.remove(), 300);
                }, 3000);
                
                searchCard.classList.remove('hidden');
                searchCard.style.animation = 'fadeInScale 0.4s ease-out';
                teamIdInput.value = '';
                teamIdInput.focus();
            }
        }, 300);
    }, 1500);
}

window.displayResult = function(team) {
    const resultCard = document.getElementById('resultCard');
    const teamBadge = document.getElementById('teamBadge');
    const domainTitle = document.getElementById('domainTitle');
    const problemText = document.getElementById('problemText');

    // Set team badge
    teamBadge.textContent = team.team_id;
    const psBadge = document.getElementById('psBadge');
if (team.ps_id) {
    psBadge.textContent = team.ps_id;
} else {
    psBadge.textContent = "";
}

    // Set domain
    domainTitle.textContent = team.domain;

    // Set problem statement with typewriter effect
    problemText.textContent = '';
    resultCard.classList.remove('hidden');

    // Typewriter effect for problem statement with lightweight sound
    let charIndex = 0;
    const text = team.problem_statement;

    function typeWriter() {
        if (charIndex < text.length) {
            const currentChar = text.charAt(charIndex);
            problemText.textContent += currentChar;
            
            // ✅ FIX 4: Play typewriter sound only on desktop (disabled on mobile)
            if (!isMobile && currentChar.match(/[a-zA-Z0-9]/)) {
                playTypewriterSound();
            }
            
            charIndex++;
            setTimeout(typeWriter, 30);
        }
    }

    setTimeout(typeWriter, 800);
}

window.resetSearch = function() {
    playButtonClickSound();
    
    const resultCard = document.getElementById('resultCard');
    const searchCard = document.querySelector('.search-card');
    const teamIdInput = document.getElementById('teamIdInput');

    resultCard.style.animation = 'fadeOut 0.4s ease-out forwards';
    
    setTimeout(() => {
        resultCard.classList.add('hidden');
        searchCard.classList.remove('hidden');
        searchCard.style.animation = 'fadeInScale 0.5s ease-out';
        teamIdInput.value = '';
        teamIdInput.focus();
    }, 400);
}

// ✅ FIX 6: Simplified audio context init (only click event)
document.addEventListener('click', () => {
    initAudioContext();
}, { once: true });

// Handle Enter key on input
document.addEventListener('DOMContentLoaded', () => {
    const teamIdInput = document.getElementById('teamIdInput');
    if (teamIdInput) {
        teamIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('teamForm').dispatchEvent(new Event('submit'));
            }
        });
        
       }
    

});
window.copyProblem = function() {
    const text = document.getElementById('problemText').innerText;

    navigator.clipboard.writeText(text).then(() => {
        alert("Problem statement copied!");
    });
};

window.downloadProblem = function() {
    const text = document.getElementById('problemText').innerText;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "problem_statement.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

