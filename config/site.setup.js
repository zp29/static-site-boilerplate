/* eslint-disable */
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

const { prompt } = require('enquirer');

const skip_setup = process.env.SKIP_SETUP || false;

let ROOT = process.env.PWD;

if (!ROOT) {
  ROOT = process.cwd();
}

async function runSetup() {
  clear();
  console.log( chalk.yellow(figlet.textSync('29' )) );

  const questions = await prompt([
    {
      type: 'input',
      name: 'site_name',
      message: 'What is the name of your website?',
      initial: 'Static Site Boilerplate'
    },
    {
      type: 'input',
      name: 'site_description',
      message: 'What is a description of your website?',
      initial: 'A modern boilerplate for static website development'
    },
    {
      type: 'input',
      name: 'site_url',
      message: 'What is the live URL for your website?',
      hint: 'http://yourwebsite.com'
    },
    {
      type: 'select',
      name: 'styles',
      message: 'CSS extension language?',
      choices: ['less', 'sass', 'scss', 'None'],
    },
    {
      type: 'select',
      name: 'cssreset',
      message: 'Which CSS reset library would you like installed?',
      choices: ['None', 'normalize.css', 'reset.css'],
    },
    {
      type: 'select',
      name: 'jquery',
      message: 'Would you like jQuery installed?',
      choices: ['No', 'Yes'],
    }
  ]);

  // Update site configuration
  fs.readFile('./config/site.config.js', 'utf8', (err, data) => {
    if (typeof questions.site_name !== 'undefined') {
      data = data.replace(/site_name: '.*?'/g, `site_name: '${questions.site_name}'`);
    }
    if (typeof questions.site_description !== 'undefined') {
      data = data.replace(/site_description: '.*?'/g, `site_description: '${questions.site_description}'`);
    }
    if (typeof questions.site_url !== 'undefined') {
      data = data.replace(/site_url: '.*?'/g, `site_url: '${questions.site_url}'`);
    }
    if (typeof questions.styles !== 'undefined') {
      data = data.replace(/dev_styles: '.*?'/g, `dev_styles: '${questions.styles}'`);
    }
    fs.writeFile(path.join(ROOT, '/config/site.config.js'), data, 'utf8', (err) => { });
  });

  // Add CSS reset to stylesheet
  if (questions.styles !== 'None') {
    let styles = questions.styles,
        isLess = styles == 'less',
        isSass = styles == 'sass',
        isScss = styles == 'scss'
    if (questions.cssreset !== 'None') {
      let isNormalizePath = questions.cssreset === 'normalize.css',
          isResetPath    = questions.cssreset === 'reset.css',
          normalizePath = `node_modules/normalize.css/normalize.css`,
          resetPath     = `node_modules/reset-css/reset.css`,
          path          = isNormalizePath ? normalizePath : isResetPath ? resetPath : ''
          lesscontent   = `@import "../../${path}"` + '\n',
          sasscontent   = '@import "~' + questions.cssreset + '"\n'
          StyleContent  = isLess ? lesscontent : sasscontent
      console.log('site.setup.js StyleContent ->', StyleContent);
      fs.writeFile(path.join(ROOT, `/src/stylesheets/styles.${questions.styles}`), StyleContent, (err) => {});
    } else {
      fs.writeFile(path.join(ROOT, `/src/stylesheets/styles.${questions.styles}`), '', (err) => {});
    }
  } else {
    fs.writeFile(path.join(ROOT, `/src/stylesheets/styles.css`), '', (err) => {});
  }

  // Add jQuery to scripts
  if (questions.jquery == 'Yes') {
    const jsContent =
      '// Load jQuery from NPM\n'
      + 'import $ from \'jquery\';\n\n'
      + 'window.jQuery = $;\n'
      + 'window.$ = $;\n';

    fs.writeFile(path.join(ROOT, '/src/javascripts/scripts.js'), jsContent, (err) => {});
  }
};

if (!skip_setup) {
  runSetup();
}
