import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './Carrossel.css';

const carrosselCategorias = {
  filmesAcao: {
    titulo: "Filmes de Ação",
    itens: [
      { src: "/images/personagens/capitao-nasc.png", alt: "Capitão Nascimento" },
      { src: "/images/personagens/jake-sully.png", alt: "Jake Sully" },
      { src: "/images/personagens/john-wick.png", alt: "John Wick" },
      { src: "/images/personagens/dom-toretto.png", alt: "Dom Toretto" },
      { src: "/images/personagens/ethan-hunt.png", alt: "Ethan Hunt" },
      { src: "/images/personagens/thomas-maze.png", alt: "Thomas Maze" },
      { src: "/images/personagens/james-bond.png", alt: "James Bond" },
      { src: "/images/personagens/the-rock.png", alt: "The Rock" }
    ]
  },
  superHerois: {
    titulo: "Super-Heróis",
    itens: [
      { src: "/images/personagens/capitao-america.png", alt: "Capitão América" },
      { src: "/images/personagens/thor.png", alt: "Thor" },
      { src: "/images/personagens/homem-de-ferro.png", alt: "Homem de Ferro" },
      { src: "/images/personagens/homem-aranha.png", alt: "Homem-Aranha" },
      { src: "/images/personagens/superman.png", alt: "Superman" },
      { src: "/images/personagens/batman.png", alt: "Batman" },
      { src: "/images/personagens/flash.png", alt: "Flash" },
      { src: "/images/personagens/shazam.png", alt: "Shazam" }
    ]
  },
  galaoCinema: {
    titulo: "Galãs do Cinema",
    itens: [
      { src: "/images/personagens/thimothee.png", alt: "Thimothee" },
      { src: "/images/personagens/christian-grey.png", alt: "Christian Grey" },
      { src: "/images/personagens/leo-dicaprio.png", alt: "Leonardo DiCaprio" },
      { src: "/images/personagens/robert-pattinson.png", alt: "Robert Pattinson" },
      { src: "/images/personagens/pedro-novaes.png", alt: "Pedro Novaes" },
      { src: "/images/personagens/brad-pitt.png", alt: "Brad Pitt" },
      { src: "/images/personagens/king-caspian.png", alt: "Rei Caspian" },
      { src: "/images/personagens/johnny-depp.png", alt: "Johnny Depp" }
    ]
  },
  jogos: {
    titulo: "Personagens de Jogos",
    itens: [
      { src: "/images/personagens/kratos.png", alt: "Kratos" },
      { src: "/images/personagens/geralt.png", alt: "Geralt de Rívia" },
      { src: "/images/personagens/joel.png", alt: "Joel" },
      { src: "/images/personagens/ryu-mk.png", alt: "Ryu (Mortal Kombat)" },
      { src: "/images/personagens/steve-minecraft.png", alt: "Steve (Minecraft)" },
      { src: "/images/personagens/zed.png", alt: "Zed" },
      { src: "/images/personagens/darius.png", alt: "Darius" },
      { src: "/images/personagens/graves.png", alt: "Graves" }
    ]
  },
  cantores: {
    titulo: "Cantores/Ícones da Música",
    itens: [
      { src: "/images/personagens/justin-bieber.png", alt: "Justin Bieber" },
      { src: "/images/personagens/shawn-mendes.png", alt: "Shawn Mendes" },
      { src: "/images/personagens/jungkook.png", alt: "Jungkook" },
      { src: "/images/personagens/harry-styles.png", alt: "Harry Styles" },
      { src: "/images/personagens/bruno-mars.png", alt: "Bruno Mars" },
      { src: "/images/personagens/henrique.png", alt: "Henrique" },
      { src: "/images/personagens/chico-buarque.png", alt: "Chico Buarque" },
      { src: "/images/personagens/david-bowie.png", alt: "David Bowie" }
    ]
  },
  series: {
    titulo: "Personagens de Séries",
    itens: [
      { src: "/images/personagens/anthony-brigerton.png", alt: "Anthony Bridgerton" },
      { src: "/images/personagens/benedict-brigerton.png", alt: "Benedict Bridgerton" },
      { src: "/images/personagens/dean-winchester.png", alt: "Dean Winchester" },
      { src: "/images/personagens/sam-winchester.png", alt: "Sam Winchester" },
      { src: "/images/personagens/profeta.png", alt: "Profeta" },
      { src: "/images/personagens/fred-weasley.png", alt: "Fred Weasley" },
      { src: "/images/personagens/javier-pena.png", alt: "Javier Peña" },
      { src: "/images/personagens/marcus-lopez.png", alt: "Marcus Lopez" }
    ]
  },
  galaoFeios: {
    titulo: "Galãs Feios",
    itens: [
      { src: "/images/personagens/wagner-moura.png", alt: "Wagner Moura" },
      { src: "/images/personagens/ronaldo.png", alt: "Ronaldo" },
      { src: "/images/personagens/pedro-pascal.png", alt: "Pedro Pascal" },
      { src: "/images/personagens/tom-hiddleston.png", alt: "Tom-Hiddleston" },
      { src: "/images/personagens/hugh-jackman.png", alt: "Hugh Jackman" },
      { src: "/images/personagens/rodrigo-simas.png", alt: "Rodrigo Simas" },
      { src: "/images/personagens/jesuita-barbosa.png", alt: "Jesuita Barbosa" },
      { src: "/images/personagens/ryan-gosling.png", alt: "Ryan Gossling" }
    ]
  },
  viloes: {
    titulo: "Vilões/Anti Heróis",
    itens: [
      { src: "/images/personagens/deadpool.png", alt: "Deadpool" },
      { src: "/images/personagens/draco-malfoy.png", alt: "Draco Malfoy" },
      { src: "/images/personagens/coringa.png", alt: "Coringa" },
      { src: "/images/personagens/hans.png", alt: "Hans" },
      { src: "/images/personagens/tommy_shelby.png", alt: "Tommy Shelby" },
      { src: "/images/personagens/loki.png", alt: "Loki" },
      { src: "/images/personagens/wolverine.png", alt: "Wolverine" },
      { src: "/images/personagens/jack-sparrow.png", alt: "Jack Sparrow" }
    ]
  },
  desenhos: {
    titulo: "Personagens de Desenhos",
    itens: [
      { src: "/images/personagens/jack-frost.png", alt: "Jack Frost" },
      { src: "/images/personagens/jose-bezerra.png", alt: "José Bezerra" },
      { src: "/images/personagens/soluço.png", alt: "Soluço" },
      { src: "/images/personagens/ben10.png", alt: "Ben 10" },
      { src: "/images/personagens/raposa-zoo.png", alt: "Raposa do Zootopia" },
      { src: "/images/personagens/croods.png", alt: "Personagem dos Croods" },
      { src: "/images/personagens/ratatouille.png", alt: "Remy (Ratatouille)" },
      { src: "/images/personagens/detona-ralph.png", alt: "Detona Ralph" }
    ]
  }
};

