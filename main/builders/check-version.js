const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getVersion() {
  const pkgPath = path.resolve(__dirname, '../../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  return pkg.version;
}

function tagExists(tag) {
  try {
    execSync(`git rev-parse ${tag}`, { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}

function createAndPushTag(tag) {
  try {
    execSync('git config user.name "github-actions[bot]"');
    execSync('git config user.email "github-actions[bot]@users.noreply.github.com"');
    execSync(`git tag -a ${tag} -m "Release ${tag}"`);
    execSync(`git push origin ${tag}`);
    console.log(`✅ Tag ${tag} created and pushed successfully.`);
  } catch (err) {
    console.error(`❌ Failed to create or push tag ${tag}:`, err.message);
    process.exit(1);
  }
}

// 主流程
const version = getVersion();
const tag = `v${version}`;

if (tagExists(tag)) {
  console.log(`Tag ${tag} already exists. Nothing to do.`);
} else {
  console.log(`Tag ${tag} does not exist. Creating...`);
  createAndPushTag(tag);
}
