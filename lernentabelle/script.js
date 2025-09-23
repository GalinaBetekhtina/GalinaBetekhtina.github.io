let currentAudio = null;
const overlay = document.getElementById('overlay');
const modalLetter = document.getElementById('modalLetter');
let activeCard = null;

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

// Подстройка шрифта, чтобы текст помещался
function adjustFontSize(element, maxWidth) {
  let fontSize = parseInt(window.getComputedStyle(element).fontSize);
  while (element.scrollWidth > maxWidth && fontSize > 10) {
    fontSize -= 1;
    element.style.fontSize = fontSize + "px";
  }
}

function openModalForCard(card, soundFile) {
  activeCard = card;
  card.classList.add('hide-img');

  const modalHTML = card.getAttribute('data-modal-text') || card.querySelector('span')?.textContent;
  modalLetter.innerHTML = modalHTML;

  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';

  adjustFontSize(modalLetter, modalLetter.parentElement.clientWidth - 20);

  playSound(soundFile, closeModal);
}

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

// Клик по overlay (фон) для закрытия модального окна
overlay.addEventListener('click', (event) => {
  if(event.target === overlay){
    closeModal();
  }
});

// Подгонка шрифта при изменении окна
window.addEventListener('resize', () => {
  if (overlay.classList.contains('show')) {
    adjustFontSize(modalLetter, modalLetter.parentElement.clientWidth - 20);
  }
});
