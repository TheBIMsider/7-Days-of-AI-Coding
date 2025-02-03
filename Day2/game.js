const words = {
  easy: [
    'BIM',
    'LOD',
    'LOI',
    'CAD',
    'CDE',
    'IFC',
    'GIS',
    'API',
    'LLM',
    'GPT',
    'AGI',
    'OCR',
  ],
  medium: [
    'REVIT',
    'ROBOT',
    'CLOUD',
    'UNITY',
    'SCOPE',
    'RHINO',
    'AGILE',
    'LEGACY',
    'NEURAL',
    'TENSOR',
    'CLAUDE',
    'AIAGENT',
  ],
  hard: [
    'DIGITALTWIN',
    'BLOCKCHAIN',
    'AUTOMATION',
    'PARAMETRIC',
    'ALGORITHM',
    'METAVERSE',
    'LIFECYCLE',
    'TOPOLOGY',
    'FRAMEWORK',
    'DEEPLEARNING',
    'PROMPTING',
    'COMPUTERVISION',
  ],
};

class JargonJenga {
  constructor() {
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('highScore') || '0');
    this.lives = 6;
    this.currentWord = '';
    this.guessedLetters = new Set();
    this.difficulty = 'easy';

    this.initializeElements();
    this.initializeEventListeners();
    this.startNewGame();
  }

  initializeElements() {
    this.buildingDiv = document.getElementById('building');
    this.wordDiv = document.getElementById('word');
    this.keyboardDiv = document.getElementById('keyboard');
    this.scoreSpan = document.getElementById('score');
    this.highScoreSpan = document.getElementById('highScore');
    this.livesSpan = document.getElementById('lives');
    this.helpModal = document.getElementById('helpModal');

    if (
      !this.buildingDiv ||
      !this.wordDiv ||
      !this.keyboardDiv ||
      !this.scoreSpan ||
      !this.highScoreSpan ||
      !this.livesSpan ||
      !this.helpModal
    ) {
      throw new Error('Required DOM elements not found');
    }

    this.createKeyboard();
  }

  initializeEventListeners() {
    const newGameBtn = document.getElementById('newGameBtn');
    const helpBtn = document.getElementById('helpBtn');
    const closeHelpBtn = document.getElementById('closeHelp');
    const hintBtn = document.getElementById('hintBtn');
    const difficultySelect = document.getElementById('difficulty');

    if (
      !newGameBtn ||
      !helpBtn ||
      !closeHelpBtn ||
      !hintBtn ||
      !difficultySelect
    ) {
      throw new Error('Required button elements not found');
    }

    newGameBtn.addEventListener('click', () => this.startNewGame());
    helpBtn.addEventListener('click', () => this.showHelp());
    closeHelpBtn.addEventListener('click', () => this.hideHelp());
    hintBtn.addEventListener('click', () => this.getHint());
    difficultySelect.addEventListener('change', (e) => {
      this.difficulty = e.target.value;
      this.startNewGame();
    });
  }

  createKeyboard() {
    const keyboardLayout = [
      ['Q', 'W', 'E', 'R', 'T', 'Y'],
      ['U', 'I', 'O', 'P', 'A', 'S'],
      ['D', 'F', 'G', 'H', 'J', 'K'],
      ['L', 'Z', 'X', 'C', 'V', 'B'],
      ['N', 'M'],
    ];

    this.keyboardDiv.innerHTML = '';
    keyboardLayout.forEach((row) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'keyboard-row';

      row.forEach((letter) => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.className = 'key';
        button.addEventListener('click', () => this.handleGuess(letter));
        rowDiv.appendChild(button);
      });

      this.keyboardDiv.appendChild(rowDiv);
    });
  }

  startNewGame() {
    this.lives = 6;
    this.guessedLetters.clear();
    this.currentWord = this.getRandomWord();
    this.updateDisplay();
    this.resetKeyboard();
    this.buildBuilding();
  }

  getRandomWord() {
    const wordList = words[this.difficulty];
    return wordList[Math.floor(Math.random() * wordList.length)];
  }

  handleGuess(letter) {
    if (this.guessedLetters.has(letter)) return;

    this.guessedLetters.add(letter);
    const button = Array.from(this.keyboardDiv.children).find(
      (btn) => btn.textContent === letter
    );
    if (button) {
      button.classList.add('used');
    }

    if (!this.currentWord.includes(letter)) {
      this.lives--;
      this.removeBuilding();
    }

    this.updateDisplay();
    this.checkGameStatus();
  }

  getHint() {
    if (this.lives <= 1) return;

    const unguessedLetters = this.currentWord
      .split('')
      .filter((letter) => !this.guessedLetters.has(letter));

    if (unguessedLetters.length > 0) {
      this.lives--;
      this.handleGuess(unguessedLetters[0]);
    }
  }

  buildBuilding() {
    if (!this.buildingDiv) return;
    this.buildingDiv.innerHTML = '';
    const parts = [
      'house-body',
      'roof',
      'chimney',
      'window window-left',
      'window window-right',
      'door',
    ];
    parts.forEach((partClass) => {
      const piece = document.createElement('div');
      piece.className = `building-piece ${partClass}`;
      piece.style.display = 'none';
      this.buildingDiv.appendChild(piece);
    });
  }

  removeBuilding() {
    if (!this.buildingDiv) return;
    const pieces = Array.from(
      this.buildingDiv.getElementsByClassName('building-piece')
    );
    const hiddenPieces = pieces.filter((p) => p.style.display === 'none');
    if (hiddenPieces.length > 0) {
      hiddenPieces[0].style.display = 'block';
    }
  }

  updateDisplay() {
    if (
      !this.wordDiv ||
      !this.livesSpan ||
      !this.scoreSpan ||
      !this.highScoreSpan
    )
      return;

    this.wordDiv.textContent = this.currentWord
      .split('')
      .map((letter) => (this.guessedLetters.has(letter) ? letter : '_'))
      .join(' ');

    this.livesSpan.textContent = this.lives.toString();
    this.scoreSpan.textContent = this.score.toString();
    this.highScoreSpan.textContent = this.highScore.toString();
  }

  checkGameStatus() {
    const won = this.currentWord
      .split('')
      .every((letter) => this.guessedLetters.has(letter));

    if (won) {
      const points = { easy: 1, medium: 2, hard: 3 }[this.difficulty] || 1;
      this.score += points;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('highScore', this.highScore.toString());
      }
      setTimeout(() => {
        alert('Congratulations! You won!');
        this.startNewGame();
      }, 500);
    } else if (this.lives <= 0) {
      setTimeout(() => {
        alert(`Game Over! The word was: ${this.currentWord}`);
        this.score = 0;
        this.startNewGame();
      }, 500);
    }
  }

  showHelp() {
    if (this.helpModal) {
      this.helpModal.style.display = 'block';
    }
  }

  hideHelp() {
    if (this.helpModal) {
      this.helpModal.style.display = 'none';
    }
  }

  resetKeyboard() {
    Array.from(this.keyboardDiv.children).forEach((button) => {
      button.classList.remove('used');
    });
  }
}

// Start the game when the page loads
window.addEventListener('load', () => {
  try {
    new JargonJenga();
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
});
