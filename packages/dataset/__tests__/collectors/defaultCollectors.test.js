'use strict';

const collectors = require('../../lib/collectors');

test('MultipleChoiceCollector should aggregrate correctly', () => {
    expect(
        collectors.MultipleChoiceCollector.aggregated([
            'A',
            'A',
            'C',
        ])
    ).toEqual({
        value: "A",
        confidence: 2/3
    });
});
  
test('MultipleChoiceCollector should compute agreement correctly', () => {
    expect(
        collectors.MultipleChoiceCollector.agreement([
            'A',
            'B',
            'C',
        ])
    ).toBe(1/3);

    expect(
        collectors.MultipleChoiceCollector.agreement([
            'A',
            'A',
            'C',
        ])
    ).toBe(2/3);

});
  
