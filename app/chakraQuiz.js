  // Chakra personality mapping (A-G)
  const chakraMapping = {
    a: "Root chakra type (Builder)",
    b: "Sacral chakra type (Artist)",
    c: "Solar plexus chakra type (Achiever)",
    d: "Heart chakra type (Caretaker)",
    e: "Throat chakra type (Speaker)",
    f: "Third eye chakra type (Thinker)",
    g: "Crown chakra type (Yogi)"
  };
// chakraQuiz.js
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
Chart.register(...registerables);

export function initChakraQuiz(containerId) {
  // Ensure this runs only in the browser (not SSR)
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const container = document.getElementById(containerId);
  if (!container) return console.error('Container not found');

  // Clear container content
  container.innerHTML = '';

  // Create quiz elements
  const quizDiv = document.createElement('div');
  quizDiv.id = 'quiz';

  // --- Headline and description ---
  const quizHeadline = document.createElement('h1');
  quizHeadline.className = 'chakra-quiz-headline';
  const quizDesc = document.createElement('p');
  quizDesc.className = 'chakra-quiz-desc';

  // Progress bar and quiz
  const progressDiv = document.createElement('div');
  progressDiv.className = 'progress';
  const progressBarDiv = document.createElement('div');
  progressBarDiv.className = 'progress-bar';
  progressBarDiv.id = 'progressBar';
  progressDiv.appendChild(progressBarDiv);

  const progressText = document.createElement('p');
  progressText.id = 'progressText';

  const questionDiv = document.createElement('div');
  questionDiv.className = 'question';
  questionDiv.id = 'question';

  const answersDiv = document.createElement('div');
  answersDiv.className = 'answers';

  // Dynamically generate answer buttons based on current question's answers (a-g)
  function renderAnswerButtons() {
    answersDiv.innerHTML = '';
    const q = shuffledQuestions[currentIndex];
    if (!q || !q.answers) return;
    const letters = ['a','b','c','d','e','f','g'];
    // Always show all 7 options in correct order, using translation for current language
    letters.forEach((l, idx) => {
      const answerText = q.answers[l];
      if (typeof answerText === 'string' && answerText.length > 0) {
        const btn = document.createElement('button');
        btn.id = `btn${idx}`;
        btn.textContent = answerText;
        btn.addEventListener('click', () => answer(idx));
        answersDiv.appendChild(btn);
      }
    });
  }

  let currentLanguage = 'en';

  // --- Language selector for quiz page ---
  const langSelectTop = document.createElement('select');
  langSelectTop.id = 'langSelectTop';
  langSelectTop.className = 'restart-btn';
  langSelectTop.style.position = 'absolute';
  langSelectTop.style.top = '10px';
  langSelectTop.style.right = '10px';
  langSelectTop.style.margin = '0';
  langSelectTop.style.maxWidth = '140px';
  langSelectTop.style.zIndex = '1000';
  langSelectTop.innerHTML = `
    <option value="en">EN</option>
    <option value="de">DE</option>
  `;

  langSelectTop.value = currentLanguage;
  langSelectTop.addEventListener('change', () => {
    currentLanguage = langSelectTop.value;
    questions = translations[currentLanguage];
    updateQuizHeadlineAndDesc();
    if (quizDiv.style.display !== 'none') {
      startQuiz();
    } else {
      updateQuizHeadlineAndDesc();
    }
    showQuestion();
    const rs = document.getElementById('langSelectResult');
    if (rs) rs.value = currentLanguage;
  });
  document.body.appendChild(langSelectTop);

  // Add headline and description above quiz container, outside quizDiv, and center them
  // Remove headline/desc from inside quizDiv
  const quizHeadlineContainer = document.createElement('div');
  quizHeadlineContainer.style.display = 'flex';
  quizHeadlineContainer.style.flexDirection = 'column';
  quizHeadlineContainer.style.alignItems = 'center';
  quizHeadlineContainer.style.justifyContent = 'center';
  quizHeadlineContainer.style.width = '100%';
  quizHeadlineContainer.appendChild(quizHeadline);
  quizHeadlineContainer.appendChild(quizDesc);
  container.appendChild(quizHeadlineContainer);

  // Add quizDiv content
  quizDiv.style.position = 'relative';
  // Do NOT append headline/desc to quizDiv anymore
  quizDiv.appendChild(progressDiv);
  quizDiv.appendChild(progressText);
  quizDiv.appendChild(questionDiv);
  quizDiv.appendChild(answersDiv);

  const resultDiv = document.createElement('div');
  resultDiv.id = 'result';
  resultDiv.className = 'result';

  const resultTitle = document.createElement('h2');
  resultTitle.textContent = 'Dein Ergebnis';

  const chakraSummaryDiv = document.createElement('div');
  chakraSummaryDiv.id = 'chakraSummary';

  const canvas = document.createElement('canvas');
  canvas.id = 'chakraChart';
  canvas.height = 300;

  // New chakraAnalysisDiv for textual analysis
  const chakraAnalysisDiv = document.createElement('div');
  chakraAnalysisDiv.id = 'chakraAnalysis';
  chakraAnalysisDiv.style.textAlign = 'left';
  chakraAnalysisDiv.style.maxWidth = '600px';
  chakraAnalysisDiv.style.marginTop = '20px';
  chakraAnalysisDiv.style.color = '#374151';
  chakraAnalysisDiv.style.fontSize = '1rem';
  chakraAnalysisDiv.style.lineHeight = '1.5';

  const restartBtn = document.createElement('button');
  restartBtn.className = 'restart-btn';
  restartBtn.id = 'restartBtn';
  restartBtn.textContent = '🔄 Neu starten';

  // New Download PDF button
  const downloadPdfBtn = document.createElement('button');
  downloadPdfBtn.className = 'download-pdf-btn';
  downloadPdfBtn.id = 'downloadPdfBtn';
  downloadPdfBtn.textContent = '📄 PDF herunterladen';

  resultDiv.appendChild(resultTitle);
  resultDiv.appendChild(chakraSummaryDiv);
  resultDiv.appendChild(canvas);
  resultDiv.appendChild(chakraAnalysisDiv);
  resultDiv.appendChild(restartBtn);
  resultDiv.appendChild(downloadPdfBtn);

  container.appendChild(quizDiv);
  container.appendChild(resultDiv);

  // Add minimalistic, subtle styles
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background: linear-gradient(120deg, #f7fafc 0%, #f1f5f9 100%);
      color: #2d3748;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #${containerId} {
      width: 100%;
      max-width: 700px;
      background: linear-gradient(120deg, #f9fafb 0%, #f1f5f9 100%);
      padding: 36px 28px;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(44, 62, 80, 0.06);
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 36px;
      box-sizing: border-box;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .chakra-quiz-headline {
      font-size: 2rem;
      font-weight: 700;
      color: #6366f1;
      margin-bottom: 6px;
      margin-top: 0;
      letter-spacing: 0.01em;
      text-shadow: none;
      font-family: inherit;
    }
    .chakra-quiz-desc {
      font-size: 1.08rem;
      color: #4b5563;
      margin-bottom: 18px;
      margin-top: 0;
      line-height: 1.55;
      font-weight: 400;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      opacity: 0.93;
    }
    @media (max-width: 700px) {
      .chakra-quiz-headline {
        font-size: 1.33rem;
        margin-bottom: 4px;
      }
      .chakra-quiz-desc {
        font-size: 0.97rem;
        margin-bottom: 10px;
        padding: 0 2vw;
      }
    }
    .progress {
      background: linear-gradient(90deg, #e0e7ef 0%, #f1f5f9 100%);
      border-radius: 10px;
      overflow: hidden;
      height: 12px;
      box-shadow: none;
      margin-bottom: 12px;
      position: relative;
      width: 100%;
      max-width: 100%;
    }
    .progress-bar {
      height: 12px;
      background: linear-gradient(90deg, #a5b4fc 0%, #bae6fd 100%);
      background-size: 200% 100%;
      animation: gradientShift 5s ease infinite;
      width: 0%;
      border-radius: 10px;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: none;
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    #progressText {
      font-weight: 500;
      font-size: 1rem;
      color: #64748b;
      margin-bottom: 18px;
      letter-spacing: 0.01em;
    }
    .question {
      font-size: 1.28rem;
      font-weight: 500;
      margin-bottom: 22px;
      color: #334155;
      min-height: 58px;
      line-height: 1.35;
    }
    .answers {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      max-width: 100%;
    }
    .answers button {
      background: linear-gradient(90deg, #f1f5f9 0%, #e0e7ef 100%);
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 14px 18px;
      font-size: 1.05rem;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(44,62,80,0.04);
      transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      user-select: none;
      will-change: transform;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }
    .answers button:hover {
      background: #e0e7ef;
      color: #6366f1;
      border-color: #c7d2fe;
      box-shadow: 0 2px 8px rgba(99,102,241,0.07);
    }
    .answers button:active {
      background: #f1f5f9;
      color: #6366f1;
      border-color: #c7d2fe;
      box-shadow: none;
    }
    .result {
      display: none;
      background: linear-gradient(120deg, #f9fafb 0%, #f1f5f9 100%);
      padding: 26px 18px;
      border-radius: 20px;
      box-shadow: 0 2px 14px rgba(44, 62, 80, 0.08);
      color: #1e293b;
      display: flex;
      flex-direction: column;
      gap: 18px;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
    }
    .result h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      color: #6366f1;
      letter-spacing: 0.01em;
    }
    #chakraSummary p {
      font-size: 1.05rem;
      margin: 6px 0;
      font-weight: 500;
      color: #374151;
      line-height: 1.4;
    }
    #chakraChart {
      max-width: 100%;
      width: 100%;
      border-radius: 14px;
      box-shadow: none;
      background: #f1f5f9;
      padding: 14px;
      margin-top: 8px;
      box-sizing: border-box;
    }
    .restart-btn,
    .download-pdf-btn {
      margin-top: 0;
      padding: 12px 24px;
      font-size: 1rem;
      font-weight: 500;
      border-radius: 16px;
      border: none;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(44,62,80,0.03);
      transition: background 0.2s, color 0.2s, box-shadow 0.2s;
      user-select: none;
      will-change: transform;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: linear-gradient(90deg, #e0e7ef 0%, #f1f5f9 100%);
      color: #6366f1;
      border: 1px solid #e5e7eb;
    }
    .restart-btn:hover,
    .download-pdf-btn:hover {
      background: #e0e7ef;
      color: #6366f1;
      box-shadow: 0 2px 8px rgba(99,102,241,0.07);
      border-color: #c7d2fe;
    }
    .restart-btn:active,
    .download-pdf-btn:active {
      background: #f1f5f9;
      color: #6366f1;
      border-color: #c7d2fe;
      box-shadow: none;
    }
    .download-pdf-btn {
      margin-top: 12px;
    }
    /* ----- MOBILE RESPONSIVENESS ----- */
    @media (max-width: 900px) {
      #${containerId} {
        max-width: 97vw;
        padding: 18px 4vw;
      }
      .result {
        padding: 18px 4vw;
      }
    }
    @media (max-width: 700px) {
      #${containerId} {
        max-width: 100vw;
        padding: 10px 1vw 10px 1vw;
        border-radius: 10px;
        gap: 18px;
      }
      .result {
        padding: 10px 4vw;
        border-radius: 10px;
        gap: 10px;
      }
      .question {
        font-size: 1.05rem;
        min-height: 30px;
        margin-bottom: 8px;
      }
      #chakraChart {
        padding: 8px;
        border-radius: 8px;
      }
    }
    @media (max-width: 480px) {
      #${containerId} {
        max-width: 100vw;
        padding: 4px 1vw 4px 1vw;
        border-radius: 0px;
        gap: 7px;
      }
      .result {
        padding: 4px 2vw;
        border-radius: 0px;
        gap: 6px;
      }
      .question {
        font-size: 0.97rem;
        min-height: 10px;
        margin-bottom: 6px;
      }
      .answers button {
        padding: 9px 8px;
        font-size: 0.93rem;
        border-radius: 8px;
      }
      .answers {
        gap: 7px;
      }
      .progress {
        height: 8px;
        border-radius: 6px;
      }
      .progress-bar {
        height: 8px;
        border-radius: 6px;
      }
      #progressText {
        font-size: 0.93rem;
        margin-bottom: 8px;
      }
      .restart-btn,
      .download-pdf-btn {
        padding: 8px 10px;
        font-size: 0.93rem;
        border-radius: 8px;
        margin-top: 4px;
      }
      #chakraChart {
        padding: 4px;
        border-radius: 6px;
        margin-top: 2px;
      }
      #chakraSummary > div {
        flex-direction: column !important;
        gap: 8px !important;
        margin: 6px 0 4px 0 !important;
        align-items: stretch !important;
      }
      #chakraSummary > div > div {
        min-width: unset !important;
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 0 0 0 !important;
        padding: 10px 6px 8px 6px !important;
      }
      #chakraAnalysis {
        font-size: 0.92rem !important;
        padding: 0 1px;
        max-width: 100vw !important;
      }
    }
    /* Make chakra cards stack vertically on narrow screens */
    @media (max-width: 700px) {
      #chakraSummary > div {
        flex-direction: column !important;
        gap: 10px !important;
        margin: 10px 0 6px 0 !important;
        align-items: stretch !important;
      }
      #chakraSummary > div > div {
        min-width: unset !important;
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 0 0 0 !important;
        padding: 10px 8px 8px 8px !important;
      }
    }
    /* Make chart scale on mobile */
    @media (max-width: 480px) {
      #chakraChart {
        width: 100vw !important;
        min-width: 0 !important;
        max-width: 100vw !important;
        height: auto !important;
      }
    }
    /* Ensure buttons and inputs fill width on mobile */
    @media (max-width: 480px) {
      .answers button,
      .restart-btn,
      .download-pdf-btn {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100vw !important;
      }
    }
  `;
  document.head.appendChild(style);

  // Language selection and translations for questions

  const translations = {
    en: [
      {
        question: "1. Select the statement you identify with the most.",
        answers: {
          a: "Life is an opportunity to build something solid—to diligently and patiently establish stability, groundedness, and peace of mind.",
          b: "The world is full of endless adventures and opportunities, and we are here to experience as many of them as possible.",
          c: "Life is an opportunity to bring out the best in ourselves, become a success story, and emerge victorious.",
          d: "The world is a space of emotional bonding, and we are here to realize our maximum potential as love in a human form.",
          e: "Life presents the opportunity to discover our message, express our truest voice, and influence others’ lives.",
          f: "The world is a space of endless learning and knowledge, and our role in it is to stretch our intelligence and understanding as much as possible.",
          g: "Life is an opportunity for a profound inner journey of spiritual liberation and transcendence."
        }
      },
      {
        question: "2. What would you say is the most active part of you?",
        answers: {
          a: "The earthly, grounded, and instinctual part of my being.",
          b: "My feelings, impulses, and the intelligence of my body.",
          c: "My willpower and ambition.",
          d: "My deep emotional world.",
          e: "My voice, expression, and communication.",
          f: "My mind and intellect.",
          g: "The spiritual part of my being."
        }
      },
      {
        question: "3. Which imagery immediately makes you feel like you are in the right place?",
        answers: {
          a: "A beautiful house, a garden, and prosperous land.",
          b: "Someone dancing in a trancelike, ecstatic state at a party.",
          c: "Climbing a mountaintop, nearly reaching the peak.",
          d: "Two people’s hands entwining and caressing each other.",
          e: "A speaker in a big lecture hall facing a large crowd.",
          f: "A library and a lone writer sitting in it, immersed in their own world.",
          g: "A monk in deep meditation."
        }
      },
      {
        question: "4. My ideal way of sharing my being with others is…",
        answers: {
          a: "Serving the needs of my family and community with my skills and abilities.",
          b: "Having fun, laughing, dancing, and experiencing physical and sensual joy.",
          c: "Striving toward some shared target with effort and determination.",
          d: "A one-on-one, personal, and intimate sharing in which we open our hearts to one another.",
          e: "Guiding others or discussing and creating a grand vision with them.",
          f: "Engaging in a profound philosophical discussion with a thoughtful person.",
          g: "Meditating, praying, and simply being with others who are spiritually oriented."
        }
      },
      {
        question: "5. The best way I could spend my time is by…",
        answers: {
          a: "Carrying out small actions and plans that put life into order and balance.",
          b: "Immersing myself in the outdoors, moving my body, and breathing the moment deep into my being.",
          c: "Making sure that everything I do can lead me to my goal.",
          d: "Helping someone and making sure they are happy.",
          e: "Writing or recording a message that could change people’s lives.",
          f: "Delving into a book by a great philosopher.",
          g: "Watching a video of a spiritual or religious teacher."
        }
      },
      {
        question: "6. Since childhood, my main connection with the world has been through…",
        answers: {
          a: "My search for belonging and my role in the systems of the world.",
          b: "Playfulness and experimentation.",
          c: "Winning in various competitions and other settings.",
          d: "Strong feelings toward certain others.",
          e: "Educating and leading others.",
          f: "Distant observation and quiet inner study.",
          g: "Indifference and unbelonging."
        }
      },
      {
        question: "7. Others would say that I am…",
        answers: {
          a: "Diligent, serious, responsible, cautious, and accurate.",
          b: "Restless, intense, passionate, humorous, and always hunting for a new experience.",
          c: "Ambitious, driven, focused, busy, and competitive.",
          d: "Emotional, sensitive, caring, helpful, and kindhearted.",
          e: "Inquisitive, controlling, intense, idealistic, and expressive.",
          f: "Wise, silent, distant, deep, and aware.",
          g: "Spiritual, introverted, unearthly, gentle, and dreamy."
        }
      },
      {
        question: "8. At heart, I am a…",
        answers: {
          a: "Hard worker.",
          b: "Dancer.",
          c: "Warrior.",
          d: "Lover.",
          e: "Communicator.",
          f: "Philosopher.",
          g: "Meditator."
        }
      },
      {
        question: "9. I am…",
        answers: {
          a: "Slow and careful.",
          b: "Quick and spontaneous.",
          c: "Persistent and determined.",
          d: "Mild and harmonious.",
          e: "Intense and engaging.",
          f: "Distant and observant.",
          g: "Dreamy and spacey."
        }
      },
      {
        question: "10. Choose the word that you respond the most to.",
        answers: {
          a: "Foundation.",
          b: "Passion.",
          c: "Victory.",
          d: "Love.",
          e: "Vision.",
          f: "Wisdom.",
          g: "Silence."
        }
      },
      {
        question: "11. Which building sounds the most interesting and impressive to you?",
        answers: {
          a: "An ancient history museum.",
          b: "A whimsical, artistic building.",
          c: "A skyscraper.",
          d: "A sanctuary for the underserved.",
          e: "A congressional hall.",
          f: "A university.",
          g: "An ashram or a monastery."
        }
      },
      {
        question: "12. When I leave this world, I want to know that…",
        answers: {
          a: "I have benefited and contributed to my family, community, and people.",
          b: "I have experienced life totally and let it in fully.",
          c: "I have achieved the highest goals I set for myself.",
          d: "I have loved strongly enough.",
          e: "I have left behind a legacy of influence and impact.",
          f: "I have understood some of life’s hidden mysteries.",
          g: "I have experienced my innermost spirit."
        }
      },
      {
        question: "13. Which of these negative attributes characterizes you the most?",
        answers: {
          a: "Overcaution.",
          b: "Lack of commitment.",
          c: "Anger.",
          d: "Neediness.",
          e: "A controlling nature.",
          f: "Arrogance.",
          g: "Detachment."
        }
      },
      {
        question: "14. How do you feel when you read the following statement? “I love dealing with details—calculations and figures, materials and accurate planning, pieces of information, and schedules.”",
        answers: {
          a: "Yes! I totally agree.",
          b: "No, dealing with details makes me want to fly away. I love doing nothing!",
          c: "Yes, but only if it leads me to some clear and powerful goal.",
          d: "Yes, but only if it clearly helps me serve someone I love.",
          e: "No, I would rather leap to the vision at the edge of my imagination.",
          f: "No, small details have no intelligence or depth in them.",
          g: "No, earthly life has no spiritual meaning."
        }
      },
      {
        question: "15. When an overwhelming negative emotion arises in me, I…",
        answers: {
          a: "Do anything I can to calm it down and put myself back together.",
          b: "Become one with it, totally experience it, and quickly return to joy.",
          c: "Take it out on my surroundings.",
          d: "Become overwhelmed and struggle to transform it into harmony.",
          e: "Try to control and suffocate it.",
          f: "Investigate it as a scientist.",
          g: "Meditate."
        }
      },
      {
        question: "16. How much do you like change and mobility in life (as opposed to routine and permanence)?",
        answers: {
          a: "Big changes feel unhealthy and destabilizing for me. I prefer slow and gradual change.",
          b: "Change is my middle name. I always feel on fire and can’t stand routine!",
          c: "I don’t like disruptions, but I know how to adjust them to my plans.",
          d: "I am fine with changes as long as I get to keep all my loved ones with me.",
          e: "I get confused when things change and collide with the dream inside me.",
          f: "I prefer to create a routine that allows me to deeply explore the mental realm.",
          g: "I don’t initiate changes, but I can accept changes when they come as God’s will."
        }
      },
      {
        question: "17. How would you describe your type and level of energy?",
        answers: {
          a: "Slow and persistent, like a low flame.",
          b: "Rapid, quick, and physical, like a flare.",
          c: "Massive and uncompromising, like a bulldozer.",
          d: "Gentle and soft, like a breeze.",
          e: "Intense and wakeful.",
          f: "Mainly concentrated in my head, not so physical.",
          g: "Airy, like levitation."
        }
      },
      {
        question: "18. I feel most alive when…",
        answers: {
          a: "I manage to grasp the inner mechanism of something.",
          b: "I am experiencing creative expression.",
          c: "I manage to remove obstacles and take a step forward.",
          d: "I am in a state of intimacy and bonding.",
          e: "I manage to influence and affect the lives of others.",
          f: "I have new and brilliant insights.",
          g: "I manage to enter deep states of consciousness."
        }
      },
      {
        question: "19. How do you feel when you read the following statement? “I want to change the world!”",
        answers: {
          a: "My aspirations are not that great. However, I want to know that I have benefited others and my community.",
          b: "Far from it. I just want to be myself and express that creatively and authentically.",
          c: "I want to conquer the world!",
          d: "I just spread love with all my heart. Whatever happens, happens.",
          e: "Yes—by spreading my ideas, visions, and creations, I dream of having a global impact.",
          f: "My thoughts and ideas are far too deep to change the common people.",
          g: "Global change is none of my concern. I am only occupied with the eternal."
        }
      },
      {
        question: "20. Think of the color that best represents your deepest, innermost being (as opposed to your “favorite” color). Which of the following colors most closely resembles the color of your inner being?",
        answers: {
          a: "Deep red.",
          b: "Fizzy orange.",
          c: "Radiant yellow.",
          d: "Soft and light green.",
          e: "Deep and intense blue.",
          f: "Lush and mysterious purple.",
          g: "Bright white; colorless."
        }
      },
      {
        question: "21. Choose your most cherished values.",
        answers: {
          a: "Respect, loyalty, patience.",
          b: "Joy, totality, beauty.",
          c: "Courage, perseverance, dignity.",
          d: "Compassion, friendship, harmony.",
          e: "Authenticity, autonomy, self-expression.",
          f: "Intelligence, clarity, depth.",
          g: "Purity, nonattachment, freedom."
        }
      },
      {
        question: "22. How do you feel when you read the following statement? “I love being part of a larger unit like a tradition, family, community, or nation. It feels healthy and supportive.”",
        answers: {
          a: "Perfectly accurate.",
          b: "Not at all! I avoid frameworks that limit my freedom of choice and experience.",
          c: "I appreciate structures, but it is most important for me to stand out and be myself.",
          d: "Structures are wonderful as long as they are opportunities for love.",
          e: "I am more interested in my dreams about better, even utopian, communities.",
          f: "Such structures are for common people. I prefer to research this phenomenon.",
          g: "Only if these larger units are spiritual and support spirituality."
        }
      },
      {
        question: "23. How much do you like long-term projects and lifetime commitments?",
        answers: {
          a: "A lot—as long as they are relaxed and secure processes.",
          b: "The very idea terrifies me. I feel like I’m in a cage.",
          c: "I like them as long as they lead to some successful end and are constantly growing and expanding.",
          d: "I like them, but they need to be essentially emotional commitments.",
          e: "I like them, but only if they include a vision that thrills me and never stifles my dreams.",
          f: "I like them if they are intellectual by nature and lead to new depths.",
          g: "My only lifelong commitment is to my spiritual journey."
        }
      },
      {
        question: "24. Choose the figure that you relate to the most.",
        answers: {
          a: "Thomas Edison, inventor.",
          b: "Jim Morrison, rock legend and poet.",
          c: "Ernesto “Che” Guevara, warrior and revolutionary.",
          d: "Mother Teresa, missionary of charity.",
          e: "Martin Luther King Jr., speaker and leader.",
          f: "Sigmund Freud, psychologist and theorist.",
          g: "Francis of Assisi, saint."
        }
      },
      {
        question: "25. Which historical revolution impresses you the most?",
        answers: {
          a: "The agricultural or industrial revolution.",
          b: "The social revolution of the ’60s (the flower children).",
          c: "The victory in the Second World War.",
          d: "Nonviolent peace movements like Gandhi’s and King’s.",
          e: "The emergence of democracy in ancient Athens.",
          f: "Ancient Greek philosophy.",
          g: "The emergence of teachers like the Buddha or Jesus."
        }
      }
    ],
    de: [
      {
        question: "1. Wähle die Aussage, mit der du dich am meisten identifizierst.",
        answers: {
          a: "Das Leben ist eine Gelegenheit, etwas Solides zu erschaffen – geduldig und fleißig Stabilität, Erdung und innere Ruhe zu etablieren.",
          b: "Die Welt ist voller Abenteuer und Möglichkeiten. Wir sind hier, um so viele davon wie möglich zu erleben.",
          c: "Das Leben ist eine Chance, das Beste aus uns herauszuholen, Erfolgsgeschichten zu schreiben und als Sieger hervorzugehen.",
          d: "Die Welt ist ein Raum für emotionale Bindung, und wir sind hier, um unser höchstes Potenzial als Liebe in menschlicher Form zu entfalten.",
          e: "Das Leben bietet die Möglichkeit, unsere Botschaft zu entdecken, unsere wahre Stimme auszudrücken und das Leben anderer zu beeinflussen.",
          f: "Die Welt ist ein Ort endlosen Lernens und Wissens, und unsere Aufgabe ist es, unsere Intelligenz und unser Verständnis maximal zu erweitern.",
          g: "Das Leben ist eine Gelegenheit für eine tiefe innere Reise spiritueller Befreiung und Transzendenz."
        }
      },
      {
        question: "2. Welcher Teil von dir ist am aktivsten?",
        answers: {
          a: "Der irdische, geerdete und instinktive Teil meines Wesens.",
          b: "Meine Gefühle, Impulse und die Intelligenz meines Körpers.",
          c: "Mein Wille und mein Ehrgeiz.",
          d: "Meine tiefe Gefühlswelt.",
          e: "Meine Stimme, mein Ausdruck und meine Kommunikation.",
          f: "Mein Geist und Intellekt.",
          g: "Der spirituelle Teil meines Wesens."
        }
      },
      {
        question: "3. Bei welchem Bild hast du sofort das Gefühl, am richtigen Ort zu sein?",
        answers: {
          a: "Ein schönes Haus, ein Garten und fruchtbares Land.",
          b: "Jemand tanzt in ekstatischer Trance auf einer Party.",
          c: "Einen Berg erklimmen und fast den Gipfel erreichen.",
          d: "Zwei Hände, die sich liebevoll ineinander verschlingen.",
          e: "Ein Redner in einem großen Hörsaal vor vielen Menschen.",
          f: "Eine Bibliothek mit einem einsamen Schreibenden, vertieft in seine Welt.",
          g: "Ein Mönch in tiefer Meditation."
        }
      },
      {
        question: "4. Meine ideale Art, mein Sein mit anderen zu teilen, ist…",
        answers: {
          a: "Mit meinen Fähigkeiten meiner Familie und Gemeinschaft zu dienen.",
          b: "Spaß haben, lachen, tanzen und körperliche sowie sinnliche Freude erleben.",
          c: "Gemeinsam mit anderen mit Einsatz und Entschlossenheit auf ein Ziel hinarbeiten.",
          d: "Ein persönliches, intimes Miteinander, bei dem wir unsere Herzen öffnen.",
          e: "Andere anleiten oder gemeinsam eine große Vision entwickeln.",
          f: "Ein tiefgründiges philosophisches Gespräch mit einer nachdenklichen Person.",
          g: "Meditieren, beten und einfach mit anderen spirituell orientierten Menschen sein."
        }
      },
      {
        question: "5. Die schönste Art, meine Zeit zu verbringen, ist…",
        answers: {
          a: "Kleine Handlungen und Pläne umsetzen, die das Leben in Ordnung und Balance bringen.",
          b: "Draußen sein, mich bewegen und den Moment tief in mich aufnehmen.",
          c: "Sicherstellen, dass alles, was ich tue, mich meinem Ziel näherbringt.",
          d: "Jemandem helfen und für sein Glück sorgen.",
          e: "Eine Botschaft schreiben oder aufnehmen, die das Leben anderer verändern kann.",
          f: "Mich in ein Buch eines großen Philosophen vertiefen.",
          g: "Ein Video eines spirituellen oder religiösen Lehrers anschauen."
        }
      },
      {
        question: "6. Seit meiner Kindheit ist meine Hauptverbindung zur Welt…",
        answers: {
          a: "Meine Suche nach Zugehörigkeit und meine Rolle in den Systemen der Welt.",
          b: "Verspieltheit und Experimentierfreude.",
          c: "Siegen in Wettbewerben und anderen Situationen.",
          d: "Starke Gefühle für bestimmte Menschen.",
          e: "Andere zu unterrichten und anzuleiten.",
          f: "Distanzierte Beobachtung und stilles inneres Forschen.",
          g: "Gleichgültigkeit und Nichtzugehörigkeit."
        }
      },
      {
        question: "7. Andere würden sagen, ich bin…",
        answers: {
          a: "Fleißig, ernst, verantwortungsbewusst, vorsichtig und genau.",
          b: "Unruhig, leidenschaftlich, humorvoll und immer auf der Suche nach neuen Erlebnissen.",
          c: "Ehrgeizig, zielstrebig, fokussiert, beschäftigt und wettbewerbsorientiert.",
          d: "Emotional, sensibel, fürsorglich, hilfsbereit und herzlich.",
          e: "Neugierig, kontrollierend, idealistisch und ausdrucksstark.",
          f: "Weise, still, distanziert, tiefgründig und aufmerksam.",
          g: "Spirituell, introvertiert, weltentrückt, sanft und verträumt."
        }
      },
      {
        question: "8. Im Herzen bin ich ein…",
        answers: {
          a: "Arbeiter.",
          b: "Tänzer.",
          c: "Kämpfer.",
          d: "Liebender.",
          e: "Kommunikator.",
          f: "Philosoph.",
          g: "Meditierender."
        }
      },
      {
        question: "9. Ich bin…",
        answers: {
          a: "Langsam und vorsichtig.",
          b: "Schnell und spontan.",
          c: "Ausdauernd und entschlossen.",
          d: "Sanft und harmonisch.",
          e: "Intensiv und mitreißend.",
          f: "Distanziert und beobachtend.",
          g: "Verträumt und abgehoben."
        }
      },
      {
        question: "10. Welches Wort spricht dich am meisten an?",
        answers: {
          a: "Grundlage.",
          b: "Leidenschaft.",
          c: "Sieg.",
          d: "Liebe.",
          e: "Vision.",
          f: "Weisheit.",
          g: "Stille."
        }
      },
      {
        question: "11. Welches Gebäude klingt für dich am interessantesten und beeindruckendsten?",
        answers: {
          a: "Ein Museum für Geschichte.",
          b: "Ein verspieltes, künstlerisches Gebäude.",
          c: "Ein Wolkenkratzer.",
          d: "Ein Zufluchtsort für Bedürftige.",
          e: "Ein Parlamentssaal.",
          f: "Eine Universität.",
          g: "Ein Ashram oder Kloster."
        }
      },
      {
        question: "12. Wenn ich diese Welt verlasse, möchte ich wissen, dass…",
        answers: {
          a: "Ich meiner Familie, Gemeinschaft und den Menschen geholfen und etwas beigetragen habe.",
          b: "Ich das Leben vollkommen erfahren und es voll zugelassen habe.",
          c: "Ich die höchsten Ziele erreicht habe, die ich mir gesetzt habe.",
          d: "Ich stark genug geliebt habe.",
          e: "Ich ein Vermächtnis von Einfluss und Wirkung hinterlassen habe.",
          f: "Ich einige der verborgenen Geheimnisse des Lebens verstanden habe.",
          g: "Ich meinen innersten Geist erfahren habe."
        }
      },
      {
        question: "13. Welche dieser negativen Eigenschaften trifft am ehesten auf dich zu?",
        answers: {
          a: "Übervorsicht.",
          b: "Mangel an Engagement.",
          c: "Wut.",
          d: "Bedürftigkeit.",
          e: "Kontrollbedürfnis.",
          f: "Arroganz.",
          g: "Distanzierung."
        }
      },
      {
        question: "14. Wie fühlst du dich, wenn du folgende Aussage liest? „Ich liebe es, mich mit Details zu beschäftigen – Berechnungen und Zahlen, Materialien und genaue Planung, Informationen und Zeitpläne.“",
        answers: {
          a: "Ja! Stimme ich voll zu.",
          b: "Nein, Details machen mich verrückt. Ich liebe es, nichts zu tun!",
          c: "Ja, aber nur, wenn es zu einem klaren und kraftvollen Ziel führt.",
          d: "Ja, aber nur, wenn es jemandem hilft, den ich liebe.",
          e: "Nein, ich springe lieber direkt zur Vision am Rand meiner Vorstellungskraft.",
          f: "Nein, kleine Details haben für mich keine Tiefe oder Intelligenz.",
          g: "Nein, das irdische Leben hat für mich keine spirituelle Bedeutung."
        }
      },
      {
        question: "15. Wenn eine überwältigende negative Emotion in mir aufkommt, dann…",
        answers: {
          a: "Tue ich alles, um mich zu beruhigen und wieder zusammenzusetzen.",
          b: "Ich werde eins mit ihr, erlebe sie total und kehre dann schnell zur Freude zurück.",
          c: "Lasse ich es an meiner Umgebung aus.",
          d: "Werde ich überwältigt und habe Mühe, sie in Harmonie zu verwandeln.",
          e: "Versuche ich, sie zu kontrollieren und zu unterdrücken.",
          f: "Untersuche ich sie wie ein Wissenschaftler.",
          g: "Meditiere ich."
        }
      },
      {
        question: "16. Wie sehr magst du Veränderungen und Mobilität im Leben (im Gegensatz zu Routine und Beständigkeit)?",
        answers: {
          a: "Große Veränderungen verunsichern mich. Ich bevorzuge langsame und allmähliche Veränderung.",
          b: "Veränderung ist mein zweiter Vorname. Ich kann keine Routine ertragen!",
          c: "Ich mag keine Störungen, aber ich weiß, wie ich sie in meine Pläne einbaue.",
          d: "Veränderungen sind ok, solange ich alle meine Liebsten bei mir behalten kann.",
          e: "Ich werde verwirrt, wenn sich Dinge ändern und mit meinem inneren Traum kollidieren.",
          f: "Ich schaffe mir lieber Routinen, um geistige Tiefe zu erforschen.",
          g: "Ich initiiere keine Veränderungen, aber ich akzeptiere sie als göttlichen Willen."
        }
      },
      {
        question: "17. Wie würdest du deinen Energie-Typ und dein Energie-Level beschreiben?",
        answers: {
          a: "Langsam und ausdauernd, wie eine kleine Flamme.",
          b: "Schnell, sprunghaft und körperlich, wie eine Fackel.",
          c: "Massiv und kompromisslos, wie ein Bulldozer.",
          d: "Sanft und weich, wie eine Brise.",
          e: "Intensiv und wach.",
          f: "Hauptsächlich im Kopf konzentriert, wenig körperlich.",
          g: "Luftig, wie Schweben."
        }
      },
      {
        question: "18. Ich fühle mich am lebendigsten, wenn…",
        answers: {
          a: "Ich den inneren Mechanismus von etwas verstehe.",
          b: "Ich mich kreativ ausdrücke.",
          c: "Ich Hindernisse beseitige und einen Schritt vorankomme.",
          d: "Ich in Intimität und Verbundenheit bin.",
          e: "Ich das Leben anderer beeinflussen kann.",
          f: "Ich neue, brillante Einsichten habe.",
          g: "Ich in tiefe Bewusstseinszustände eintauche."
        }
      },
      {
        question: "19. Wie fühlst du dich, wenn du folgende Aussage liest? „Ich will die Welt verändern!“",
        answers: {
          a: "So große Ambitionen habe ich nicht. Ich möchte aber wissen, dass ich anderen und meiner Gemeinschaft geholfen habe.",
          b: "Ganz und gar nicht. Ich will einfach ich selbst sein und das kreativ und authentisch ausdrücken.",
          c: "Ich will die Welt erobern!",
          d: "Ich verbreite einfach Liebe mit ganzem Herzen. Was passiert, passiert.",
          e: "Ja – indem ich Ideen, Visionen und Kreationen verbreite, träume ich von globalem Einfluss.",
          f: "Meine Gedanken sind zu tief, um die breite Masse zu erreichen.",
          g: "Globale Veränderung ist nicht mein Thema. Ich beschäftige mich nur mit dem Ewigen."
        }
      },
      {
        question: "20. Welche Farbe entspricht am ehesten deinem innersten Wesen (nicht deiner „Lieblingsfarbe“)?",
        answers: {
          a: "Tiefes Rot.",
          b: "Spritziges Orange.",
          c: "Strahlendes Gelb.",
          d: "Sanftes, helles Grün.",
          e: "Tiefes, intensives Blau.",
          f: "Üppiges, mystisches Violett.",
          g: "Helles Weiß; farblos."
        }
      },
      {
        question: "21. Wähle deine wichtigsten Werte.",
        answers: {
          a: "Respekt, Loyalität, Geduld.",
          b: "Freude, Ganzheit, Schönheit.",
          c: "Mut, Ausdauer, Würde.",
          d: "Mitgefühl, Freundschaft, Harmonie.",
          e: "Authentizität, Autonomie, Selbstausdruck.",
          f: "Intelligenz, Klarheit, Tiefe.",
          g: "Reinheit, Loslösung, Freiheit."
        }
      },
      {
        question: "22. Wie fühlst du dich, wenn du folgende Aussage liest? „Ich liebe es, Teil einer größeren Einheit wie Tradition, Familie, Gemeinschaft oder Nation zu sein. Es fühlt sich gesund und unterstützend an.“",
        answers: {
          a: "Absolut zutreffend.",
          b: "Überhaupt nicht! Ich meide Rahmen, die meine Freiheit einschränken.",
          c: "Ich schätze Strukturen, aber am wichtigsten ist es, herauszustechen und ich selbst zu sein.",
          d: "Strukturen sind wunderbar, solange sie Gelegenheiten für Liebe sind.",
          e: "Ich interessiere mich mehr für meine Träume von besseren, sogar utopischen Gemeinschaften.",
          f: "Solche Strukturen sind für die Masse. Ich forsche lieber darüber.",
          g: "Nur wenn diese Einheiten spirituell sind und Spiritualität fördern."
        }
      },
      {
        question: "23. Wie stehst du zu langfristigen Projekten und lebenslangen Verpflichtungen?",
        answers: {
          a: "Sehr – solange es entspannte und sichere Prozesse sind.",
          b: "Der Gedanke macht mir Angst. Ich fühle mich wie im Käfig.",
          c: "Ich mag sie, solange sie zu Erfolg führen und stetig wachsen.",
          d: "Ich mag sie, aber sie müssen emotionale Bindungen sein.",
          e: "Ich mag sie nur, wenn sie eine Vision enthalten, die mich begeistert und meine Träume nicht erstickt.",
          f: "Ich mag sie, wenn sie geistig sind und zu neuer Tiefe führen.",
          g: "Meine einzige lebenslange Verpflichtung gilt dem spirituellen Weg."
        }
      },
      {
        question: "24. Mit welcher Persönlichkeit identifizierst du dich am meisten?",
        answers: {
          a: "Thomas Edison, Erfinder.",
          b: "Jim Morrison, Rocklegende und Dichter.",
          c: "Ernesto „Che“ Guevara, Kämpfer und Revolutionär.",
          d: "Mutter Teresa, Missionarin der Nächstenliebe.",
          e: "Martin Luther King Jr., Redner und Anführer.",
          f: "Sigmund Freud, Psychologe und Theoretiker.",
          g: "Franz von Assisi, Heiliger."
        }
      },
      {
        question: "25. Welche historische Revolution beeindruckt dich am meisten?",
        answers: {
          a: "Die landwirtschaftliche oder industrielle Revolution.",
          b: "Die soziale Revolution der 60er (Flower Power).",
          c: "Der Sieg im Zweiten Weltkrieg.",
          d: "Gewaltfreie Friedensbewegungen wie die von Gandhi und King.",
          e: "Die Entstehung der Demokratie im antiken Athen.",
          f: "Die antike griechische Philosophie.",
          g: "Das Auftreten von Lehrern wie Buddha oder Jesus."
        }
      }
    ]
  };

  let questions = translations[currentLanguage];

  // Headline and description translations
  const quizHeadlineDescTranslations = {
    en: {
      headline: "Chakra Personality Test",
      desc: "Find out which chakras are particularly strong or weak in your life and receive a personal analysis."
    },
    de: {
      headline: "Chakra Persönlichkeitstest",
      desc: "Finde heraus, welche Chakras in deinem Leben besonders stark oder schwach ausgeprägt sind und erhalte eine persönliche Analyse."
    }
  };

  function updateQuizHeadlineAndDesc() {
    // Always keep the German headline/desc for both languages as per requirements
    quizHeadline.textContent = quizHeadlineDescTranslations['de'].headline;
    quizDesc.textContent = quizHeadlineDescTranslations['de'].desc;
  }

  // Helper: answer mapping for 7 options (a-g)
  // a=1, b=2, c=3, d=4, e=5, f=6, g=7

  const chakraColors = {
    1: '#e11d48',
    2: '#f97316',
    3: '#eab308',
    4: '#22c55e',
    5: '#3b82f6',
    6: '#8b5cf6',
    7: '#9333ea',
  };
  const chakraDescriptions = {
    1: 'Wurzelchakra – Stabilität, Sicherheit, Erdung.',
    2: 'Sakralchakra – Kreativität, Freude, Sexualität.',
    3: 'Solarplexus – Selbstbewusstsein, Wille, Kraft.',
    4: 'Herzchakra – Liebe, Mitgefühl, Verbundenheit.',
    5: 'Halschakra – Kommunikation, Ausdruck, Wahrheit.',
    6: 'Stirnchakra – Intuition, Klarheit, Vision.',
    7: 'Kronenchakra – Spiritualität, Einheit, Vertrauen.',
  };

  // Chakra analysis text for each chakra (expanded, with Challenges and Kompetenzen)
  const chakraAnalysisText = {
    1: `Beziehungen: In deinen Beziehungen sind dir Sicherheit, Stabilität und Beständigkeit besonders wichtig. Du strebst nach einem Umfeld, das dir Geborgenheit und Vertrauen schenkt. Wenn das Wurzelchakra ausgeglichen ist, kannst du anderen Halt geben und bist ein verlässlicher Partner.
