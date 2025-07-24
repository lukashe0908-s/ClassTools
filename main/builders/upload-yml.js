const fs = require('fs');
const path = require('path');

(async () => {
  const filePath = path.resolve('build/dist/latest.yml');
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  const tag = process.env.TAG_NAME;
  const token = process.argv[2];

  if (!tag || !token) {
    console.error('Missing TAG_NAME (env) or PUSH_TOKEN (arg)');
    process.exit(1);
  }

  console.log(`📦 Uploading latest.yml with tag: ${tag}`);

  const response = await fetch('https://update-class-tools.lukass.workers.dev/push_version', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      x_replace: true,
      x_tag: tag,
      'Content-Type': 'application/octet-stream',
    },
    body: fileContent,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`❌ Upload failed: ${response.status} ${response.statusText}\n${text}`);
  }

  console.log(`✅ Upload successful for tag: ${tag}`);
})();
