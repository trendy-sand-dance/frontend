import fs from 'node:fs';

export function getBundledFile() {
  return new Promise((resolve, reject) => {
    fs.readdir('./public', (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      for (const file of files) {
        if (file.includes('index') && file.endsWith('.js')) {
          console.log(file);
          resolve(file);
          return;
        }
      }
      resolve(null);
    });
  });
}
