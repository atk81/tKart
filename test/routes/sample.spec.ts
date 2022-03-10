process.env.NODE_ENV = 'test';
import app from '../../src/index';

import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp)

describe("Checking for simple / get routes", () => {
    it("should return json object with status 200", (done) => {
        chai.request(app)
            .get("/")
            .end((err, res) => {
                expect(res.status).to.equals(200);
                expect(res.body.message).to.equals("Hello World");
                expect(res.body.data).to.equals(null);
                done();
            });
    });
});
