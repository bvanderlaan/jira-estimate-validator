'use strict';

const { expect } = require('chai');
const { oneLineTrim } = require('common-tags');
const { jsonFormatter } = require('../../lib/formatters');

describe('JSON Formatter', () => {
  it('should stringify the data', () => {
    const data = [
      {
        key: 'ISSUE-18127',
        description: 'Do Stuff.',
        type: 'Task',
        created: '2017-09-05T11:59:31.000-0400',
        estimate: 3,
        progress: [
          {
            date: '2017-09-06T15:22:01.093-0400',
            from: 'Open',
            to: 'In Progress',
          },
          {
            date: '2017-09-15T17:55:16.867-0400',
            from: 'In Progress',
            to: 'Resolved',
          },
          {
            date: '2017-09-18T10:00:13.610-0400',
            from: 'Resolved',
            to: 'Closed',
          },
        ],
        actualDuration: 8,
        currentStatus: 'Closed',
      },
      {
        key: 'ISSUE-18126',
        description: 'Fix Stuff.',
        type: 'Bug',
        created: '2017-09-05T11:45:10.000-0400',
        estimate: 1,
        progress: [
          {
            date: '2017-09-05T11:47:12.580-0400',
            from: 'Open',
            to: 'In Progress',
          },
          {
            date: '2017-09-06T09:31:18.333-0400',
            from: 'In Progress',
            to: 'Review',
          },
          {
            date: '2017-09-06T11:36:32.070-0400',
            from: 'Review',
            to: 'Resolved',
          },
          {
            date: '2017-09-12T10:12:21.260-0400',
            from: 'Resolved',
            to: 'Verified',
          },
          {
            date: '2017-09-15T10:20:14.757-0400',
            from: 'Verified',
            to: 'Closed',
          },
        ],
        actualDuration: 8,
        currentStatus: 'Closed',
      },
    ];

    expect(jsonFormatter(data)).to.equals(oneLineTrim`[{"key":"ISSUE-18127",
      "description":"Do Stuff.","type":"Task",
      "created":"2017-09-05T11:59:31.000-0400","estimate":3,"progress":[
        {"date":"2017-09-06T15:22:01.093-0400","from":"Open",
          "to":"In Progress"},
        {"date":"2017-09-15T17:55:16.867-0400","from":"In Progress",
          "to":"Resolved"},
        {"date":"2017-09-18T10:00:13.610-0400","from":"Resolved",
          "to":"Closed"}],
        "actualDuration":8,"currentStatus":"Closed"},
        {"key":"ISSUE-18126","description":"Fix Stuff.","type":"Bug",
          "created":"2017-09-05T11:45:10.000-0400","estimate":1,"progress":[
            {"date":"2017-09-05T11:47:12.580-0400","from":"Open",
              "to":"In Progress"},
            {"date":"2017-09-06T09:31:18.333-0400","from":"In Progress",
              "to":"Review"},
            {"date":"2017-09-06T11:36:32.070-0400","from":"Review",
              "to":"Resolved"},
            {"date":"2017-09-12T10:12:21.260-0400","from":"Resolved",
              "to":"Verified"},
            {"date":"2017-09-15T10:20:14.757-0400","from":"Verified",
              "to":"Closed"}],
          "actualDuration":8,"currentStatus":"Closed"}]`);
  });
});
