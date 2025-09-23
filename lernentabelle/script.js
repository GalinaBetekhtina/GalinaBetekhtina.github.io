document.addEventListener('DOMContentLoaded', () => {
  let currentAudio = null;
  let activeCard = null;
  let autoplayIndex = 0;
  let autoplayMode = false;
  let gameMode = false;
  let gameTimeout = null; // для очистки таймаута игры

  const overlay = document.getElementById('overlay');
  const modal = document.querySelector('.modal');
  const modalLetter = document.getElementById('modalLetter');
  const modalImage = document.getElementById('modalImage');

  // --- проигрывание звука ---
  function playSound(src, onEnded) {
    if (!src) return null;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    const audio = new Audio(src);
    currentAudio = audio;
    audio.play().catch(() => {});
    audio.onended = () => { if (onEnded) onEnded(); };
    return audio;
  }

  // --- автоподгонка текста ---
  function adjustFontSize(element, maxWidth) {
    let fontSize = parseInt(window.getComputedStyle(element).fontSize);
    while (element.scrollWidth > maxWidth && fontSize > 10) {
      fontSize -= 1;
      element.style.fontSize = fontSize + "px";
    }
  }

  // --- открыть модалку ---
  function openModalForCard(card, soundFile, showImageInModal = false, onEnded = null) {
    activeCard = card;
    const modalHTML = card.getAttribute('data-modal-text') || card.querySelector('span')?.textContent;
    modalLetter.innerHTML = modalHTML;

    if (showImageInModal) {
      modalImage.src = card.querySelector('img').src;
      modalImage.style.display = 'block';
      modalLetter.classList.add('autoplay');
    } else {
      modalImage.style.display = 'none';
      modalLetter.classList.remove('autoplay');
    }

    modalLetter.style.display = "block";
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    adjustFontSize(modalLetter, modalLetter.parentElement.clientWidth - 20);

    playSound(soundFile, () => {
      if (onEnded) onEnded();
      if (!autoplayMode && !gameMode) closeModal();
    });
  }

  // --- закрыть ---
  function closeModal() {
    activeCard = null;
    overlay.classList.remove('show');
    modal.classList.remove('game-mode');
    document.body.style.overflow = '';
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    modalLetter.style.display = "block";
    modalImage.style.display = "none";

    // очистка таймаута игры
    if (gameTimeout) {
      clearTimeout(gameTimeout);
      gameTimeout = null;
    }
  }

  // --- обычный клик на карточку ---
  document.querySelectorAll('.letter').forEach(letter => {
    letter.addEventListener('click', () => {
      if (!autoplayMode && !gameMode) {
        const soundFile = letter.getAttribute('data-sound');
        openModalForCard(letter, soundFile, false);
      }
    });
  });

  // --- автопроигрывание ---
  function autoplayCards(cards) {
    if (autoplayIndex >= cards.length) {
      autoplayMode = false;
      closeModal();
      return;
    }

    autoplayMode = true;
    const card = cards[autoplayIndex];
    const soundFile = card.getAttribute('data-sound');

    openModalForCard(card, soundFile, true, () => {
      autoplayIndex++;
      autoplayCards(cards);
    });
  }

  const playAllBtn = document.getElementById('playAllBtn');
  playAllBtn.addEventListener('click', () => {
    autoplayIndex = 0;
    autoplayCards(Array.from(document.querySelectorAll('.letter')));
  });

  // --- ИГРА ---
  function playRandomCard() {
    if (!gameMode) return;

    const cards = Array.from(document.querySelectorAll('.letter'));
    if (cards.length === 0) return;

    // очищаем предыдущий таймаут и аудио
    if (gameTimeout) {
      clearTimeout(gameTimeout);
      gameTimeout = null;
    }
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    const soundFile = randomCard.getAttribute('data-sound');
    const wordText = randomCard.getAttribute('data-modal-text') 
               || randomCard.querySelector('span')?.outerHTML 
               || '';

    modal.classList.add('game-mode');

    // Показываем ❓ и картинку
    modalLetter.innerHTML = "❓❓❓";
    modalLetter.style.display = "block";
    modalImage.src = randomCard.querySelector('img').src;
    modalImage.style.display = "block";

    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Через 5 секунд показываем текст и проигрываем звук
    gameTimeout = setTimeout(() => {
      if (!gameMode) return;

      modalLetter.innerHTML = wordText;
      playSound(soundFile, () => {
        if (gameMode) playRandomCard();
      });

      gameTimeout = null;
    }, 5000);
  }

  const grammBtn = document.getElementById('grammBtn');
  grammBtn.addEventListener('click', () => {
    gameMode = true;
    playRandomCard();
  });

  // --- выход ---
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeModal();
      autoplayMode = false;
      gameMode = false;
    }
  });
});

