'use strict';

const { expect } = require('chai');

const { numberOfWorkDays } = require('../lib/date-range');

describe('Date Range', () => {
  describe('Number of Work Days', () => {
    it('should return 5 work days', () => {
      expect(numberOfWorkDays(new Date(2017, 8, 18), new Date(2017, 8, 22)))
        .to.equals(5);
    });

    it('should not count weekends (Sunday/Saturday)', () => {
      expect(numberOfWorkDays(new Date(2017, 8, 17), new Date(2017, 8, 23)))
        .to.equals(5);
    });

    it('should work across Months', () => {
      expect(numberOfWorkDays(new Date(2017, 8, 28), new Date(2017, 9, 3)))
        .to.equals(4);
    });

    it('should work across Years', () => {
      expect(numberOfWorkDays(new Date(2017, 11, 27), new Date(2018, 0, 4)))
        .to.equals(7);
    });
  });
});
