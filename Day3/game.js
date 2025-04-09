/**
 * Brick by Brick - Word Guessing Game
 * A game where players guess industry-related words while building a house
 * ==========================================================================
 */

/**
 * Game Configuration
 * Contains all the constant values and settings used throughout the game
 */
const GAME_CONFIG = {
  // Maximum number of wrong guesses allowed before game over
  MAX_LIVES: 6,

  // Keyboard layout in rows for the virtual keyboard
  // Each array represents a row of letters
  KEYBOARD_LAYOUT: [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ],

  // HTML classes for building pieces, added in order as player makes mistakes
  BUILDING_PIECES: [
    'house-body',
    'roof',
    'chimney',
    'window window-left',
    'window window-right',
    'door',
  ],

  // Key used for storing high score in browser's local storage
  LOCAL_STORAGE_KEY: 'highScore',
};

/**
 * Word Lists
 * Collection of words organized by difficulty level
 * Each word has a comment explaining its meaning
 */
const WORD_LISTS = {
  easy: [
    { word: 'BIM', meaning: 'Digital construction blueprint on steroids' },
    { word: 'LOD', meaning: 'How much detail you want to see' },
    { word: 'LOI', meaning: 'Data richness indicator' },
    { word: 'CAD', meaning: 'Drawing with computers, not pencils' },
    { word: 'CDE', meaning: 'Where project data lives and breathes' },
    { word: 'IFC', meaning: 'Universal language for building data' },
    { word: 'GIS', meaning: 'Maps that know everything' },
    { word: 'API', meaning: 'Digital handshake between programs' },
    { word: 'LLM', meaning: 'AI that writes like a human' },
    { word: 'GPT', meaning: "ChatGPT's family name" },
    { word: 'AGI', meaning: 'When machines become as smart as us' },
    { word: 'OCR', meaning: 'Turns pictures of text into actual text' },
  ],
  medium: [
    { word: 'REVIT', meaning: "Autodesk's building design powerhouse" },
    { word: 'ROBOT', meaning: 'Crunches numbers for structures' },
    { word: 'CLOUD', meaning: "Your data's home in the sky" },
    { word: 'UNITY', meaning: 'Makes virtual worlds come alive' },
    { word: 'SCOPE', meaning: 'Project boundaries and goals' },
    { word: 'RHINO', meaning: '3D modeling beast' },
    { word: 'AGILE', meaning: 'Flexible project management style' },
    { word: 'LEGACY', meaning: 'Old but still running' },
    { word: 'NEURAL', meaning: 'Brain-inspired computing' },
    { word: 'TENSOR', meaning: 'Math that powers AI' },
    { word: 'CLAUDE', meaning: "Anthropic's smart assistant" },
    { word: 'AIAGENT', meaning: 'Software that thinks for itself' },
  ],
  hard: [
    { word: 'DIGITALTWIN', meaning: 'Virtual clone of real things' },
    { word: 'BLOCKCHAIN', meaning: 'Unbreakable digital ledger' },
    { word: 'AUTOMATION', meaning: 'Let machines do the work' },
    { word: 'PARAMETRIC', meaning: 'Design that changes with numbers' },
    { word: 'ALGORITHM', meaning: 'Step-by-step problem solver' },
    { word: 'METAVERSE', meaning: 'Digital universe you can visit' },
    { word: 'LIFECYCLE', meaning: 'From cradle to grave' },
    { word: 'TOPOLOGY', meaning: 'Shape optimization magic' },
    { word: 'FRAMEWORK', meaning: 'Building blocks for coding' },
    { word: 'DEEPLEARNING', meaning: 'AI that learns by example' },
    { word: 'PROMPTING', meaning: 'The art of talking to AI' },
    { word: 'COMPUTERVISION', meaning: 'Machines that can see' },
  ],
};

/**
 * Point values awarded for completing words at each difficulty level
 */
const DIFFICULTY_POINTS = {
  easy: 1,
  medium: 2,
  hard: 3,
};

/**
 * Main Game Class
 * Handles all game logic and user interactions
 */
class JargonJenga {
  /**
   * Initialize the game
   * Sets up initial game state and event listeners
   */
  constructor() {
    // Initialize game state variables
    this.score = 0;
    this.highScore = parseInt(
      localStorage.getItem(GAME_CONFIG.LOCAL_STORAGE_KEY) || '0'
    );
    this.lives = GAME_CONFIG.MAX_LIVES;
    this.currentWord = '';
    this.currentMeaning = '';
    this.guessedLetters = new Set();
    this.difficulty = 'easy';

    // Set up the game
    this.initializeElements();
    this.initializeEventListeners();
    this.startNewGame();
  }

