const Review = require("../models/Review");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions, checkPermissionsReview } = require("../utils");

const createReview = async (req, res) => {
	const { product: productId } = req.body;

	const isValidProduct = await Product.findOne({ _id: productId });

	//check if product exist
	if (!isValidProduct) {
		throw new CustomError.NotFoundError(`No product with id : ${productId}`);
	}

	const alreadySubmitted = await Review.findOne({
		product: productId,
		user: req.user.userId,
	});

	//check if user have already submitted
	if (alreadySubmitted) {
		throw new CustomError.BadRequestError(
			"Already submitted review for this product"
		);
	}

	req.body.user = req.user.userId;
	const review = await Review.create(req.body);
	res.status(StatusCodes.CREATED).json({ review });
};

// use the populate method to return certain properties of what we want to return
const getAllReviews = async (req, res) => {
	const reviews = await Review.find({})
		.populate({
			path: "product",
			select: "name company price",
		})
		.populate({
			path: "user",
			select: "name role",
		});
	res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
	const { id: reviewId } = req.params;
	const review = await Review.findOne({ _id: reviewId })
		.populate({
			path: "product",
			select: "name company price",
		})
		.populate({
			path: "user",
			select: "name role",
		});

	if (!review) {
		throw new CustomError.NotFoundError(`No review with id : ${reviewId}`);
	}
	res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
	const { id: reviewId } = req.params;
	const { rating, title, comment } = req.body;

	let review = await Review.findOne({ _id: reviewId });

	if (!review) {
		throw new CustomError.NotFoundError(`No review with id : ${reviewId}`);
	}

	//check if user is permitted to delete review
	checkPermissionsReview(req.user, review.user);

	review = await Review.findOneAndUpdate({ _id: reviewId }, req.body, {
		new: true,
		runValidators: true,
	}).populate({
		path: "product",
		select: "name company price",
	});

	res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
	const { id: reviewId } = req.params;
	const review = await Review.findOne({ _id: reviewId });
	if (!review) {
		throw new CustomError.NotFoundError(`No review with id : ${reviewId}`);
	}

	//check if user is permitted to delete review
	checkPermissions(req.user, review.user);
	await review.deleteOne();
	res.status(StatusCodes.OK).json({ msg: "Success, Deleted successfully" });
};

const getSingleProductReviews = async (req, res) => {
	const { id: productId } = req.params;
	const reviews = await Review.find({ product: productId });
	res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
	createReview,
	getAllReviews,
	getSingleReview,
	updateReview,
	deleteReview,
	getSingleProductReviews,
};
