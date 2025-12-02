document.querySelector('.github').addEventListener('click', () => {
    window.location.href = 'https://github.com/costiz7/Image-Filters';
});

document.querySelector('.linkedin').addEventListener('click', () => {
    window.location.href = 'https://www.linkedin.com/in/costelz7/';
});

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

const fileInput = document.getElementById('fileInput');
const btnImport = document.getElementById('btn-import');
const btnDownload = document.getElementById('btn-download');
const btnOriginal = document.getElementById('btn-original');
const btnRemove = document.getElementById('btn-remove');
const btnPicker = document.getElementById('btn-picker');

const filterButtons = document.querySelectorAll('.filter-effect');
const brightnessSlider = document.getElementById('myRange');

const colorBox = document.querySelector('.color');
const colorHexInput = document.querySelector('.color-hex');

let originalImageData = null;
let isPickingColor = false;

// 1. INCARCARE IMAGINE

btnImport.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.drawImage(img, 0, 0);

            const tempImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            originalImageData = new ImageData(
                new Uint8ClampedArray(tempImageData.data),
                tempImageData.width,
                tempImageData.height
            );

            toggleButtons(false);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// 2. LOGICA FILTRELOR

function toggleButtons(isDisabled) {
    btnDownload.disabled = isDisabled;
    btnOriginal.disabled = isDisabled;
    btnRemove.disabled = isDisabled;
    btnPicker.disabled = isDisabled;
    filterButtons.forEach(btn => btn.disabled = isDisabled);
    brightnessSlider.disabled = isDisabled;
    
    if (isDisabled) {
        stopPickingMode();
    }
}

filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        stopPickingMode();
        
        const effectType = e.target.getAttribute('data-effect');
        applyEffect(effectType);
    });
});

function applyEffect(type) {
    if (!originalImageData) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    if (type === 'grayscale') {
        for(let i = 0; i < data.length; i += 4){
            let avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = data[i + 1] = data[i + 2] = avg;
        }
    } 
    else if (type === 'sepia') {
        for(let i = 0; i < data.length; i += 4){
            let r = data[i], g = data[i + 1], b = data[i + 2];
            data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
            data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
            data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
    }
    else if (type === 'negative') {
        for(let i = 0; i < data.length; i += 4){
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
    }
    else if (type === 'pixelate') {
        applyPixelate(10); 
        return; 
    }

    ctx.putImageData(imageData, 0, 0);
}

function applyPixelate(pixelSize) {
    const imageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height
    );
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    for(let y = 0; y < height; y += pixelSize){
        for(let x = 0; x < width; x += pixelSize){
            let totalR = 0, totalG = 0, totalB = 0, count = 0;

            for (let subY = 0; subY < pixelSize; subY++) {
                for (let subX = 0; subX < pixelSize; subX++) {
                    const currentX = x + subX;
                    const currentY = y + subY;
                    if (currentX < width && currentY < height) {
                        const index = (currentY * width + currentX) * 4;
                        totalR += data[index];
                        totalG += data[index + 1];
                        totalB += data[index + 2];
                        count++;
                    }
                }
            }

            const avgR = count > 0 ? Math.round(totalR / count) : 0;
            const avgG = count > 0 ? Math.round(totalG / count) : 0;
            const avgB = count > 0 ? Math.round(totalB / count) : 0;

            for (let subY = 0; subY < pixelSize; subY++) {
                for (let subX = 0; subX < pixelSize; subX++) {
                    const currentX = x + subX;
                    const currentY = y + subY;
                    if (currentX < width && currentY < height) {
                        const index = (currentY * width + currentX) * 4;
                        data[index] = avgR;
                        data[index + 1] = avgG;
                        data[index + 2] = avgB;
                    }
                }
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

btnOriginal.addEventListener('click', () => {
    if (originalImageData) {
        stopPickingMode(); // Resetăm modurile
        ctx.putImageData(originalImageData, 0, 0);
        brightnessSlider.value = 50;
    }
});

brightnessSlider.addEventListener('input', (e) => {
    if (!originalImageData) return;
    
    if (isPickingColor) stopPickingMode();

    const value = parseInt(e.target.value); 
    const brightnessValue = (value - 50) * 5;

    const imageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height
    );
    const data = imageData.data;

    for(let i = 0; i < data.length; i += 4){
        data[i] = Math.max(0, Math.min(255, data[i] + brightnessValue));
        data[i+1] = Math.max(0, Math.min(255, data[i+1] + brightnessValue));
        data[i+2] = Math.max(0, Math.min(255, data[i+2] + brightnessValue));
    }
    ctx.putImageData(imageData, 0, 0);
});

btnDownload.addEventListener('click', () => {
    const dataURL = canvas.toDataURL("image/png");
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'imagine-editata.png'; 
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});

btnRemove.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
    fileInput.value = '';
    originalImageData = null;
    toggleButtons(true);
});

// 4. COLOR PICKER (ACTUALIZAT
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// 1. ACTIVARE MOD PICKER
btnPicker.addEventListener('click', () => {
    isPickingColor = !isPickingColor;
    
    if (isPickingColor) {
        canvas.style.cursor = "crosshair";
        btnPicker.textContent = "Cancel"; 
        btnPicker.style.backgroundColor = "#ff4444"; 
    } else {
        stopPickingMode();
    }
});

function stopPickingMode() {
    isPickingColor = false;
    canvas.style.cursor = "default";
    btnPicker.textContent = "Pick a color";
    btnPicker.style.backgroundColor = "";
}

// 2. PREVIZUALIZARE (HOVER)
canvas.addEventListener('mousemove', (e) => {
    if (!originalImageData || !isPickingColor) return;

    pickColor(e);
});

// 3. SALVARE CULOARE (CLICK)
canvas.addEventListener('click', (e) => {
    if (!originalImageData || !isPickingColor) return;

    pickColor(e); 
    stopPickingMode();
});

function pickColor(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const r = pixelData[0];
    const g = pixelData[1];
    const b = pixelData[2];
    
    const colorString = `rgb(${r}, ${g}, ${b})`;
    colorBox.style.backgroundColor = colorString;
    colorHexInput.value = rgbToHex(r, g, b);
}