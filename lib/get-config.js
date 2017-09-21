'use strict';

const { promisifyAll } = require('bluebird');
const fs = promisifyAll(require('fs'));
const { homedir } = require('os');
const path = require('path');
const prompt = promisifyAll(require('prompt'));

const configFile = path.join(homedir(), '.estimate-check');

function createConfigFile() {
  const schema = {
    properties: {
      jira: {
        message: 'The url to Jira (i.e. https://jira.mydomain.com)',
        required: true,
      },
      username: {
        message: 'The name you use to log into Jira',
        required: true,
      },
      password: {
        message: 'Your Jira password (will not be shown)',
        hidden: true,
        required: true,
      },
      storyPointField: {
        message: 'The name of the custom field for Story Points',
        default: 'customfield_12028',
      },
    },
  };

  prompt.start();
  /* eslint-disable no-console */
  console.log('\nWe need your credentials to log into Jira.');
  console.log('We\'ll save them locally but won\'t share them.');
  console.log('Its just so you don\'t have to keep entering them.');
  console.log('You can delete the saved credentials later with the --destoryconfig flag.\n');
  /* eslint-enable no-console */

  return prompt.getAsync(schema)
    .then(input => (
      fs.writeFileAsync(configFile, JSON.stringify({
        jira: input.jira,
        username: input.username,
        password: input.password,
        storyPointField: input.storyPointField,
      }))
    ))
    .then(() => fs.readFileAsync(configFile));
}

module.exports = (destroyConfig) => {
  if (destroyConfig) {
    try {
      fs.unlinkSync(configFile);
    } catch (err) {
      if (!err.message.includes('no such file')) {
        return Promise.reject(new Error(`Failed to destroy saved config: ${err.message}`));
      }
    }
  }

  return fs.readFileAsync(configFile)
    .catch(() => createConfigFile())
    .then(data => JSON.parse(data));
};
