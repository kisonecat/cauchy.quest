import words from '../data/words.json';
import vectorsUrl from '../data/vectors.bin';

export { words };

function dot(a,b) {
  let result = 0;

  for(let i=0; i<a.length; i++) {
    result = result + a[i]*b[i];
  }

  return result;
}

const norm = (a) => Math.sqrt(dot(a,a));

let model = {};

export function hasWord(w) {
  return model[w] !== undefined;
}

export async function load() {
  let vectorsRaw = await fetch(vectorsUrl);
  let buffer = await vectorsRaw.arrayBuffer();

  let vectors = new Float32Array(buffer);

  let dimension = vectors.length / words.length;
  
  for(let i=0; i < words.length; i++ ) {
    model[words[i]] = vectors.subarray(i*dimension, (i+1)*dimension);
  }
}

export function similarity(ws) {
  let result = [];

  for( const x of Object.keys(model) ) {
    let value = 0.0;

    for( const w of ws ) {
      if (model[w]) {
        value += dot(model[w], model[x]) / norm(model[x]) / norm(model[w]);
      }
    }

    result.push( [value, x] );
  }
  
  result.sort( (a,b) => (a[0] - b[0]) );
    
  return result;
}

