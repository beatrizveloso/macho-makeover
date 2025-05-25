  const track = document.querySelector('.carousel-track');
    const items = document.querySelectorAll('.carousel-item');
    const nextButton = document.getElementById('next');
    const prevButton = document.getElementById('prev');
    const confirmarBtn = document.getElementById('confirmar-btn');

    let currentAngle = 0;
    const itemCount = items.length;
    const itemAngle = 360 / itemCount;
    let selectedCharacter = null;

    items.forEach((item, index) => {
      const angle = index * itemAngle;
      item.style.transform = `rotateY(${angle}deg) translateZ(300px)`;
    });

    const rotateCarousel = (direction) => {
      currentAngle += direction * itemAngle;
      track.style.transform = `rotateY(${currentAngle}deg)`;
    };

    nextButton.addEventListener('click', () => rotateCarousel(-1));
    prevButton.addEventListener('click', () => rotateCarousel(1));

    items.forEach((item) => {
      item.addEventListener('click', () => {
        selectedCharacter = item.querySelector('img').src;
        items.forEach(i => i.querySelector('img').style.border = 'none');
        item.querySelector('img').style.border = '3px solid pink';
      });
    });

    confirmarBtn.addEventListener('click', () => {
      if (!selectedCharacter) {
        showCustomAlert();
      } else {
        localStorage.setItem('selectedCharacter', selectedCharacter);
        window.location.href = 'monte seu avatar.html';
      }
    });

    function showCustomAlert() {
      document.getElementById('custom-alert').style.display = 'flex';
    }

    function closeCustomAlert() {
      document.getElementById('custom-alert').style.display = 'none';
    }