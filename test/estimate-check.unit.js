'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const nock = require('nock');

const { expect } = chai;
chai.use(chaiAsPromised);

const { checkEstimates } = require('../lib/estimate-check');

describe('Check Estimates', () => {
  it('should reject if no filter is provided', () => {
    const options = {
      username: 'me',
      password: 'password',
      jira: 'http://my-jira',
    };

    return expect(checkEstimates('', options))
      .to.eventually.be.rejectedWith('No JQL');
  });

  it('should reject if no username is provided', () => {
    const options = {
      password: 'password',
      jira: 'http://my-jira',
    };

    return expect(checkEstimates('search=this', options))
      .to.eventually.be.rejectedWith('No Auth');
  });

  it('should reject if no password is provided', () => {
    const options = {
      username: 'me',
      jira: 'http://my-jira',
    };

    return expect(checkEstimates('search=this', options))
      .to.eventually.be.rejectedWith('No Auth');
  });

  it('should reject if no Jira URL is provided', () => {
    const options = {
      username: 'me',
      password: 'password',
    };

    return expect(checkEstimates('search=this', options))
      .to.eventually.be.rejectedWith('No JIRA URL');
  });

  describe('when not authorized to query jira', () => {
    nock('http://my-jira')
      .get(/\/rest\/api\/.\/search/)
      .query(true)
      .reply(401, '401 - Unauthorized');

    it('should reject', () => {
      const options = {
        username: 'me',
        password: 'password',
        jira: 'http://my-jira',
      };

      return expect(checkEstimates('search=this', options))
        .to.eventually.be.rejectedWith('NotAuthorized');
    });
  });

  describe('when failed to query Jira', () => {
    nock('http://my-jira')
      .get(/\/rest\/api\/.\/search/)
      .query(true)
      .reply(500, 'BOOM');

    it('should reject', () => {
      const options = {
        username: 'me',
        password: 'password',
        jira: 'http://my-jira',
      };

      return expect(checkEstimates('search=this', options))
        .to.eventually.be.rejectedWith('BOOM');
    });
  });

  describe('when no issues returned from query', () => {
    nock('http://my-jira')
      .get(/\/rest\/api\/.\/search/)
      .query(true)
      .reply(200, {
        issues: null,
      });

    it('should reject', () => {
      const options = {
        username: 'me',
        password: 'password',
        jira: 'http://my-jira',
      };

      return expect(checkEstimates('search=this', options))
        .to.eventually.be.rejectedWith('No Issues Found');
    });
  });

  describe('when query does not return an array of issues', () => {
    nock('http://my-jira')
      .get(/\/rest\/api\/.\/search/)
      .query(true)
      .reply(200, {
        issues: 'not-an-array',
      });

    it('should reject', () => {
      const options = {
        username: 'me',
        password: 'password',
        jira: 'http://my-jira',
      };

      return expect(checkEstimates('search=this', options))
        .to.eventually.be.rejectedWith('No Issues Found');
    });
  });

  describe('when query returns an empty array of issues', () => {
    nock('http://my-jira')
      .get(/\/rest\/api\/.\/search/)
      .query(true)
      .reply(200, {
        issues: [],
      });

    it('should reject', () => {
      const options = {
        username: 'me',
        password: 'password',
        jira: 'http://my-jira',
      };

      return expect(checkEstimates('search=this', options))
        .to.eventually.be.rejectedWith('No Issues Found');
    });
  });

  describe('when query returns issues', () => {
    const response = {
      issues: [
        {
          key: 'ISSUE-18127',
          fields: {
            issuetype: {
              name: 'Task',
            },
            created: '2017-09-05T11:45:10.000-0400',
            description: 'Do Something NOW!.',
            summary: 'Do Something.',
            customfield_12028: 1,
          },
          changelog: {
            histories: [
              {
                created: '2017-09-05T11:59:33.680-0400',
                items: [
                  {
                    field: 'status',
                    from: '1',
                    fromString: 'Open',
                    to: '2',
                    toString: 'In Progress',
                  },
                ],
              },
              {
                created: '2017-09-18T10:00:13.610-0400',
                items: [
                  {
                    field: 'timeestimate',
                    from: null,
                    fromString: null,
                    to: '0',
                    toString: '0',
                  },
                  {
                    field: 'status',
                    from: '2',
                    fromString: 'In Progress',
                    to: '3',
                    toString: 'Closed',
                  },
                ],
              },
            ],
          },
        },
        {
          key: 'ISSUE-18128',
          fields: {
            issuetype: {
              name: 'Bug',
            },
            created: '2017-09-05T11:45:10.000-0400',
            description: 'Fix Something NOW!.',
            summary: 'Fix Something.',
            customfield_12028: 3,
          },
          changelog: {
            histories: [
              {
                created: '2017-09-05T11:59:33.680-0400',
                items: [
                  {
                    field: 'status',
                    from: '1',
                    fromString: 'Open',
                    to: '2',
                    toString: 'In Progress',
                  },
                ],
              },
              {
                created: '2017-09-10T10:00:13.610-0400',
                items: [
                  {
                    field: 'timeestimate',
                    from: null,
                    fromString: null,
                    to: '0',
                    toString: '0',
                  },
                  {
                    field: 'status',
                    from: '2',
                    fromString: 'In Progress',
                    to: '3',
                    toString: 'Closed',
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    nock('http://my-jira')
      .get(/\/rest\/api\/.\/search/)
      .query(true)
      .reply(200, response);

    it('should resolve', () => {
      const options = {
        username: 'me',
        password: 'password',
        jira: 'http://my-jira',
        storyPointField: 'customfield_12028',
      };

      return expect(checkEstimates('search=this', options))
        .to.eventually.be.fulfilled
        .and.deep.equals([
          {
            key: 'ISSUE-18127',
            description: 'Do Something NOW!.',
            type: 'Task',
            created: '2017-09-05T11:45:10.000-0400',
            progress: [
              {
                date: '2017-09-05T11:59:33.680-0400',
                from: 'Open',
                to: 'In Progress',
              },
              {
                date: '2017-09-18T10:00:13.610-0400',
                from: 'In Progress',
                to: 'Closed',
              },
            ],
            actualDuration: 9,
            estimate: 1,
            currentStatus: 'Closed',
          },
          {
            key: 'ISSUE-18128',
            description: 'Fix Something NOW!.',
            type: 'Bug',
            created: '2017-09-05T11:45:10.000-0400',
            progress: [
              {
                date: '2017-09-05T11:59:33.680-0400',
                from: 'Open',
                to: 'In Progress',
              },
              {
                date: '2017-09-10T10:00:13.610-0400',
                from: 'In Progress',
                to: 'Closed',
              },
            ],
            actualDuration: 4,
            estimate: 3,
            currentStatus: 'Closed',
          },
        ]);
    });
  });

  describe('when query returns an issue which is not closed', () => {
    const response = {
      issues: [
        {
          key: 'ISSUE-18127',
          fields: {
            issuetype: {
              name: 'Task',
            },
            created: '2017-09-05T11:45:10.000-0400',
            description: 'Do Something NOW!.',
            summary: 'Do Something.',
            customfield_12028: 1,
          },
          changelog: {
            histories: [
              {
                created: '2017-09-05T11:59:33.680-0400',
                items: [
                  {
                    field: 'status',
                    from: '1',
                    fromString: 'Open',
                    to: '2',
                    toString: 'In Progress',
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    nock('http://my-jira')
      .get(/\/rest\/api\/.\/search/)
      .query(true)
      .reply(200, response);

    it('should resolve', () => {
      const options = {
        username: 'me',
        password: 'password',
        jira: 'http://my-jira',
        storyPointField: 'customfield_12028',
      };

      return expect(checkEstimates('search=this', options))
        .to.eventually.be.fulfilled
        .and.deep.equals([
          {
            key: 'ISSUE-18127',
            description: 'Do Something NOW!.',
            type: 'Task',
            created: '2017-09-05T11:45:10.000-0400',
            progress: [
              {
                date: '2017-09-05T11:59:33.680-0400',
                from: 'Open',
                to: 'In Progress',
              },
            ],
            actualDuration: -1,
            estimate: 1,
            currentStatus: 'In Progress',
          },
        ]);
    });
  });

  describe('when query returns an issue which is not started', () => {
    const response = {
      issues: [
        {
          key: 'ISSUE-18127',
          fields: {
            issuetype: {
              name: 'Task',
            },
            created: '2017-09-05T11:45:10.000-0400',
            description: 'Do Something NOW!.',
            summary: 'Do Something.',
            customfield_12028: 1,
          },
          changelog: {
            histories: [
              {
                created: '2017-09-05T11:59:33.680-0400',
                items: [],
              },
            ],
          },
        },
      ],
    };

    nock('http://my-jira')
      .get(/\/rest\/api\/.\/search/)
      .query(true)
      .reply(200, response);

    it('should resolve', () => {
      const options = {
        username: 'me',
        password: 'password',
        jira: 'http://my-jira',
        storyPointField: 'customfield_12028',
      };

      return expect(checkEstimates('search=this', options))
        .to.eventually.be.fulfilled
        .and.deep.equals([
          {
            key: 'ISSUE-18127',
            description: 'Do Something NOW!.',
            type: 'Task',
            created: '2017-09-05T11:45:10.000-0400',
            progress: [],
            actualDuration: -1,
            estimate: 1,
            currentStatus: 'Open',
          },
        ]);
    });
  });

  describe('when query returns an issue which is only verified', () => {
    const response = {
      issues: [
        {
          key: 'ISSUE-18127',
          fields: {
            issuetype: {
              name: 'Task',
            },
            created: '2017-09-05T11:45:10.000-0400',
            description: 'Do Something NOW!.',
            summary: 'Do Something.',
            customfield_12028: 1,
          },
          changelog: {
            histories: [
              {
                created: '2017-09-05T11:59:33.680-0400',
                items: [
                  {
                    field: 'status',
                    from: '1',
                    fromString: 'Open',
                    to: '2',
                    toString: 'In Progress',
                  },
                ],
              },
              {
                created: '2017-09-18T10:00:13.610-0400',
                items: [
                  {
                    field: 'timeestimate',
                    from: null,
                    fromString: null,
                    to: '0',
                    toString: '0',
                  },
                  {
                    field: 'status',
                    from: '2',
                    fromString: 'In Progress',
                    to: '3',
                    toString: 'Verified',
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    nock('http://my-jira')
      .get(/\/rest\/api\/.\/search/)
      .query(true)
      .reply(200, response);

    it('should resolve', () => {
      const options = {
        username: 'me',
        password: 'password',
        jira: 'http://my-jira',
        storyPointField: 'customfield_12028',
      };

      return expect(checkEstimates('search=this', options))
        .to.eventually.be.fulfilled
        .and.deep.equals([
          {
            key: 'ISSUE-18127',
            description: 'Do Something NOW!.',
            type: 'Task',
            created: '2017-09-05T11:45:10.000-0400',
            progress: [
              {
                date: '2017-09-05T11:59:33.680-0400',
                from: 'Open',
                to: 'In Progress',
              },
              {
                date: '2017-09-18T10:00:13.610-0400',
                from: 'In Progress',
                to: 'Verified',
              },
            ],
            actualDuration: 9,
            estimate: 1,
            currentStatus: 'Verified',
          },
        ]);
    });
  });
});
