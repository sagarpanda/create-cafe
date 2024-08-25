import chalk from 'chalk';
import { banner } from './utils';
import packageJson from '../package.json';

const version = () => {
  banner();
  console.log(chalk.cyanBright(`version .... v${packageJson.version}\n`));
};

export default version;
