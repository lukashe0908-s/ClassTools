const fs = require('fs');
const path = require('path');

async function uploadLatestYml() {
  const filePath = path.resolve('./build/dist/latest.yml');
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  const tagName = process.env.TAG_NAME;
  console.log('tagName:', tagName);
  const bearerToken = process.env.PUSH_TOKEN;
  if (!bearerToken) {
    throw new Error('Missing PUSH_TOKEN env variable');
  }

  const response = await fetch('https://update-class-tools.lukass.workers.dev/push_version', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      x_replace: true,
      x_tag: tagName,
      'Content-Type': 'application/octet-stream', // or text/yaml
    },
    body: fileContent,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  console.log('Upload successful!');
}

uploadLatestYml().catch(err => {
  console.error(err);
  process.exit(1);
});
