import { expect } from "chai";
import { afterEach } from "mocha";
import sinon from "sinon";
import {Cloudinary} from "../../src/config/cloudinary.config";

describe("/config/cloudinary", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("should upload image", async () => {
        const stub = sinon.stub(Cloudinary.getInstance(), "uploadUsersProfile");
        stub.resolves({
            public_id: "public_id",
            secure_url: "secure_url",
        });
        const result = await Cloudinary.getInstance().uploadUsersProfile({
            photo: {
                tempFilePath: "tempFilePath",
            },
        });
        expect(stub.calledOnce).to.be.true;
        expect(result.public_id).to.equal("public_id");
        expect(result.secure_url).to.equal("secure_url");
    });

    it("two different Cloudinary instance should be same", () =>{
        const cloudinary1 = Cloudinary.getInstance();
        const cloudinary2 = Cloudinary.getInstance();
        expect(cloudinary1).to.equal(cloudinary2);
    });

    it("should config cloudinary", () => {
        const stub = sinon.stub(Cloudinary.getInstance(), "config");
        Cloudinary.getInstance().config();
        expect(stub.calledOnce).to.be.true;
    });
})