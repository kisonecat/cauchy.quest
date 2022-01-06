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

function combine(a,b,c) {
  let result = new Float32Array(a.length);

  for(let i=0; i<a.length; i++) {
    result[i] = a[i] - b[i] + c[i];
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

export function analogy(a,b,c) {
  let av = model[a];
  let bv = model[b];
  let cv = model[c];

  if (av && bv && cv) {
    let target = combine(av,bv,cv);
    
    let result = [];

    for( const w of Object.keys(model) ) {
      if ((w !== a) && (w !== b) && (w !== c)) {
        let value = dot(model[w], target) / norm(target) / norm(model[w]);
        result.push( [value, w] );
      }
    }

    result.sort( (x,y) => (x[0] - y[0]) );
    
    return result;
  }

  return [];
}

