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

  const selectedCharacter = localStorage.getItem('selectedCharacter');
  let characterImage = null;
  const accessoryImages = [];
  let selectedAccessory = null;
  let isDragging = false;
  let resizing = null;
  let panelCollapsed = false;
  let currentIndex = 0;

  carousel.addEventListener("wheel", (event) => {
    event.preventDefault();
    carousel.scrollBy({
      top: event.deltaY,
      behavior: "smooth"
    });
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
  });

  prevArrow.addEventListener("click", () => {
    carousel.scrollBy({
      top: -carousel.clientHeight,
      behavior: 'smooth'
    });
  });

  nextArrow.addEventListener("click", () => {
    carousel.scrollBy({
      top: carousel.clientHeight,
      behavior: 'smooth'
    });
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
      
      layerItem.textContent = `Acessório ${accessoryImages.length - i}`;
      
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

    accessoryImages.forEach(({ img, x, y, width, height }) => {
      ctx.drawImage(img, x, y, width, height);

      if (selectedAccessory && selectedAccessory.img === img) {
        ctx.strokeStyle = "rgba(148, 1, 104, 0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        ctx.fillStyle = "rgba(212, 68, 153, 0.5)";
        [[x-5,y-5], [x+width-5,y-5], [x-5,y+height-5], [x+width-5,y+height-5]].forEach(
          ([x, y]) => ctx.fillRect(x, y, 10, 10)
        );
      }
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

  function addAccessory(imageSrc) {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const newAccessory = {
        img,
        x: (canvas.width - 100) / 2,
        y: (canvas.height - 100) / 2,
        width: 100,
        height: 100
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
      if (x >= acc.x && x <= acc.x + acc.width && 
          y >= acc.y && y <= acc.y + acc.height) {
        return acc;
      }
    }
    return null;
  }

  function detectCorner(x, y, acc) {
    const cornerSize = 10;
    const corners = [
      { name: "top-left", x: acc.x, y: acc.y },
      { name: "top-right", x: acc.x + acc.width, y: acc.y },
      { name: "bottom-left", x: acc.x, y: acc.y + acc.height },
      { name: "bottom-right", x: acc.x + acc.width, y: acc.y + acc.height }
    ];
    return corners.find(corner =>
      x >= corner.x - cornerSize &&
      x <= corner.x + cornerSize &&
      y >= corner.y - cornerSize &&
      y <= corner.y + cornerSize
    );
  }

  function handleCanvasMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    
    const clickedAccessory = getAccessoryAtPosition(offsetX, offsetY);
    if (clickedAccessory) {
      const corner = detectCorner(offsetX, offsetY, clickedAccessory);
      if (corner) {
        selectedAccessory = clickedAccessory;
        resizing = corner.name;
        isDragging = true;
        return;
      }
    }
    
    selectedAccessory = clickedAccessory;
    if (selectedAccessory) isDragging = true;
    
    drawCharacterAndAccessories();
    updateLayersPanel();
  }

  function handleCanvasMouseMove(event) {
    if (isDragging && selectedAccessory) {
      const rect = canvas.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;

      if (resizing) {
        switch(resizing) {
          case "top-left":
            selectedAccessory.width += selectedAccessory.x - offsetX;
            selectedAccessory.height += selectedAccessory.y - offsetY;
            selectedAccessory.x = offsetX;
            selectedAccessory.y = offsetY;
            break;
          case "top-right":
            selectedAccessory.width = offsetX - selectedAccessory.x;
            selectedAccessory.height += selectedAccessory.y - offsetY;
            selectedAccessory.y = offsetY;
            break;
          case "bottom-left":
            selectedAccessory.width += selectedAccessory.x - offsetX;
            selectedAccessory.height = offsetY - selectedAccessory.y;
            selectedAccessory.x = offsetX;
            break;
          case "bottom-right":
            selectedAccessory.width = offsetX - selectedAccessory.x;
            selectedAccessory.height = offsetY - selectedAccessory.y;
            break;
        }
      } else {
        selectedAccessory.x = offsetX - selectedAccessory.width / 2;
        selectedAccessory.y = offsetY - selectedAccessory.height / 2;
      }

      drawCharacterAndAccessories();
    }
  }

  canvas.addEventListener("mousedown", handleCanvasMouseDown);
  canvas.addEventListener("mousemove", handleCanvasMouseMove);
  canvas.addEventListener("mouseup", () => {
    isDragging = false;
    resizing = null;
    updateLayersPanel();
  });

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

  const items = {
    cabelos: Array.from({length: 11}, (_, i) => `src/images/cabelo${i+1}.png`),
    oculos: Array.from({length: 12}, (_, i) => `src/images/oculos${i+1}.png`),
    colares: [
      ...Array.from({length: 8}, (_, i) => `src/images/colar${i+1}.png`),
      "src/images/cachecol-rosa.png"
    ],
    chapeus: [
      ...Array.from({length: 15}, (_, i) => `src/images/coroa${i+1}.png`).filter((_, i) => i !== 6),
      "src/images/boina.png"
    ],
    add: [
      ...Array.from({length: 12}, (_, i) => `src/images/add${i+1}.png`),
      "src/images/laço-azul.png", "src/images/laço-rosa.png",
      "src/images/mini-bag-pink.png", "src/images/bag-pink.png",
      ...Array.from({length: 10}, (_, i) => `src/images/bolsa${i+1}.png`)
    ]
  };

  function renderItems(category) {
    carousel.innerHTML = items[category].map(imageSrc => `
      <div class="carousel-item">
        <img src="${imageSrc}" alt="Acessório" onclick="addAccessory('${imageSrc}')">
      </div>
    `).join('');
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
  });

  window.addAccessory = addAccessory;
});