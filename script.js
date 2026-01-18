let teamsData = [];

function playSound(isSuccess) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (isSuccess) {
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } else {
        oscillator.frequency.value = 300;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    }
}

function initParticles() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 80;

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

        // Draw connections
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

        requestAnimationFrame(animate);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Initialize particles when page loads
window.addEventListener('load', () => {
    initParticles();
    loadTeamsData();
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
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainScreen = document.getElementById('mainScreen');

    welcomeScreen.style.animation = 'fadeOut 0.5s ease-out forwards';

    setTimeout(() => {
        welcomeScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
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

    const teamIdInput = document.getElementById('teamIdInput');
    const teamId = teamIdInput.value.trim().toUpperCase();

    if (!teamId) {
        alert('Please enter a Team ID');
        return;
    }

    // Show loading spinner
    document.querySelector('.search-card').classList.add('hidden');
    document.getElementById('loadingSpinner').classList.remove('hidden');

    // Simulate loading delay for better UX
    setTimeout(() => {
        // Search for team in data
        const team = teamsData.find(t => t.team_id.toUpperCase() === teamId);

        document.getElementById('loadingSpinner').classList.add('hidden');

        if (team) {
            playSound(true);
            displayResult(team);
        } else {
            playSound(false);
            alert(`Team ID "${teamId}" not found. Please check your Team ID and try again.`);
            document.querySelector('.search-card').classList.remove('hidden');
            teamIdInput.value = '';
            teamIdInput.focus();
        }
    }, 1500);
}

window.displayResult = function(team) {
    const resultCard = document.getElementById('resultCard');
    const teamBadge = document.getElementById('teamBadge');
    const domainTitle = document.getElementById('domainTitle');
    const problemText = document.getElementById('problemText');

    // Set team badge
    teamBadge.textContent = team.team_id;

    // Set domain
    domainTitle.textContent = team.domain;

    // Set problem statement with typewriter effect
    problemText.textContent = '';
    resultCard.classList.remove('hidden');

    // Typewriter effect for problem statement
    let charIndex = 0;
    const text = team.problem_statement;

    function typeWriter() {
        if (charIndex < text.length) {
            problemText.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 30);
        }
    }

    setTimeout(typeWriter, 800);
}

window.resetSearch = function() {
    const resultCard = document.getElementById('resultCard');
    const searchCard = document.querySelector('.search-card');
    const teamIdInput = document.getElementById('teamIdInput');

    resultCard.classList.add('hidden');
    searchCard.classList.remove('hidden');

    teamIdInput.value = '';
    teamIdInput.focus();
}

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