Karriere: Beruflich brauchst du klare Strukturen und ein solides Fundament, um dich wohlzufühlen. Du bist ausdauernd, praktisch veranlagt und bringst Projekte zuverlässig zum Abschluss. Veränderungen können dich verunsichern, daher bevorzugst du eine sichere Arbeitsumgebung.
Gesundheit: Erdung und körperliches Wohlbefinden stehen für dich im Vordergrund. Du spürst schnell, wenn dir Stabilität fehlt, und reagierst sensibel auf Stress. Ein gesunder Lebensstil und regelmäßige Routinen sind für dein Wohlbefinden essenziell.
Persönliches Wachstum: Du legst Wert auf die Erfüllung deiner Grundbedürfnisse und Selbstschutz. Wachstum beginnt für dich mit einem starken Fundament und dem Gefühl, sicher verwurzelt zu sein.
Herausforderungen: Angst vor Veränderungen, Unsicherheit in instabilen Situationen, Tendenz zu Sorgen um Existenz und Sicherheit.
Kompetenzen: Bodenständigkeit, Durchhaltevermögen, Verantwortungsbewusstsein, Verlässlichkeit, praktische Umsetzungskraft.`,

    2: `Beziehungen: Emotionale Offenheit, Nähe und Intimität sind dir sehr wichtig. Du genießt es, dich in Beziehungen auszutauschen und Gefühle zu teilen. Ein harmonisches Sakralchakra ermöglicht es dir, Leidenschaft und Lebensfreude mit anderen zu erleben.
Karriere: Kreativität und Freude treiben dich an, neue Wege zu gehen. Du bist offen für Inspiration und bringst Schwung ins Team. In kreativen Berufen oder Rollen, in denen Flexibilität gefragt ist, blühst du besonders auf.
Gesundheit: Dein emotionales Wohlbefinden steht in engem Zusammenhang mit deiner körperlichen Gesundheit. Du profitierst davon, Genuss und Sinnlichkeit bewusst zu erleben und dir regelmäßig kleine Freuden zu gönnen.
Persönliches Wachstum: Du bist bestrebt, deine Leidenschaften zu entdecken und neue Ausdrucksmöglichkeiten zu erforschen. Persönliche Entwicklung bedeutet für dich, Gefühle zuzulassen und dich kreativ zu entfalten.
Herausforderungen: Schwierigkeiten mit emotionaler Abgrenzung, Angst vor Nähe oder Ablehnung, Tendenz zu Stimmungsschwankungen.
Kompetenzen: Kreativität, Offenheit, Lebensfreude, Sinnlichkeit, emotionale Intelligenz, Anpassungsfähigkeit.`,

    3: `Beziehungen: Du trittst in Beziehungen selbstbewusst auf und setzt klare Grenzen. Du weißt, was du willst, und stehst für deine Bedürfnisse ein. Ein starkes Solarplexuschakra ermöglicht es dir, dich authentisch zu zeigen und Verantwortung zu übernehmen.
