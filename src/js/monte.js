   document.addEventListener("DOMContentLoaded", function() {
      const carousel = document.getElementById("carousel");
      
      document.getElementById("prevArrow").addEventListener("click", () => {
        carousel.scrollBy({
          top: -carousel.clientHeight,
          behavior: 'smooth'
        });
      });

      document.getElementById("nextArrow").addEventListener("click", () => {
        carousel.scrollBy({
          top: carousel.clientHeight,
          behavior: 'smooth'
        });
      });

      const selectedCharacter = localStorage.getItem('selectedCharacter');
      let characterImage = null;
      const accessoryImages = [];
      let selectedAccessory = null;
      let isDragging = false;
      let resizing = null;
      const canvas = document.getElementById("avatarCanvas");
      const ctx = canvas.getContext("2d");
      const layersPanel = document.getElementById("layersPanel");
      const layersList = document.getElementById("layersList");
      const togglePanelBtn = document.getElementById("togglePanel");
      const panelContent = document.getElementById("panelContent");

      let panelCollapsed = false;
      
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
              const temp = accessoryImages[i];
              accessoryImages[i] = accessoryImages[i + 1];
              accessoryImages[i + 1] = temp;
              updateLayersPanel();
              drawCharacterAndAccessories();
            }
          });
          
          const moveDownBtn = document.createElement('button');
          moveDownBtn.textContent = '↓';
          moveDownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (i > 0) {
              const temp = accessoryImages[i];
              accessoryImages[i] = accessoryImages[i - 1];
              accessoryImages[i - 1] = temp;
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
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const scaleX = canvasWidth / characterImage.width;
        const scaleY = canvasHeight / characterImage.height;
        const scale = Math.min(scaleX, scaleY);

        const newWidth = characterImage.width * scale;
        const newHeight = characterImage.height * scale;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        ctx.drawImage(
          characterImage,
          (canvasWidth - newWidth) / 2,
          (canvasHeight - newHeight) / 2,
          newWidth,
          newHeight
        );

        accessoryImages.forEach(({ img, x, y, width, height }) => {
          ctx.drawImage(img, x, y, width, height);

          if (selectedAccessory && selectedAccessory.img === img) {
            ctx.strokeStyle = "rgba(148, 1, 104, 0.8)";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
            
            ctx.fillStyle = "rgba(63, 5, 39, 0.5)";
            const corners = [
              { x: x - 5, y: y - 5 },
              { x: x + width - 5, y: y - 5 },
              { x: x - 5, y: y + height - 5 },
              { x: x + width - 5, y: y + height - 5 },
            ];
            corners.forEach(({ x, y }) => ctx.fillRect(x, y, 10, 10));
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
        const accessoryImage = new Image();
        accessoryImage.src = imageSrc;

        accessoryImage.onload = () => {
          const width = 100;
          const height = 100;
          const x = (canvas.width - width) / 2;
          const y = (canvas.height - height) / 2;

          const newAccessory = { img: accessoryImage, x, y, width, height };
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

      function detectCorner(x, y, acc) {
        const cornerSize = 10;
        const corners = [
          { name: "top-left", x: acc.x, y: acc.y },
          { name: "top-right", x: acc.x + acc.width, y: acc.y },
          { name: "bottom-left", x: acc.x, y: acc.y + acc.height },
          { name: "bottom-right", x: acc.x + acc.width, y: acc.y + acc.height },
        ];
        return corners.find(
          (corner) =>
            x >= corner.x - cornerSize &&
            x <= corner.x + cornerSize &&
            y >= corner.y - cornerSize &&
            y <= corner.y + cornerSize
        );
      }

      function getAccessoryAtPosition(x, y) {
        for (let i = accessoryImages.length - 1; i >= 0; i--) {
          const acc = accessoryImages[i];
          if (x >= acc.x && x <= acc.x + acc.width && y >= acc.y && y <= acc.y + acc.height) {
            return acc;
          }
        }
        return null;
      }

      canvas.addEventListener("mousedown", (event) => {
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
        if (selectedAccessory) {
          isDragging = true;
        }
        
        drawCharacterAndAccessories();
        updateLayersPanel();
      });

      canvas.addEventListener("mousemove", (event) => {
        if (isDragging && selectedAccessory) {
          const rect = canvas.getBoundingClientRect();
          const offsetX = event.clientX - rect.left;
          const offsetY = event.clientY - rect.top;

          if (resizing) {
            if (resizing === "top-left") {
              selectedAccessory.width += selectedAccessory.x - offsetX;
              selectedAccessory.height += selectedAccessory.y - offsetY;
              selectedAccessory.x = offsetX;
              selectedAccessory.y = offsetY;
            } else if (resizing === "top-right") {
              selectedAccessory.width = offsetX - selectedAccessory.x;
              selectedAccessory.height += selectedAccessory.y - offsetY;
              selectedAccessory.y = offsetY;
            } else if (resizing === "bottom-left") {
              selectedAccessory.width += selectedAccessory.x - offsetX;
              selectedAccessory.height = offsetY - selectedAccessory.y;
              selectedAccessory.x = offsetX;
            } else if (resizing === "bottom-right") {
              selectedAccessory.width = offsetX - selectedAccessory.x;
              selectedAccessory.height = offsetY - selectedAccessory.y;
            }
          } else {
            selectedAccessory.x = offsetX - selectedAccessory.width / 2;
            selectedAccessory.y = offsetY - selectedAccessory.height / 2;
          }

          drawCharacterAndAccessories();
        }
      });

      canvas.addEventListener("mouseup", () => {
        isDragging = false;
        resizing = null;
        updateLayersPanel();
      });

      canvas.addEventListener("touchstart", (event) => {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const offsetX = touch.clientX - rect.left;
        const offsetY = touch.clientY - rect.top;
        
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
        if (selectedAccessory) {
          isDragging = true;
        }
        
        drawCharacterAndAccessories();
        updateLayersPanel();
      });

      canvas.addEventListener("touchmove", (event) => {
        event.preventDefault();
        if (isDragging && selectedAccessory) {
          const rect = canvas.getBoundingClientRect();
          const touch = event.touches[0];
          const offsetX = touch.clientX - rect.left;
          const offsetY = touch.clientY - rect.top;

          if (resizing) {
            if (resizing === "top-left") {
              selectedAccessory.width += selectedAccessory.x - offsetX;
              selectedAccessory.height += selectedAccessory.y - offsetY;
              selectedAccessory.x = offsetX;
              selectedAccessory.y = offsetY;
            } else if (resizing === "top-right") {
              selectedAccessory.width = offsetX - selectedAccessory.x;
              selectedAccessory.height += selectedAccessory.y - offsetY;
              selectedAccessory.y = offsetY;
            } else if (resizing === "bottom-left") {
              selectedAccessory.width += selectedAccessory.x - offsetX;
              selectedAccessory.height = offsetY - selectedAccessory.y;
              selectedAccessory.x = offsetX;
            } else if (resizing === "bottom-right") {
              selectedAccessory.width = offsetX - selectedAccessory.x;
              selectedAccessory.height = offsetY - selectedAccessory.y;
            }
          } else {
            selectedAccessory.x = offsetX - selectedAccessory.width / 2;
            selectedAccessory.y = offsetY - selectedAccessory.height / 2;
          }

          drawCharacterAndAccessories();
        }
      });

      canvas.addEventListener("touchend", () => {
        isDragging = false;
        resizing = null;
        updateLayersPanel();
      });

      const saveButton = document.getElementById("saveAvatar");
      saveButton.addEventListener("click", () => {
        const image = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = image;
        link.download = "macho.png";
        link.click();
      });

      if (selectedCharacter) {
        setCharacter(selectedCharacter);
      } else {
        alert('Nenhum personagem foi selecionado!');
      }

      const tabs = document.querySelectorAll(".tab");
      const items = {
        cabelos: [
          "src/images/cabelo1.png",
          "src/images/cabelo2.png",
          "src/images/cabelo3.png",
          "src/images/cabelo4.png",
          "src/images/cabelo5.png",
          "src/images/cabelo6.png",
          "src/images/cabelo7.png",
          "src/images/cabelo8.png",
          "src/images/cabelo9.png",
          "src/images/cabelo10.png",
          "src/images/cabelo11.png"
        ],
        oculos: [
          "src/images/oculos1.png",
          "src/images/oculos2.png",
          "src/images/oculos3.png",
          "src/images/oculos4.png",
          "src/images/oculos5.png",
          "src/images/oculos6.png",
          "src/images/oculos7.png",
          "src/images/oculos8.png",
          "src/images/oculos9.png",
          "src/images/oculos10.png",
          "src/images/oculos11.png",
          "src/images/oculos12.png"
        ],
        colares: [
          "src/images/colar1.png",
          "src/images/colar2.png",
          "src/images/colar3.png",
          "src/images/colar4.png",
          "src/images/colar5.png",
          "src/images/colar6.png",
          "src/images/colar7.png",
          "src/images/colar8.png",
          "src/images/cachecol-rosa.png"
        ],
        chapeus: [
          "src/images/coroa8.png",
          "src/images/coroa9.png",
          "src/images/coroa10.png",
          "src/images/coroa11.png",
          "src/images/coroa12.png",
          "src/images/coroa13.png",
          "src/images/coroa1.png",
          "src/images/coroa2.png",
          "src/images/coroa3.png",
          "src/images/coroa4.png",
          "src/images/coroa5.png",
          "src/images/coroa6.png",
          "src/images/coroa7.png",
          "src/images/coroa14.png",
          "src/images/coroa15.png",
          "src/images/boina.png"
        ],
        add: [
          "src/images/add1.png",
          "src/images/add2.png",
          "src/images/add3.png",
          "src/images/add4.png",
          "src/images/add5.png",
          "src/images/add6.png",
          "src/images/add7.png",
          "src/images/add8.png",
          "src/images/add9.png",
          "src/images/add10.png",
          "src/images/add11.png",
          "src/images/add12.png",
          "src/images/laço-azul.png",
          "src/images/laço-rosa.png",
          "src/images/mini-bag-pink.png",
          "src/images/bag-pink.png",
          "src/images/bolsa1.png",
          "src/images/bolsa2.png",
          "src/images/bolsa3.png",
          "src/images/bolsa4.png",
          "src/images/bolsa5.png",
          "src/images/bolsa6.png",
          "src/images/bolsa7.png",
          "src/images/bolsa8.png",
          "src/images/bolsa9.png",
          "src/images/bolsa10.png"
        ],
      };

      let currentIndex = 0;
      function renderItems(category) {
        const categoryItems = items[category];
        carousel.innerHTML = "";
        categoryItems.forEach((imageSrc) => {
          const item = document.createElement("div");
          item.classList.add("carousel-item");
          const img = document.createElement("img");
          img.src = imageSrc;
          img.alt = "Acessório";
          item.appendChild(img);
          item.addEventListener("click", () => {
            addAccessory(imageSrc);
          });
          carousel.appendChild(item);
        });
      }
      
      function updateTabs() {
        tabs.forEach((tab, index) => {
          tab.classList.toggle("active", index === currentIndex);
        });
        const category = tabs[currentIndex].dataset.category;
        renderItems(category);
      }
      
      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
          currentIndex = index;
          updateTabs();
        });
      });
      
      updateTabs();

      document.addEventListener("keydown", (event) => {
        if (event.key === "Delete" && selectedAccessory) {
          const index = accessoryImages.findIndex(
            (accessory) => accessory.img === selectedAccessory.img
          );
          if (index !== -1) {
            accessoryImages.splice(index, 1);
            selectedAccessory = null;
            drawCharacterAndAccessories();
            updateLayersPanel();
          }
        }
      });
    });