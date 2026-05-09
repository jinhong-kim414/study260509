// Teachable Machine Model URL
// 사용자가 제공한 정확한 모델 URL을 사용합니다.
const URL = "https://teachablemachine.withgoogle.com/models/xjglajpn/"; 

let model, maxPredictions;
let isModelLoading = false;

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
