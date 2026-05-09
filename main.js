// Teachable Machine Model URL
const URL = "https://teachablemachine.withgoogle.com/models/xjglajpn/";

let model, labelContainer, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
}

document.addEventListener('DOMContentLoaded', () => {
    init();

    const uploadArea = document.getElementById('upload-area');
    const imageInput = document.getElementById('image-input');
    const previewImage = document.getElementById('preview-image');
    const uploadLabel = document.getElementById('upload-label');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultContainer = document.getElementById('result-container');
    const labelContainerResult = document.getElementById('label-container');

    uploadArea.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                previewImage.src = event.target.result;
                previewImage.style.display = 'block';
                uploadLabel.style.display = 'none';
                
                loadingSpinner.style.display = 'block';
                resultContainer.style.display = 'none';
                
                previewImage.onload = async () => {
                    await predict(previewImage);
                    loadingSpinner.style.display = 'none';
                    resultContainer.style.display = 'block';
                };
            };
            reader.readAsDataURL(file);
        }
    });

    async function predict(imageElement) {
        const prediction = await model.predict(imageElement);
        labelContainerResult.innerHTML = '';
        
        const sortedPrediction = [...prediction].sort((a, b) => b.probability - a.probability);
        
        const topResult = sortedPrediction[0].className;
        document.getElementById('result-message').innerText = "당신은 " + topResult + "상입니다!";

        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction = prediction[i].className;
            const probability = (prediction[i].probability * 100).toFixed(0);
            
            const resultItem = document.createElement('div');
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
