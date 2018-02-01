'use strict';

const test = require('tape');
import utils from '../src/utils';

test('Directions#utils', tt => {
  tt.test('roundWithOriginalPrecision', (t) => {
    t.equal(utils.roundWithOriginalPrecision(11.1000000, 11.1), '11.1');
    t.equal(utils.roundWithOriginalPrecision(11.1000000, 11.1000000000), '11.1');
    t.equal(utils.roundWithOriginalPrecision(11.1234567, 11.1234567890), '11.12346');
    t.equal(utils.roundWithOriginalPrecision(11.0000000, 11), '11');

    t.end();
  });

  tt.end();
});
