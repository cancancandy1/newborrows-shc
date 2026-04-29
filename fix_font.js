const fs = require('fs');
const https = require('https');
const path = require('path');

const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/sarabun/Sarabun-Regular.ttf';
const outputPath = path.join(__dirname, 'src', 'assets', 'fonts', 'Sarabun-Regular-normal.js');

function getFont(url) {
  https.get(url, (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      return getFont(res.headers.location);
    }
    if (res.statusCode !== 200) {
      console.error(`Failed to download font: ${res.statusCode} for ${url}`);
      return;
    }

  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const base64 = buffer.toString('base64');
    
    const jsContent = `import { jsPDF } from 'jspdf';
const font = "${base64}";
const callAddFont = function () {
  this.addFileToVFS('Sarabun-Regular.ttf', font);
  this.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');
};
if (typeof jsPDF !== 'undefined' && jsPDF.API) {
  jsPDF.API.events.push(['addFonts', callAddFont]);
}
export default font;
`;

    fs.writeFileSync(outputPath, jsContent, 'utf8');
    console.log('Successfully generated font file in UTF-8');
  });
}).on('error', (err) => {
  console.error(`Error downloading font: ${err.message}`);
});
}

getFont(fontUrl);
