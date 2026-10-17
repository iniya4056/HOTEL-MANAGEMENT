const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

function removeFile(imagePath) {
  if (!imagePath) return;
  const file = path.join(UPLOAD_DIR, path.basename(imagePath));
  fs.unlink(file, (err) => {
    if (err && err.code !== 'ENOENT') console.error('Could not delete file:', err.message);
  });
}

module.exports = { UPLOAD_DIR, removeFile };
