import path from 'path';
import fs from 'fs';
import { homedir, tmpdir } from 'os';
import rc from 'rc';
import chalk from 'chalk';
import color from 'picocolors';
import { intro, outro, note, spinner } from '@clack/prompts';
import {
  argvValidate,
  downloadFromUrl,
  extractTargz,
  setPackageName,
  banner,
  createDir,
  copyToProjectDir,
  templateValueParse,
  getProjectNameFromPath
} from './utils';
import inquire from './inquire';
import help from './help';
import version from './version';

const main = async () => {
  const argv = rc('cafe', {});
  const cwd = process.cwd();
  const homeOrTemp = homedir() || tmpdir();
  const cafeHomeDir = path.resolve(homeOrTemp, '.cafe');
  const cacheDir = path.resolve(cafeHomeDir, '.cache');

  if (argvValidate(argv).error) {
    console.log(chalk.red(`Arg ${argvValidate(argv).error.message}`));
    process.exit(0);
  }

  const cfg = {
    name: argv._[0],
    template: argv.t || argv.template,
    help: argv.h || argv.help,
    version: argv.v || argv.version
  };

  if (cfg.help) {
    help();
    process.exit(0);
  }

  if (cfg.version) {
    version();
    process.exit(0);
  }

  banner();
  await createDir(cacheDir);

  intro(`${color.bgCyan(color.black(' Create Project '))}`);

  const ans = await inquire(cfg);
  const projectDir = path.resolve(cwd, ans.name);
  const projectName = getProjectNameFromPath(projectDir);
  const template = templateValueParse(ans.template, ans.gitProvider);

  const s = spinner();
  s.start('Downloading template...');

  const targzFilePath = path.resolve(cacheDir, 'myfile.tar.gz');
  const unzipDir = path.resolve(cacheDir, ans.name);

  await downloadFromUrl(template.url, targzFilePath);

  s.stop('Downloaded template');
  s.start('Extracting template...');

  await extractTargz(targzFilePath, unzipDir);
  fs.unlinkSync(targzFilePath); // deleted tar.gz file after extraction

  copyToProjectDir(unzipDir, projectDir);
  setPackageName(projectDir, projectName);

  s.stop('Extracted template');

  let nextSteps = `cd ${ans.name}        \nnpm install\nnpm dev`;
  note(nextSteps, 'Next steps.');

  outro(
    `Problems? ${color.underline(
      color.cyan('https://github.com/sagarpanda/create-cafe/issues')
    )}`
  );

  process.exit(0);
};

main().catch((e) => {
  console.error(e);
});
