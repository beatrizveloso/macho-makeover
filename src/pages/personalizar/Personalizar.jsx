import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaTrash, FaArrowRight, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './Personalizar.css';

const PERSONALIZAR_TAMANHO_ALCA = 12;
const PERSONALIZAR_DISTANCIA_ALCA_ROTACAO = 35;
const PERSONALIZAR_TAMANHO_MINIMO = 30;
const PERSONALIZAR_TAMANHO_MAXIMO = 800;

const personalizarItens = {
  cabelos: Array.from({ length: 53 }, (_, i) => `/images/cabelos/cabelo${i + 1}.png`),
  oculos: Array.from({ length: 50 }, (_, i) => `/images/oculos/oculos${i + 1}.png`),
  colares: [
    ...Array.from({ length: 40 }, (_, i) => `/images/colares/colar${i + 1}.png`),
    ...Array.from({ length: 11 }, (_, i) => `/images/colares/brinco${i + 1}.png`)
  ],
  chapeus: Array.from({ length: 50 }, (_, i) => `/images/chapeus/chapeu${i + 1}.png`),
  adds: [
    ...Array.from({ length: 36 }, (_, i) => `/images/adds/add${i + 1}.png`),
    ...Array.from({ length: 14 }, (_, i) => `/images/adds/bolsa${i + 1}.png`)
  ]
};

