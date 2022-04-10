import { Document, model, Schema } from "mongoose";

export interface IAddress extends Document{
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phoneNo: string;
}

export const AddressSchema = new Schema<IAddress>({
    name: {
        type: String,
        required: [true, "Delivery name is required"],
    },
    address: {
        type: String,
        required: [true, "Delivery address is required"],
    },
    city: {
        type: String,
        required: [true, "Delivery city is required"],
    },
    state: {
        type: String,
        required: [true, "Delivery state is required"],
    },
    zip: {
        type: String,
        required: [true, "Delivery zip is required"],
    },
    phoneNo: {
        type: String,
        required: [true, "Delivery phoneNo is required"],
    },
});

const Address = model<IAddress>("Address", AddressSchema);
export default {
    Address,
}
