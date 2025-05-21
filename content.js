const answers = {
    "Какая мера центральной тенденции делит заданный набор на две равные части?": "ЗАЛУПППААААААА",
    "Это способ организации, представления и объяснения набора данных с помощью диаграмм, графиков и сводных мер.": "Описательная статистика",
    "Выберите все примеры сводной статистики.": [
      "Мера центральной тенденции",
      "Мера дисперсии",
      "Мера форм распределения",
      "Мера статистической взаимосвязи"
    ],
    "Выберите правильное определение типов данных в статистике.": [
      "Качественные данные",
      "Количественные данные"
    ],
    "Ниже представлены оценки учащихся за тест. Какая из них является медианой?": "60",
    "Самый большой вес в классе — 37 кг, а самый малый — 30 кг. Каков интервал веса учащихся?": "7 кг"
  };

  let answersEnabled = true;

  if (localStorage.getItem('answersEnabled') === 'false') {
    answersEnabled = false;
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.code === 'KeyD') {
      console.log("Signal");
      answersEnabled = !answersEnabled;
      localStorage.setItem('answersEnabled', answersEnabled);
    }
  });
  
  const tooltip = document.createElement('div');
  tooltip.className = 'answer-tooltip';
  document.body.appendChild(tooltip);
  
  function processQuestions() {
    console.log("Starting processing questions");
    const questions = document.querySelectorAll('[data-automation-id="questionItem"]');
    console.log("All questions: " + questions);

    questions.forEach(question => {
      const titleElement = question.querySelector('span.text-format-content ');
      console.log("Title element: " + titleElement);
      const questionText = titleElement.textContent
        .replace(/\d+\./, '')
        .trim();
      console.log("Question text: " + questionText);
      
      if (answers[questionText]) {
        console.log("Found answer for question: " + questionText);
        const answer = Array.isArray(answers[questionText]) 
          ? answers[questionText].join(', ') 
          : answers[questionText];
        
        titleElement.addEventListener('mouseover', () => showAnswer(question, answer));
        titleElement.addEventListener('mouseout', hideAnswer);
      } else {
        console.log("Answer for question " + questionText + "not found :(");
      }
    });
  }
  
  function showAnswer(question, answer) {
    if (!answersEnabled) return;

    console.log("Showing answer")

    const rect = question.getBoundingClientRect();
    tooltip.textContent = answer;
    
    tooltip.style.opacity = '0';
    tooltip.style.display = 'block';
    
    tooltip.style.top = `${rect.top + window.scrollY}px`;
    tooltip.style.left = `${rect.right + window.scrollX + 15}px`; // 15px отступ справа
    
    setTimeout(() => {
      tooltip.style.opacity = '1';
      tooltip.style.transition = 'opacity 0.2s ease';
    }, 10);
  }
  
  function hideAnswer() {
    console.log("Hiding answer");
    tooltip.style.display = 'none';
  }
  
  const observer = new MutationObserver(processQuestions);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  processQuestions();