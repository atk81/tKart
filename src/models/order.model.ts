import { Document, model, Schema } from "mongoose";
import { IAddress, AddressSchema } from "./address.model";

export interface IOrder extends Document{
    user: Schema.Types.ObjectId;
    products: {items:[{
        product: Schema.Types.ObjectId;
        name: string;
        price: number;
        quantity: number;
        total: number;
        orderStatus?: string;
        deliveryStatus?: boolean,
        deliveryDate?: Date,
        deliveryAddress?: IAddress,
    }]};
    total: number;
    payment: string;
    createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
    products: {
        items: [{
            // Links to the orginal product
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: [true, "Product is required"],
            },
            // Now store all the stall information like name, price, quantity, etc..., because original prouct information can change.
            name: {
                type: String,
                required: [true, "Product name is required"],
            },
            price: {
                type: Number,
                required: [true, "Product price is required"],
            },
            quantity: {
                type: Number,
                required: [true, "Quantity is required"],
                min: [1, "Quantity must be at least 1"],
            },
            total: {
                type: Number,
                required: [true, "Product total is required"],
            },
            orderStatus: {
                type: String,
                enum: ["pending", "processing", "completed", "cancelled"],
                default: "pending",
            },
            deliveryStatus: {
                type: Boolean,
                default: false,
            },
            deliveryDate: {
                type: Date,
            },
            // Diff. address for each product allows users to order multiple products for different address.
            deliveryAddress: AddressSchema
        }],
    },
    total: {
        type: Number,
        required: [true, "Total is required"],
        min: [0, "Total must be at least 0"],
    },
    payment: {
        type: String,
        required: [true, "Payment is required"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Order = model<IOrder>("Order", OrderSchema);
export default Order;
