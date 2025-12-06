import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import './Personalizar.css';

const personalizarItens = {
  cabelos: Array.from({ length: 50 }, (_, i) => `/images/cabelos/cabelo${i + 1}.png`),
  oculos: Array.from({ length: 50 }, (_, i) => `/images/oculos/oculos${i + 1}.png`),
  colares: [
    ...Array.from({ length: 40 }, (_, i) => `/images/colares/colar${i + 1}.png`),
    ...Array.from({ length: 11 }, (_, i) => `/images/colares/brinco${i + 1}.png`)
  ],
  chapeus: Array.from({ length: 50 }, (_, i) => `/images/chapeus/chapeu${i + 1}.png`),
  adds: [
    ...Array.from({ length: 31 }, (_, i) => `/images/adds/add${i + 1}.png`),
    ...Array.from({ length: 10 }, (_, i) => `/images/adds/bolsa${i + 1}.png`)
  ]
};

const Personalizar = () => {
  const personalizarCanvasRef = useRef(null);
  const personalizarCarouselRef = useRef(null);
  const personalizarLayersPanelRef = useRef(null);
  const [personalizarImagemPersonagem, setPersonalizarImagemPersonagem] = useState(null);
  const [personalizarImagensAcessorios, setPersonalizarImagensAcessorios] = useState([]);
  const [personalizarAcessorioSelecionado, setPersonalizarAcessorioSelecionado] = useState(null);
  const [personalizarAbaAtual, setPersonalizarAbaAtual] = useState('cabelos');
  const [personalizarPainelRecolhido, setPersonalizarPainelRecolhido] = useState(false);
  const [personalizarArrastando, setPersonalizarArrastando] = useState(false);
  const [personalizarArrastandoItem, setPersonalizarArrastandoItem] = useState(false);
  const [personalizarRedimensionando, setPersonalizarRedimensionando] = useState(null);
  const [personalizarRotacionando, setPersonalizarRotacionando] = useState(false);
  const [personalizarDadosArraste, setPersonalizarDadosArraste] = useState({ startX: 0, startY: 0, initialWidth: 0, initialHeight: 0, initialAngle: 0, initialMouseAngle: 0 });
  
  const PERSONALIZAR_TAMANHO_ALCA = 12;
  const PERSONALIZAR_DISTANCIA_ALCA_ROTACAO = 35;
  const PERSONALIZAR_TAMANHO_MINIMO = 30;
  const PERSONALIZAR_TAMANHO_MAXIMO = 800;

  useEffect(() => {
    const personagemSelecionado = localStorage.getItem('carrosselPersonagemSelecionado');
    if (personagemSelecionado) {
      const img = new Image();
      img.src = personagemSelecionado;
      img.onload = () => {
        setPersonalizarImagemPersonagem(img);
      };
    } else {
      alert('Nenhum personagem foi selecionado!');
      const img = new Image();
      img.src = '/images/character.png';
      img.onload = () => {
        setPersonalizarImagemPersonagem(img);
      };
    }
  }, []);

  useEffect(() => {
    personalizarDesenharPersonagemEAcessorios();
  }, [personalizarImagemPersonagem, personalizarImagensAcessorios, personalizarAcessorioSelecionado]);

  const personalizarDesenharPersonagemEAcessorios = () => {
    const canvas = personalizarCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (personalizarImagemPersonagem) {
      const scale = Math.min(
        canvas.width / personalizarImagemPersonagem.width,
        canvas.height / personalizarImagemPersonagem.height
      );
      const newWidth = personalizarImagemPersonagem.width * scale;
      const newHeight = personalizarImagemPersonagem.height * scale;

      ctx.drawImage(
        personalizarImagemPersonagem,
        (canvas.width - newWidth) / 2,
        (canvas.height - newHeight) / 2,
        newWidth,
        newHeight
      );
    }

    personalizarImagensAcessorios.forEach((acessorio, index) => {
      const { img, x, y, width, height, angle = 0 } = acessorio;
      if (!img) return;

      ctx.save();
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * Math.PI / 180);
      
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      
      if (personalizarAcessorioSelecionado && personalizarAcessorioSelecionado.img === acessorio.img) {
        ctx.strokeStyle = "rgba(148, 1, 104, 0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(-width / 2, -height / 2, width, height);
        
        ctx.fillStyle = "rgba(143, 28, 85, 0.8)";
        
        const cornerHandles = [
          { x: -width/2, y: -height/2 },
          { x: width/2, y: -height/2 },
          { x: -width/2, y: height/2 },
          { x: width/2, y: height/2 }
        ];
        
        const edgeHandles = [
          { x: 0, y: -height/2 },
          { x: width/2, y: 0 },
          { x: 0, y: height/2 },
          { x: -width/2, y: 0 }
        ];
        
        cornerHandles.forEach(({x, y}) => {
          ctx.beginPath();
          ctx.arc(x, y, PERSONALIZAR_TAMANHO_ALCA, 0, Math.PI * 2);
          ctx.fill();
        });
        
        edgeHandles.forEach(({x, y}) => {
          ctx.beginPath();
          ctx.arc(x, y, PERSONALIZAR_TAMANHO_ALCA/1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.restore();
    });
  };

  const personalizarObterAcessorioNaPosicao = (x, y) => {
    for (let i = personalizarImagensAcessorios.length - 1; i >= 0; i--) {
      const acc = personalizarImagensAcessorios[i];
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
  };

  const personalizarDetectarControle = (x, y, acc) => {
    const centerX = acc.x + acc.width / 2;
    const centerY = acc.y + acc.height / 2;
    const angle = -acc.angle * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    const localX = (x - centerX) * cos - (y - centerY) * sin;
    const localY = (x - centerX) * sin + (y - centerY) * cos;

    const cornerHandles = [
      { name: "resize-nw", x: -acc.width/2, y: -acc.height/2, size: PERSONALIZAR_TAMANHO_ALCA },
      { name: "resize-ne", x: acc.width/2, y: -acc.height/2, size: PERSONALIZAR_TAMANHO_ALCA },
      { name: "resize-sw", x: -acc.width/2, y: acc.height/2, size: PERSONALIZAR_TAMANHO_ALCA },
      { name: "resize-se", x: acc.width/2, y: acc.height/2, size: PERSONALIZAR_TAMANHO_ALCA }
    ];
    
    const edgeHandles = [
      { name: "resize-n", x: 0, y: -acc.height/2, size: PERSONALIZAR_TAMANHO_ALCA/1.5 },
      { name: "resize-e", x: acc.width/2, y: 0, size: PERSONALIZAR_TAMANHO_ALCA/1.5 },
      { name: "resize-s", x: 0, y: acc.height/2, size: PERSONALIZAR_TAMANHO_ALCA/1.5 },
      { name: "resize-w", x: -acc.width/2, y: 0, size: PERSONALIZAR_TAMANHO_ALCA/1.5 }
    ];
    
    for (const handle of [...cornerHandles, ...edgeHandles]) {
      const dx = localX - handle.x;
      const dy = localY - handle.y;
      if (Math.sqrt(dx * dx + dy * dy) <= handle.size) {
        return { type: "resize", corner: handle.name.split('-')[1] };
      }
    }
    
    const rotationHandleY = -acc.height/2 - PERSONALIZAR_DISTANCIA_ALCA_ROTACAO;
    const rotDx = localX - 0;
    const rotDy = localY - rotationHandleY;
    if (Math.sqrt(rotDx * rotDx + rotDy * rotDy) <= PERSONALIZAR_TAMANHO_ALCA) {
      return { type: "rotate" };
    }
    
    return null;
  };

  const personalizarMouseDownCanvas = (e) => {
    e.preventDefault();
    const canvas = personalizarCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    const clickedAccessory = personalizarObterAcessorioNaPosicao(offsetX, offsetY);
    if (clickedAccessory) {
      const control = personalizarDetectarControle(offsetX, offsetY, clickedAccessory);
      if (control) {
        setPersonalizarAcessorioSelecionado(clickedAccessory);
        
        if (control.type === "rotate") {
          setPersonalizarRotacionando(true);
          const centerX = clickedAccessory.x + clickedAccessory.width / 2;
          const centerY = clickedAccessory.y + clickedAccessory.height / 2;
          const initialMouseAngle = Math.atan2(offsetY - centerY, offsetX - centerX) * 180 / Math.PI;
          
          setPersonalizarDadosArraste({
            startX: offsetX,
            startY: offsetY,
            initialWidth: clickedAccessory.width,
            initialHeight: clickedAccessory.height,
            initialAngle: clickedAccessory.angle || 0,
            initialMouseAngle
          });
          return;
        } 
        else if (control.type === "resize") {
          setPersonalizarRedimensionando(control.corner);
          setPersonalizarArrastando(true);
          setPersonalizarDadosArraste({
            startX: offsetX,
            startY: offsetY,
            initialWidth: clickedAccessory.width,
            initialHeight: clickedAccessory.height,
            initialAngle: clickedAccessory.angle || 0,
            initialMouseAngle: 0
          });
          return;
        }
      }
      
      setPersonalizarAcessorioSelecionado(clickedAccessory);
      setPersonalizarArrastando(true);
      setPersonalizarDadosArraste({
        startX: offsetX,
        startY: offsetY,
        initialWidth: clickedAccessory.width,
        initialHeight: clickedAccessory.height,
        initialAngle: clickedAccessory.angle || 0,
        initialMouseAngle: 0
      });
      return;
    }
    
    setPersonalizarAcessorioSelecionado(null);
  };

  const personalizarMouseMoveCanvas = (e) => {
    if (!personalizarArrastando && !personalizarRotacionando) return;
    
    e.preventDefault();
    const canvas = personalizarCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    if (personalizarRotacionando && personalizarAcessorioSelecionado) {
      const centerX = personalizarAcessorioSelecionado.x + personalizarAcessorioSelecionado.width / 2;
      const centerY = personalizarAcessorioSelecionado.y + personalizarAcessorioSelecionado.height / 2;
      
      const newMouseAngle = Math.atan2(offsetY - centerY, offsetX - centerX) * 180 / Math.PI;
      const newAngle = personalizarDadosArraste.initialAngle + (newMouseAngle - personalizarDadosArraste.initialMouseAngle);
      
      const updatedAccessory = {
        ...personalizarAcessorioSelecionado,
        angle: ((newAngle % 360) + 360) % 360
      };
      
      setPersonalizarImagensAcessorios(prev => prev.map(acc => 
        acc.img === personalizarAcessorioSelecionado.img ? updatedAccessory : acc
      ));
      setPersonalizarAcessorioSelecionado(updatedAccessory);
      return;
    }
    
    if (personalizarArrastando && personalizarAcessorioSelecionado) {
      if (personalizarRedimensionando) {
        const centerX = personalizarAcessorioSelecionado.x + personalizarAcessorioSelecionado.width / 2;
        const centerY = personalizarAcessorioSelecionado.y + personalizarAcessorioSelecionado.height / 2;
        
        const angle = -(personalizarAcessorioSelecionado.angle || 0) * Math.PI / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        const localX = (offsetX - centerX) * cos - (offsetY - centerY) * sin;
        const localY = (offsetX - centerX) * sin + (offsetY - centerY) * cos;
        
        const startLocalX = (personalizarDadosArraste.startX - centerX) * cos - (personalizarDadosArraste.startY - centerY) * sin;
        const startLocalY = (personalizarDadosArraste.startX - centerX) * sin + (personalizarDadosArraste.startY - centerY) * cos;
        
        let newWidth = personalizarDadosArraste.initialWidth;
        let newHeight = personalizarDadosArraste.initialHeight;

        switch(personalizarRedimensionando) {
          case "nw": 
            newWidth = personalizarDadosArraste.initialWidth - (localX - startLocalX) * 2;
            newHeight = personalizarDadosArraste.initialHeight - (localY - startLocalY) * 2;
            break;
          case "ne": 
            newWidth = personalizarDadosArraste.initialWidth + (localX - startLocalX) * 2;
            newHeight = personalizarDadosArraste.initialHeight - (localY - startLocalY) * 2;
            break;
          case "sw":
            newWidth = personalizarDadosArraste.initialWidth - (localX - startLocalX) * 2;
            newHeight = personalizarDadosArraste.initialHeight + (localY - startLocalY) * 2;
            break;
          case "se": 
            newWidth = personalizarDadosArraste.initialWidth + (localX - startLocalX) * 2;
            newHeight = personalizarDadosArraste.initialHeight + (localY - startLocalY) * 2;
            break;
          case "n":
            newHeight = personalizarDadosArraste.initialHeight - (localY - startLocalY) * 2;
            break;
          case "e":
            newWidth = personalizarDadosArraste.initialWidth + (localX - startLocalX) * 2;
            break;
          case "s": 
            newHeight = personalizarDadosArraste.initialHeight + (localY - startLocalY) * 2;
            break;
          case "w": 
            newWidth = personalizarDadosArraste.initialWidth - (localX - startLocalX) * 2;
            break;
        }
        
        newWidth = Math.max(PERSONALIZAR_TAMANHO_MINIMO, Math.min(PERSONALIZAR_TAMANHO_MAXIMO, newWidth));
        newHeight = Math.max(PERSONALIZAR_TAMANHO_MINIMO, Math.min(PERSONALIZAR_TAMANHO_MAXIMO, newHeight));
        
        if (e.shiftKey) {
          const aspect = personalizarDadosArraste.initialWidth / personalizarDadosArraste.initialHeight;
          if (personalizarRedimensionando.includes("w") || personalizarRedimensionando.includes("e")) {
            newHeight = newWidth / aspect;
          } else {
            newWidth = newHeight * aspect;
          }
        }
        
        const widthRatio = newWidth / personalizarAcessorioSelecionado.width;
        const heightRatio = newHeight / personalizarAcessorioSelecionado.height;
        
        const newX = centerX - (centerX - personalizarAcessorioSelecionado.x) * widthRatio;
        const newY = centerY - (centerY - personalizarAcessorioSelecionado.y) * heightRatio;
        
        const updatedAccessory = {
          ...personalizarAcessorioSelecionado,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
        };
        
        setPersonalizarImagensAcessorios(prev => prev.map(acc => 
          acc.img === personalizarAcessorioSelecionado.img ? updatedAccessory : acc
        ));
        setPersonalizarAcessorioSelecionado(updatedAccessory);
      } else {
        const deltaX = offsetX - personalizarDadosArraste.startX;
        const deltaY = offsetY - personalizarDadosArraste.startY;
        
        const updatedAccessory = {
          ...personalizarAcessorioSelecionado,
          x: personalizarAcessorioSelecionado.x + deltaX,
          y: personalizarAcessorioSelecionado.y + deltaY
        };
        
        setPersonalizarImagensAcessorios(prev => prev.map(acc => 
          acc.img === personalizarAcessorioSelecionado.img ? updatedAccessory : acc
        ));
        setPersonalizarAcessorioSelecionado(updatedAccessory);
        
        setPersonalizarDadosArraste(prev => ({ ...prev, startX: offsetX, startY: offsetY }));
      }
    }
  };

  const personalizarMouseUpCanvas = () => {
    setPersonalizarArrastando(false);
    setPersonalizarRedimensionando(null);
    setPersonalizarRotacionando(false);
  };

  const personalizarAdicionarAcessorio = (imageSrc, x = null, y = null) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = personalizarCanvasRef.current;
      const newAccessory = {
        img,
        x: x !== null ? x : (canvas.width - 100) / 2,
        y: y !== null ? y : (canvas.height - 100) / 2,
        width: 100,
        height: 100,
        angle: 0
      };
      setPersonalizarImagensAcessorios(prev => [...prev, newAccessory]);
      setPersonalizarAcessorioSelecionado(newAccessory);
      if (personalizarPainelRecolhido) {
        setPersonalizarPainelRecolhido(false);
      }
    };
  };

  const personalizarSalvarAvatar = () => {
    const canvas = personalizarCanvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "macho-makeover-avatar.png";
    link.click();
  };

  const personalizarClicarAba = (categoria) => {
    setPersonalizarAbaAtual(categoria);
  };

  const personalizarAlternarPainel = () => {
    setPersonalizarPainelRecolhido(!personalizarPainelRecolhido);
  };

  const personalizarTeclaPressionada = (e) => {
    if (e.key === "Delete" && personalizarAcessorioSelecionado) {
      setPersonalizarImagensAcessorios(prev => prev.filter(acc => acc.img !== personalizarAcessorioSelecionado.img));
      setPersonalizarAcessorioSelecionado(null);
    }
    
    if (personalizarAcessorioSelecionado) {
      const rotationStep = e.shiftKey ? 1 : 5;
      
      if (e.key === "ArrowLeft") {
        const updatedAccessory = {
          ...personalizarAcessorioSelecionado,
          angle: ((personalizarAcessorioSelecionado.angle - rotationStep) % 360 + 360) % 360
        };
        setPersonalizarImagensAcessorios(prev => prev.map(acc => 
          acc.img === personalizarAcessorioSelecionado.img ? updatedAccessory : acc
        ));
        setPersonalizarAcessorioSelecionado(updatedAccessory);
      } else if (e.key === "ArrowRight") {
        const updatedAccessory = {
          ...personalizarAcessorioSelecionado,
          angle: ((personalizarAcessorioSelecionado.angle + rotationStep) % 360 + 360) % 360
        };
        setPersonalizarImagensAcessorios(prev => prev.map(acc => 
          acc.img === personalizarAcessorioSelecionado.img ? updatedAccessory : acc
        ));
        setPersonalizarAcessorioSelecionado(updatedAccessory);
      } else if (e.key === "r" || e.key === "R") {
        const updatedAccessory = {
          ...personalizarAcessorioSelecionado,
          angle: 0
        };
        setPersonalizarImagensAcessorios(prev => prev.map(acc => 
          acc.img === personalizarAcessorioSelecionado.img ? updatedAccessory : acc
        ));
        setPersonalizarAcessorioSelecionado(updatedAccessory);
      } else if (e.key === "ArrowUp") {
        const updatedAccessory = {
          ...personalizarAcessorioSelecionado,
          width: Math.min(PERSONALIZAR_TAMANHO_MAXIMO, personalizarAcessorioSelecionado.width + 5),
          height: Math.min(PERSONALIZAR_TAMANHO_MAXIMO, personalizarAcessorioSelecionado.height + 5)
        };
        setPersonalizarImagensAcessorios(prev => prev.map(acc => 
          acc.img === personalizarAcessorioSelecionado.img ? updatedAccessory : acc
        ));
        setPersonalizarAcessorioSelecionado(updatedAccessory);
      } else if (e.key === "ArrowDown") {
        const updatedAccessory = {
          ...personalizarAcessorioSelecionado,
          width: Math.max(PERSONALIZAR_TAMANHO_MINIMO, personalizarAcessorioSelecionado.width - 5),
          height: Math.max(PERSONALIZAR_TAMANHO_MINIMO, personalizarAcessorioSelecionado.height - 5)
        };
        setPersonalizarImagensAcessorios(prev => prev.map(acc => 
          acc.img === personalizarAcessorioSelecionado.img ? updatedAccessory : acc
        ));
        setPersonalizarAcessorioSelecionado(updatedAccessory);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', personalizarTeclaPressionada);
    return () => window.removeEventListener('keydown', personalizarTeclaPressionada);
  }, [personalizarAcessorioSelecionado]);

  const personalizarInicioArraste = (e, imageSrc) => {
    e.dataTransfer.setData('text/plain', imageSrc);
    setPersonalizarArrastandoItem(true);
    e.currentTarget.classList.add('personalizar-arrastando');
  };

  const personalizarFimArraste = (e) => {
    setPersonalizarArrastandoItem(false);
    e.currentTarget.classList.remove('personalizar-arrastando');
  };

  const personalizarSoltarNoCanvas = (e) => {
    e.preventDefault();
    const imageSrc = e.dataTransfer.getData('text/plain');
    if (imageSrc) {
      const canvas = personalizarCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      personalizarAdicionarAcessorio(imageSrc, x - 50, y - 50);
    }
  };

  const personalizarArrasteSobre = (e) => {
    e.preventDefault();
  };

  const personalizarRolagemCarrossel = () => {
    const carousel = personalizarCarouselRef.current;
    const prevArrow = document.getElementById('personalizar-seta-anterior');
    const nextArrow = document.getElementById('personalizar-seta-proxima');
    
    if (prevArrow && nextArrow) {
      prevArrow.style.visibility = carousel.scrollTop > 0 ? 'visible' : 'hidden';
      nextArrow.style.visibility = carousel.scrollTop < carousel.scrollHeight - carousel.clientHeight ? 'visible' : 'hidden';
    }
  };

  const personalizarRolarCarrossel = (direcao) => {
    const carousel = personalizarCarouselRef.current;
    if (carousel) {
      carousel.scrollBy({
        top: direcao * carousel.clientHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="personalizar-container" onDragOver={personalizarArrasteSobre}>
      <div 
        id="personalizar-painel-camadas" 
        ref={personalizarLayersPanelRef} 
        className={`personalizar-painel-camadas ${personalizarPainelRecolhido ? 'personalizar-recolhido' : ''}`}
      >
        <div className="personalizar-cabecalho-painel">
          <span className="personalizar-titulo-painel">Camadas</span>
          <button className="personalizar-botao-alternar" onClick={personalizarAlternarPainel}>
            {personalizarPainelRecolhido ? '►' : '▼'}
          </button>
        </div>
        {!personalizarPainelRecolhido && (
          <div className="personalizar-conteudo-painel">
            <div className="personalizar-item-camada">
              Personagem Base
            </div>
            {[...personalizarImagensAcessorios].reverse().map((acessorio, index) => (
              <div 
                key={index} 
                className={`personalizar-item-camada ${personalizarAcessorioSelecionado?.img === acessorio.img ? 'personalizar-selecionado' : ''}`}
                onClick={() => setPersonalizarAcessorioSelecionado(acessorio)}
              >
                Acessório {personalizarImagensAcessorios.length - index}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="personalizar-alinhamento">
        <div className="personalizar-canva">
          <canvas 
            ref={personalizarCanvasRef}
            id="personalizar-canvas-avatar" 
            width="600" 
            height="600"
            onMouseDown={personalizarMouseDownCanvas}
            onMouseMove={personalizarMouseMoveCanvas}
            onMouseUp={personalizarMouseUpCanvas}
            onMouseLeave={personalizarMouseUpCanvas}
            onDrop={personalizarSoltarNoCanvas}
            onDragOver={personalizarArrasteSobre}
          ></canvas>
        </div>

        <div className="personalizar-salvar">
          <button className="personalizar-botao-salvar" onClick={personalizarSalvarAvatar}>
            <h1 className="personalizar-texto-botao-salvar">Salvar Macho</h1>
            <img src="/images/diamante.png" alt="Diamante" className="personalizar-icone-diamante" />
          </button>
        </div>
      </div>

      <div className="personalizar-container-carrossel">
        <div className="personalizar-container-abas">
          <div className="personalizar-abas">
            <div className={`personalizar-aba ${personalizarAbaAtual === 'cabelos' ? 'personalizar-aba-ativa' : ''}`} onClick={() => personalizarClicarAba('cabelos')}>
              Cabelos
            </div>
            <div className={`personalizar-aba ${personalizarAbaAtual === 'oculos' ? 'personalizar-aba-ativa' : ''}`} onClick={() => personalizarClicarAba('oculos')}>
              Óculos
            </div>
            <div className={`personalizar-aba ${personalizarAbaAtual === 'colares' ? 'personalizar-aba-ativa' : ''}`} onClick={() => personalizarClicarAba('colares')}>
              Colares
            </div>
            <div className={`personalizar-aba ${personalizarAbaAtual === 'chapeus' ? 'personalizar-aba-ativa' : ''}`} onClick={() => personalizarClicarAba('chapeus')}>
              Chapeus
            </div>
            <div className={`personalizar-aba ${personalizarAbaAtual === 'adds' ? 'personalizar-aba-ativa' : ''}`} onClick={() => personalizarClicarAba('adds')}>
              Adds
            </div>
          </div>
        </div>
        <div className="personalizar-seta" id="personalizar-seta-anterior" onClick={() => personalizarRolarCarrossel(-1)}>↑</div>
        <div 
          className="personalizar-carrossel" 
          id="personalizar-carrossel" 
          ref={personalizarCarouselRef}
          onScroll={personalizarRolagemCarrossel}
        >
          {personalizarItens[personalizarAbaAtual].map((imageSrc, index) => (
            <div 
              key={index} 
              className="personalizar-item-carrossel"
              draggable="true"
              onDragStart={(e) => personalizarInicioArraste(e, imageSrc)}
              onDragEnd={personalizarFimArraste}
              onClick={() => personalizarAdicionarAcessorio(imageSrc)}
            >
              <img src={imageSrc} alt="Acessório" draggable="false" className="personalizar-imagem-acessorio" />
            </div>
          ))}
        </div>
        <div className="personalizar-seta" id="personalizar-seta-proxima" onClick={() => personalizarRolarCarrossel(1)}>↓</div>
      </div>
    </div>
  );
};

export default Personalizar;