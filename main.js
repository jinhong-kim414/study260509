// Teachable Machine Model URL
// 사용자가 제공한 정확한 모델 URL을 사용합니다.
const URL = "https://teachablemachine.withgoogle.com/models/cryxcLDN-/"; 

let model, maxPredictions;
let isModelLoading = false;


function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);

    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? '화이트모드로 전환' : '블랙모드로 전환');
    themeToggle.querySelector('.theme-icon').textContent = isDark ? '☾' : '☀';
    themeToggle.querySelector('.theme-label').textContent = isDark ? '블랙' : '화이트';
}

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme-mode') || 'light';

    applyTheme(savedTheme);

    if (!themeToggle) return;

    themeToggle.addEventListener('click', () => {
        const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        localStorage.setItem('theme-mode', nextTheme);
        applyTheme(nextTheme);
    });
}


function createFireworkBurst(x, y, colors) {
    const particles = [];
    const particleCount = 42;

    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 2 + Math.random() * 4.5;
        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 2 + Math.random() * 2.5,
            alpha: 1,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }

    return particles;
}

function launchFireworks() {
    const existingCanvas = document.querySelector('.fireworks-canvas');
    if (existingCanvas) existingCanvas.remove();

    const canvas = document.createElement('canvas');
    canvas.className = 'fireworks-canvas';
    document.body.appendChild(canvas);

    const context = canvas.getContext('2d');
    const colors = ['#ff7675', '#fdcb6e', '#55efc4', '#74b9ff', '#a29bfe', '#fd79a8'];
    const particles = [];
    let animationFrame;
    let startTime;

    function resizeCanvas() {
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.floor(window.innerWidth * ratio);
        canvas.height = Math.floor(window.innerHeight * ratio);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function addBurst() {
        const x = window.innerWidth * (0.18 + Math.random() * 0.64);
        const y = window.innerHeight * (0.16 + Math.random() * 0.46);
        particles.push(...createFireworkBurst(x, y, colors));
    }

    function draw(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        if (elapsed < 850 && Math.floor(elapsed / 170) > Math.floor((elapsed - 16) / 170)) {
            addBurst();
        }

        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        context.globalCompositeOperation = 'lighter';

        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.055;
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            particle.alpha -= 0.014;

            if (particle.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            context.globalAlpha = particle.alpha;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            context.fillStyle = particle.color;
            context.fill();
        }

        context.globalAlpha = 1;
        context.globalCompositeOperation = 'source-over';

        if (particles.length || elapsed < 1200) {
            animationFrame = requestAnimationFrame(draw);
            return;
        }

        window.removeEventListener('resize', resizeCanvas);
        canvas.remove();
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    addBurst();
    animationFrame = requestAnimationFrame(draw);

    setTimeout(() => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        window.removeEventListener('resize', resizeCanvas);
        canvas.remove();
    }, 4500);
}

function initFireworksButton() {
    const fireworksButton = document.getElementById('fireworks-btn');
    if (!fireworksButton) return;

    fireworksButton.addEventListener('click', launchFireworks);
}

// 모델 로드 함수
async function loadModel() {
    try {
        isModelLoading = true;
        console.log("AI 모델 로딩 중: " + URL);
        
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        
        isModelLoading = false;
        console.log("AI 모델 로드 완료!");
    } catch (e) {
        console.error("모델 로딩 실패:", e);
        isModelLoading = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initFireworksButton();

    // 즉시 모델 로딩 시작
    loadModel();

    const uploadArea = document.getElementById('upload-area');
    const imageInput = document.getElementById('image-input');
    const previewImage = document.getElementById('preview-image');
    const uploadLabel = document.getElementById('upload-label');
    const analyzeBtn = document.getElementById('analyze-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultContainer = document.getElementById('result-container');
    const labelContainerResult = document.getElementById('label-container');

    uploadArea.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImage.src = event.target.result;
                previewImage.style.display = 'block';
                uploadLabel.style.display = 'none';
                analyzeBtn.style.display = 'block';
                resultContainer.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    analyzeBtn.addEventListener('click', async () => {
        if (isModelLoading) {
            alert("모델을 불러오는 중입니다. 잠시만 기다려주세요.");
            return;
        }

        if (!model) {
            await loadModel();
            if (!model) {
                alert("모델 로드에 실패했습니다. URL(https://teachablemachine.withgoogle.com/models/xjglajpn/)이 유효한지 확인해주세요.");
                return;
            }
        }

        analyzeBtn.style.display = 'none';
        loadingSpinner.style.display = 'block';

        // 분석 실행
        setTimeout(async () => {
            try {
                const prediction = await model.predict(previewImage);
                labelContainerResult.innerHTML = '';
                
                const sortedPrediction = [...prediction].sort((a, b) => b.probability - a.probability);
                const topResult = sortedPrediction[0].className;
                
                document.getElementById('result-message').innerText = "결과: " + topResult + "상!";

                for (let i = 0; i < maxPredictions; i++) {
                    const classPrediction = prediction[i].className;
                    const probability = (prediction[i].probability * 100).toFixed(0);
                    
                    const resultItem = document.createElement('div');
                    resultItem.className = 'result-item';
                    resultItem.innerHTML = 
                        '<div class="label-text">' +
                            '<span>' + classPrediction + '</span>' +
                            '<span>' + probability + '%</span>' +
                        '</div>' +
                        '<div class="bar-container">' +
                            '<div class="bar" style="width: ' + probability + '%"></div>' +
                        '</div>';
                    labelContainerResult.appendChild(resultItem);
                }
                
                loadingSpinner.style.display = 'none';
                resultContainer.style.display = 'block';
            } catch (error) {
                console.error("분석 오류:", error);
                alert("분석 중 오류가 발생했습니다.");
                loadingSpinner.style.display = 'none';
                analyzeBtn.style.display = 'block';
            }
        }, 300);
    });
});
