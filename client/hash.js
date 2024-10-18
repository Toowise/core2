const bcryptjs = require('bcryptjs');


const plainPassword = 'test12345';


bcryptjs.hash(plainPassword, 10, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Hashed password:', hashedPassword);
  }
});
