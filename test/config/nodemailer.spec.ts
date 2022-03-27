import { expect } from "chai";
import { afterEach } from "mocha";
import sinon from "sinon";
import { Nodemailer } from "../../src/config/nodemailer.config";
import { logger } from "../../src/logger";

describe("/config/nodemailer", () => {
    afterEach(() => {
        sinon.restore();
    });

    it.skip("should send email for confirmation user email", async () => {
        const nodemailer = new Nodemailer();
        logger.debug(nodemailer);
        const stub = sinon.stub(nodemailer, "sendEmailConfirmation");
        await nodemailer.sendEmailConfirmation("name", "email", "token");
        expect(stub.calledOnce).to.be.true;
    });
})