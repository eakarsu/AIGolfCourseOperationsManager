'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluate } = require('../domain');

test('domain workflow accepts a reviewable, grounded case', () => {
  const evaluation = evaluate({
  teeSlots: [{ id: 'slot-1', date: '2026-08-01', time: '08:00', capacity: 4, price: 80 }],
  bookings: [{ id: 'book-1', slotId: 'slot-1', players: 4, amountPaid: 320, refund: 0 }],
  maintenance: [], weather: []
});
  assert.deepEqual(evaluation.errors, []);
  assert.equal(evaluation.result.decision, 'reviewable');
  assert.ok(Array.isArray(evaluation.assumptions));
  assert.equal(typeof evaluation.uncertainty, 'object');
});

test('domain workflow fails closed on unsafe or incomplete input', () => {
  const evaluation = evaluate({ teeSlots: [{ id: 's', date: '2026-08-01', time: '08:00', capacity: 2, price: 10 }], bookings: [{ id: 'b', slotId: 's', players: 3, paymentData: 'raw' }], maintenance: [] });
  assert.ok(evaluation.errors.length > 0);
  assert.notEqual(evaluation.result.decision, 'reviewable');
});
