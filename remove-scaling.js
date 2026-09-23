const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('c:/grezto react native/GreztoApp/src');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content
    .replace(/moderateScale\(([^)]+)\)/g, '$1')
    .replace(/verticalScale\(([^)]+)\)/g, '$1')
    .replace(/scale\(([^)]+)\)/g, '$1')
    .replace(/import \{.*scale.*\} from 'react-native-size-matters';\n?/g, '');
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    console.log('Updated ' + f);
  }
});
