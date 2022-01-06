import './styles/base.css';
import './styles/spinkit.css';
import * as model from './model.js';

// More common words are at the beginning of the model.words array
function randomWord() {
  return model.words[Math.floor(Math.random()*model.words.length * 0.15)];
}

let myWord = undefined;
let playerWord = undefined;
let spokenWords = {};

function announce(player, text) {
  let t = document.createTextNode(text);
  let n = document.createElement('p');
  n.appendChild(t);
  n.classList.add(player);
  let parent = document.getElementById("transcript");
  parent.appendChild(n);
  window.scrollTo(0,document.body.scrollHeight);
}

async function revealHash() {
  const encoder = new TextEncoder();
  const data = encoder.encode(myWord);
  const hash = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hash));                     // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string

  const text = 'echo -ne word | shasum = ' + hashHex;   
  let n = document.createElement('p');
  n.classList.add('hash');
  
  n.appendChild(document.createTextNode('echo -ne '));

  let secret = document.createElement('span');
  secret.appendChild(document.createTextNode('my secret word'));
  secret.classList.add('secret');
  secret.id = 'secret';
  n.appendChild(secret);

  n.appendChild(document.createTextNode(' | shasum'));

  let mapsto = document.createElement('span');
  mapsto.appendChild(document.createTextNode('↦'));
  mapsto.classList.add('mapsto');
  n.appendChild(mapsto);

  n.appendChild(document.createTextNode(hashHex));

  let parent = document.getElementById("transcript");
  parent.appendChild(n);
}

function winGame() {
  announce('computer','We win!');
  announce('computer','Let\'s play again.');
  announce('computer','I am thinking of a word.');
  myWord = randomWord();
  spokenWords = {};
  revealHash();
}

function submitAnswer() {
  var player = document.getElementById("player");
  player.value = '';

  if (spokenWords[playerWord]) {
    announce('human','You can\'t say “' + playerWord + '” because that word has already been said.');
    return;
  }

  announce('human','You say, “' + playerWord + '.”  I say, “' + myWord + '.”');
  spokenWords[playerWord] = true;
  spokenWords[myWord] = true;

  let parent = document.getElementById("secret");
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
  parent.appendChild(document.createTextNode(myWord));
  parent.id = '';

  if (myWord === playerWord) {
    winGame();
  } else {
    announce('computer','I am thinking of a word related to “' + playerWord + '” and “' + myWord + '.”');

    let results = model.similarity([myWord, playerWord]);
    while( spokenWords[myWord] )
      myWord = results.pop()[1];
    revealHash();
  }

  window.scrollTo(0,document.body.scrollHeight);
}


window.addEventListener('load', async function () {
  var player = document.getElementById("player");
  var submit = document.getElementById("submit");
  
  player.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      submit.click();
    }
  });

  player.disabled = true;
  submit.disabled = true;

  await model.load();

  // remove spinner
  let parent = document.getElementById("transcript");
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }

  player.disabled = false;

  player.addEventListener("input", function(event) {
    let v = event.target.value.toLowerCase();
    playerWord = v;
    
    if (v === '') {
      submit.disabled = true;
      event.target.setCustomValidity('');
    } else {
      if (!model.hasWord(v)) {
        submit.disabled = true;
        event.target.setCustomValidity('unknown word');
      } else
        submit.disabled = false;
        event.target.setCustomValidity('');
    }

    event.target.reportValidity();
  });

  submit.addEventListener("click", submitAnswer );

  myWord = randomWord();

  announce('computer','I am thinking of a word.  Can you guess it?');
  await revealHash();
});
