let answers = {};
let answersEnabled = true;

// Создание и стилизация подсказки
const tooltip = document.createElement('div');
tooltip.className = 'answer-tooltip';
document.body.appendChild(tooltip);
console.log('[Plugin] Tooltip element created');

// Загрузка ответов из внешнего JSON-файла
fetch(chrome.runtime.getURL('answers.json'))
  .then(response => response.json())
  .then(json => {
    answers = json;
    console.log('[Plugin] Answers loaded:', answers);
    init();
  })
  .catch(err => console.error('[Plugin] Failed to load answers:', err));

function init() {
  console.log('[Plugin] Initialization started');
  // Восстановление состояния из localStorage
  if (localStorage.getItem('answersEnabled') === 'false') {
    answersEnabled = false;
    console.log('[Plugin] Answers disabled from storage');
  } else {
    console.log('[Plugin] Answers enabled');
  }

  // Переключение видимости ответов по Ctrl+Alt+D
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.code === 'KeyD') {
      answersEnabled = !answersEnabled;
      localStorage.setItem('answersEnabled', answersEnabled);
      console.log('[Plugin] Toggled answersEnabled to', answersEnabled);
    }
  });

  // Наблюдатель за изменениями DOM
  const observer = new MutationObserver(processQuestions);
  observer.observe(document.body, { childList: true, subtree: true });
  console.log('[Plugin] MutationObserver set');
  processQuestions();
}

function processQuestions() {
  console.log('[Plugin] processQuestions called');
  const questions = document.querySelectorAll('[data-automation-id="questionItem"]');
  console.log('[Plugin] Found questions count:', questions.length);
  questions.forEach(question => {
    // Если уже привязали обработчики — пропускаем
    if (question.dataset.answerBound) {
      console.log('[Plugin] Question already bound, skipping');
      return;
    }

    const titleEl = question.querySelector('span.text-format-content');
    if (!titleEl) {
      console.log('[Plugin] Title element not found for a question, skipping');
      return;
    }

    const questionText = titleEl.textContent.replace(/\d+\./, '').trim();
    console.log('[Plugin] Question text:', questionText);
    if (!(questionText in answers)) {
      console.log('[Plugin] No answer for this question, skipping');
      return;
    }

    const answer = Array.isArray(answers[questionText])
      ? answers[questionText].join(', ')
      : answers[questionText];
    console.log('[Plugin] Found answer:', answer);

    titleEl.addEventListener('mouseover', () => showAnswer(question, answer));
    titleEl.addEventListener('mouseout', hideAnswer);
    console.log('[Plugin] Event listeners attached');

    // Отмечаем, что вопросы уже обработаны
    question.dataset.answerBound = 'true';
  });
}

function showAnswer(question, answer) {
  console.log('[Plugin] showAnswer called for:', question, 'Answer:', answer);
  if (!answersEnabled) {
    console.log('[Plugin] Answers disabled, not showing');
    return;
  }

  const rect = question.getBoundingClientRect();
  tooltip.textContent = answer;
  tooltip.style.opacity = '0';
  tooltip.style.display = 'block';
  tooltip.style.top = `${rect.top + window.scrollY}px`;
  tooltip.style.left = `${rect.right + window.scrollX + 15}px`;

  setTimeout(() => {
    tooltip.style.opacity = '1';
    tooltip.style.transition = 'opacity 0.2s ease';
    console.log('[Plugin] Tooltip displayed');
  }, 10);
}

function hideAnswer() {
  console.log('[Plugin] hideAnswer called');
  tooltip.style.display = 'none';
}
