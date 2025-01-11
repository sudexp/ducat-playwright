import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
import unzipCrx from 'unzip-crx'; // Импортируем unzip-crx

dotenv.config();

const CRX_URL = process.env.CRX_URL as string;
const EXTENSION_DIR = path.join(__dirname, '../xverse');

if (!CRX_URL) {
  console.error('CRX_URL is not defined in .env file!');
  process.exit(1);
}

const downloadFile = async (url: string, destination: string): Promise<void> => {
  const writer = fs.createWriteStream(destination);
  const { data } = await axios.get(url, { responseType: 'stream' });

  data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

if (!fs.existsSync(EXTENSION_DIR)) {
  fs.mkdirSync(EXTENSION_DIR, { recursive: true });
}

(async () => {
  try {
    const crxFilePath = path.join(__dirname, 'xverse.crx');

    console.log('Downloading Xverse extension...');
    await downloadFile(CRX_URL, crxFilePath);

    console.log('Unzipping CRX extension...');
    await unzipCrx(crxFilePath, EXTENSION_DIR);

    console.log('Xverse extension downloaded and unpacked successfully!');
  } catch (error) {
    console.error('Error downloading or unpacking the extension:', error);
  }
})();