Karriere: Zielstrebigkeit, Willenskraft und Durchsetzungsvermögen zeichnen dich aus. Du gehst Herausforderungen mit Mut an und übernimmst gerne die Führung, wenn es darauf ankommt. Dein Ehrgeiz hilft dir, berufliche Ziele konsequent zu verfolgen.
Gesundheit: Energie und Vitalität sind deine Stärken. Du spürst schnell, wenn dein Energiehaushalt aus dem Gleichgewicht gerät, und weißt, wie wichtig Selbstfürsorge ist. Körperliche Aktivität gibt dir Kraft und Selbstvertrauen.
Persönliches Wachstum: Du entwickelst stetig dein Selbstbewusstsein und deine innere Stärke weiter. Wachstum bedeutet für dich, deine Macht anzuerkennen und gezielt einzusetzen.
Herausforderungen: Übermäßiger Ehrgeiz, Kontrollbedürfnis, Schwierigkeiten mit Autoritäten, Angst vor Versagen.
Kompetenzen: Durchsetzungsvermögen, Selbstdisziplin, Zielorientierung, innere Stärke, Verantwortungsbereitschaft, Motivation.`,

    4: `Beziehungen: Liebe, Mitgefühl und Harmonie prägen deine Beziehungen. Du bist einfühlsam, kannst dich gut in andere hineinversetzen und bist bereit zu vergeben. Ein ausgeglichenes Herzchakra ermöglicht tiefe Verbundenheit und authentische Nähe.
