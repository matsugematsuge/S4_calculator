// ドロップダウンリストを生成する関数
function populateDropdowns(data) {
    // 石英工房のレベルを1～35まで生成
    for (let i = 1; i <= 5; i++) {
        const workshopSelect = document.getElementById(`workshop-${i}-level`);
        for (let j = 1; j <= 35; j++) {
            const option = document.createElement('option');
            option.value = j;
            option.textContent = `${j}`;
            workshopSelect.appendChild(option);
        }
    }

    // 光電研究所のレベルを1～35まで生成
    const labSelect = document.getElementById('targetLabLevel');
    for (let i = 1; i <= 35; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i}`;
        labSelect.appendChild(option);
    }
}

// フォームの状態をローカルストレージに保存する関数
function saveState() {
    const state = {
        currentQuartz: document.getElementById('currentQuartz').value,
        targetLabLevel: document.getElementById('targetLabLevel').value,
        workshops: []
    };

    for (let i = 1; i <= 5; i++) {
        state.workshops.push({
            enabled: document.getElementById(`workshop-${i}-enabled`).checked,
            level: document.getElementById(`workshop-${i}-level`).value
        });
    }

    localStorage.setItem('gameCalculatorState', JSON.stringify(state));
}

// ローカルストレージから状態を復元する関数
function restoreState() {
    const savedState = localStorage.getItem('gameCalculatorState');
    if (!savedState) return;

    const state = JSON.parse(savedState);
    
    document.getElementById('currentQuartz').value = state.currentQuartz;
    document.getElementById('targetLabLevel').value = state.targetLabLevel;

    for (let i = 1; i <= 5; i++) {
        document.getElementById(`workshop-${i}-enabled`).checked = state.workshops[i - 1].enabled;
        document.getElementById(`workshop-${i}-level`).value = state.workshops[i - 1].level;
    }
}

// 計算を実行する関数
function calculate(data) {
    let totalProductionPerHour = 0;
    for (let i = 1; i <= 5; i++) {
        const enabledCheckbox = document.getElementById(`workshop-${i}-enabled`);
        if (enabledCheckbox.checked) {
            const workshopLevel = document.getElementById(`workshop-${i}-level`).value;
            totalProductionPerHour += data.workshopProduction[workshopLevel];
        }
    }
    
    const currentQuartz = parseInt(document.getElementById('currentQuartz').value, 10);
    const targetLabLevel = document.getElementById('targetLabLevel').value;
    
    const requiredQuartz = data.requiredQuartz[targetLabLevel];
    
    const resultElement = document.getElementById('requiredTime');

    if (isNaN(currentQuartz) || !requiredQuartz) {
        resultElement.textContent = "入力が無効です。";
        return;
    }
    
    const remainingQuartz = requiredQuartz - currentQuartz;
    
    let requiredTimeInMinutes;
    if (remainingQuartz <= 0) {
        requiredTimeInMinutes = 0;
    } else if (totalProductionPerHour <= 0) {
        requiredTimeInMinutes = Infinity;
    } else {
        requiredTimeInMinutes = (remainingQuartz / totalProductionPerHour) * 60;
    }

    if (requiredTimeInMinutes === 0) {
        resultElement.textContent = `今すぐアップグレード可能です！`;
    } else if (requiredTimeInMinutes === Infinity) {
        resultElement.textContent = `生産量が0のため、アップグレードできません。`;
    } else {
        const hours = Math.floor(requiredTimeInMinutes / 60);
        const minutes = Math.round(requiredTimeInMinutes % 60);
        
        let timeString = '';
        if (hours > 0) {
            timeString += `${hours}時間`;
        }
        timeString += `${minutes}分`;
        
        const now = new Date();
        const finishTime = new Date(now.getTime() + requiredTimeInMinutes * 60000);
        const finishHours = finishTime.getHours().toString().padStart(2, '0');
        const finishMinutes = finishTime.getMinutes().toString().padStart(2, '0');

        resultElement.innerHTML = `あと ${timeString}<br>完了予定時刻: ${finishHours}時${finishMinutes}分`;
    }

    saveState();
}

// 外部ファイルからデータを読み込む処理
document.addEventListener('DOMContentLoaded', () => {
    fetch('gameData.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateDropdowns(data);
            restoreState();
            
            document.getElementById('calculateButton').addEventListener('click', () => {
                calculate(data);
            });

            document.querySelectorAll('input, select').forEach(element => {
                element.addEventListener('change', saveState);
            });
        })
        .catch(error => {
            console.error('データの読み込みに失敗しました:', error);
            alert('ゲームデータの読み込みに失敗しました。ファイルが正しく配置されているか確認してください。');
        });
});