// 1. 공용 강아지/고양이 분류 모델 URL (공식 예제 모델 등 작동 확인된 URL 사용)
// 사용자가 제공한 URL이 있다면 이 부분을 해당 URL로 변경해 주세요.
const URL = "https://teachablemachine.withgoogle.com/models/6qZqQ-YkS/"; 

let model, maxPredictions;
let isModelLoading = false;

// 모델 로드 함수 개선
async function loadModel() {
    const loadingStatus = document.getElementById('loading-spinner');
    const uploadLabel = document.getElementById('upload-label');
    
    try {
        isModelLoading = true;
        console.log("AI 모델 로딩 시작...");
        
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        
        // tmImage.load는 시간이 걸릴 수 있으므로 비동기로 처리
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        
        isModelLoading = false;
        console.log("AI 모델 로드 완료!");
    } catch (e) {
        console.error("모델 로딩 실패:", e);
        isModelLoading = false;
        alert("AI 모델을 불러오는데 실패했습니다. URL을 확인하거나 잠시 후 다시 시도해주세요.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 페이지 로드와 동시에 모델 로딩 시작
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
                
                // 사진 업로드 후 버튼으로 스크롤
                setTimeout(() => {
                    analyzeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            };
            reader.readAsDataURL(file);
        }
    });

    analyzeBtn.addEventListener('click', async () => {
        if (isModelLoading) {
            alert("AI 모델을 아직 불러오는 중입니다. 잠시만 더 기다려주세요.");
            return;
        }

        if (!model) {
            // 모델 로딩 재시도
            await loadModel();
            if(!model) return;
        }

        analyzeBtn.style.display = 'none';
        loadingSpinner.style.display = 'block';

        // 분석 실행 (브라우저 렌더링을 위해 약간의 지연 후 실행)
        setTimeout(async () => {
            try {
                await predict();
                loadingSpinner.style.display = 'none';
                resultContainer.style.display = 'block';
                resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (error) {
                console.error("분석 오류:", error);
                alert("분석 중 오류가 발생했습니다.");
                loadingSpinner.style.display = 'none';
                analyzeBtn.style.display = 'block';
            }
        }, 200);
    });

    async function predict() {
        // 이미지를 캔버스 등으로 변환하지 않고 바로 예측 (속도 우선)
        const prediction = await model.predict(previewImage);
        labelContainerResult.innerHTML = '';
        
        // 확률순 정렬
        const sortedPrediction = [...prediction].sort((a, b) => b.probability - a.probability);
        const topResult = sortedPrediction[0].className;
        
        // 결과 메시지 업데이트
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
    }
});
