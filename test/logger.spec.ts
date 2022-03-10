import { expect } from "chai";
import { afterEach } from "mocha";
import sinon from "sinon";
import {logger} from "../src/logger";

describe("/logger",()=>{
    afterEach(() =>{
        sinon.restore();
    });
    it("should log info",()=>{
        const stub = sinon.stub(logger,"info");
        logger.info("logging info");
        expect(stub.calledOnce).to.be.true;
    });
});