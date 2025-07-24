const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    })
  );
}

async function main() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const version = packageJson.version;

    if (!version) {
      console.error('package.json 中没有找到 version 字段');
      process.exit(1);
    }

    const defaultTag = `v${version}`;

    // 询问用户输入 tag 名，默认使用 package.json 版本号
    let inputTag = await askQuestion(`请输入 tag 名（默认 ${defaultTag}）：`);
    inputTag = inputTag.trim() || defaultTag;

    // 获取已有 tags
    const existingTags = execSync('git tag', { encoding: 'utf8' })
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean);

    if (existingTags.includes(inputTag)) {
      console.log(`Tag "${inputTag}" 已存在，跳过创建`);
      process.exit(0);
    }

    // 创建 tag
    execSync(`git tag ${inputTag} -m "Add tag ${inputTag}"`, { stdio: 'inherit' });
    console.log(`创建 tag: ${inputTag}`);

    // 推送 tag
    execSync(`git push origin ${inputTag}`, { stdio: 'inherit' });
    console.log(`推送 tag ${inputTag} 到远程仓库`);
  } catch (error) {
    console.error('操作失败:', error);
    process.exit(1);
  }
}

main();