const calcRotHandle = (w, h, cornerX, cornerY, distance) => {
  const vx = cornerX;
  const vy = cornerY;
  const len = Math.sqrt(vx * vx + vy * vy) || 1;
  const nx = vx / len;
  const ny = vy / len;
  return { x: cornerX + nx * distance, y: cornerY + ny * distance };
};

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;

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
  const [personalizarRedimensionando, setPersonalizarRedimensionando] = useState(null);
  const [personalizarRotacionando, setPersonalizarRotacionando] = useState(false);
  const [personalizarDadosArraste, setPersonalizarDadosArraste] = useState({
    startX: 0, startY: 0, initialWidth: 0, initialHeight: 0, initialAngle: 0, initialMouseAngle: 0
  });
  const [touchStartX, setTouchStartX] = useState(0);
  const [isCarouselSwiping, setIsCarouselSwiping] = useState(false);

  useEffect(() => {
    const personagemSelecionado = localStorage.getItem('carrosselPersonagemSelecionado');
    const img = new Image();
    img.src = personagemSelecionado || '/images/character.png';
    img.onload = () => setPersonalizarImagemPersonagem(img);
    img.onerror = () => {
      const fallback = new Image();
      fallback.src = '/images/character.png';
      fallback.onload = () => setPersonalizarImagemPersonagem(fallback);
    };
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

    personalizarImagensAcessorios.forEach((acessorio) => {
      if (!acessorio || !acessorio.img) return;
      const { img, x, y, width, height, angle = 0 } = acessorio;
      ctx.save();
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * Math.PI / 180);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);

      if (personalizarAcessorioSelecionado && personalizarAcessorioSelecionado.id === acessorio.id) {
        ctx.strokeStyle = "rgba(148, 1, 104, 0.9)";
        ctx.lineWidth = 2;
        ctx.strokeRect(-width / 2, -height / 2, width, height);

        ctx.fillStyle = "rgba(143, 28, 85, 0.9)";

        const corners = [
          { x: -width/2, y: -height/2, name: 'nw' },
          { x: width/2,  y: -height/2, name: 'ne' },
          { x: -width/2, y: height/2,  name: 'sw' },
          { x: width/2,  y: height/2,  name: 'se' }
        ];

        const edges = [
          { x: 0, y: -height/2, name: 'n' },
          { x: width/2, y: 0, name: 'e' },
          { x: 0, y: height/2, name: 's' },
          { x: -width/2, y: 0, name: 'w' }
        ];

        corners.forEach(c => {
          ctx.beginPath();
          ctx.arc(c.x, c.y, PERSONALIZAR_TAMANHO_ALCA, 0, Math.PI * 2);
          ctx.fill();
        });
        edges.forEach(eh => {
          ctx.beginPath();
          ctx.arc(eh.x, eh.y, PERSONALIZAR_TAMANHO_ALCA / 1.5, 0, Math.PI * 2);
          ctx.fill();
        });

        corners.forEach(c => {
          const rh = calcRotHandle(width/2, height/2, c.x, c.y, PERSONALIZAR_DISTANCIA_ALCA_ROTACAO);
          ctx.save();
          ctx.beginPath();
          ctx.fillStyle = "rgba(220, 220, 220, 0.56)";
          ctx.arc(rh.x, rh.y, PERSONALIZAR_TAMANHO_ALCA, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "rgba(0,0,0,0.9)";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("↻", rh.x, rh.y);
          ctx.restore();
        });
      }

      ctx.restore();
    });
  };

  const globalParaLocal = (x, y, acc) => {
    const centerX = acc.x + acc.width / 2;
    const centerY = acc.y + acc.height / 2;
    const angle = -acc.angle * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = x - centerX;
    const dy = y - centerY;
    return {
      x: dx * cos - dy * sin,
      y: dx * sin + dy * cos
    };
  };

  const personalizarObterAcessorioNaPosicao = (x, y) => {
    for (let i = personalizarImagensAcessorios.length - 1; i >= 0; i--) {
      const acc = personalizarImagensAcessorios[i];
      const local = globalParaLocal(x, y, acc);
      const hw = acc.width / 2;
      const hh = acc.height / 2;

      if (local.x >= -hw && local.x <= hw && local.y >= -hh && local.y <= hh) {
        return acc;
      }

      const cornerPositions = [
        { x: -hw, y: -hh },
        { x: hw,  y: -hh },
        { x: -hw, y: hh },
        { x: hw,  y: hh }
      ];
      for (const c of cornerPositions) {
        const dx = local.x - c.x;
        const dy = local.y - c.y;
        if (Math.sqrt(dx*dx + dy*dy) <= PERSONALIZAR_TAMANHO_ALCA) {
          return acc;
        }
      }

      const edgePositions = [
        { x: 0, y: -hh },
        { x: hw, y: 0 },
        { x: 0, y: hh },
        { x: -hw, y: 0 }
      ];
      for (const e of edgePositions) {
        const dx = local.x - e.x;
        const dy = local.y - e.y;
        if (Math.sqrt(dx*dx + dy*dy) <= PERSONALIZAR_TAMANHO_ALCA * 0.9) {
          return acc;
        }
      }

      for (const c of cornerPositions) {
        const rh = calcRotHandle(hw, hh, c.x, c.y, PERSONALIZAR_DISTANCIA_ALCA_ROTACAO);
        const dx = local.x - rh.x;
        const dy = local.y - rh.y;
        if (Math.sqrt(dx*dx + dy*dy) <= PERSONALIZAR_TAMANHO_ALCA) {
          return acc;
        }
      }
    }
    return null;
  };

  const personalizarDetectarControle = (x, y, acc) => {
    const local = globalParaLocal(x, y, acc);
    const hw = acc.width / 2;
    const hh = acc.height / 2;

    const corners = [
      { name: "resize-nw", x: -hw, y: -hh },
      { name: "resize-ne", x: hw, y: -hh },
      { name: "resize-sw", x: -hw, y: hh },
      { name: "resize-se", x: hw, y: hh }
    ];
    for (const handle of corners) {
      const dx = local.x - handle.x;
      const dy = local.y - handle.y;
      if (Math.sqrt(dx * dx + dy * dy) <= PERSONALIZAR_TAMANHO_ALCA) {
        return { type: "resize", corner: handle.name.split('-')[1] };
      }
    }

    const edges = [
      { name: "resize-n", x: 0, y: -hh },
      { name: "resize-e", x: hw, y: 0 },
      { name: "resize-s", x: 0, y: hh },
      { name: "resize-w", x: -hw, y: 0 }
    ];
    for (const handle of edges) {
      const dx = local.x - handle.x;
      const dy = local.y - handle.y;
      if (Math.sqrt(dx * dx + dy * dy) <= PERSONALIZAR_TAMANHO_ALCA * 0.9) {
        return { type: "resize", corner: handle.name.split('-')[1] };
      }
    }

    const cornerPositions = [
      { x: -hw, y: -hh, id: 'nw' },
      { x: hw,  y: -hh, id: 'ne' },
      { x: -hw, y: hh,  id: 'sw' },
      { x: hw,  y: hh,  id: 'se' }
    ];
    for (const c of cornerPositions) {
      const rh = calcRotHandle(hw, hh, c.x, c.y, PERSONALIZAR_DISTANCIA_ALCA_ROTACAO);
      const dx = local.x - rh.x;
      const dy = local.y - rh.y;
      if (Math.sqrt(dx * dx + dy * dy) <= PERSONALIZAR_TAMANHO_ALCA) {
        return { type: "rotate", corner: c.id };
      }
    }

    if (local.x >= -hw && local.x <= hw && local.y >= -hh && local.y <= hh) {
      return { type: "move" };
    }

    return null;
  };

  const handleCanvasTouchStart = (e) => {
    e.preventDefault();
    const canvas = personalizarCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;

    const clickedAccessory = personalizarObterAcessorioNaPosicao(offsetX, offsetY);
    if (clickedAccessory) {
      const control = personalizarDetectarControle(offsetX, offsetY, clickedAccessory);
      setPersonalizarAcessorioSelecionado(clickedAccessory);

      if (control) {
        if (control.type === 'rotate') {
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
        } else if (control.type === 'resize') {
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
        } else if (control.type === 'move') {
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
      } else {
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

    setPersonalizarAcessorioSelecionado(null);
  };

  const handleCanvasTouchMove = (e) => {
    if (!personalizarArrastando && !personalizarRotacionando) return;
    e.preventDefault();

    const canvas = personalizarCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;

    if (!personalizarAcessorioSelecionado) return;

    if (personalizarRotacionando) {
      const centerX = personalizarAcessorioSelecionado.x + personalizarAcessorioSelecionado.width / 2;
      const centerY = personalizarAcessorioSelecionado.y + personalizarAcessorioSelecionado.height / 2;
      const newMouseAngle = Math.atan2(offsetY - centerY, offsetX - centerX) * 180 / Math.PI;
      const newAngle = personalizarDadosArraste.initialAngle + (newMouseAngle - personalizarDadosArraste.initialMouseAngle);
      const updatedAccessory = {
        ...personalizarAcessorioSelecionado,
        angle: ((newAngle % 360) + 360) % 360
      };
      setPersonalizarImagensAcessorios(prev => prev.map(acc => acc.id === personalizarAcessorioSelecionado.id ? updatedAccessory : acc));
      setPersonalizarAcessorioSelecionado(updatedAccessory);
      return;
    }

    if (personalizarArrastando) {
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
          default:
            break;
        }

        newWidth = Math.max(PERSONALIZAR_TAMANHO_MINIMO, Math.min(PERSONALIZAR_TAMANHO_MAXIMO, newWidth));
        newHeight = Math.max(PERSONALIZAR_TAMANHO_MINIMO, Math.min(PERSONALIZAR_TAMANHO_MAXIMO, newHeight));

        if (e.touches.length > 1) {
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

        setPersonalizarImagensAcessorios(prev => prev.map(acc => acc.id === personalizarAcessorioSelecionado.id ? updatedAccessory : acc));
        setPersonalizarAcessorioSelecionado(updatedAccessory);
      } else {
        const deltaX = offsetX - personalizarDadosArraste.startX;
        const deltaY = offsetY - personalizarDadosArraste.startY;

        const updatedAccessory = {
          ...personalizarAcessorioSelecionado,
          x: personalizarAcessorioSelecionado.x + deltaX,
          y: personalizarAcessorioSelecionado.y + deltaY
        };

        setPersonalizarImagensAcessorios(prev => prev.map(acc => acc.id === personalizarAcessorioSelecionado.id ? updatedAccessory : acc));
        setPersonalizarAcessorioSelecionado(updatedAccessory);

        setPersonalizarDadosArraste(prev => ({ ...prev, startX: offsetX, startY: offsetY }));
      }
    }
  };

  const handleCanvasTouchEnd = () => {
    setTimeout(() => {
      setPersonalizarArrastando(false);
      setPersonalizarRedimensionando(null);
      setPersonalizarRotacionando(false);
    }, 50);
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
      setPersonalizarAcessorioSelecionado(clickedAccessory);

      if (control) {
        if (control.type === 'rotate') {
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
        } else if (control.type === 'resize') {
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
        } else if (control.type === 'move') {
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
      } else {
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

    setPersonalizarAcessorioSelecionado(null);
  };

  const personalizarMouseMoveCanvas = (e) => {
    if (!personalizarArrastando && !personalizarRotacionando) return;
    e.preventDefault();

    const canvas = personalizarCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    if (!personalizarAcessorioSelecionado) return;

    if (personalizarRotacionando) {
      const centerX = personalizarAcessorioSelecionado.x + personalizarAcessorioSelecionado.width / 2;
      const centerY = personalizarAcessorioSelecionado.y + personalizarAcessorioSelecionado.height / 2;
      const newMouseAngle = Math.atan2(offsetY - centerY, offsetX - centerX) * 180 / Math.PI;
      const newAngle = personalizarDadosArraste.initialAngle + (newMouseAngle - personalizarDadosArraste.initialMouseAngle);
      const updatedAccessory = {
        ...personalizarAcessorioSelecionado,
        angle: ((newAngle % 360) + 360) % 360
      };
      setPersonalizarImagensAcessorios(prev => prev.map(acc => acc.id === personalizarAcessorioSelecionado.id ? updatedAccessory : acc));
      setPersonalizarAcessorioSelecionado(updatedAccessory);
      return;
    }

    if (personalizarArrastando) {
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
          default:
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

        setPersonalizarImagensAcessorios(prev => prev.map(acc => acc.id === personalizarAcessorioSelecionado.id ? updatedAccessory : acc));
        setPersonalizarAcessorioSelecionado(updatedAccessory);
      } else {
        const deltaX = offsetX - personalizarDadosArraste.startX;
        const deltaY = offsetY - personalizarDadosArraste.startY;

        const updatedAccessory = {
          ...personalizarAcessorioSelecionado,
          x: personalizarAcessorioSelecionado.x + deltaX,
          y: personalizarAcessorioSelecionado.y + deltaY
        };

        setPersonalizarImagensAcessorios(prev => prev.map(acc => acc.id === personalizarAcessorioSelecionado.id ? updatedAccessory : acc));
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
        id: makeId(),
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
    link.download = "macho.png";
    link.click();
  };

  const personalizarClicarAba = (categoria) => setPersonalizarAbaAtual(categoria);
  const personalizarAlternarPainel = () => setPersonalizarPainelRecolhido(!personalizarPainelRecolhido);

  const personalizarRemoverAcessorio = () => {
    if (personalizarAcessorioSelecionado) {
      setPersonalizarImagensAcessorios(prev => prev.filter(acc => acc.id !== personalizarAcessorioSelecionado.id));
      setPersonalizarAcessorioSelecionado(null);
    }
  };

  const personalizarMoverCamadaParaCima = (acessorioId) => {
    setPersonalizarImagensAcessorios(prev => {
      const index = prev.findIndex(acc => acc.id === acessorioId);
      if (index < prev.length - 1) {
        const newArray = [...prev];
        [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
        return newArray;
      }
      return prev;
    });
  };

  const personalizarMoverCamadaParaBaixo = (acessorioId) => {
    setPersonalizarImagensAcessorios(prev => {
      const index = prev.findIndex(acc => acc.id === acessorioId);
      if (index > 0) {
        const newArray = [...prev];
        [newArray[index], newArray[index - 1]] = [newArray[index - 1], newArray[index]];
        return newArray;
      }
      return prev;
    });
  };

  const personalizarTeclaPressionada = (e) => {
    if (e.key === "Delete" && personalizarAcessorioSelecionado) {
      personalizarRemoverAcessorio();
      return;
    }
    if (!personalizarAcessorioSelecionado) return;

    const rotationStep = e.shiftKey ? 1 : 5;
    if (e.key === "ArrowLeft") {
      const updatedAccessory = { ...personalizarAcessorioSelecionado, angle: ((personalizarAcessorioSelecionado.angle - rotationStep) % 360 + 360) % 360 };
      setPersonalizarImagensAcessorios(prev => prev.map(acc => acc.id === updatedAccessory.id ? updatedAccessory : acc));
      setPersonalizarAcessorioSelecionado(updatedAccessory);
    } else if (e.key === "ArrowRight") {
      const updatedAccessory = { ...personalizarAcessorioSelecionado, angle: ((personalizarAcessorioSelecionado.angle + rotationStep) % 360 + 360) % 360 };
      setPersonalizarImagensAcessorios(prev => prev.map(acc => acc.id === updatedAccessory.id ? updatedAccessory : acc));
      setPersonalizarAcessorioSelecionado(updatedAccessory);
    } else if (e.key.toLowerCase() === "r") {
      const updatedAccessory = { ...personalizarAcessorioSelecionado, angle: 0 };
      setPersonalizarImagensAcessorios(prev => prev.map(acc => acc.id === updatedAccessory.id ? updatedAccessory : acc));
      setPersonalizarAcessorioSelecionado(updatedAccessory);
    } else if (e.key === "ArrowUp") {
      const updatedAccessory = {
        ...personalizarAcessorioSelecionado,
        width: Math.min(PERSONALIZAR_TAMANHO_MAXIMO, personalizarAcessorioSelecionado.width + 5),
        height: Math.min(PERSONALIZAR_TAMANHO_MAXIMO, personalizarAcessorioSelecionado.height + 5)
      };
      setPersonalizarImagensAcessorios(prev => prev.map(acc => acc.id === updatedAccessory.id ? updatedAccessory : acc));
      setPersonalizarAcessorioSelecionado(updatedAccessory);
    } else if (e.key === "ArrowDown") {
      const updatedAccessory = {
        ...personalizarAcessorioSelecionado,
        width: Math.max(PERSONALIZAR_TAMANHO_MINIMO, personalizarAcessorioSelecionado.width - 5),
        height: Math.max(PERSONALIZAR_TAMANHO_MINIMO, personalizarAcessorioSelecionado.height - 5)
      };
      setPersonalizarImagensAcessorios(prev => prev.map(acc => acc.id === updatedAccessory.id ? updatedAccessory : acc));
      setPersonalizarAcessorioSelecionado(updatedAccessory);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', personalizarTeclaPressionada);
    return () => window.removeEventListener('keydown', personalizarTeclaPressionada);
  }, [personalizarAcessorioSelecionado]);

  const personalizarInicioArraste = (e, imageSrc) => {
    e.dataTransfer.setData('text/plain', imageSrc);
    e.currentTarget.classList.add('personalizar-arrastando');
  };

  const personalizarFimArraste = (e) => {
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

  const personalizarArrasteSobre = (e) => e.preventDefault();

  const handleCarouselTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setIsCarouselSwiping(true);
  };

  const handleCarouselTouchMove = (e) => {
    if (!isCarouselSwiping) return;
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const diff = touchStartX - touchX;
    if (Math.abs(diff) > 10) {
      const carousel = personalizarCarouselRef.current;
      if (carousel) {
        carousel.scrollLeft += diff * 2;
        setTouchStartX(touchX);
      }
    }
  };

  const handleCarouselTouchEnd = () => {
    setIsCarouselSwiping(false);
  };

  const personalizarRolarCarrosselMobile = (direcao) => {
    const carousel = personalizarCarouselRef.current;
    if (carousel) {
      carousel.scrollBy({ left: direcao * carousel.clientWidth * 0.8, behavior: 'smooth' });
    }
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div className="personalizar-container" onDragOver={personalizarArrasteSobre}>
      <div className="personalizar-gifs">
        <img src="http://www.gigaglitters.com/created/p3oAvyJiCF.gif" width="210" height="80" alt="Clique em" />
      <div className="personalizar-gifs2">
        <img src="http://www.gigaglitters.com/created/8eUPtHLK8v.gif"  width="180" height="80" alt="um objeto" />
      </div>
      </div>

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
            <div className="personalizar-item-camada">Personagem Base</div>
            {[...personalizarImagensAcessorios].reverse().map((acessorio, index) => (
              <div
                key={acessorio.id}
                className={`personalizar-item-camada ${personalizarAcessorioSelecionado?.id === acessorio.id ? 'personalizar-selecionado' : ''}`}
                onClick={() => setPersonalizarAcessorioSelecionado(acessorio)}
              >
                <span className="personalizar-nome-camada">Acessório {personalizarImagensAcessorios.length - index}</span>
                <div className="personalizar-controles-camada">
                  <button 
                    className="personalizar-botao-mover-cima"
                    onClick={(e) => {
                      e.stopPropagation();
                      personalizarMoverCamadaParaCima(acessorio.id);
                    }}
                    title="Mover para cima"
                  >
                    <FaArrowUp size={12} />
                  </button>
                  <button 
                    className="personalizar-botao-mover-baixo"
                    onClick={(e) => {
                      e.stopPropagation();
                      personalizarMoverCamadaParaBaixo(acessorio.id);
                    }}
                    title="Mover para baixo"
                  >
                    <FaArrowDown size={12} />
                  </button>
                </div>
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
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleCanvasTouchMove}
            onTouchEnd={handleCanvasTouchEnd}
            onTouchCancel={handleCanvasTouchEnd}
          ></canvas>
          <button className="personalizar-botao-deletar" onClick={personalizarRemoverAcessorio} title="Deletar Objeto">
            <FaTrash />
          </button>
        </div>

        <div className="personalizar-controles">
          <button className="personalizar-botao-salvar" onClick={personalizarSalvarAvatar}>
            <h1 className="personalizar-texto-botao-salvar">Salvar Macho</h1>
            <img src="/images/diamante.png" alt="Diamante" className="personalizar-icone-diamante" />
          </button>
        </div>
      </div>

      <div className="personalizar-container-carrossel">
        <div className="personalizar-container-abas">
          <div className="personalizar-abas">
            <div className={`personalizar-aba ${personalizarAbaAtual === 'cabelos' ? 'personalizar-aba-ativa' : ''}`} onClick={() => personalizarClicarAba('cabelos')}>Cabelos</div>
            <div className={`personalizar-aba ${personalizarAbaAtual === 'oculos' ? 'personalizar-aba-ativa' : ''}`} onClick={() => personalizarClicarAba('oculos')}>Óculos</div>
            <div className={`personalizar-aba ${personalizarAbaAtual === 'colares' ? 'personalizar-aba-ativa' : ''}`} onClick={() => personalizarClicarAba('colares')}>Colares</div>
            <div className={`personalizar-aba ${personalizarAbaAtual === 'chapeus' ? 'personalizar-aba-ativa' : ''}`} onClick={() => personalizarClicarAba('chapeus')}>Chapeus</div>
            <div className={`personalizar-aba ${personalizarAbaAtual === 'adds' ? 'personalizar-aba-ativa' : ''}`} onClick={() => personalizarClicarAba('adds')}>Adds</div>
          </div>
        </div>

        {isMobile && (
          <>
            <div className="personalizar-seta personalizar-seta-anterior" onClick={() => personalizarRolarCarrosselMobile(-1)}>
              <FaArrowLeft />
            </div>

            <div
              className="personalizar-carrossel"
              id="personalizar-carrossel"
              ref={personalizarCarouselRef}
              onTouchStart={handleCarouselTouchStart}
              onTouchMove={handleCarouselTouchMove}
              onTouchEnd={handleCarouselTouchEnd}
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

            <div className="personalizar-seta personalizar-seta-proxima" onClick={() => personalizarRolarCarrosselMobile(1)}>
              <FaArrowRight />
            </div>
          </>
        )}

        {!isMobile && (
          <>
            <div className="personalizar-seta personalizar-seta-anterior" onClick={() => {
              const carousel = personalizarCarouselRef.current;
              if (carousel) {
                carousel.scrollBy({ top: -carousel.clientHeight, behavior: 'smooth' });
              }
            }}>
              ↑
            </div>

            <div
              className="personalizar-carrossel"
              id="personalizar-carrossel"
              ref={personalizarCarouselRef}
              onScroll={() => {
                const carousel = personalizarCarouselRef.current;
                const prevArrow = document.querySelector('.personalizar-seta-anterior');
                const nextArrow = document.querySelector('.personalizar-seta-proxima');
                if (prevArrow && nextArrow && carousel) {
                  prevArrow.style.visibility = carousel.scrollTop > 0 ? 'visible' : 'hidden';
                  nextArrow.style.visibility = carousel.scrollTop < carousel.scrollHeight - carousel.clientHeight ? 'visible' : 'hidden';
                }
              }}
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

            <div className="personalizar-seta personalizar-seta-proxima" onClick={() => {
              const carousel = personalizarCarouselRef.current;
              if (carousel) {
                carousel.scrollBy({ top: carousel.clientHeight, behavior: 'smooth' });
              }
            }}>
              ↓
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Personalizar;