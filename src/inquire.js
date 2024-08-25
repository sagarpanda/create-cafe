import { isCancel, cancel, text, select } from '@clack/prompts';
import { getTemplates, toTitleCase } from './utils';

export const check = (value, cancelMsg) => {
  const msg = cancelMsg || 'Operation cancelled.';
  if (isCancel(value)) {
    cancel(msg);
    process.exit(0);
  }
  return value;
};

const inquireName = async (defaultName) => {
  let name = defaultName;
  if (!name) {
    name = check(
      await text({
        message: 'Where should we create your project',
        placeholder: 'my-project',
        validate: (txt) => {
          if (!txt || txt.trim().length === 0) {
            return 'Project name is required';
          } else if (/\s/g.test(txt)) {
            return 'Space is not allowed';
          }
        }
      })
    );
  }
  return name;
};

const inquireTemplate = async (templateValue) => {
  let value = templateValue;
  if (!templateValue) {
    const templateOptions = Object.entries(getTemplates()).map(([key, val]) => {
      return { label: toTitleCase(key), value: val };
    });
    value = check(
      await select({
        message: 'Select a project template',
        options: templateOptions.concat([
          { label: 'None of the above', value: 'nota' }
        ])
      })
    );
    if (value === 'nota') {
      value = check(
        await text({
          message: 'Enter your custom template',
          placeholder: 'github.com:username/repo'
        })
      );
    }
  }
  return value;
};

const inquireGitProvider = async (templateValue) => {
  let gitProvider = ['github', 'gitlab'].filter((item) => {
    return templateValue.includes(item);
  })[0];

  if (!gitProvider) {
    gitProvider = check(
      await select({
        message: `Select the git provider for ${templateValue}?`,
        options: [
          { label: 'Github', value: 'github' },
          { label: 'Gitlab', value: 'gitlab' }
        ]
      })
    );
  }
  return gitProvider;
};

const inquire = async (cfg) => {
  const name = await inquireName(cfg.name);
  const template = await inquireTemplate(cfg.template);
  const gitProvider = await inquireGitProvider(template);

  return {
    name,
    template,
    gitProvider
  };
};

export default inquire;
