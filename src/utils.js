import https from 'https';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import Joi from 'joi';
import slugify from 'slugify';
import chalk from 'chalk';
import figlet from 'figlet';
import decompress from '@xhmikosr/decompress';
import decompressTargz from '@xhmikosr/decompress-targz';
import templates from './templates.json';

const schema = Joi.object({
  _: Joi.array().items(Joi.string()).max(1),
  t: Joi.string(),
  template: Joi.string(),
  h: Joi.bool(),
  help: Joi.bool(),
  v: Joi.bool(),
  token: Joi.string(),
  version: Joi.bool(),
  configs: Joi.array().items(Joi.string()),
  config: Joi.string()
});

export const argvValidate = (data) => {
  return schema.validate(data);
};

export const getTemplates = () => {
  return templates;
};

export const slug = (name) => {
  return slugify(name, {
    replacement: '-',
    remove: undefined,
    lower: true,
    strict: true,
    trim: true
  });
};

export const toPascalCase = (str) => {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
    .join('');
};

export const toTitleCase = (str) => {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.slice(0, 1).toUpperCase() + x.slice(1))
    .join(' ');
};

export const banner = () => {
  console.log(
    chalk.yellow(figlet.textSync('Cafe Js', { horizontalLayout: 'full' }))
  );
};

const fetchFromUrl = async (url, file) => {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      response
        .pipe(file)
        .on('finish', () => {
          file.close();
          resolve(request);
        })
        .on('error', () => {
          reject(err);
        });
    });
  });
};

export const downloadFromUrl = async (url, filename) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    const request = https.get(url, (response) => {
      if (response.statusCode >= 400) {
        reject(response);
      } else if (response.statusCode >= 300) {
        fetchFromUrl(response.headers.location, file).then(resolve);
      } else {
        response
          .pipe(file)
          .on('finish', () => {
            file.close();
            resolve(request);
          })
          .on('error', () => {
            reject(err);
          });
      }
    });
  });
};

export const extractTargz = async (sourcePath, targetPath) => {
  const extracts = await decompress(sourcePath, targetPath, {
    plugins: [decompressTargz()]
  });
  return extracts;
};

export const setPackageName = (targetDir, name) => {
  const cwd = process.cwd();
  process.chdir(targetDir);
  execSync(`npm pkg set name=${name}`);
  process.chdir(cwd);
};

export const createDir = (dirPath) => {
  return new Promise((resolve, reject) => {
    fs.access(dirPath, (err) => {
      if (err) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      resolve(true);
    });
  });
};

export const copyToProjectDir = (unzipDir, projectDir) => {
  const subDirName = fs.readdirSync(unzipDir)[0];
  const subDirPath = path.resolve(unzipDir, subDirName);
  fs.cpSync(subDirPath, projectDir, {
    recursive: true
  });
  fs.rmSync(unzipDir, { recursive: true, force: true });
};

export const templateValueParse = (value, gitProvider, token) => {
  const domains = {
    github: 'https://github.com',
    gitlab: 'https://gitlab.com'
  };

  const splitValue = value.split(':');
  const splitValue2 = splitValue[1].split('#');

  const domain = domains[splitValue[0]] || `https://${splitValue[0]}`;
  const branch = splitValue2[1] || 'master';
  const relRepoUrl = splitValue2[0];

  let url = `${domain}/${relRepoUrl}/archive/refs/heads/${branch}.tar.gz`;
  if (gitProvider === 'gitlab') {
    const queryString = token ? `?private_token=${token}` : '';
    const lastItem = relRepoUrl.split('/').pop();
    url = `${domain}/${relRepoUrl}/-/archive/${branch}/${lastItem}-${branch}.tar.gz${queryString}`;
  }

  return {
    domain,
    branch,
    relRepoUrl,
    url
  };
};

export const getProjectNameFromPath = (fullPath) => {
  const projectName = fullPath
    .replace(/\\/g, '/') // for windows
    .split('/')
    .pop();
  return projectName;
};
