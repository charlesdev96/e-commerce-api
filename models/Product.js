const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: [true, "Please provide product name"],
			maxlength: [100, "Name can not be more than 100 characters"],
		},
		price: {
			type: Number,
			required: [true, "Please provide product price"],
			default: 0,
		},
		description: {
			type: String,
			required: [true, "Please provide product description"],
			maxlength: [1000, "Description can not be more than 1000 characters"],
		},
		image: {
			type: String,
			default: "/uploads/example.jpeg",
		},
		category: {
			type: String,
			required: [true, "Please provide product category"],
			enum: ["office", "kitchen", "bedroom"],
		},
		company: {
			type: String,
			required: [true, "Please provide company"],
			enum: {
				values: ["ikea", "liddy", "marcos"],
				message: "{VALUE} is not supported",
			},
		},
		colors: {
			type: [String],
			default: ["#222"],
			required: true,
		},
		featured: {
			type: Boolean,
			default: false,
		},
		freeShipping: {
			type: Boolean,
			default: false,
		},
		inventory: {
			type: Number,
			required: true,
			default: 15,
		},
		averageRating: {
			type: Number,
			default: 0,
		},
		numOfReviews: {
			type: Number,
			default: 0,
		},
		user: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//create a connection to the reviews so that we can get all reviews attached to a product
//toJSON: {virtuals: true}, toObject: {virtuals: true} is because of this method we want to create
ProductSchema.virtual("reviews", {
	ref: "Review",
	localField: "_id", // in the Review model to identify new reviews created
	foreignField: "product", // we have two foreign fields, which are product and user
	justOne: false,
});

// this method will delete any reviews associated with a product once that product is deleted
ProductSchema.pre("deleteOne", { document: true }, async function (next) {
	await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", ProductSchema);
