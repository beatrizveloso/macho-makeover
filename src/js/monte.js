document.addEventListener("DOMContentLoaded", function() {
  const carousel = document.getElementById("carousel");
  const prevArrow = document.getElementById("prevArrow");
  const nextArrow = document.getElementById("nextArrow");
  const canvas = document.getElementById("avatarCanvas");
  const ctx = canvas.getContext("2d");
  const layersPanel = document.getElementById("layersPanel");
  const layersList = document.getElementById("layersList");
  const togglePanelBtn = document.getElementById("togglePanel");
  const saveButton = document.getElementById("saveAvatar");
  const tabs = document.querySelectorAll(".tab");
  const canvasDropZone = document.getElementById("canvasDropZone");

  const selectedCharacter = localStorage.getItem('selectedCharacter');
  let characterImage = null;
  const accessoryImages = [];
  let selectedAccessory = null;
  let isDragging = false;
  let isDraggingItem = false;
  let dragItem = null;
  let resizing = null;
  let rotating = false;
  let panelCollapsed = false;
  let currentIndex = 0;
  let dragStartX, dragStartY;
  let initialWidth, initialHeight;
  let initialAngle = 0;
  let initialMouseAngle = 0;
  let currentDraggedElement = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  
  const HANDLE_SIZE = 12;
  const ROTATION_HANDLE_DISTANCE = 35;
  const MIN_SIZE = 30;
  const MAX_SIZE = 800;

  function checkArrowsVisibility() {
    prevArrow.style.visibility = carousel.scrollTop > 0 ? 'visible' : 'hidden';
    nextArrow.style.visibility = carousel.scrollTop < carousel.scrollHeight - carousel.clientHeight ? 'visible' : 'hidden';
  }

  carousel.addEventListener("scroll", checkArrowsVisibility);

  carousel.addEventListener("wheel", (event) => {
    event.preventDefault();
    carousel.scrollBy({
      top: event.deltaY,
      behavior: "smooth"
    });
    setTimeout(checkArrowsVisibility, 100);
  });

  let isDraggingCarousel = false;
  let startY;
  let scrollTop;

  carousel.addEventListener('touchstart', (e) => {
    isDraggingCarousel = true;
    startY = e.touches[0].pageY - carousel.offsetTop;
    scrollTop = carousel.scrollTop;
  });

  carousel.addEventListener('touchmove', (e) => {
    if (!isDraggingCarousel) return;
    e.preventDefault();
    const y = e.touches[0].pageY - carousel.offsetTop;
    const walk = (y - startY) * 2;
    carousel.scrollTop = scrollTop - walk;
  });

  carousel.addEventListener('touchend', () => {
    isDraggingCarousel = false;
    checkArrowsVisibility();
  });

  prevArrow.addEventListener("click", () => {
    carousel.scrollBy({
      top: -carousel.clientHeight,
      behavior: 'smooth'
    });
    setTimeout(checkArrowsVisibility, 100);
  });

  nextArrow.addEventListener("click", () => {
    carousel.scrollBy({
      top: carousel.clientHeight,
      behavior: 'smooth'
    });
    setTimeout(checkArrowsVisibility, 100);
  });

  togglePanelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panelCollapsed = !panelCollapsed;
    layersPanel.classList.toggle('collapsed', panelCollapsed);
    togglePanelBtn.textContent = panelCollapsed ? '►' : '▼';
  });

  function updateLayersPanel() {
    layersList.innerHTML = '';
    
    const characterLayer = document.createElement('div');
    characterLayer.className = 'layer-item';
    characterLayer.textContent = 'Personagem Base';
    characterLayer.addEventListener('click', () => {
      selectedAccessory = null;
      drawCharacterAndAccessories();
      updateLayersPanel();
    });
    layersList.appendChild(characterLayer);
    
    for (let i = accessoryImages.length - 1; i >= 0; i--) {
      const accessory = accessoryImages[i];
      const layerItem = document.createElement('div');
      layerItem.className = 'layer-item';
      if (selectedAccessory && selectedAccessory.img === accessory.img) {
        layerItem.classList.add('selected');
      }
      
      const category = getCategoryFromImageSrc(accessory.img.src);
      layerItem.textContent = `${category} ${accessoryImages.length - i}`;
      
      const layerControls = document.createElement('div');
      layerControls.className = 'layer-controls';
      
      const moveUpBtn = document.createElement('button');
      moveUpBtn.textContent = '↑';
      moveUpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (i < accessoryImages.length - 1) {
          [accessoryImages[i], accessoryImages[i + 1]] = [accessoryImages[i + 1], accessoryImages[i]];
          updateLayersPanel();
          drawCharacterAndAccessories();
        }
      });
      
      const moveDownBtn = document.createElement('button');
      moveDownBtn.textContent = '↓';
      moveDownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (i > 0) {
          [accessoryImages[i], accessoryImages[i - 1]] = [accessoryImages[i - 1], accessoryImages[i]];
          updateLayersPanel();
          drawCharacterAndAccessories();
        }
      });
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'X';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        accessoryImages.splice(i, 1);
        if (selectedAccessory && selectedAccessory.img === accessory.img) {
          selectedAccessory = null;
        }
        updateLayersPanel();
        drawCharacterAndAccessories();
      });
      
      layerControls.appendChild(moveUpBtn);
      layerControls.appendChild(moveDownBtn);
      layerControls.appendChild(deleteBtn);
      layerItem.appendChild(layerControls);
      
      layerItem.addEventListener('click', () => {
        selectedAccessory = accessory;
        drawCharacterAndAccessories();
        updateLayersPanel();
      });
      
      layersList.appendChild(layerItem);
    }
  }

  function getCategoryFromImageSrc(src) {
    if (src.includes('cabelos')) return 'Cabelo';
    if (src.includes('oculos')) return 'Óculos';
    if (src.includes('colares') || src.includes('brinco')) return 'Colar/Brinco';
    if (src.includes('chapeus')) return 'Chapéu';
    if (src.includes('adds') || src.includes('bolsa')) return 'Acessório';
    return 'Item';
  }

  function drawCharacterAndAccessories() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (characterImage) {
      const scale = Math.min(
        canvas.width / characterImage.width,
        canvas.height / characterImage.height
      );
      const newWidth = characterImage.width * scale;
      const newHeight = characterImage.height * scale;

      ctx.drawImage(
        characterImage,
        (canvas.width - newWidth) / 2,
        (canvas.height - newHeight) / 2,
        newWidth,
        newHeight
      );
    }

    accessoryImages.forEach(({ img, x, y, width, height, angle = 0 }) => {
      ctx.save();
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * Math.PI / 180);
      
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      
      if (selectedAccessory && selectedAccessory.img === img) {
        ctx.strokeStyle = "rgba(148, 1, 104, 0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(-width / 2, -height / 2, width, height);
        
        ctx.fillStyle = "rgba(143, 28, 85, 0.8)";
        
        const cornerHandles = [
          { x: -width/2, y: -height/2, corner: 'nw' },
          { x: width/2, y: -height/2, corner: 'ne' },
          { x: -width/2, y: height/2, corner: 'sw' },
          { x: width/2, y: height/2, corner: 'se' }
        ];
        
        const edgeHandles = [
          { x: 0, y: -height/2, corner: 'n' },
          { x: width/2, y: 0, corner: 'e' },
          { x: 0, y: height/2, corner: 's' },
          { x: -width/2, y: 0, corner: 'w' }
        ];
        
        cornerHandles.forEach(({x, y}) => {
          ctx.beginPath();
          ctx.arc(x, y, HANDLE_SIZE, 0, Math.PI * 2);
          ctx.fill();
        });
        
        edgeHandles.forEach(({x, y}) => {
          ctx.beginPath();
          ctx.arc(x, y, HANDLE_SIZE/1.5, 0, Math.PI * 2);
          ctx.fill();
        });
        
        const rotationHandleY = -height/2 - ROTATION_HANDLE_DISTANCE;
        
        // ctx.beginPath();
        // ctx.arc(0, rotationHandleY, HANDLE_SIZE, 0, Math.PI * 2);
        // // ctx.fill();
        
        // ctx.strokeStyle = "rgba(212, 68, 153, 0.8)";
        // // ctx.lineWidth = 2;
        
        // ctx.beginPath();
        // ctx.moveTo(0, -height/2);
        // ctx.lineTo(0, rotationHandleY);
        // ctx.stroke();
        
        // ctx.fillStyle = "rgba(68, 153, 212, 0.8)";
        // ctx.beginPath();
        // ctx.arc(0, rotationHandleY, HANDLE_SIZE/2, 0, Math.PI * 2);
        // ctx.fill();
      }
      ctx.restore();
    });
  }
  
  function setCharacter(imageSrc) {
    characterImage = new Image();
    characterImage.src = imageSrc;
    characterImage.onload = () => {
      drawCharacterAndAccessories();
      updateLayersPanel();
    };
  }
  
  function addAccessory(imageSrc, x = null, y = null) {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const newAccessory = {
        img,
        x: x !== null ? x : (canvas.width - 100) / 2,
        y: y !== null ? y : (canvas.height - 100) / 2,
        width: 100,
        height: 100,
        angle: 0
      };
      accessoryImages.push(newAccessory);
      selectedAccessory = newAccessory;
      drawCharacterAndAccessories();
      updateLayersPanel();
      
      if (panelCollapsed) {
        panelCollapsed = false;
        layersPanel.classList.remove('collapsed');
        togglePanelBtn.textContent = '▼';
      }
    };
  }

  function getAccessoryAtPosition(x, y) {
    for (let i = accessoryImages.length - 1; i >= 0; i--) {
      const acc = accessoryImages[i];
      const centerX = acc.x + acc.width / 2;
      const centerY = acc.y + acc.height / 2;
      
      const angle = -acc.angle * Math.PI / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      const localX = (x - centerX) * cos - (y - centerY) * sin;
      const localY = (x - centerX) * sin + (y - centerY) * cos;
      
      if (localX >= -acc.width/2 && localX <= acc.width/2 && 
          localY >= -acc.height/2 && localY <= acc.height/2) {
        return acc;
      }
    }
    return null;
  }

  function detectControl(x, y, acc) {
    const centerX = acc.x + acc.width / 2;
    const centerY = acc.y + acc.height / 2;
    const angle = -acc.angle * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    const localX = (x - centerX) * cos - (y - centerY) * sin;
    const localY = (x - centerX) * sin + (y - centerY) * cos;

    const cornerHandles = [
      { name: "resize-nw", x: -acc.width/2, y: -acc.height/2, size: HANDLE_SIZE },
      { name: "resize-ne", x: acc.width/2, y: -acc.height/2, size: HANDLE_SIZE },
      { name: "resize-sw", x: -acc.width/2, y: acc.height/2, size: HANDLE_SIZE },
      { name: "resize-se", x: acc.width/2, y: acc.height/2, size: HANDLE_SIZE }
    ];
    
    const edgeHandles = [
      { name: "resize-n", x: 0, y: -acc.height/2, size: HANDLE_SIZE/1.5 },
      { name: "resize-e", x: acc.width/2, y: 0, size: HANDLE_SIZE/1.5 },
      { name: "resize-s", x: 0, y: acc.height/2, size: HANDLE_SIZE/1.5 },
      { name: "resize-w", x: -acc.width/2, y: 0, size: HANDLE_SIZE/1.5 }
    ];
    
    for (const handle of [...cornerHandles, ...edgeHandles]) {
      const dx = localX - handle.x;
      const dy = localY - handle.y;
      if (Math.sqrt(dx * dx + dy * dy) <= handle.size) {
        return { type: "resize", corner: handle.name.split('-')[1] };
      }
    }
    
    const rotationHandleY = -acc.height/2 - ROTATION_HANDLE_DISTANCE;
    const rotDx = localX - 0;
    const rotDy = localY - rotationHandleY;
    if (Math.sqrt(rotDx * rotDx + rotDy * rotDy) <= HANDLE_SIZE) {
      return { type: "rotate" };
    }
    
    return null;
  }

  function handleCanvasMouseDown(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    
    const clickedAccessory = getAccessoryAtPosition(offsetX, offsetY);
    if (clickedAccessory) {
      const control = detectControl(offsetX, offsetY, clickedAccessory);
      if (control) {
        selectedAccessory = clickedAccessory;
        
        if (control.type === "rotate") {
          rotating = true;
          dragStartX = offsetX;
          dragStartY = offsetY;
          initialAngle = selectedAccessory.angle;
          
          const centerX = selectedAccessory.x + selectedAccessory.width / 2;
          const centerY = selectedAccessory.y + selectedAccessory.height / 2;
          initialMouseAngle = Math.atan2(offsetY - centerY, offsetX - centerX) * 180 / Math.PI;
          drawCharacterAndAccessories();
          return;
        } 
        else if (control.type === "resize") {
          resizing = control.corner;
          isDragging = true;
          dragStartX = offsetX;
          dragStartY = offsetY;
          initialWidth = selectedAccessory.width;
          initialHeight = selectedAccessory.height;
          drawCharacterAndAccessories();
          return;
        }
      }
      
      selectedAccessory = clickedAccessory;
      isDragging = true;
      dragStartX = offsetX;
      dragStartY = offsetY;
      drawCharacterAndAccessories();
      return;
    }
    
    selectedAccessory = null;
    drawCharacterAndAccessories();
    updateLayersPanel();
  }

  function handleCanvasMouseMove(event) {
    if (!isDragging && !rotating) return;
    
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    
    if (rotating && selectedAccessory) {
      const centerX = selectedAccessory.x + selectedAccessory.width / 2;
      const centerY = selectedAccessory.y + selectedAccessory.height / 2;
      
      const newMouseAngle = Math.atan2(offsetY - centerY, offsetX - centerX) * 180 / Math.PI;
      selectedAccessory.angle = initialAngle + (newMouseAngle - initialMouseAngle);
      
      selectedAccessory.angle = selectedAccessory.angle % 360;
      if (selectedAccessory.angle < 0) selectedAccessory.angle += 360;
      
      drawCharacterAndAccessories();
      return;
    }
    
    if (isDragging && selectedAccessory) {
      if (resizing) {
        const centerX = selectedAccessory.x + selectedAccessory.width / 2;
        const centerY = selectedAccessory.y + selectedAccessory.height / 2;
        
        const angle = -selectedAccessory.angle * Math.PI / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        const localX = (offsetX - centerX) * cos - (offsetY - centerY) * sin;
        const localY = (offsetX - centerX) * sin + (offsetY - centerY) * cos;
        
        const startLocalX = (dragStartX - centerX) * cos - (dragStartY - centerY) * sin;
        const startLocalY = (dragStartX - centerX) * sin + (dragStartY - centerY) * cos;
        
        let newWidth = initialWidth;
        let newHeight = initialHeight;
        let deltaX = 0;
        let deltaY = 0;

        switch(resizing) {
          case "nw": 
            newWidth = initialWidth - (localX - startLocalX) * 2;
            newHeight = initialHeight - (localY - startLocalY) * 2;
            deltaX = (localX - startLocalX);
            deltaY = (localY - startLocalY);
            break;
          case "ne": 
            newWidth = initialWidth + (localX - startLocalX) * 2;
            newHeight = initialHeight - (localY - startLocalY) * 2;
            deltaY = (localY - startLocalY);
            break;
          case "sw":
            newWidth = initialWidth - (localX - startLocalX) * 2;
            newHeight = initialHeight + (localY - startLocalY) * 2;
            deltaX = (localX - startLocalX);
            break;
          case "se": 
            newWidth = initialWidth + (localX - startLocalX) * 2;
            newHeight = initialHeight + (localY - startLocalY) * 2;
            break;
          case "n":
            newHeight = initialHeight - (localY - startLocalY) * 2;
            deltaY = (localY - startLocalY);
            break;
          case "e":
            newWidth = initialWidth + (localX - startLocalX) * 2;
            break;
          case "s": 
            newHeight = initialHeight + (localY - startLocalY) * 2;
            break;
          case "w": 
            newWidth = initialWidth - (localX - startLocalX) * 2;
            deltaX = (localX - startLocalX);
            break;
        }
        
        newWidth = Math.max(MIN_SIZE, Math.min(MAX_SIZE, newWidth));
        newHeight = Math.max(MIN_SIZE, Math.min(MAX_SIZE, newHeight));
        
        if (event.shiftKey) {
          const aspect = initialWidth / initialHeight;
          if (resizing.includes("w") || resizing.includes("e")) {
            newHeight = newWidth / aspect;
          } else {
            newWidth = newHeight * aspect;
          }
        }
        
        const widthRatio = newWidth / selectedAccessory.width;
        const heightRatio = newHeight / selectedAccessory.height;
        
        selectedAccessory.x = centerX - (centerX - selectedAccessory.x) * widthRatio;
        selectedAccessory.y = centerY - (centerY - selectedAccessory.y) * heightRatio;
        
        selectedAccessory.width = newWidth;
        selectedAccessory.height = newHeight;
      } else {
        const deltaX = offsetX - dragStartX;
        const deltaY = offsetY - dragStartY;
        
        selectedAccessory.x += deltaX;
        selectedAccessory.y += deltaY;
        
        dragStartX = offsetX;
        dragStartY = offsetY;
      }
      
      drawCharacterAndAccessories();
    }
  }

  function handleCanvasMouseUp() {
    isDragging = false;
    resizing = null;
    rotating = false;
    updateLayersPanel();
  }

  canvas.addEventListener("mousedown", handleCanvasMouseDown);
  canvas.addEventListener("mousemove", handleCanvasMouseMove);
  canvas.addEventListener("mouseup", handleCanvasMouseUp);
  canvas.addEventListener("mouseleave", handleCanvasMouseUp);

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  });

  canvas.addEventListener("touchend", () => {
    const mouseEvent = new MouseEvent("mouseup");
    canvas.dispatchEvent(mouseEvent);
  });

  saveButton.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "macho.png";
    link.click();
  });

  function setupDragAndDrop() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    
    carouselItems.forEach(item => {
      item.setAttribute('draggable', 'true');
      
      item.addEventListener('dragstart', function(e) {
        isDraggingItem = true;
        currentDraggedElement = this;
        const imgSrc = this.querySelector('img').src;
        dragItem = { src: imgSrc };
        e.dataTransfer.setData('text/plain', imgSrc);
        e.dataTransfer.effectAllowed = 'copy';
        
        this.classList.add('dragging');
        canvasDropZone.classList.add('active');
        
        const rect = this.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
      });
      
      item.addEventListener('dragend', function() {
        isDraggingItem = false;
        currentDraggedElement = null;
        dragItem = null;
        
        this.classList.remove('dragging');
        canvasDropZone.classList.remove('active');
      });
      
      item.addEventListener('click', function(e) {
        if (isDraggingItem) return;
        const imgSrc = this.querySelector('img').src;
        addAccessory(imgSrc);
      });
    });
    
    canvasDropZone.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.style.backgroundColor = 'rgba(148, 1, 104, 0.5)';
    });
    
    canvasDropZone.addEventListener('dragleave', function() {
      this.style.backgroundColor = 'rgba(148, 1, 104, 0.3)';
    });
    
    canvasDropZone.addEventListener('drop', function(e) {
      e.preventDefault();
      this.style.backgroundColor = 'rgba(148, 1, 104, 0.3)';
      canvasDropZone.classList.remove('active');
      
      const imgSrc = e.dataTransfer.getData('text/plain');
      if (imgSrc) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addAccessory(imgSrc, x - 50, y - 50);
      }
    });
    
    document.addEventListener('dragover', function(e) {
      if (isDraggingItem) {
        e.preventDefault();
      }
    });
    
    document.addEventListener('drop', function(e) {
      if (isDraggingItem && !e.target.closest('.canvas-drop-zone')) {
        canvasDropZone.classList.remove('active');
        if (currentDraggedElement) {
          currentDraggedElement.classList.remove('dragging');
        }
      }
    });
  }

  const items = {
    cabelos: Array.from({ length: 50 }, (_, i) => `src/images/cabelos/cabelo${i + 1}.png`),
    oculos: Array.from({ length: 50 }, (_, i) => `src/images/oculos/oculos${i + 1}.png`),
    colares: [
      ...Array.from({ length: 40 }, (_, i) => `src/images/colares/colar${i + 1}.png`),
      ...Array.from({ length: 11 }, (_, i) => `src/images/colares/brinco${i + 1}.png`)
    ],
    chapeus: [
      ...Array.from({ length: 50 }, (_, i) => `src/images/chapeus/chapeu${i + 1}.png`)
    ],
    add: [
      ...Array.from({ length: 31 }, (_, i) => `src/images/adds/add${i + 1}.png`),
      ...Array.from({ length: 10 }, (_, i) => `src/images/adds/bolsa${i + 1}.png`)
    ]
  };

  function renderItems(category) {
    carousel.innerHTML = items[category].map(imageSrc => `
      <div class="carousel-item" draggable="true">
        <img src="${imageSrc}" alt="Acessório" draggable="false">
      </div>
    `).join('');
    checkArrowsVisibility();
    setTimeout(setupDragAndDrop, 0);
  }

  function updateTabs() {
    tabs.forEach((tab, index) => {
      tab.classList.toggle("active", index === currentIndex);
    });
    renderItems(tabs[currentIndex].dataset.category);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      currentIndex = index;
      updateTabs();
    });
  });

  if (selectedCharacter) {
    setCharacter(selectedCharacter);
  } else {
    alert('Nenhum personagem foi selecionado!');
    setCharacter('src/images/character.png');
  }

  updateTabs();

  document.addEventListener("keydown", (event) => {
    if (event.key === "Delete" && selectedAccessory) {
      const index = accessoryImages.findIndex(acc => acc.img === selectedAccessory.img);
      if (index !== -1) {
        accessoryImages.splice(index, 1);
        selectedAccessory = null;
        drawCharacterAndAccessories();
        updateLayersPanel();
      }
    }
    
    if (selectedAccessory) {
      const rotationStep = event.shiftKey ? 1 : 5;
      
      if (event.key === "ArrowLeft") {
        selectedAccessory.angle -= rotationStep;
        if (selectedAccessory.angle < 0) selectedAccessory.angle += 360;
        drawCharacterAndAccessories();
      } else if (event.key === "ArrowRight") {
        selectedAccessory.angle += rotationStep;
        if (selectedAccessory.angle >= 360) selectedAccessory.angle -= 360;
        drawCharacterAndAccessories();
      } else if (event.key === "r" || event.key === "R") {
        selectedAccessory.angle = 0;
        drawCharacterAndAccessories();
      } else if (event.key === "ArrowUp") {
        selectedAccessory.width = Math.min(MAX_SIZE, selectedAccessory.width + 5);
        selectedAccessory.height = Math.min(MAX_SIZE, selectedAccessory.height + 5);
        drawCharacterAndAccessories();
      } else if (event.key === "ArrowDown") {
        selectedAccessory.width = Math.max(MIN_SIZE, selectedAccessory.width - 5);
        selectedAccessory.height = Math.max(MIN_SIZE, selectedAccessory.height - 5);
        drawCharacterAndAccessories();
      }
    }
  });

  window.addAccessory = addAccessory;
});