const Carrossel = () => {
  const navigate = useNavigate();
  const [carrosselPaginaAtual, setCarrosselPaginaAtual] = useState('categorias');
  const [carrosselCategoriaAtual, setCarrosselCategoriaAtual] = useState(null);
  const [carrosselAnguloAtual, setCarrosselAnguloAtual] = useState(0);
  const [carrosselPersonagemSelecionado, setCarrosselPersonagemSelecionado] = useState(null);
  const [carrosselMostrarAlerta, setCarrosselMostrarAlerta] = useState(false);

  const carrosselExibirCarrossel = (categoria) => {
    setCarrosselCategoriaAtual(categoria);
    setCarrosselPaginaAtual('carrossel');
    setCarrosselPersonagemSelecionado(null);
    setCarrosselAnguloAtual(0);
  };

  const carrosselVoltarCategorias = () => {
    setCarrosselPaginaAtual('categorias');
    setCarrosselPersonagemSelecionado(null);
  };

  const carrosselRotacionarCarrossel = (direcao) => {
    if (!carrosselCategoriaAtual) return;
    const itens = carrosselCategorias[carrosselCategoriaAtual].itens;
    const anguloItem = itens.length > 0 ? 360 / itens.length : 0;
    setCarrosselAnguloAtual(prev => prev + direcao * anguloItem);
  };

  const carrosselConfirmarSelecao = () => {
    if (!carrosselPersonagemSelecionado) {
      setCarrosselMostrarAlerta(true);
    } else {
      localStorage.setItem('carrosselPersonagemSelecionado', carrosselPersonagemSelecionado);
      navigate('/personalizar');
    }
  };

  const carrosselFecharAlerta = () => {
    setCarrosselMostrarAlerta(false);
  };

  const carrosselSelecionarImagem = (src) => {
    setCarrosselPersonagemSelecionado(src);
  };

  useEffect(() => {
    if (carrosselCategoriaAtual) {
      const itens = document.querySelectorAll('.carrossel-item');
      const quantidadeItens = itens.length;
      const anguloItem = quantidadeItens > 0 ? 360 / quantidadeItens : 0;
      
      itens.forEach((item, index) => {
        const angulo = index * anguloItem;
        item.style.transform = `rotateY(${angulo}deg) translateZ(300px)`;
      });
    }
  }, [carrosselCategoriaAtual]);

  return (
    <div className="carrossel-container">
      {carrosselPaginaAtual === 'carrossel' && (
        <button className="personalizar-botao-voltar" onClick={carrosselVoltarCategorias}></button>
      )}

      <div className="carrossel-cabecalho">
        <div className="carrossel-texto">
          {carrosselPaginaAtual === 'categorias' ? (
            <>
              <div className="carrossel-um">
                <img src="http://www.gigaglitters.com/created/TMutGkY49g.gif" width="425" height="80" alt="Selecione uma" />
              </div>
              <div className="carrossel-dois">
                <img src="http://www.gigaglitters.com/created/kZbMP6m9S2.gif" width="290" height="80" alt="categoria" />
              </div>
            </>
          ) : (
            <>
              <div className="carrossel-um">
                <img src="http://www.gigaglitters.com/created/F5LYma4SVL.gif" width="400" height="80" alt="Selecione um" />
              </div>
              <div className="carrossel-dois">
                <img src="http://www.gigaglitters.com/created/hmXs2jRS7q.gif" width="240" height="80" alt="Macho" />
              </div>
            </>
          )}
        </div>
      </div>

      {carrosselPaginaAtual === 'categorias' && (
        <div className="carrossel-pagina-categorias">
          <div className="carrossel-categorias">
            <button className="button-filmes-de-acao carrossel-botao-categoria" onClick={() => carrosselExibirCarrossel('filmesAcao')}></button>
            <button className="button-super-herois carrossel-botao-categoria" onClick={() => carrosselExibirCarrossel('superHerois')}></button>
            <button className="button-galao-cinema carrossel-botao-categoria" onClick={() => carrosselExibirCarrossel('galaoCinema')}></button>
            <button className="button-jogos carrossel-botao-categoria" onClick={() => carrosselExibirCarrossel('jogos')}></button>
            <button className="button-cantores carrossel-botao-categoria" onClick={() => carrosselExibirCarrossel('cantores')}></button>
            <button className="button-series carrossel-botao-categoria" onClick={() => carrosselExibirCarrossel('series')}></button>
            <button className="button-galao-feios carrossel-botao-categoria" onClick={() => carrosselExibirCarrossel('galaoFeios')}></button>
            <button className="button-viloes carrossel-botao-categoria" onClick={() => carrosselExibirCarrossel('viloes')}></button>
            <button className="button-desenhos carrossel-botao-categoria" onClick={() => carrosselExibirCarrossel('desenhos')}></button>
          </div>
        </div>
      )}

      {carrosselPaginaAtual === 'carrossel' && carrosselCategoriaAtual && (
        <div className="carrossel-pagina-carrossel">
          <h2 className="carrossel-titulo-categoria">{carrosselCategorias[carrosselCategoriaAtual].titulo}</h2>
          
          <div className="carrossel-carrossel">
            <div className="carrossel-track" style={{ transform: `rotateY(${carrosselAnguloAtual}deg)` }}>
              {carrosselCategorias[carrosselCategoriaAtual].itens.map((item, index) => (
                <div key={index} className="carrossel-item">
                  <img 
                    src={item.src} 
                    alt={item.alt}
                    className={carrosselPersonagemSelecionado === item.src ? 'carrossel-selecionado' : ''}
                    onClick={() => carrosselSelecionarImagem(item.src)}
                  />
                </div>
              ))}
            </div>
            <div className="carrossel-controles">
              <button className="carrossel-botao-navegacao" onClick={() => carrosselRotacionarCarrossel(1)}>&#8249;</button>
              <button className="carrossel-botao-navegacao" onClick={() => carrosselRotacionarCarrossel(-1)}>&#8250;</button>
            </div>
          </div>

          <div className="carrossel-botao-container">
            <button className="carrossel-botao-confirmar" onClick={carrosselConfirmarSelecao}>
              <span className="carrossel-texto-botao">
                <h1>Confirmar</h1>
              </span>
              <img src="/images/diamante.png" alt="Diamante" />
            </button>
          </div>
        </div>
      )}

      {carrosselMostrarAlerta && (
        <div className="carrossel-alerta-customizado" style={{ display: 'flex' }}>
          <div className="carrossel-caixa-alerta">
            <h2>Escolha um personagem primeiro!</h2>
            <button onClick={carrosselFecharAlerta}>Ok</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrossel;