let text = 'abc123' + 'cde9982';
const neverReassigned = {};
neverReassigned.name = 'luisao oooo';
let toBeReassigned = {};
toBeReassigned = {
  name: 'ana 1'
};
toBeReassigned.name = 0;
toBeReassigned = 1;
toBeReassigned = {
  name: 'ana 2'
};
const result = text.split(',').map(l => {
  return l.toUpperCase();
}).join('.');
console.log(result);
text = '123';
