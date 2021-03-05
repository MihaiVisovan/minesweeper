var numberOfBombs = 110;
var numberOfColumns = 35;
var numberOfRows = 23;
var numberOfBoxes = numberOfColumns * numberOfRows;
var wordNumbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
var titleChanged = false;

window.onload = () => {
  startGame();
};

const startGame = () => {
  setup();
  createBoxes();
  addBombs();
  addNumbers();
};

const setup = () => {
  const timer = document.getElementById('timer');
  timer.textContent = -1;
  setTimer(timer);

  const flaggedBombs = document.getElementById('flags');
  flaggedBombs.textContent = numberOfBombs;
};

const setTimer = (timer) => {
  timer.textContent++;
  setTimeout(() => {
    setTimer(timer)
  }, 1000);
};

const createBoxes = () => {
  const content = document.getElementsByClassName('content')[0];

  for (let index = 0; index < numberOfBoxes; index++) {
    const box = document.createElement('button');
    box.className = 'box';
    box.setAttribute('id', index);
    box.setAttribute('data-row', Math.floor(index / numberOfColumns));
    box.setAttribute('data-column', index % numberOfColumns);
    addRightClickEvent(box);
    content.appendChild(box);
  }
};

const addRightClickEvent = (box) => {
  box.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    toggleFlag(box);
  });
};

const toggleFlag = (box) => {
  const hasFlag = box.getAttribute('data-flag');
  const flaggedBombs = document.getElementById('flags');
  const flaggedBombsInt = parseInt(flaggedBombs.textContent);

  if (hasFlag === 'true') {
    flaggedBombs.textContent = flaggedBombsInt + 1;
    box.classList.remove('flag');
    box.setAttribute('data-flag', false);
  } else {
    flaggedBombs.textContent -= 1;
    box.classList.add('flag');
    box.setAttribute('data-flag', true);
  }
};

const addNumbers = () => {
  for (let i = 0; i < numberOfBoxes; i++) {
    const box = document.getElementById(i);
    if (!box.hasAttribute('data-bomb')) {
      const numberOfSurroundingBombs = countSurroundingBombs(box);
      if(numberOfSurroundingBombs) {
        box.setAttribute('data-number', true);
        box.addEventListener('click', () => addNumberAnimation(box, numberOfSurroundingBombs));
      } else {
        box.addEventListener('click', () => showBlankNeighbors(box, numberOfSurroundingBombs));
      }
    }
  }
}

const addBombs = () => {
  const randomBombs = getRandomArray(numberOfBombs, numberOfBoxes);
  for (let i = 0; i < randomBombs.length; i++) {
    const id = randomBombs[i];
    const box = document.getElementById(id);
    box.setAttribute('data-bomb', true);
    box.addEventListener('click', () => addBombAnimation(box));
  }
}

const addBombAnimation = (box) => {
  changeTitle();

  if (box.getAttribute('data-flag') === 'false' || !box.hasAttribute('data-flag')) {
    const bombs = document.querySelectorAll(`[data-bomb=true]`);
    bombs.forEach(bomb => {
      setTimeout(() => {
        bomb.classList.add('bomb');
        bomb.classList.add('flip-vertical-fwd');
      }, 100);
    })
    loseGame();
  }
}

const addNumberAnimation = (box, numberOfSurroundingBombs) => {
  changeTitle();
  const gameWon = winGame();
  if (gameWon) {
    alert('You won');
  }

  if (box.getAttribute('data-flag') === 'false' || !box.hasAttribute('data-flag')) {
    box.classList.add('slide-out-bck-center');
    setTimeout(() => {
      if (numberOfSurroundingBombs) {
        box.textContent = numberOfSurroundingBombs;
      }
      box.classList.add(wordNumbers[numberOfSurroundingBombs]);
      box.classList.add('numbers');
      box.classList.add('slide-in-fwd-center');
    }, 500);
  }
}

const countSurroundingBombs = (box) => {
  let numberOfSurroundingBombs = 0;
  const surroundingBoxes = getSurroundingBoxes(box);

  surroundingBoxes.forEach(x => {
    // check the elements exists for corner cases
    if(x && x.hasAttribute('data-bomb')) {
      numberOfSurroundingBombs++;
    }
  })
  return numberOfSurroundingBombs;
}

const getSurroundingBoxes = (box) => {
  const i = parseInt(box.getAttribute('data-row'));
  const j = parseInt(box.getAttribute('data-column'));

  // surrounding Boxes
  const topLeftBox = document.querySelector(`[data-row="${i-1}"][data-column="${j-1}"]`);
  const topBox = document.querySelector(`[data-row="${i-1}"][data-column="${j}"]`);
  const topRightBox = document.querySelector(`[data-row="${i-1}"][data-column="${j+1}"]`);
  const leftBox = document.querySelector(`[data-row="${i}"][data-column="${j-1}"]`);
  const rightBox = document.querySelector(`[data-row="${i}"][data-column="${j+1}"]`);
  const bottomLeftBox = document.querySelector(`[data-row="${i+1}"][data-column="${j-1}"]`);
  const bottomBox = document.querySelector(`[data-row="${i+1}"][data-column="${j}"]`);
  const bottomRightBox = document.querySelector(`[data-row="${i+1}"][data-column="${j+1}"]`);

  const surroundingBoxes = [topLeftBox, topBox, topRightBox, leftBox, 
    bottomLeftBox, bottomBox, bottomRightBox, rightBox];

  return surroundingBoxes;
}

const showBlankNeighbors = async (box, numberOfSurroundingBombs) => {
  await sleep(100);
  addNumberAnimation(box, numberOfSurroundingBombs);
  if (box.hasAttribute('data-number') || box.getAttribute('data-visited')) return;

  box.setAttribute('data-visited', true);
  const surroundingBoxes = getSurroundingBoxes(box).filter(x => x !== null);
  surroundingBoxes.forEach(box => {
    showBlankNeighbors(box, countSurroundingBombs(box));
  });
}

const changeTitle = () => {
  if (!titleChanged) {
    const title = document.getElementsByClassName('title')[0];
    title.textContent = 'Restart';
    title.classList.add('restart');
    title.addEventListener('click', () => {
      location.reload();
    })
    titleChanged = true;
  }
}

const loseGame = () => {
  setTimeout(() => {
    alert('You lost!');
    const content = document.getElementsByClassName('content')[0];
    content.style.pointerEvents = 'none';
  }, 1000);
}

const winGame = () => {
  const boxes = document.getElementsByClassName('box');
  return !Array.from(boxes).some(box => !box.getAttribute('data-visited'));
};

const getRandomArray = (length, range) => {
  const randomArray = new Set();
  while(randomArray.size !== length) {
    randomArray.add(Math.floor(Math.random() * range));
  }
  return [...randomArray];
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}