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
  quizHeadline.textContent = 'Chakra Persönlichkeitstest';
  quizHeadline.className = 'chakra-quiz-headline';
  const quizDesc = document.createElement('p');
  quizDesc.textContent = 'Finde heraus, welche Chakras in deinem Leben besonders stark oder schwach ausgeprägt sind und erhalte eine persönliche Analyse.';
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
    q.answers.forEach((answerText, idx) => {
      const btn = document.createElement('button');
      btn.id = `btn${idx}`;
      btn.textContent = answerText;
      // The answerText is e.g. "a) ...", so extract the letter for mapping
      // But since all questions have answers a-g in order, idx maps directly to chakra 1-7
      btn.addEventListener('click', () => answer(idx));
      answersDiv.appendChild(btn);
    });
  }

  // Add headline and desc above progress bar
  quizDiv.appendChild(quizHeadline);
  quizDiv.appendChild(quizDesc);
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

  // Chakra Quiz Fragen (25, 7 Antwortoptionen a-g, Mapping: a=1, b=2, c=3, d=4, e=5, f=6, g=7)
  const questions = [
    {
      q: "Wie reagierst du, wenn du mit einer neuen Herausforderung konfrontiert wirst?",
      answers: [
        "a) Ich suche nach Sicherheit und Stabilität.",   // 1
        "b) Ich lasse mich auf neue Erfahrungen ein und genieße sie.", // 2
        "c) Ich nehme die Herausforderung als Möglichkeit, mich zu beweisen.", // 3
        "d) Ich frage andere um Rat und Unterstützung.", // 4
        "e) Ich spreche offen über meine Gedanken dazu.", // 5
        "f) Ich analysiere die Situation intuitiv.", // 6
        "g) Ich vertraue, dass alles einen höheren Sinn hat.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Was ist dir im Alltag am wichtigsten?",
      answers: [
        "a) Ein geregelter Tagesablauf.", // 1
        "b) Genuss und Lebensfreude.", // 2
        "c) Erfolge und Anerkennung.", // 3
        "d) Harmonie in Beziehungen.", // 4
        "e) Ehrliche Kommunikation.", // 5
        "f) Neue Erkenntnisse und Einsichten.", // 6
        "g) Spirituelle Entwicklung.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Wie gehst du mit Konflikten um?",
      answers: [
        "a) Ich ziehe mich zurück und suche Sicherheit.", // 1
        "b) Ich versuche, die Situation kreativ zu lösen.", // 2
        "c) Ich setze mich durch und stehe zu meiner Meinung.", // 3
        "d) Ich versuche, Verständnis für alle Seiten zu zeigen.", // 4
        "e) Ich spreche sofort offen darüber.", // 5
        "f) Ich beobachte und analysiere die Hintergründe.", // 6
        "g) Ich lasse los und vertraue auf das Universum.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Was gibt dir am meisten Energie?",
      answers: [
        "a) Natur und Erdung.", // 1
        "b) Sinnliche Erfahrungen.", // 2
        "c) Herausforderungen und Ziele.", // 3
        "d) Liebe und Nähe.", // 4
        "e) Inspirierende Gespräche.", // 5
        "f) Zeit für Reflexion und Intuition.", // 6
        "g) Meditation und Spiritualität.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Wie würdest du dich selbst am ehesten beschreiben?",
      answers: [
        "a) Bodenständig und praktisch.", // 1
        "b) Lebenslustig und kreativ.", // 2
        "c) Ehrgeizig und zielorientiert.", // 3
        "d) Empathisch und herzlich.", // 4
        "e) Ausdrucksstark und kommunikativ.", // 5
        "f) Intuitiv und nachdenklich.", // 6
        "g) Spirituell und offen.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Was ist für dich in Beziehungen besonders wichtig?",
      answers: [
        "a) Verlässlichkeit und Sicherheit.", // 1
        "b) Leidenschaft und gemeinsamer Spaß.", // 2
        "c) Gemeinsame Ziele und Entwicklung.", // 3
        "d) Tiefe Gefühle und Verbundenheit.", // 4
        "e) Ehrliches Mitteilen.", // 5
        "f) Gemeinsames Wachstum und Erkenntnisse.", // 6
        "g) Spirituelle Verbindung.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Wie gehst du mit Veränderungen um?",
      answers: [
        "a) Ich brauche Zeit, um mich daran zu gewöhnen.", // 1
        "b) Ich begrüße sie als Chance für neue Erfahrungen.", // 2
        "c) Ich nutze sie, um mich weiterzuentwickeln.", // 3
        "d) Ich suche Unterstützung bei anderen.", // 4
        "e) Ich spreche offen über meine Gefühle dazu.", // 5
        "f) Ich reflektiere die tiefere Bedeutung.", // 6
        "g) Ich vertraue auf den größeren Plan.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Was motiviert dich im Leben?",
      answers: [
        "a) Sicherheit und Stabilität.", // 1
        "b) Genuss und Kreativität.", // 2
        "c) Erfolg und Anerkennung.", // 3
        "d) Liebe und Verbundenheit.", // 4
        "e) Ideen und Austausch.", // 5
        "f) Erkenntnisse und Intuition.", // 6
        "g) Sinn und Spiritualität.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Wie gehst du mit Stress um?",
      answers: [
        "a) Ich ziehe mich an einen ruhigen, sicheren Ort zurück.", // 1
        "b) Ich suche Ablenkung und Spaß.", // 2
        "c) Ich fokussiere mich auf meine Ziele.", // 3
        "d) Ich spreche mit vertrauten Menschen darüber.", // 4
        "e) Ich kommuniziere meine Bedürfnisse klar.", // 5
        "f) Ich reflektiere und suche nach Lösungen.", // 6
        "g) Ich meditiere oder bete.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Was bedeutet Erfolg für dich?",
      answers: [
        "a) Ein sicheres und stabiles Leben.", // 1
        "b) Genuss und Lebensfreude auskosten.", // 2
        "c) Ziele erreichen und Anerkennung bekommen.", // 3
        "d) Liebevolle Beziehungen führen.", // 4
        "e) Mich ausdrücken und verstanden werden.", // 5
        "f) Erkenntnisse gewinnen und wachsen.", // 6
        "g) Inneren Frieden und Sinn finden.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Worauf achtest du besonders bei der Arbeit?",
      answers: [
        "a) Struktur und Zuverlässigkeit.", // 1
        "b) Kreative Entfaltungsmöglichkeiten.", // 2
        "c) Herausforderungen und Aufstiegschancen.", // 3
        "d) Gutes Miteinander im Team.", // 4
        "e) Klare Kommunikation.", // 5
        "f) Raum für neue Ideen.", // 6
        "g) Sinnhaftigkeit der Tätigkeit.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Wie verbringst du am liebsten deine Freizeit?",
      answers: [
        "a) In der Natur oder mit Familie.", // 1
        "b) Mit kreativen Aktivitäten.", // 2
        "c) Beim Sport oder Herausforderungen.", // 3
        "d) Mit Freunden und lieben Menschen.", // 4
        "e) Beim Lesen oder Diskutieren.", // 5
        "f) Mit Meditation oder Reflexion.", // 6
        "g) Mit spirituellen Praktiken.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Was gibt dir Halt in schwierigen Zeiten?",
      answers: [
        "a) Familie und vertraute Menschen.", // 1
        "b) Genuss und kleine Freuden.", // 2
        "c) Mein Wille und meine Ziele.", // 3
        "d) Liebe und Mitgefühl.", // 4
        "e) Austausch mit anderen.", // 5
        "f) Innere Einsicht und Intuition.", // 6
        "g) Glaube und Spiritualität.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Was ist deine größte Stärke?",
      answers: [
        "a) Durchhaltevermögen und Verlässlichkeit.", // 1
        "b) Kreativität und Lebensfreude.", // 2
        "c) Zielstrebigkeit und Disziplin.", // 3
        "d) Empathie und Hilfsbereitschaft.", // 4
        "e) Kommunikationsfähigkeit.", // 5
        "f) Intuition und Weitblick.", // 6
        "g) Spiritualität und Vertrauen.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Wie gehst du mit Fehlern um?",
      answers: [
        "a) Ich versuche, daraus zu lernen und wieder Sicherheit zu gewinnen.", // 1
        "b) Ich nehme sie mit Humor.", // 2
        "c) Ich analysiere, wie ich es besser machen kann.", // 3
        "d) Ich spreche offen über meine Gefühle.", // 4
        "e) Ich suche Feedback von anderen.", // 5
        "f) Ich reflektiere sie auf einer tieferen Ebene.", // 6
        "g) Ich nehme sie als Teil meines Weges an.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Worauf bist du am meisten stolz?",
      answers: [
        "a) Mein stabiles Umfeld.", // 1
        "b) Meine Kreativität.", // 2
        "c) Meine Erfolge.", // 3
        "d) Meine Beziehungen.", // 4
        "e) Meine Kommunikationsfähigkeit.", // 5
        "f) Meine Intuition.", // 6
        "g) Mein spirituelles Wachstum.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Was ist dir bei Entscheidungen am wichtigsten?",
      answers: [
        "a) Sicherheit und Verlässlichkeit.", // 1
        "b) Bauchgefühl und Freude.", // 2
        "c) Zielorientierung.", // 3
        "d) Harmonie mit anderen.", // 4
        "e) Austausch und Diskussion.", // 5
        "f) Intuition und Einsicht.", // 6
        "g) Spirituelle Führung.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Was inspiriert dich am meisten?",
      answers: [
        "a) Natur und Beständigkeit.", // 1
        "b) Kreative Menschen.", // 2
        "c) Erfolgreiche Persönlichkeiten.", // 3
        "d) Liebevolle Beziehungen.", // 4
        "e) Inspirierende Gespräche.", // 5
        "f) Neue Erkenntnisse.", // 6
        "g) Spirituelle Lehrer.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Wie gehst du mit Unsicherheiten um?",
      answers: [
        "a) Ich suche Stabilität.", // 1
        "b) Ich lenke mich mit schönen Dingen ab.", // 2
        "c) Ich übernehme die Kontrolle.", // 3
        "d) Ich rede mit vertrauten Menschen.", // 4
        "e) Ich spreche offen über meine Sorgen.", // 5
        "f) Ich reflektiere und suche nach dem Sinn.", // 6
        "g) Ich vertraue auf das Leben.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Was ist für dich das größte Lebensziel?",
      answers: [
        "a) Ein sicheres Zuhause.", // 1
        "b) Genuss und Lebensfreude.", // 2
        "c) Erfolg und Selbstverwirklichung.", // 3
        "d) Liebe und Verbundenheit.", // 4
        "e) Sich ausdrücken und verstanden werden.", // 5
        "f) Erkenntnis und Weisheit.", // 6
        "g) Spirituelle Erfüllung.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Wie reagierst du, wenn dich jemand kritisiert?",
      answers: [
        "a) Ich ziehe mich zurück.", // 1
        "b) Ich versuche, es mit Humor zu nehmen.", // 2
        "c) Ich verteidige meine Position.", // 3
        "d) Ich versuche, die Gefühle des anderen zu verstehen.", // 4
        "e) Ich spreche offen über meine Sicht.", // 5
        "f) Ich reflektiere die Kritik tiefgründig.", // 6
        "g) Ich nehme sie als Lernchance für meinen Weg.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Was ist für dich das Schönste am Leben?",
      answers: [
        "a) Sicherheit und Geborgenheit.", // 1
        "b) Genuss und Sinnlichkeit.", // 2
        "c) Erfolge feiern.", // 3
        "d) Liebe erleben.", // 4
        "e) Sich ausdrücken können.", // 5
        "f) Erkenntnisse gewinnen.", // 6
        "g) Spirituelle Erfahrungen.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Wie gehst du mit Unsicherheiten in Beziehungen um?",
      answers: [
        "a) Ich suche Stabilität und Nähe.", // 1
        "b) Ich bringe Leichtigkeit hinein.", // 2
        "c) Ich kläre die Situation direkt.", // 3
        "d) Ich spreche offen über meine Gefühle.", // 4
        "e) Ich kommuniziere meine Bedürfnisse.", // 5
        "f) Ich reflektiere die Dynamik.", // 6
        "g) Ich vertraue auf die Entwicklung.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Was ist dir bei Freundschaften am wichtigsten?",
      answers: [
        "a) Verlässlichkeit.", // 1
        "b) Gemeinsamer Spaß.", // 2
        "c) Gegenseitige Motivation.", // 3
        "d) Tiefe Verbundenheit.", // 4
        "e) Offener Austausch.", // 5
        "f) Gemeinsame Entwicklung.", // 6
        "g) Spiritueller Austausch.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Wie reagierst du auf neue Ideen?",
      answers: [
        "a) Ich prüfe, ob sie zu meinem Leben passen.", // 1
        "b) Ich lasse mich inspirieren.", // 2
        "c) Ich frage mich, wie ich sie umsetzen kann.", // 3
        "d) Ich bespreche sie mit anderen.", // 4
        "e) Ich teile meine Meinung dazu.", // 5
        "f) Ich reflektiere sie tiefgründig.", // 6
        "g) Ich lasse sie auf mich wirken.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
    {
      q: "Was ist deine größte Herausforderung?",
      answers: [
        "a) Veränderungen akzeptieren.", // 1
        "b) Gefühle zulassen.", // 2
        "c) Kontrolle abgeben.", // 3
        "d) Grenzen setzen.", // 4
        "e) Sich klar auszudrücken.", // 5
        "f) Den eigenen Intuitionen vertrauen.", // 6
        "g) Im Hier und Jetzt bleiben.", // 7
      ],
      chakra: [1,2,3,4,5,6,7]
    },
  ];

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
    // Shuffle questions only on the client
    shuffledQuestions = [...questions].sort(() => {
      // Math.random() is browser-specific; ensure this runs only on client
      return Math.random() - 0.5;
    });
    currentIndex = 0;
    chakraScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    quizDiv.style.display = 'block';
    resultDiv.style.display = 'none';
    chakraAnalysisDiv.innerHTML = ''; // clear previous analysis
    showQuestion();
  }

  function showQuestion() {
    const q = shuffledQuestions[currentIndex];
    questionDiv.innerText = q.q;
    progressText.innerText = `Frage ${currentIndex + 1} von ${shuffledQuestions.length}`;
    progressBarDiv.style.width = `${((currentIndex + 1) / shuffledQuestions.length) * 100}%`;
    renderAnswerButtons();
  }

  // value: index of selected answer (0-6)
  function answer(value) {
    // Each answer in the question maps to a chakra type: 0->1, 1->2, ..., 6->7
    const q = shuffledQuestions[currentIndex];
    if (q && Array.isArray(q.chakra) && q.chakra.length > value) {
      const chakraNum = q.chakra[value];
      chakraScores[chakraNum] = (chakraScores[chakraNum] || 0) + 1;
    }
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

  // No static button listeners needed; handled dynamically in renderAnswerButtons()
  restartBtn.addEventListener('click', startQuiz);
  downloadPdfBtn.addEventListener('click', downloadPDF);

  startQuiz();
}