Karriere: Du arbeitest gerne im Team und förderst eine wertschätzende, unterstützende Atmosphäre. Zusammenarbeit und gegenseitige Hilfe sind dir wichtiger als Konkurrenzdenken. Du bringst Menschen zusammen und sorgst für ein gutes Betriebsklima.
Gesundheit: Emotionale Balance stärkt dein Herz und dein allgemeines Wohlbefinden. Du spürst, wie sich Stress oder zwischenmenschliche Konflikte auf dein Herz auswirken können, und suchst aktiv nach Ausgleich und Harmonie.
Persönliches Wachstum: Du bist offen für Heilung und Vergebung, sowohl dir selbst als auch anderen gegenüber. Persönliches Wachstum bedeutet für dich, dein Herz zu öffnen und alte Verletzungen zu transformieren.
Herausforderungen: Übermäßige Selbstaufopferung, Schwierigkeiten beim Setzen von Grenzen, Angst vor Zurückweisung.
Kompetenzen: Empathie, Mitgefühl, Teamfähigkeit, Herzlichkeit, Vergebungsbereitschaft, Harmoniebedürfnis.`,

    5: `Beziehungen: Ehrliche, offene und klare Kommunikation ist dir besonders wichtig. Du kannst deine Gefühle und Gedanken gut ausdrücken und bist ein aufmerksamer Zuhörer. Ein harmonisches Halschakra fördert Vertrauen und Verständnis in Beziehungen.
