process.env.NODE_ENV = 'test';
import app from '../../src/index';

import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp)

describe("Checking for simple /errors get routes", () => {
    it("should return error object with status 500", (done) => {
        chai.request(app)
            .get("/errors")
            .end((err, res) => {
                expect(res.status).to.equals(500);
                expect(res.body.type).to.equals("Application");
                expect(res.body.message).to.equals("INTERNAL_SERVER_ERROR");
                expect(res.body.errors).to.eql([{
                    message: "Something went wrong",
                }]);
                done();
            });
    });
});
