import chalk from 'chalk';
import { banner } from './utils';

const msg1 = `\nnpm create cafe`;
const msg2 = `
--help ........ (optional) show help
--version ..... (optional) show version

`;

const help = () => {
  banner();
  console.log(chalk.cyanBright(msg1));
  console.log(chalk.cyan(msg2));
};

export default help;
