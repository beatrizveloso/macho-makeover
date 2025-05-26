
    const categories = {
      action: {
    title: "Filmes de Ação",
    items: [
      { src: "src/images/capitao-nasc.png", alt: "Capitão Nascimento" },
      { src: "src/images/rambo.png", alt: "Rambo" },
      { src: "src/images/john_wick.png", alt: "John Wick" },
      { src: "src/images/dom-toretto.png", alt: "Dom Toretto" },
      { src: "src/images/ethan-hunt.png", alt: "Ethan Hunt" },
      { src: "src/images/jack-reacher.png", alt: "Jack Reacher" },
      { src: "src/images/mad-max.png", alt: "Max Rockatansky" },
      { src: "src/images/the_rock_base.png", alt: "The Rock" }
    ]
  },
  superheroes: {
    title: "Super-Heróis",
    items: [
      { src: "src/images/batman.png", alt: "Batman" },
      { src: "src/images/thor_base.png", alt: "Thor" },
      { src: "src/images/capitao-america.png", alt: "Capitão América" },
      { src: "src/images/homem-de-ferro.png", alt: "Homem de Ferro" },
      { src: "src/images/homem-aranha.png", alt: "Homem-Aranha" },
      { src: "src/images/superman.png", alt: "Superman" },
      { src: "src/images/deadpool.png", alt: "Deadpool" },
      { src: "src/images/pantera-negra.png", alt: "Pantera Negra" }
    ]
  },
  leadingmen: {
    title: "Galãs do Cinema",
    items: [
      { src: "src/images/damon-salvatore.png", alt: "Damon Salvatore" },
      { src: "src/images/dean-winchester.png", alt: "Dean Winchester" },
      { src: "src/images/sam-winchester.png", alt: "Sam Winchester" },
      { src: "src/images/pedro-novaes.png", alt: "Pedro Novaes" },
      { src: "src/images/tommy_shelby.png", alt: "Tommy Shelby" },
      { src: "src/images/johnny_depp.png", alt: "Johnny Depp" },
      { src: "src/images/leo_dicaprio.png", alt: "Leonardo DiCaprio" },
      { src: "src/images/robert-pattinson.png", alt: "Robert Pattinson" }
    ]
  },
  games: {
    title: "Personagens de Jogos",
    items: [
      { src: "src/images/kratos.png", alt: "Kratos" },
      { src: "src/images/geralt.png", alt: "Geralt de Rívia" },
      { src: "src/images/joel.png", alt: "Joel" },
      { src: "src/images/ryu-mk.png", alt: "Ryu (Mortal Kombat)" },
      { src: "src/images/steve-minecraft.png", alt: "Steve (Minecraft)" },
      { src: "src/images/zed.png", alt: "Zed" },
      { src: "src/images/darius.png", alt: "Darius" },
      { src: "src/images/graves.png", alt: "Graves" }
    ]
  },
  singers: {
    title: "Cantores/Ícones da Música",
    items: [
      { src: "src/images/harry_styles.png", alt: "Harry Styles" },
      { src: "src/images/justin_bieber.png", alt: "Justin Bieber" },
      { src: "src/images/jungkook.png", alt: "Jungkook" },
      { src: "src/images/ed-sheeran.png", alt: "Ed Sheeran" },
      { src: "src/images/henrique.png", alt: "Henrique" },
      { src: "src/images/chico_buarque.png", alt: "Chico Buarque" },
      { src: "src/images/shawn_mendes.png", alt: "Shawn Mendes" },
      { src: "src/images/david_bowie.png", alt: "David Bowie" }
    ]
  },
  series: {
    title: "Personagens de Séries",
    items: [
      { src: "src/images/anthony-brigerton.png", alt: "Anthony Bridgerton" },
      { src: "src/images/benedict-bridgerton.png", alt: "Benedict Bridgerton" },
      { src: "src/images/thimothee.png", alt: "Thimothee" },
      { src: "src/images/armani.png", alt: "Armani" },
      { src: "src/images/george-weasley.png", alt: "George Weasley" },
      { src: "src/images/king-caspian.png", alt: "Rei Caspian" },
      { src: "src/images/javier-pena.png", alt: "Javier Peña" },
      { src: "src/images/marcus-lopez.png", alt: "Marcus Lopez" }
    ]
  }
};
    const categoriesPage = document.getElementById('categories-page');
    const carouselPage = document.getElementById('carousel-page');
    const backButton = document.getElementById('back-button');
    const categoryTitle = document.getElementById('category-title');
    const carouselTrack = document.getElementById('carousel-track');
    const nextButton = document.getElementById('next');
    const prevButton = document.getElementById('prev');
    const confirmarBtn = document.getElementById('confirmar-btn');
    const customAlert = document.getElementById('custom-alert');

    let currentAngle = 0;
    let itemAngle = 0;
    let selectedCharacter = null;
    let currentCategory = null;

    document.querySelectorAll('.category-btn').forEach(button => {
      button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');
        showCarousel(category);
      });
    });

    backButton.addEventListener('click', () => {
      categoriesPage.style.display = 'flex';
      carouselPage.style.display = 'none';
      selectedCharacter = null;
    });

    function showCarousel(category) {
      currentCategory = category;
      const categoryData = categories[category];
      
      categoryTitle.textContent = categoryData.title;
      
      carouselTrack.innerHTML = '';
    
      categoryData.items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'carousel-item';
        div.innerHTML = `<img src="${item.src}" alt="${item.alt}">`;
        carouselTrack.appendChild(div);
      });
      
      setupCarousel();
      
      categoriesPage.style.display = 'none';
      carouselPage.style.display = 'flex';
    }
    function setupCarousel() {
      const items = document.querySelectorAll('.carousel-item');
      const itemCount = items.length;
      itemAngle = itemCount > 0 ? 360 / itemCount : 0;
      
      items.forEach((item, index) => {
        const angle = index * itemAngle;
        item.style.transform = `rotateY(${angle}deg) translateZ(300px)`;
        
        item.addEventListener('click', () => {
          selectedCharacter = item.querySelector('img').src;
          items.forEach(i => i.querySelector('img').classList.remove('selected'));
          item.querySelector('img').classList.add('selected');
        });
      });
    }

    function rotateCarousel(direction) {
      currentAngle += direction * itemAngle;
      carouselTrack.style.transform = `rotateY(${currentAngle}deg)`;
    }

    nextButton.addEventListener('click', () => rotateCarousel(-1));
    prevButton.addEventListener('click', () => rotateCarousel(1));

    confirmarBtn.addEventListener('click', () => {
      if (!selectedCharacter) {
        showCustomAlert();
      } else {
        localStorage.setItem('selectedCharacter', selectedCharacter);
        window.location.href = 'monte seu avatar.html';
      }
    });

    function showCustomAlert() {
      customAlert.style.display = 'flex';
    }

    function closeCustomAlert() {
      customAlert.style.display = 'none';
    }