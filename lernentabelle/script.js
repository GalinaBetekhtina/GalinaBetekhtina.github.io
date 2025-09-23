document.addEventListener('DOMContentLoaded', () => {
  let currentCard = null;
  let autoplayIndex = 0;
  let autoplayMode = false;
  let gameMode = false;
  let gameTimeout = null;

  const overlay = document.getElementById('overlay');
  const modal = document.querySelector('.modal');
  const modalLetter = document.getElementById('modalLetter');
  const modalImage = document.getElementById('modalImage');

  // Создаем скрытый <audio> элемент для воспроизведения звуков
  const gameAudio = document.createElement('audio');
  gameAudio.style.display = 'none';
  document.body.appendChild(gameAudio);

  // --- воспроизведение аудио через DOM <audio> ---
  function playSound(src, onEnded) {
    if (!src) return;
    gameAudio.src = src;
    gameAudio.currentTime = 0;
    const playPromise = gameAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
    gameAudio.onended = () => { if (onEnded) onEnded(); };
  }

  // --- автоподгонка текста ---
  function adjustFontSize(element, maxWidth) {
    let fontSize = parseInt(window.getComputedStyle(element).fontSize);
    while (element.scrollWidth > maxWidth && fontSize > 10) {
      fontSize -= 1;
      element.style.fontSize = fontSize + "px";
    }
  }

  // --- открыть модалку для обычного клика ---
  function openModalForCard(card, soundFile, showImage = false, onEnded = null) {
    currentCard = card;
    const modalHTML = card.getAttribute('data-modal-text') || card.querySelector('span')?.textContent;
    modalLetter.innerHTML = modalHTML;

    if (showImage) {
      modalImage.src = card.querySelector('img').src;
      modalImage.style.display = 'block';
      modalLetter.classList.add('autoplay');
    } else {
      modalImage.style.display = 'none';
      modalLetter.classList.remove('autoplay');
    }

    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    modalLetter.style.display = "block";
    adjustFontSize(modalLetter, modalLetter.parentElement.clientWidth - 20);

    playSound(soundFile, () => {
      if (onEnded) onEnded();
      if (!autoplayMode && !gameMode) closeModal();
    });
  }

  // --- закрыть модалку ---
  function closeModal() {
    currentCard = null;
    overlay.classList.remove('show');
    modal.classList.remove('game-mode');
    document.body.style.overflow = '';
    modalLetter.style.display = "block";
    modalImage.style.display = "none";

    if (gameTimeout) {
      clearTimeout(gameTimeout);
      gameTimeout = null;
    }

    gameAudio.pause();
    gameAudio.currentTime = 0;
  }

  // --- клик по карточке ---
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

    // Сбрасываем предыдущие таймауты и звук
    if (gameTimeout) {
      clearTimeout(gameTimeout);
      gameTimeout = null;
    }
    gameAudio.pause();
    gameAudio.currentTime = 0;

    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    const soundFile = randomCard.getAttribute('data-sound');
    const wordText = randomCard.getAttribute('data-modal-text') || randomCard.querySelector('span')?.outerHTML || '';

    modal.classList.add('game-mode');

    // Показываем ❓ и картинку
    modalLetter.innerHTML = "❓";
    modalLetter.style.display = "block";
    modalImage.src = randomCard.querySelector('img').src;
    modalImage.style.display = "block";
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Задержка 5 секунд перед заменой текста и воспроизведением звука
    gameTimeout = setTimeout(() => {
      if (!gameMode) return;

      modalLetter.innerHTML = wordText;

      // Воспроизводим звук
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

  // --- закрытие при клике на оверлей ---
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeModal();
      autoplayMode = false;
      gameMode = false;
    }
  });
});