Karriere: Du überzeugst durch deine Ausdrucksstärke und kannst komplexe Themen verständlich vermitteln. Präsentationen, Schreiben oder das Führen von Gesprächen liegen dir. In Berufen mit viel Kommunikation findest du Erfüllung.
Gesundheit: Du achtest auf deine Stimme, deinen Hals und deinen Ausdruck. Spannungen im Nacken- oder Kieferbereich können dir zeigen, wenn du dich nicht frei ausdrücken kannst.
Persönliches Wachstum: Du entwickelst deine Fähigkeit zur authentischen Selbstdarstellung und findest immer mehr zu deiner eigenen Wahrheit. Wachstum bedeutet für dich, dich ehrlich zu zeigen und für deine Überzeugungen einzustehen.
Herausforderungen: Angst vor Ablehnung, Zurückhaltung beim Ausdrücken eigener Bedürfnisse, Schwierigkeiten mit Kritik.
Kompetenzen: Kommunikationsfähigkeit, Ausdrucksstärke, Überzeugungskraft, Authentizität, Zuhören, Kreativität im sprachlichen Bereich.`,

    6: `Beziehungen: Deine ausgeprägte Intuition hilft dir, andere Menschen tief zu verstehen. Du nimmst Stimmungen und unausgesprochene Signale wahr und kannst dich gut in andere hineinversetzen. Du vertraust deiner inneren Stimme im Umgang mit anderen.
Karriere: Du hast eine klare Vision für dein Leben und folgst deiner inneren Führung. Strategisches Denken und Vorstellungskraft helfen dir, innovative Lösungen zu finden. Berufe, die Kreativität und Weitblick erfordern, liegen dir besonders.
Gesundheit: Geistige Klarheit und ein wacher Geist unterstützen dein Wohlbefinden. Meditation, Achtsamkeit und Visualisierungsübungen helfen dir, im Gleichgewicht zu bleiben.
Persönliches Wachstum: Du förderst deine Intuition und innere Weisheit, indem du auf deine Träume und Eingebungen achtest. Wachstum bedeutet für dich, immer mehr auf deine innere Führung zu vertrauen.
Herausforderungen: Zweifel an der eigenen Wahrnehmung, Überforderung durch zu viele Eindrücke, Schwierigkeiten, Visionen praktisch umzusetzen.
Kompetenzen: Intuition, Vorstellungskraft, Weitblick, Kreativität, analytisches Denken, Offenheit für neue Perspektiven.`,

    7: `Beziehungen: Du fühlst dich auf einer tiefen Ebene mit allem und jedem verbunden. Spirituelle Werte und ein Gefühl von Einheit prägen deine Beziehungen. Du bist offen für die Vielfalt des Lebens und begegnest anderen mit Toleranz.
