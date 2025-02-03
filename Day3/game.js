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
    'BIM', // Building Information Modeling
    'LOD', // Level of Detail/Development
    'LOI', // Level of Information
    'CAD', // Computer-Aided Design
    'CDE', // Common Data Environment
    'IFC', // Industry Foundation Classes
    'GIS', // Geographic Information System
    'API', // Application Programming Interface
    'LLM', // Large Language Model
    'GPT', // Generative Pre-trained Transformer
    'AGI', // Artificial General Intelligence
    'OCR', // Optical Character Recognition
  ],
  medium: [
    'REVIT', // Popular BIM software
    'ROBOT', // Structural analysis software
    'CLOUD', // Cloud computing
    'UNITY', // Game/visualization engine
    'SCOPE', // Project scope
    'RHINO', // 3D modeling software
    'AGILE', // Project management methodology
    'LEGACY', // Legacy systems
    'NEURAL', // Neural networks
    'TENSOR', // Tensors in machine learning
    'CLAUDE', // AI assistant
    'AIAGENT', // AI agent systems
  ],
  hard: [
    'DIGITALTWIN', // Digital representation of physical asset
    'BLOCKCHAIN', // Distributed ledger technology
    'AUTOMATION', // Process automation
    'PARAMETRIC', // Parametric design
    'ALGORITHM', // Algorithmic design
    'METAVERSE', // Virtual world concept
    'LIFECYCLE', // Building lifecycle
    'TOPOLOGY', // Topological optimization
    'FRAMEWORK', // Software framework
    'DEEPLEARNING', // Deep learning AI
    'PROMPTING', // AI prompt engineering
    'COMPUTERVISION', // Computer vision technology
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
    this.currentWord = this.getRandomWord();
    this.updateDisplay();
    this.resetKeyboard();
    this.buildBuilding();
  }

  /**
   * Get a random word based on current difficulty
   * @returns {string} The selected word
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

    // Update game statistics
    this.livesSpan.textContent = this.lives.toString();
    this.scoreSpan.textContent = this.score.toString();
    this.highScoreSpan.textContent = this.highScore.toString();

    // Update accessibility labels
    this.wordDiv.setAttribute(
      'aria-label',
      `Word to guess: ${this.wordDiv.textContent}`
    );
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
