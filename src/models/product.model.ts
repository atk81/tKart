import {Schema, model, Document} from "mongoose";

export interface IProduct extends Document {
    name: string;
    price: number;
    discription: string;
    photos?: {
        id: string;
        secure_url: string;
    }[],
    category: string;
    brand: string;
    rating?: number;
    reviews?: string[];
    productOwner: string;
    createdAt: Date;
}

const ProductSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        maxlength: [120, "Name must be at most 120 characters"],
        minlength: [3, "Name must be at least 3 characters"],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be at least 0"],
    },
    discription: {
        type: String,
        required: [true, "Discription is required"],
    },
    photos: [{
        id: {
            type: String,
        },
        secure_url: {
            type: String,
        },
    }],
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: {
            values: ["shortsleeve", "longsleeve", "sweatshirt", "hoodie"],
            message: "Category is invalid, please choose from the following: shortsleeve, longsleeve, sweatshirt, hoodie"
        }
    },
    brand: {
        type: String,
        required: [true, "Brand is required"],
    },
    rating: {
        type: Number,
        default: 0,
    },
    numberofreviews: {
        type: Number,
        default: 0,
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review",
    }],
    productOwner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Product = model("Product", ProductSchema);
export default Product;
