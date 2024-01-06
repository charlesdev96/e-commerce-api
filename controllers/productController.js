const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");

const createProduct = async (req, res) => {
	req.body.user = req.user.userId;
	const product = await Product.create(req.body);
	res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
	products = await Product.find({}).populate("reviews");
	res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req, res) => {
	const { id: productId } = req.params;
	const product = await Product.findOne({ _id: productId }).populate("reviews");
	if (!product) {
		throw new CustomError.NotFoundError(`No product with id: ${productId}`);
	}
	res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
	const { id: productId } = req.params;
	const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
		new: true,
		runValidators: true,
	});

	if (!product) {
		throw new CustomError.NotFoundError(`No product with id: ${productId}`);
	}

	res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
	const { id: productId } = req.params;
	const product = await Product.findOne({ _id: productId });
	if (!product) {
		throw new CustomError.NotFoundError(`No product with id: ${productId}`);
	}
	await product.deleteOne();

	res.status(StatusCodes.OK).json({ msg: "Success, Deleted successfully" });
};

const uploadImage = async (req, res) => {
	//check if file exists
	if (!req.files) {
		throw new CustomError.BadRequestError("No File Uploaded");
	}
	//we make use of image because it is the name I choose in the postman, e.g we normally choose image
	const productImage = req.files.image;

	// check format
	if (!productImage.mimetype.startsWith("image")) {
		throw new CustomError.BadRequestError("Please Upload Image");
	}

	//check size
	const maxSize = 1024 * 1024;
	if (productImage.size > maxSize) {
		throw new CustomError.BadRequestError(
			"Please upload image smaller than 1MB"
		);
	}

	//create a path to store the uploaded files
	const imagePath = path.join(
		__dirname,
		"../public/uploads/" + `${productImage.name}`
	);
	await productImage.mv(imagePath);
	return res
		.status(StatusCodes.OK)
		.json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
	createProduct,
	getAllProducts,
	getSingleProduct,
	updateProduct,
	deleteProduct,
	uploadImage,
};
