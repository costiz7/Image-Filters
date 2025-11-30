//GitHub button
document.querySelector('.github').addEventListener('click', () => {
    window.location.href = 'https://github.com/costiz7/Image-Filters';
});

//LinkedIn button
document.querySelector('.linkedin').addEventListener('click', () => {
    window.location.href = 'https://www.linkedin.com/in/costelz7/';
});

const fileImport = document.getElementById('fileInput');
const btnImport = document.getElementById('btn-import');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

btnImport.addEventListener('click', () => {
    fileImport.click();
});

fileImport.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            context.drawImage(img, 0, 0);

            originalImageData = context.getImageData(0, 0, canvas.width, canvas.height);

            enableButtons();
        };

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});

function enableButtons() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = false);
}