Karriere: Spiritualität, Sinnhaftigkeit und das Streben nach einem höheren Ziel leiten deine Entscheidungen. Du suchst nach einer Tätigkeit, die deinem Leben Bedeutung gibt und dich erfüllt. Du inspirierst andere durch deine Weisheit und Gelassenheit.
Gesundheit: Geistiges Gleichgewicht und innere Ruhe stärken deine Gesundheit. Rückzug, Meditation und der Kontakt zu einer höheren Kraft sind für dich wichtige Ressourcen.
Persönliches Wachstum: Du strebst nach Einheit, Vertrauen und einem höheren Bewusstsein. Persönliches Wachstum bedeutet für dich, dich immer mehr mit dem großen Ganzen zu verbinden und dich dem Fluss des Lebens hinzugeben.
Herausforderungen: Gefühl der Entfremdung, Realitätsflucht, Schwierigkeiten, spirituelle Erfahrungen in den Alltag zu integrieren.
Kompetenzen: Spiritualität, Weisheit, Vertrauen, Inspiration, Sinn für das Große Ganze, Gelassenheit, Offenheit für Transzendenz.`,
  };

  let shuffledQuestions = [],
    currentIndex = 0,
    chakraScores = {},
    chartInstance = null;

  function startQuiz() {
    // Always use questions in the current language
    questions = translations[currentLanguage];
    shuffledQuestions = questions;
    currentIndex = 0;
    chakraScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    quizDiv.style.display = 'block';
    resultDiv.style.display = 'none';
    chakraAnalysisDiv.innerHTML = ''; // clear previous analysis
    updateQuizHeadlineAndDesc();
    showQuestion();
  }

  function showQuestion() {
    const q = shuffledQuestions[currentIndex];
    questionDiv.innerText = q.question;
    // Progress text language
    progressText.innerText =
      currentLanguage === 'de'
        ? `Frage ${currentIndex + 1} von ${shuffledQuestions.length}`
        : `Question ${currentIndex + 1} of ${shuffledQuestions.length}`;
    progressBarDiv.style.width = `${((currentIndex + 1) / shuffledQuestions.length) * 100}%`;
    renderAnswerButtons();
  }

  function answer(value) {
    // Map answer index 0..6 -> chakra 1..7
    const chakraNum = value + 1;
    chakraScores[chakraNum] = (chakraScores[chakraNum] || 0) + 1;
    currentIndex++;
    if (currentIndex < shuffledQuestions.length) showQuestion();
    else showResults();
  }

  function showResults() {
    quizDiv.style.display = 'none';
    resultDiv.style.display = 'flex';

    // Letter-based counts (A-G) for chart and mapping
    // Map chakraScores (1-7) to letters a-g
    const letterCounts = {};
    for (let i = 1; i <= 7; ++i) {
      const letter = String.fromCharCode(96 + i); // 97='a'
      letterCounts[letter] = chakraScores[i] || 0;
    }

    // Chakra letter to full name mapping for chart and result
    const chakraMap = {
      a: "Wurzelchakra (Builder)",
      b: "Sakralchakra (Artist)",
      c: "Solarplexus (Achiever)",
      d: "Herzchakra (Caretaker)",
      e: "Halschakra (Speaker)",
      f: "Stirnchakra (Thinker)",
      g: "Kronenchakra (Yogi)"
    };

    // Helper to get top 3 letter chakras
    function getTopThreeChakras(answerCounts) {
      const countsArray = Object.keys(answerCounts).map(letter => ({
        letter,
        count: answerCounts[letter] || 0,
        chakra: chakraMap[letter]
      }));
      countsArray.sort((a, b) => b.count - a.count);
      return countsArray.slice(0, 3);
    }

    // Get top three chakras (letters)
    const topThree = getTopThreeChakras(letterCounts);
    const top = topThree[0];
    const second = topThree[1];

    // Chakra minimalistic card styles and color gradients (soft pastel)
    const chakraGradients = {
      1: 'linear-gradient(120deg, #fee2e2 0%, #fca5a5 100%)',
      2: 'linear-gradient(120deg, #fef3c7 0%, #fdba74 100%)',
      3: 'linear-gradient(120deg, #fef9c3 0%, #fde68a 100%)',
      4: 'linear-gradient(120deg, #d1fae5 0%, #6ee7b7 100%)',
      5: 'linear-gradient(120deg, #dbeafe 0%, #93c5fd 100%)',
      6: 'linear-gradient(120deg, #ede9fe 0%, #c4b5fd 100%)',
      7: 'linear-gradient(120deg, #f3e8ff 0%, #e9d5ff 100%)',
    };

    function chakraCard({ chakraId, label }) {
      const name = chakraDescriptions[chakraId].split(' – ')[0];
      const desc = chakraDescriptions[chakraId].split(' – ')[1];
      return `
        <div style="
          background: ${chakraGradients[chakraId]};
          border-radius: 14px;
          padding: 20px 18px 14px 18px;
          box-shadow: 0 2px 10px 0 rgba(44,62,80,0.06);
          margin: 0 10px 0 0;
          color: #374151;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 160px;
          max-width: 300px;
          flex: 1;
          position: relative;
          border: 1.5px solid #e5e7eb;
        ">
          <div style="font-size: 0.92rem; font-weight: 600; letter-spacing: 0.04em; opacity: 0.86; margin-bottom: 10px; background: #fff6; color: #6366f1; padding: 3px 12px; border-radius: 8px; box-shadow: none;">${label}</div>
          <div style="font-size: 1.18rem; font-weight: 700; letter-spacing: 0.01em; line-height: 1.15; margin-bottom: 6px;">
            ${name}
          </div>
          <div style="font-size: 1rem; font-weight: 400; line-height: 1.4; margin-bottom: 0;">
            ${desc}
          </div>
        </div>
      `;
    }

    // Show top chakra cards (main + second) using mapping (convert letter to chakraId)
    chakraSummaryDiv.innerHTML = `
      <div style="display: flex; gap: 28px; justify-content: center; align-items: stretch; margin: 30px 0 18px 0;">
        ${chakraCard({ chakraId: top.letter.charCodeAt(0) - 96, label: 'Zentral' })}
        ${chakraCard({ chakraId: second.letter.charCodeAt(0) - 96, label: 'Sekundär' })}
      </div>
    `;
    chakraSummaryDiv.style.marginBottom = "10px";
    chakraSummaryDiv.style.marginTop = "0";
    chakraSummaryDiv.style.width = "100%";

    // Chart: labels and data based on letterCounts and chakraMap
    const chartCanvas = canvas;
    if (chartInstance) chartInstance.destroy();
    const chartLabels = ["a","b","c","d","e","f","g"].map(l => chakraMap[l]);
    const chartData = ["a","b","c","d","e","f","g"].map(l => letterCounts[l] || 0);
    const chartColors = [
      "#e11d48", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#9333ea"
    ];
    chartInstance = new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'Anzahl Antworten pro Chakra-Typ',
          data: chartData,
          backgroundColor: chartColors
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Chakra-Typ Verteilung' }
        }
      }
    });

    // "Dein Ergebnis" section: show main type and top 3
    const mainChakraName = chakraMap[top.letter];
    // Top three list
    let topThreeHtml = `
      <div style="margin-top:18px;text-align:left;">
        <div style="font-weight:600;margin-bottom:4px;">Top 3 Chakra-Typen:</div>
        <ol style="margin:0;padding-left:18px;">
          ${topThree.map(t =>
            `<li>
              <strong>${t.letter.toUpperCase()}</strong>: ${chakraMap[t.letter]} &ndash; <span style="color:#6366f1;font-weight:500;">${t.count}</span>
            </li>`
          ).join('')}
        </ol>
      </div>
    `;
    // Insert main result and top three list above chart
    chakraSummaryDiv.innerHTML += `
      <div style="width:100%;max-width:600px;margin:0 auto 0 auto;text-align:left;">
        <div style="margin-top:10px;font-size:1.1rem;">
          <span style="font-weight:600;color:#6366f1;">Dein Haupt-Chakra-Typ:</span>
          <span style="font-weight:700;">${mainChakraName}</span>
        </div>
        ${topThreeHtml}
      </div>
    `;

    // Helper to render chakra analysis as collapsible cards per life area (unchanged)
    function renderChakraAnalysisCollapsible(chakraId, chakraColor) {
      const analysis = chakraAnalysisText[chakraId];
      if (!analysis) return '';
      const lines = analysis.split('\n').filter(Boolean);
      return `
        <div class="chakra-collapsible-group">
          ${lines
            .map((line, idx) => {
              const areaIdx = idx + 1;
              const uniqueId = `chakra${chakraId}-area${areaIdx}`;
              const splitIdx = line.indexOf(':');
              let area = '', text = '';
              if (splitIdx !== -1) {
                area = line.slice(0, splitIdx).trim();
                text = line.slice(splitIdx + 1).trim();
              } else {
                text = line.trim();
              }
              return `
                <div class="chakra-collapsible-area" style="margin-bottom: 14px;">
                  <button
                    class="chakra-collapsible-header"
                    style="--chakra-color: ${chakraColor};"
                    aria-expanded="false"
                    aria-controls="${uniqueId}-content"
                    type="button"
                  >
                    <span class="chakra-collapsible-arrow" aria-hidden="true">&#9654;</span>
                    <span>${area ? area : ''}</span>
                  </button>
                  <div
                    id="${uniqueId}-content"
                    class="chakra-collapsible-content"
                    style="max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1); background: #f3f4f6; border-radius: 0 0 14px 14px; box-shadow: 0 4px 16px rgba(44,62,80,0.08); padding: 0 18px;"
                  >
                    <div style="color: #374151; font-size: 1rem; padding: 12px 0;">
                      ${text}
                    </div>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      `;
    }

    // Add minimalistic collapsible area styles (only once)
    if (!document.getElementById('chakra-collapsible-style')) {
      const collapsibleStyle = document.createElement('style');
      collapsibleStyle.id = 'chakra-collapsible-style';
      collapsibleStyle.textContent = `
        .chakra-collapsible-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
          background: #f9fafb;
          border: none;
          border-left: 4px solid var(--chakra-color, #6366f1);
          border-radius: 8px 8px 0 0;
          font-weight: 500;
          font-size: 1rem;
          color: #374151;
          cursor: pointer;
          padding: 10px 12px 10px 10px;
          box-shadow: none;
          transition: background 0.18s, color 0.18s;
          outline: none;
          position: relative;
        }
        .chakra-collapsible-header[aria-expanded="true"] {
          background: #f1f5f9;
          color: var(--chakra-color, #6366f1);
        }
        .chakra-collapsible-arrow {
          display: inline-block;
          font-size: 1em;
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
          color: var(--chakra-color, #6366f1);
        }
        .chakra-collapsible-header[aria-expanded="true"] .chakra-collapsible-arrow {
          transform: rotate(90deg);
        }
        .chakra-collapsible-content {
          will-change: max-height;
        }
        @media (max-width: 700px) {
          .chakra-collapsible-header {
            font-size: 0.94rem;
            padding: 7px 8px 7px 6px;
            border-radius: 7px 7px 0 0;
          }
          .chakra-collapsible-content {
            border-radius: 0 0 7px 7px;
            padding: 0 4px;
          }
        }
      `;
      document.head.appendChild(collapsibleStyle);
    }

    // Show chakra analysis for top two (main and secondary)
    chakraAnalysisDiv.innerHTML = `
      <h3 style="color:#4f46e5; margin-bottom: 12px;">
        Analyse deines zentralen Chakras (${chakraDescriptions[top.letter.charCodeAt(0) - 96].split(' – ')[0]}):
      </h3>
      ${renderChakraAnalysisCollapsible(top.letter.charCodeAt(0) - 96, chartColors[top.letter.charCodeAt(0) - 97])}
      <h3 style="color:#4f46e5; margin-top: 24px; margin-bottom: 12px;">
        Analyse deines sekundären Chakras (${chakraDescriptions[second.letter.charCodeAt(0) - 96].split(' – ')[0]}):
      </h3>
      ${renderChakraAnalysisCollapsible(second.letter.charCodeAt(0) - 96, chartColors[second.letter.charCodeAt(0) - 97])}
    `;

    // Add collapsible toggle JS for all headers in chakraAnalysisDiv
    Array.from(chakraAnalysisDiv.querySelectorAll('.chakra-collapsible-header')).forEach(header => {
      header.addEventListener('click', function () {
        const expanded = header.getAttribute('aria-expanded') === 'true';
        const content = header.parentElement.querySelector('.chakra-collapsible-content');
        if (!content) return;
        if (expanded) {
          content.style.maxHeight = '0';
          header.setAttribute('aria-expanded', 'false');
        } else {
          content.style.maxHeight = content.scrollHeight + 'px';
          header.setAttribute('aria-expanded', 'true');
        }
      });
    });
    window.addEventListener('resize', function () {
      Array.from(chakraAnalysisDiv.querySelectorAll('.chakra-collapsible-header[aria-expanded="true"]')).forEach(header => {
        const content = header.parentElement.querySelector('.chakra-collapsible-content');
        if (content) {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });
  }

  // PDF download functionality (improved layout and visual design)
  function downloadPDF() {
    const doc = new jsPDF({
      unit: "mm",
      format: "a4",
    });

    // Chakra color palette for bars
    const chakraColorBars = {
      1: "#e11d48",
      2: "#f97316",
      3: "#eab308",
      4: "#22c55e",
      5: "#3b82f6",
      6: "#8b5cf6",
      7: "#9333ea",
    };

    // Subtle background color for life area sections
    const areaBgColor = "#f3f4f6";
    const areaTextColor = "#22223b";
    const areaBoxRadius = 2.5;
    const areaPadX = 3;
    const areaPadY = 2;

    // Font sizes
    const titleFont = 18;
    const secTitleFont = 14;
    const chakraTitleFont = 13;
    const areaFont = 11;
    const areaDescFont = 10;
    const scoreFont = 11;
    const smallFont = 9;

    let y = 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(titleFont);
    doc.text("Chakra Quiz Ergebnis", 14, y);
    y += 8;

    // Chakra summary section
    const entries = Object.entries(chakraScores).sort((a, b) => b[1] - a[1]);
    const [top, second] = entries;

    // Draw central and secondary chakra cards with colored bars
    function drawChakraCard(chakraId, label, yStart) {
      const cardW = 180;
      const cardH = 20;
      const barW = 4;
      const x = 14;
      // Card background
      doc.setDrawColor(230, 230, 230);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, yStart, cardW, cardH, 3, 3, "F");
      // Color bar
      doc.setFillColor(chakraColorBars[chakraId]);
      doc.roundedRect(x, yStart, barW, cardH, areaBoxRadius, areaBoxRadius, "F");
      // Chakra label
      doc.setFontSize(secTitleFont);
      doc.setFont("helvetica", "bold");
      doc.text(label, x + barW + 4, yStart + 7);
      // Chakra title
      doc.setFontSize(chakraTitleFont);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(chakraColorBars[chakraId]);
      doc.text(chakraDescriptions[chakraId].split(" – ")[0], x + barW + 32, yStart + 7);
      // Chakra description
      doc.setFont("helvetica", "normal");
      doc.setFontSize(smallFont);
      doc.setTextColor(60, 60, 60);
      doc.text(
        chakraDescriptions[chakraId].split(" – ")[1],
        x + barW + 32,
        yStart + 13
      );
      doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(secTitleFont);
    doc.setFont("helvetica", "bold");
    doc.text("Zentrale und Sekundäre Chakra-Analyse:", 14, y);
    y += 4;
    drawChakraCard(top[0], "Zentral", y);
    y += 22;
    drawChakraCard(second[0], "Sekundär", y);
    y += 26;

    // Draw analysis for each chakra (central and secondary)
    function drawChakraAnalysis(chakraId, label) {
      // Section heading
      doc.setFontSize(secTitleFont);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(chakraColorBars[chakraId]);
      doc.text(`${label}: ${chakraDescriptions[chakraId].split(" – ")[0]}`, 14, y);
      doc.setTextColor(0, 0, 0);
      y += 6;
      // Draw each life area as a box with background color
      const lines = chakraAnalysisText[chakraId].split("\n").filter(Boolean);
      for (const line of lines) {
        const idx = line.indexOf(":");
        let area = "",
          text = "";
        if (idx !== -1) {
          area = line.slice(0, idx).trim();
          text = line.slice(idx + 1).trim();
        } else {
          text = line.trim();
        }
        // Box calculation
        let areaBoxX = 16;
        let areaBoxW = 178;
        let areaBoxY = y;
        // Calculate height for wrapped text
        doc.setFontSize(areaDescFont);
        let descLines = doc.splitTextToSize(text, areaBoxW - 2 * areaPadX);
        let boxH = areaPadY * 2 + 4 + descLines.length * 5;
        if (y + boxH > 285) {
          doc.addPage();
          y = 20;
          areaBoxY = y;
        }
        // Draw background box
        doc.setDrawColor(230, 230, 230);
        doc.setFillColor(areaBgColor);
        doc.roundedRect(areaBoxX, areaBoxY, areaBoxW, boxH, areaBoxRadius, areaBoxRadius, "F");
        // Area heading
        if (area) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(areaFont);
          doc.setTextColor(chakraColorBars[chakraId]);
          doc.text(area, areaBoxX + areaPadX, areaBoxY + areaPadY + 4);
        }
        // Area description
        doc.setFont("helvetica", "normal");
        doc.setFontSize(areaDescFont);
        doc.setTextColor(areaTextColor);
        doc.text(
          descLines,
          areaBoxX + areaPadX,
          areaBoxY + areaPadY + 9
        );
        doc.setTextColor(0, 0, 0);
        y += boxH + 2;
      }
      y += 5;
    }

    // Draw central chakra analysis
    drawChakraAnalysis(top[0], "Analyse zentrales Chakra");
    // Draw secondary chakra analysis
    drawChakraAnalysis(second[0], "Analyse sekundäres Chakra");

    // All Chakra Scores section
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(secTitleFont);
    doc.setFont("helvetica", "bold");
    doc.text("Alle Chakra Scores:", 14, y);
    y += 6;
    doc.setFontSize(scoreFont);
    doc.setFont("helvetica", "normal");
    for (const [chakra, score] of entries) {
      const label = chakraDescriptions[chakra].split(" – ")[0];
      // Add a color bar for each chakra
      let barX = 18, barY = y - 4, barH = 6, barW = 4;
      doc.setFillColor(chakraColorBars[chakra]);
      doc.roundedRect(barX, barY, barW, barH, 1, 1, "F");
      doc.setTextColor(chakraColorBars[chakra]);
      doc.setFont("helvetica", "bold");
      doc.text(label, barX + barW + 4, y);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      doc.text(`Score: ${score}`, barX + barW + 40, y);
      doc.setTextColor(0, 0, 0);
      y += 8;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }

    doc.save("chakra_quiz_ergebnis.pdf");
  }

  // Add language selector for result page
  const langSelectResult = document.createElement('select');
  langSelectResult.id = 'langSelectResult';
  langSelectResult.className = 'restart-btn';
  langSelectResult.style.marginLeft = '8px';
  langSelectResult.style.maxWidth = '140px';
  langSelectResult.innerHTML = `
    <option value="en">EN</option>
    <option value="de">DE</option>
  `;
  langSelectResult.value = currentLanguage;
  langSelectResult.addEventListener('change', () => {
    currentLanguage = langSelectResult.value;
    questions = translations[currentLanguage];
    updateQuizHeadlineAndDesc();
    startQuiz();
    const ts = document.getElementById('langSelectTop');
    if (ts) ts.value = currentLanguage;
  });
  resultDiv.insertBefore(langSelectResult, restartBtn);

  restartBtn.addEventListener('click', startQuiz);
  downloadPdfBtn.addEventListener('click', downloadPDF);

  // Set both language selectors to correct value on load
  function updateLanguageToggleButtons() {
    const ts = document.getElementById('langSelectTop');
    const rs = document.getElementById('langSelectResult');
    if (ts) ts.value = currentLanguage;
    if (rs) rs.value = currentLanguage;
  }
  // Set headline/desc and language toggles on load
  updateQuizHeadlineAndDesc();
  updateLanguageToggleButtons();
  startQuiz();
}