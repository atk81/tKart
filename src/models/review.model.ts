import {Schema, model, Document} from "mongoose";

export interface IReview extends Document {
    user: string;
    product: string;
    rating: number;
    comment: string;
    createdAt: Date;
}

const ReviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product is required"]
    },
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating must be at most 5"]
    },
    comment: {
        type: String,
        required: [true, "Review is required"],
        maxlength: [500, "Review must be at most 500 characters"],
        minlength: [10, "Review must be at least 10 characters"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Review = model("Review", ReviewSchema);
export default Review;
