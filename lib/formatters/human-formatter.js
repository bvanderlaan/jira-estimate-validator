'use string';

const { stripIndents } = require('common-tags');

module.exports = data => (
  data.reduce((text, ticket) => (
    stripIndents`${text}
    ======================================
    Ticket: ${ticket.key} (${ticket.type})
    Description: ${ticket.description}
    Estimate: ${ticket.estimate} sp
    Actual Duration: ${ticket.actualDuration} days
    Current State: ${ticket.currentStatus}
    ======================================
    `
  ), '')
);

