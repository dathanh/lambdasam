'use strict';

const index = require('../../index.js');
const chai = require('chai');
const expect = chai.expect;
var event, context;


describe('Tests index', function () {
    it('verifies successful response', async () => {
		data= index.handler;
           expect(data).to.be.equal("hello");

    });
});

