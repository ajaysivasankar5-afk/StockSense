import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Auto-build fallback if dist/index.html was not generated during installation
if (!fs.existsSync(indexPath)) {
  console.log('Dist directory or index.html not found. Executing build process...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build completed successfully.');
  } catch (err) {
    console.error('Failed to run build automatically:', err);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(distPath));

// SPA fallback: handle all routes by serving index.html
app.get('*', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Application build in progress or missing. Please refresh in a moment.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StockSense production server running on port ${PORT}`);
});
