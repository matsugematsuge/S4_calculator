// ドロップダウンリストを生成する関数
function populateDropdowns(data) {
    const workshopSelect = document.getElementById('workshopLevel');
    const labSelect = document.getElementById('targetLabLevel');

    // 石英工房のレベルを1～30まで生成
    for (let i = 1; i <= 30; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `レベル${i}`;
        workshopSelect.appendChild(option);
    }

    // 光電研究所のレベルを2～30まで生成
    for (let i = 2; i <= 30; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `レベル${i}`;
        labSelect.appendChild(option);
    }
}

// 計算を実行する関数
function calculate(data) {
    const currentQuartz = parseInt(document.getElementById('currentQuartz').value, 10);
    const workshopLevel = document.getElementById('workshopLevel').value;
    const targetLabLevel = document.getElementById('targetLabLevel').value;

    const productionPerHour = data.workshopProduction[workshopLevel];
    const requiredQuartz = data.requiredQuartz[targetLabLevel];

    const resultElement = document.getElementById('requiredTime');
    
    if (isNaN(currentQuartz) || !productionPerHour || !requiredQuartz) {
        resultElement.textContent = "入力が無効です。";
        return;
    }

    const remainingQuartz = requiredQuartz - currentQuartz;
    
    let requiredTime;
    if (remainingQuartz <= 0) {
        requiredTime = 0;
    } else if (productionPerHour <= 0) {
        requiredTime = Infinity; // 生産量が0の場合、無限時間
    } else {
        requiredTime = remainingQuartz / productionPerHour;
    }
    
    if (requiredTime === 0) {
        resultElement.textContent = `今すぐレベル${targetLabLevel}にアップグレード可能です！`;
    } else if (requiredTime === Infinity) {
        resultElement.textContent = `生産量が0のため、アップグレードできません。`;
    } else {
        const days = Math.floor(requiredTime / 24);
        const hours = (requiredTime % 24);
        
        let timeString = '';
        if (days > 0) {
            timeString += `${days}日`;
        }
        timeString += `${hours.toFixed(1)}時間`;

        resultElement.textContent = `レベル${targetLabLevel}にアップグレードするには、あと約 ${timeString} かかります。`;
    }
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
            document.getElementById('calculateButton').addEventListener('click', () => {
                calculate(data);
            });
        })
        .catch(error => {
            console.error('データの読み込みに失敗しました:', error);
            alert('ゲームデータの読み込みに失敗しました。ファイルが正しく配置されているか確認してください。');
        });
});