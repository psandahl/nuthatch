import { expect } from 'chai';
import { describe } from 'mocha';

describe('dummy', () => {
    it('This should fail ', () => {
        expect(0).to.equal(1);
    });

    it('This should succeed ', () => {
        expect(0).to.equal(0);
    });
});
