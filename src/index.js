import './styles/base.css';
import * as model from './model.js';

// More common words are at the beginning of the model.words array
let theWords = ['','',''];

if (window.location.hash) {
  theWords = window.location.hash.slice(1).split(',');
}

function findAnswers() {
  let analogies = model.analogy(theWords[1], theWords[0], theWords[2]);

  analogies.reverse();
  analogies = analogies.slice(0,10);
  
  let parent = document.getElementById("results");
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }

  for( const x of analogies ) {
    let score = x[0];
    let word = x[1];

    let t = document.createTextNode(word);
    let n = document.createElement('li');
    n.style.opacity = Math.pow(score,0.8);
    
    n.appendChild(t);
    n.classList.add('result');

    let scoreText = document.createTextNode(Math.round(100 * score).toString() + '%');
    let scoreSpan = document.createElement('span');
    scoreSpan.appendChild(scoreText);
    scoreSpan.classList.add('score');
    n.appendChild(scoreSpan);

    parent.appendChild(n);
  }
}

function validateInput(event) {
  let v = event.target.value.toLowerCase();

  if (v === '')
    event.target.setCustomValidity('');
  else {
    if (!model.hasWord(v))
      event.target.setCustomValidity('unknown word');
    else
      event.target.setCustomValidity('');
  }
  
  event.target.reportValidity();
}

function debounce(func, timeout = 100){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

function processInput(index) {
  return debounce(function(event) {
    let v = event.target.value.toLowerCase();

    theWords[index] = v;
    history.replaceState(null, null, '#' + theWords.join(',') );

    findAnswers();
  });
}

window.addEventListener('load', async function () {
  let worda = document.getElementById("worda");
  let wordb = document.getElementById("wordb");
  let wordc = document.getElementById("wordc");
  
  worda.addEventListener("input", validateInput );
  wordb.addEventListener("input", validateInput );
  wordc.addEventListener("input", validateInput );

  worda.value = theWords[0];
  wordb.value = theWords[1];
  wordc.value = theWords[2];
  
  worda.addEventListener("input", processInput(0) );
  wordb.addEventListener("input", processInput(1) );
  wordc.addEventListener("input", processInput(2) );
  
  await model.load();
  findAnswers();
});
