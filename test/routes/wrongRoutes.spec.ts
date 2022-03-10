process.env.NODE_ENV = 'test';
import app from '../../src/index';

import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp)

describe("Checking for simple /routes-does-not-exits get routes", () => {
    it("should return error object with status 404", (done) => {
        chai.request(app)
            .get("/routes-does-not-exits")
            .end((err, res) => {
                expect(res.status).to.equals(404);
                expect(res.body.type).to.equals("General");
                expect(res.body.message).to.equals('NOT_FOUND');
                expect(res.body.errors).to.eql([{
                    message: "Page not found",
                }]);
                done();
            });
    });
});
