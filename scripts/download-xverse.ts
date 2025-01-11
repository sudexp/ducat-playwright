import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
import crx from 'crx-util';

dotenv.config();

const CRX_URL = process.env.CRX_URL;

if (!CRX_URL) {
  console.error('CRX_URL is not defined in .env file!');
  process.exit(1);
}

const EXTENSION_DIR = path.join(__dirname, '../xverse');
const CRX_FILE_PATH = path.join(__dirname, 'xverse.crx');

// function to load CRX
const downloadFile = async (url: string, destination: string): Promise<void> => {
  const writer = fs.createWriteStream(destination);
  const { data } = await axios.get(url, {
    responseType: 'stream',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
      Accept: '*/*',
    },
  });

  data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

// create directory if not present
if (!fs.existsSync(EXTENSION_DIR)) {
  fs.mkdirSync(EXTENSION_DIR, { recursive: true });
}

// download and unpack
(async () => {
  try {
    console.log('📥 Downloading Xverse extension...');

    await downloadFile(CRX_URL, CRX_FILE_PATH);
    console.log('✅ Xverse extension downloaded successfully at:', CRX_FILE_PATH);
    console.log('📦 Unpacking CRX extension...');

    await crx.parser.extract(CRX_FILE_PATH, EXTENSION_DIR);
    console.log('✅ Xverse extension unpacked successfully at:', EXTENSION_DIR);

    fs.unlinkSync(CRX_FILE_PATH);
    console.log('✅ The CRX file has been delelted', CRX_FILE_PATH);
  } catch (error) {
    console.error('❌ Error downloading or unpacking the extension:', error);
  }
})();
