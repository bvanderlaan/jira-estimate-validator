'use strict';

const dateRange = require('./date-range');

function getStatusChanges(historicalEvent) {
  return historicalEvent.items.filter(change => change.field === 'status')
    .map(change => (
      {
        date: historicalEvent.created,
        from: change.fromString,
        to: change.toString,
      }
    ));
}

function getStatusChangeHistory(history) {
  return history.reduce((statusChanges, historicalEvent) => (
    statusChanges.concat(getStatusChanges(historicalEvent))
  ), []);
}

function calculateActualTime(progress) {
  let actualDuration = -1;
  if (progress.length > 1) {
    const lastEvent = progress[progress.length - 1];
    if (lastEvent.to === 'Verified' || lastEvent.to === 'Closed') {
      const startDate = new Date(progress[0].date);
      const endDate = new Date(lastEvent.date);
      actualDuration = dateRange.numberOfWorkDays(startDate, endDate);
    }
  }

  return actualDuration;
}

function getCurrentStatus(progress) {
  if (progress.length > 0) {
    return progress[progress.length - 1].to;
  } else if (progress.length === 1) {
    return progress[0].to;
  }
  return 'Open';
}

module.exports = {
  createTicket(issue, storyPointField) {
    const ticket = {
      key: issue.key,
      description: issue.fields.description,
      type: issue.fields.issuetype.name,
      created: issue.fields.created,
      estimate: issue.fields[storyPointField],
      progress: getStatusChangeHistory(issue.changelog.histories),
    };
    ticket.actualDuration = calculateActualTime(ticket.progress);
    ticket.currentStatus = getCurrentStatus(ticket.progress);

    return ticket;
  },
};
