const canvas = document.getElementById('avatarCanvas');
const ctx = canvas.getContext('2d');

// Lista de objetos adicionados ao canvas
const objects = [];

// Variáveis para controle de interação
let currentObject = null;
let isDragging = false;
let isResizing = false;
let resizeCorner = null; // Canto que está sendo redimensionado

// Adiciona imagem base do Aquaman
const aquamanImage = new Image();
aquamanImage.src = 'images/aquaman_base.png'; // Caminho para a imagem do Aquaman
aquamanImage.onload = () => {
    objects.push({
        image: aquamanImage,
        x: 0,
        y: 0,
        width: canvas.width, // A imagem preencherá o canvas
        height: canvas.height,
        selected: false,
        draggable: false, // Não será arrastável
        resizable: false // Não será redimensionável
    });
    drawCanvas();
};

// Desenhar todos os objetos no canvas
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach(obj => {
        ctx.drawImage(obj.image, obj.x, obj.y, obj.width, obj.height);
        if (obj.selected) {
            drawResizeHandles(obj);
        }
    });
}

// Desenhar alças de redimensionamento
function drawResizeHandles(obj) {
    const handles = [
        { x: obj.x, y: obj.y }, // Top-left
        { x: obj.x + obj.width, y: obj.y }, // Top-right
        { x: obj.x, y: obj.y + obj.height }, // Bottom-left
        { x: obj.x + obj.width, y: obj.y + obj.height } // Bottom-right
    ];

    ctx.fillStyle = 'blue';
    handles.forEach(handle => {
        ctx.fillRect(handle.x - 5, handle.y - 5, 10, 10);
    });
}

// Detectar se o clique está sobre um objeto ou uma alça
function getObjectAtPosition(x, y) {
    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        // Verifica se clicou em uma alça de redimensionamento
        const corners = [
            { x: obj.x, y: obj.y, corner: 'tl' },
            { x: obj.x + obj.width, y: obj.y, corner: 'tr' },
            { x: obj.x, y: obj.y + obj.height, corner: 'bl' },
            { x: obj.x + obj.width, y: obj.y + obj.height, corner: 'br' }
        ];

        for (const corner of corners) {
            if (
                x >= corner.x - 5 &&
                x <= corner.x + 5 &&
                y >= corner.y - 5 &&
                y <= corner.y + 5
            ) {
                return { object: obj, resizeCorner: corner.corner };
            }
        }

        // Verifica se clicou dentro do objeto
        if (
            x > obj.x &&
            x < obj.x + obj.width &&
            y > obj.y &&
            y < obj.y + obj.height
        ) {
            return { object: obj, resizeCorner: null };
        }
    }
    return null;
}

// Adiciona imagens ao canvas ao soltar
canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const src = e.dataTransfer.getData('accessory');
    const img = new Image();
    img.src = src;
    img.onload = () => {
        objects.push({
            image: img,
            x: e.offsetX - img.width / 2,
            y: e.offsetY - img.height / 2,
            width: img.width,
            height: img.height,
            selected: false,
            draggable: true,
            resizable: true
        });
        drawCanvas();
    };
});

canvas.addEventListener('dragover', (e) => e.preventDefault());

// Eventos de clique, arraste e soltar
canvas.addEventListener('mousedown', (e) => {
    const { offsetX: x, offsetY: y } = e;
    const result = getObjectAtPosition(x, y);

    if (result) {
        currentObject = result.object;
        currentObject.selected = true;
        isResizing = !!result.resizeCorner;
        resizeCorner = result.resizeCorner;
        isDragging = !isResizing;

        // Move o objeto para o topo da pilha
        objects.splice(objects.indexOf(currentObject), 1);
        objects.push(currentObject);

        drawCanvas();
    } else {
        currentObject = null;
        objects.forEach(obj => (obj.selected = false));
        drawCanvas();
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!currentObject) return;

    const { offsetX: x, offsetY: y } = e;

    if (isDragging) {
        // Movimentação
        currentObject.x = x - currentObject.width / 2;
        currentObject.y = y - currentObject.height / 2;
        drawCanvas();
    } else if (isResizing) {
        // Redimensionamento
        switch (resizeCorner) {
            case 'tl': // Top-left
                currentObject.width += currentObject.x - x;
                currentObject.height += currentObject.y - y;
                currentObject.x = x;
                currentObject.y = y;
                break;
            case 'tr': // Top-right
                currentObject.width = x - currentObject.x;
                currentObject.height += currentObject.y - y;
                currentObject.y = y;
                break;
            case 'bl': // Bottom-left
                currentObject.width += currentObject.x - x;
                currentObject.height = y - currentObject.y;
                currentObject.x = x;
                break;
            case 'br': // Bottom-right
                currentObject.width = x - currentObject.x;
                currentObject.height = y - currentObject.y;
                break;
        }
        drawCanvas();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
    resizeCorner = null;
});

// Salvar o canvas como imagem
document.getElementById('saveAvatar').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'macho.png';
    link.href = canvas.toDataURL();
    link.click();
});



// Função para adicionar acessórios ao canvas
function addAccessory(imageSrc) {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
        objects.push({
            image: img,
            x: canvas.width / 2 - img.width / 2, // Posição inicial centralizada
            y: canvas.height / 2 - img.height / 2,
            width: img.width,
            height: img.height,
            selected: false,
            draggable: true,
            resizable: true
        });
        drawCanvas();
    };
}

// Detectar e manipular objetos no canvas
canvas.addEventListener('mousedown', (e) => {
    const { offsetX: x, offsetY: y } = e;
    const result = getObjectAtPosition(x, y);

    if (result) {
        currentObject = result.object;
        currentObject.selected = true;
        isResizing = !!result.resizeCorner;
        resizeCorner = result.resizeCorner;
        isDragging = !isResizing;

        // Move o objeto para o topo da pilha
        objects.splice(objects.indexOf(currentObject), 1);
        objects.push(currentObject);

        drawCanvas();
    } else {
        currentObject = null;
        objects.forEach(obj => (obj.selected = false));
        drawCanvas();
    }
});

// Outros eventos permanecem iguais...
