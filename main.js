const URL = "https://teachablemachine.withgoogle.com/models/xjglajpn/";

let model, maxPredictions;

// Load the model once at the start
async function loadModel() {
    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("AI Model Ready");
    } catch (e) {
        console.error("Model loading failed", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadModel();

    const uploadArea = document.getElementById('upload-area');
    const imageInput = document.getElementById('image-input');
    const previewImage = document.getElementById('preview-image');
    const uploadLabel = document.getElementById('upload-label');
    const analyzeBtn = document.getElementById('analyze-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultContainer = document.getElementById('result-container');
    const labelContainerResult = document.getElementById('label-container');

    // Click to upload
    uploadArea.addEventListener('click', () => imageInput.click());

    // File selection
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
                
                // Reset scroll to top of container if needed
                analyzeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
            reader.readAsDataURL(file);
        }
    });

    // Analyze button click
    analyzeBtn.addEventListener('click', async () => {
        if (!model) {
            alert("AI 모델을 불러오는 중입니다. 잠시만 기다려주세요.");
            return;
        }

        analyzeBtn.style.display = 'none';
        loadingSpinner.style.display = 'block';

        // Brief timeout to allow spinner to show on mobile
        setTimeout(async () => {
            await predict();
            loadingSpinner.style.display = 'none';
            resultContainer.style.display = 'block';
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    });

    async function predict() {
        const prediction = await model.predict(previewImage);
        labelContainerResult.innerHTML = '';
        
        const sortedPrediction = [...prediction].sort((a, b) => b.probability - a.probability);
        const topResult = sortedPrediction[0].className;
        
        document.getElementById('result-message').innerText = "결과: " + topResult + "상";

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
    }
});
