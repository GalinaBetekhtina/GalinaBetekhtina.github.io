let currentAudio = null;
const overlay = document.getElementById('overlay');
const modalLetter = document.getElementById('modalLetter');
const modalImage = document.getElementById('modalImage');
let activeCard = null;

// Функция воспроизведения звука
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

// Подгонка шрифта
function adjustFontSize(element, maxWidth) {
  let fontSize = parseInt(window.getComputedStyle(element).fontSize);
  while (element.scrollWidth > maxWidth && fontSize > 10) {
    fontSize -= 1;
    element.style.fontSize = fontSize + "px";
  }
}

// Открытие модалки для одной карточки
function openModalForCard(card, soundFile) {
  activeCard = card;
 // card.classList.add('hide-img');

  const modalHTML = card.getAttribute('data-modal-text') || card.querySelector('span')?.textContent;
  modalLetter.innerHTML = modalHTML;

  // Устанавливаем картинку
  const imgSrc = card.querySelector('img').src;
  modalImage.src = imgSrc;
  modalImage.alt = card.querySelector('img').alt;

  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';

  adjustFontSize(modalLetter, modalLetter.parentElement.clientWidth - 20);

  playSound(soundFile);
}

// Закрытие модалки
function closeModal() {
  if (activeCard) {
    activeCard.classList.remove('hide-img');
    activeCard = null;
  }
  overlay.classList.remove('show');
  document.body.style.overflow = '';
  if(currentAudio){
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
}

// Клик по карточке
document.querySelectorAll('.letter').forEach(letter => {
  letter.addEventListener('click', () => {
    const soundFile = letter.getAttribute('data-sound');
    openModalForCard(letter, soundFile);
  });
  letter.addEventListener('touchstart', () => letter.classList.add('active'));
  letter.addEventListener('touchend', () => letter.classList.remove('active'));
});

// Клик по overlay для закрытия
overlay.addEventListener('click', (event) => {
  if(event.target === overlay){
    closeModal();
  }
});

// Автопроигрывание всех карточек
document.getElementById('playAllBtn').addEventListener('click', () => {
  const cards = Array.from(document.querySelectorAll('.letter'));
  let index = 0;

  function playNextCard() {
    if (index >= cards.length) {
      closeModal();
      return;
    }
    const card = cards[index];
    openModalForCard(card, card.getAttribute('data-sound'));
    index++;
    // Ждём окончания аудио перед следующей карточкой
    currentAudio.onended = () => {
      playNextCard();
    };
  }

  playNextCard();
});
