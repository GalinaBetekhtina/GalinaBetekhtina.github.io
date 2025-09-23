document.addEventListener('DOMContentLoaded', () => {
  let currentAudio = null;
  let activeCard = null;
  let autoplayIndex = 0;
  let autoplayMode = false;

  const overlay = document.getElementById('overlay');
  const modalLetter = document.getElementById('modalLetter');
  const modalImage = document.getElementById('modalImage');

  function playSound(src, onEnded) {
    if (!src) return null;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    const audio = new Audio(src);
    currentAudio = audio;
    audio.play().catch(()=>{});
    audio.onended = () => { if(onEnded) onEnded(); };
    return audio;
  }

  function adjustFontSize(element, maxWidth) {
    let fontSize = parseInt(window.getComputedStyle(element).fontSize);
    while (element.scrollWidth > maxWidth && fontSize > 10) {
      fontSize -= 1;
      element.style.fontSize = fontSize + "px";
    }
  }

 function openModalForCard(card, soundFile, showImageInModal = false, onEnded = null) {
  activeCard = card;

  const modalHTML = card.getAttribute('data-modal-text') || card.querySelector('span')?.textContent;
  modalLetter.innerHTML = modalHTML;

  const modalImage = document.getElementById('modalImage');

  if(showImageInModal){
    // Автозапуск: показываем картинку по центру
    modalImage.src = card.querySelector('img').src;
    modalImage.style.display = 'block';
    modalLetter.classList.add('autoplay'); // убираем маржи у спана
  } else {
    // Обычное нажатие: картинка не отображается
    modalImage.style.display = 'none';
    modalLetter.classList.remove('autoplay'); // обычное отображение
  }

  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';

  adjustFontSize(modalLetter, modalLetter.parentElement.clientWidth - 20);

  playSound(soundFile, () => {
    if(onEnded) onEnded();
    if(!autoplayMode) closeModal();
  });
}

  function closeModal() {
    if(activeCard){
      activeCard.classList.remove('modal-only-span');
      activeCard = null;
    }
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    if(currentAudio){
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
  }

  document.querySelectorAll('.letter').forEach(letter => {
    letter.addEventListener('click', () => {
      if(!autoplayMode){
        const soundFile = letter.getAttribute('data-sound');
        letter.classList.add('modal-only-span'); // увеличенная высота для обычного клика
        openModalForCard(letter, soundFile, false);

        overlay.addEventListener('click', function handler(event){
          if(event.target === overlay){
            letter.classList.remove('modal-only-span');
            overlay.removeEventListener('click', handler);
          }
        });
      }
    });
  });

  overlay.addEventListener('click', (event) => {
    if(event.target === overlay){
      closeModal();
      autoplayMode = false;
    }
  });

  function autoplayCards(cards) {
    if(autoplayIndex >= cards.length){
      autoplayMode = false;
      return;
    }

    autoplayMode = true;
    const card = cards[autoplayIndex];
    const soundFile = card.getAttribute('data-sound');

    openModalForCard(card, soundFile, true, () => { // картинка + спан
      autoplayIndex++;
      autoplayCards(cards);
    });
  }

  const autoplayBtn = document.getElementById('playAllBtn');
  autoplayBtn.addEventListener('click', () => {
    autoplayIndex = 0;
    autoplayCards(Array.from(document.querySelectorAll('.letter')));
  });
});
