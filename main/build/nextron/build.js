const fs = require('fs-extra');
const path = require('path');
const arg = require('arg');
const chalk = require('chalk');
const execa = require('execa');
const logger = require('./logger');
const getNextronConfig = require('./configs/getNextronConfig');

const args = arg({
  '--mac': Boolean,
  '--linux': Boolean,
  '--win': Boolean,
  '--x64': Boolean,
  '--ia32': Boolean,
  '--armv7l': Boolean,
  '--arm64': Boolean,
  '--universal': Boolean,
  '--config': String,
  '--publish': String,
  '--no-pack': Boolean,
});

const cwd = process.cwd();
const appDir = path.join(cwd, 'build/app');
const distDir = path.join(cwd, 'build/dist');
const rendererSrcDir = getNextronConfig().rendererSrcDir || 'renderer';
const execaOptions = {
  cwd,
  stdio: 'inherit',
};

(async () => {
  // Ignore missing dependencies
  process.env.ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = 'true';

  try {
    logger.info('Clearing previous builds');
    await Promise.all([fs.remove(appDir), fs.remove(distDir)]);

    logger.info('Building renderer process');
    const useLocal = process.env.LOCAL_COMPILE == 'true' || true;
    if (useLocal) {
      await execa('next', ['build', path.join(cwd, rendererSrcDir)], execaOptions);
      await Promise.all([fs.moveSync(path.join(rendererSrcDir, '../build/out'), appDir)]);
    } else {
      await Promise.all([fs.copySync(path.join(rendererSrcDir, 'public/static'), path.join(appDir, 'static'))]);
    }

    logger.info('Building main process');
    await execa('node', [path.join(__dirname, './configs/webpack.config.production.js')], execaOptions);

    if (args['--no-pack']) {
      logger.info('Skip packaging...');
    } else {
      logger.info('Packaging - please wait a moment');
      await execa('electron-builder', createBuilderArgs(), execaOptions);
    }

    logger.info('See `build/dist` directory');
  } catch (err) {
    console.log(chalk`

{bold.red Cannot build electron packages:}
{bold.yellow ${err}}
`);
    process.exit(1);
  }
})();

function createBuilderArgs() {
  const results = [];

  if (args['--config']) {
    results.push('--config');
    results.push(args['--config'] || 'electron-builder.yml');
  }

  if (args['--publish']) {
    results.push('--publish');
    results.push(args['--publish']);
  }

  args['--mac'] && results.push('--mac');
  args['--linux'] && results.push('--linux');
  args['--win'] && results.push('--win');
  args['--x64'] && results.push('--x64');
  args['--ia32'] && results.push('--ia32');
  args['--armv7l'] && results.push('--armv7l');
  args['--arm64'] && results.push('--arm64');
  args['--universal'] && results.push('--universal');

  return results;
}