  /**
   * Initialize and validate all required DOM elements
   * Throws an error if any required element is missing
   */
  initializeElements() {
    // Define all required DOM elements
    const requiredElements = {
      buildingDiv: 'building', // Container for house visualization
      wordDiv: 'word', // Displays the word being guessed
      keyboardDiv: 'keyboard', // Virtual keyboard container
      scoreSpan: 'score', // Current score display
      highScoreSpan: 'highScore', // High score display
      livesSpan: 'lives', // Remaining lives display
      helpModal: 'helpModal', // Help information modal
      clueDiv: 'clue', // Displays the clue for the current word
    };

    // Get and validate each element
    Object.entries(requiredElements).forEach(([prop, id]) => {
      this[prop] = document.getElementById(id);
      if (!this[prop]) {
        throw new Error(`Required element #${id} not found`);
      }
    });

    // Create the virtual keyboard
    this.createKeyboard();

    // Initialize changelog toggle
    const changelogToggle = document.querySelector('.changelog-toggle');
    const changelogContent = document.getElementById('changelogContent');

    if (changelogToggle && changelogContent) {
      changelogToggle.addEventListener('click', () => {
        const isExpanded =
          changelogToggle.getAttribute('aria-expanded') === 'true';
        changelogToggle.setAttribute('aria-expanded', !isExpanded);
        changelogContent.hidden = isExpanded;
      });
    }
  }

  /**
   * Set up all event listeners for game controls
   */
  initializeEventListeners() {
    // Define control buttons and their handlers
    const controlButtons = {
      newGameBtn: () => this.startNewGame(),
      helpBtn: () => this.showHelp(),
      closeHelp: () => this.hideHelp(),
      hintBtn: () => this.getHint(),
    };

    // Add click listeners to all control buttons
    Object.entries(controlButtons).forEach(([id, handler]) => {
      const button = document.getElementById(id);
      if (!button) {
        throw new Error(`Required button #${id} not found`);
      }
      button.addEventListener('click', handler);
    });

    // Set up difficulty selector
    const difficultySelect = document.getElementById('difficulty');
    if (!difficultySelect) {
      throw new Error('Difficulty selector not found');
    }
    difficultySelect.addEventListener('change', (e) => {
      this.difficulty = e.target.value;
      this.startNewGame();
    });

    // Add keyboard event listener for physical keyboard input
    document.addEventListener('keydown', this.handleKeyboardInput.bind(this));
  }

  /**
   * Handle physical keyboard input
   * @param {KeyboardEvent} e - The keyboard event
   */
  handleKeyboardInput(e) {
    const letter = e.key.toUpperCase();
    // Only process single letters that haven't been guessed
    if (/^[A-Z]$/.test(letter) && !this.guessedLetters.has(letter)) {
      this.handleGuess(letter);
    }
  }

