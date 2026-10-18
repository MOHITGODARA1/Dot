const crypto = require('crypto');

// No 0/O or 1/I so codes are easy to read aloud and type. 32^8 is about 1.1 trillion codes.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateInviteCode(length = 8) {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  }
  return code;
}

module.exports = generateInviteCode;
