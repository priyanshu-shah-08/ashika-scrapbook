let chapters = [];
let currentIndex = 0;

const appShell = document.getElementById('appShell');
const coverScreen = document.getElementById('coverScreen');
const readerScreen = document.getElementById('readerScreen');
const finaleScreen = document.getElementById('finaleScreen');

const startBtn = document.getElementById('startBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const openLetterBtn = document.getElementById('openLetterBtn');

const chapterCounter = document.getElementById('chapterCounter');
const platformBadge = document.getElementById('platformBadge');
const progressFill = document.getElementById('progressFill');
const chapterTitle = document.getElementById('chapterTitle');
const authorNoteBox = document.getElementById('authorNoteBox');
const authorNoteText = document.getElementById('authorNoteText');
const chatFeed = document.getElementById('chatFeed');
const swipeStage = document.getElementById('swipeStage');

async function init() {
    const res = await fetch('/api/chapters');
    chapters = await res.json();
}

function showScreen(screen) {
    [coverScreen, readerScreen, finaleScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function attachCursorSpotlight(bubble) {
    bubble.addEventListener('mousemove', (e) => {
        const rect = bubble.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        bubble.style.setProperty('--mx', `${x}px`);
        bubble.style.setProperty('--my', `${y}px`);
    });

    bubble.addEventListener('mouseleave', () => {
        bubble.style.setProperty('--mx', `50%`);
        bubble.style.setProperty('--my', `50%`);
    });
}

function renderChapter(index) {
    const ch = chapters[index];
    if (!ch) return;

    // Header & Progress
    chapterCounter.textContent = `Chapter ${index + 1} of ${chapters.length}`;
    platformBadge.textContent = ch.platform;
    chapterTitle.textContent = ch.title;
    const progress = index + 1;
    progressFill.style.width = `${(progress / chapters.length) * 100}%`;
    progressFill.setAttribute('aria-valuenow', progress);

    // Platform styling
    readerScreen.classList.remove('platform-reddit', 'platform-instagram', 'platform-whatsapp');
    readerScreen.classList.add(`platform-${ch.platform.toLowerCase()}`);

    // Sticky note
    if (ch.author_note && ch.author_note.trim() !== '') {
        authorNoteText.textContent = ch.author_note;
        authorNoteBox.classList.remove('hidden');
    } else {
        authorNoteBox.classList.add('hidden');
    }

    // Build chat bubbles
    chatFeed.innerHTML = '';
    ch.messages.forEach((msg, i) => {
        const row = document.createElement('div');
        row.className = `bubble-row ${msg.sender}`;
        row.style.animationDelay = `${i * 0.11}s`;

        const label = document.createElement('span');
        label.className = 'sender-label';
        label.textContent = msg.sender === 'me' ? 'You' : 'Ashika';
        row.appendChild(label);

        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        if (msg.reply_to) {
            const quote = document.createElement('div');
            quote.className = 'reply-quote';
            quote.textContent = `↪ ${msg.reply_to}`;
            bubble.appendChild(quote);
        }

        if (msg.text) {
            const textNode = document.createElement('div');
            textNode.textContent = msg.text;
            bubble.appendChild(textNode);
        }

        if (msg.attachment_note) {
            const att = document.createElement('div');
            att.className = 'attachment-chip';
            att.textContent = `📎 ${msg.attachment_note}`;
            bubble.appendChild(att);
        }

        // Cursor-following gradient glow
        attachCursorSpotlight(bubble);

        // Interactive tap-to-pop heart
        bubble.addEventListener('click', () => {
            const heart = document.createElement('span');
            heart.className = 'pop-heart';
            heart.textContent = ['💖', '✨', '🎂', '🥹', '🩷'][Math.floor(Math.random() * 5)];
            bubble.appendChild(heart);
            setTimeout(() => heart.remove(), 850);
        });

        row.appendChild(bubble);

        if (msg.time || msg.reaction) {
            const meta = document.createElement('div');
            meta.className = 'bubble-meta';
            if (msg.time) {
                const t = document.createElement('span');
                t.textContent = msg.time;
                meta.appendChild(t);
            }
            if (msg.reaction) {
                const r = document.createElement('span');
                r.className = 'reaction-pill';
                r.textContent = msg.reaction;
                meta.appendChild(r);
            }
            row.appendChild(meta);
        }

        chatFeed.appendChild(row);
    });

    swipeStage.scrollTop = 0;
    prevBtn.disabled = index === 0;
    nextBtn.textContent = index === chapters.length - 1 ? 'Birthday Note 💌' : 'Next →';
}

function goNext() {
    if (currentIndex < chapters.length - 1) {
        currentIndex++;
        renderChapter(currentIndex);
    } else {
        showScreen(finaleScreen);
    }
}

function goPrev() {
    if (currentIndex > 0) {
        currentIndex--;
        renderChapter(currentIndex);
    }
}

// Subtle 3D tilt on desktop
if (window.matchMedia('(min-width: 768px)').matches) {
    document.addEventListener('mousemove', (e) => {
        const normX = (e.clientX / window.innerWidth - 0.5) * 2;
        const normY = (e.clientY / window.innerHeight - 0.5) * 2;
        appShell.style.transform = `rotateY(${normX * 1.4}deg) rotateX(${-normY * 1.4}deg)`;
    });

    document.addEventListener('mouseleave', () => {
        appShell.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
}

// Button & Keyboard Navigation
startBtn.addEventListener('click', () => {
    currentIndex = 0;
    showScreen(readerScreen);
    renderChapter(currentIndex);
});

nextBtn.addEventListener('click', goNext);
prevBtn.addEventListener('click', goPrev);

document.addEventListener('keydown', (e) => {
    if (!readerScreen.classList.contains('active')) return;
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
});

// Touch Swipe Support
let touchStartX = 0;
swipeStage.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

swipeStage.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 55) {
        diff > 0 ? goNext() : goPrev();
    }
}, { passive: true });

// Birthday Envelope & Confetti
openLetterBtn.addEventListener('click', () => {
    document.getElementById('envelopeCard').classList.add('hidden');
    document.getElementById('letterModal').classList.remove('hidden');
    launchConfetti();
});

restartBtn.addEventListener('click', () => {
    document.getElementById('envelopeCard').classList.remove('hidden');
    document.getElementById('letterModal').classList.add('hidden');
    currentIndex = 0;
    showScreen(coverScreen);
});

function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 95 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 7 + 4,
        color: ['#f6c468', '#b794f4', '#f472b6', '#34d399', '#60a5fa'][Math.floor(Math.random() * 5)],
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 360
    }));

    let frame = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.y += p.speed;
            p.angle += 3;
            ctx.fillStyle = p.color;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.angle * Math.PI) / 180);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
        });
        frame++;
        if (frame < 180) requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    draw();
}

init();