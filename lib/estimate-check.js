'use strict';

const request = require('request-promise').defaults({ json: true });

const { createTicket } = require('./jiraParser');

const searchAPI = 'rest/api/2/search';

module.exports = {
  checkEstimates(filter, options) {
    if (!filter) {
      return Promise.reject(new Error('No JQL'));
    }

    if (!options.username || !options.password) {
      return Promise.reject(new Error('No Auth'));
    }

    if (!options.jira) {
      return Promise.reject(new Error('No JIRA URL'));
    }

    return request.get(`${options.jira}/${searchAPI}?jql=${filter}&expand=changelog`)
      .auth(options.username, options.password)
      .catch((err) => {
        if (err.message.includes('401 - Unauthorized')) {
          throw new Error('NotAuthorized');
        }
        throw err;
      })
      .then((result) => {
        const { issues } = result;
        if (!issues || !Array.isArray(issues) || issues.length === 0) {
          return Promise.reject(new Error('No Issues Found'));
        }

        const data = issues.map(issue => createTicket(issue, options.storyPointField));
        return Promise.resolve(data);
      });
  },
};