  /**
   * Create the virtual keyboard interface
   * Generates a keyboard layout with interactive buttons
   */
  createKeyboard() {
    // Clear existing keyboard
    this.keyboardDiv.innerHTML = '';

    // Create wrapper for keyboard
    const keyboardWrapper = document.createElement('div');
    keyboardWrapper.className = 'keyboard-wrapper';

    // Create each row of the keyboard
    GAME_CONFIG.KEYBOARD_LAYOUT.forEach((row, rowIndex) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'keyboard-row';

      // Add offset classes for staggered layout
      if (rowIndex === 1) rowDiv.classList.add('row-offset-half');
      if (rowIndex === 2) rowDiv.classList.add('row-offset-full');

      // Create buttons for each letter in the row
      row.forEach((letter) => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.className = 'key';
        button.setAttribute('aria-label', `Guess letter ${letter}`);
        button.addEventListener('click', () => this.handleGuess(letter));
        rowDiv.appendChild(button);
      });

      keyboardWrapper.appendChild(rowDiv);
    });

    this.keyboardDiv.appendChild(keyboardWrapper);
  }

  /**
   * Start a new game
   * Resets game state and prepares for new round
   */
  startNewGame() {
    this.lives = GAME_CONFIG.MAX_LIVES;
    this.guessedLetters.clear();
    const wordData = this.getRandomWord();
    this.currentWord = wordData.word;
    this.currentMeaning = wordData.meaning;
    this.updateDisplay();
    this.resetKeyboard();
    this.buildBuilding();
  }

  /**
   * Get a random word based on current difficulty
   * @returns {Object} The selected word and its meaning
   */
  getRandomWord() {
    const wordList = WORD_LISTS[this.difficulty];
    return wordList[Math.floor(Math.random() * wordList.length)];
  }

  /**
   * Handle a letter guess
   * @param {string} letter - The guessed letter
   */
  handleGuess(letter) {
    // Ignore if letter was already guessed
    if (this.guessedLetters.has(letter)) return;

    this.guessedLetters.add(letter);

    // Update the virtual keyboard
    const button = Array.from(document.querySelectorAll('.key')).find(
      (btn) => btn.textContent === letter
    );
    if (button) {
      button.classList.add('used');
      button.setAttribute('aria-disabled', 'true');
    }

    // Check if guess is wrong
    if (!this.currentWord.includes(letter)) {
      this.lives--;
      this.removeBuilding();
    }

    this.updateDisplay();
    this.checkGameStatus();
  }

  /**
   * Provide a hint by revealing an unguessed letter
   */
  getHint() {
    // Only provide hint if more than one life remains
    if (this.lives <= 1) return;

    // Find unguessed letters
    const unguessedLetters = this.currentWord
      .split('')
      .filter((letter) => !this.guessedLetters.has(letter));

    // Reveal first unguessed letter if any exist
    if (unguessedLetters.length > 0) {
      this.lives--;
      this.handleGuess(unguessedLetters[0]);
    }
  }

  /**
   * Initialize the building visualization
   */
  buildBuilding() {
    this.buildingDiv.innerHTML = '';
    GAME_CONFIG.BUILDING_PIECES.forEach((partClass) => {
      const piece = document.createElement('div');
      piece.className = `building-piece ${partClass}`;
      piece.style.display = 'none';
      this.buildingDiv.appendChild(piece);
    });
  }

  /**
   * Reveal next building piece on incorrect guess
   */
  removeBuilding() {
    const pieces = Array.from(
      this.buildingDiv.getElementsByClassName('building-piece')
    );
    const hiddenPieces = pieces.filter((p) => p.style.display === 'none');
    if (hiddenPieces.length > 0) {
      hiddenPieces[0].style.display = 'block';
    }
  }

  /**
   * Update game display elements
   * Updates word display, lives, score, and high score
   */
  updateDisplay() {
    // Update word display with guessed letters
    this.wordDiv.textContent = this.currentWord
      .split('')
      .map((letter) => (this.guessedLetters.has(letter) ? letter : '_'))
      .join(' ');

    // Update clue display
    this.clueDiv.textContent = `Clue: ${this.currentMeaning}`;

    // Update game statistics
    this.livesSpan.textContent = this.lives.toString();
    this.scoreSpan.textContent = this.score.toString();
    this.highScoreSpan.textContent = this.highScore.toString();

    // Update accessibility labels
    this.wordDiv.setAttribute(
      'aria-label',
      `Word to guess: ${this.wordDiv.textContent}`
    );
    this.clueDiv.setAttribute('aria-label', `Clue: ${this.currentMeaning}`);
  }

  /**
   * Check game status for win/loss conditions
   */
  checkGameStatus() {
    // Check if word is complete
    const won = this.currentWord
      .split('')
      .every((letter) => this.guessedLetters.has(letter));

    if (won) {
      // Handle win condition
      const points = DIFFICULTY_POINTS[this.difficulty];
      this.score += points;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem(
          GAME_CONFIG.LOCAL_STORAGE_KEY,
          this.highScore.toString()
        );
      }
      setTimeout(() => {
        alert('Congratulations! You won!');
        this.startNewGame();
      }, 500);
    } else if (this.lives <= 0) {
      // Handle loss condition
      setTimeout(() => {
        alert(`Game Over! The word was: ${this.currentWord}`);
        this.score = 0;
        this.startNewGame();
      }, 500);
    }
  }

  /**
   * Show help modal
   */
  showHelp() {
    this.helpModal.style.display = 'block';
  }

  /**
   * Hide help modal
   */
  hideHelp() {
    this.helpModal.style.display = 'none';
  }

  /**
   * Reset keyboard to initial state
   * Removes 'used' class from all keys
   */
  resetKeyboard() {
    const keys = document.querySelectorAll('.key');
    keys.forEach((key) => {
      key.classList.remove('used');
      key.removeAttribute('aria-disabled');
    });
  }
}

// Initialize game when page loads
window.addEventListener('load', () => {
  try {
    new JargonJenga();
  } catch (error) {
    console.error('Failed to initialize game:', error);
    alert('Error initializing game. Please refresh the page.');
  }
});
