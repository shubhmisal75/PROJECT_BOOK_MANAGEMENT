const bookModel = require('../models/bookModel');
const reviewModel = require('../models/reviewModel');
const validateBody = require('../validation/validation');
const ObjectId = require('mongoose').Types.ObjectId;


const createReview = async (req, res) => {
    try {
        const checkParams = req.params.bookId;
        let checkOBJ = ObjectId.isValid(checkParams);
        if (!checkOBJ) {
            return res.status(400).send({ status: false, message: "Please Provide a valid bookId in path params" });;
        }
        const findBook = await bookModel.findOne({ _id: checkParams });
        if (!findBook) {
            return res.status(400).send({ status: false, msg: "This BookId deosn't exist" });
        }
        if (findBook.isDeleted == true) {
            return res.status(400).send({ status: false, msg: "The book on which you want to make review is no longer exist" });
        }
        const { _id, reviews } = findBook
        const myBody = req.body
        if (!validateBody.isValidRequestBody(myBody)) {
            return res.status(400).send({ status: false, message: "Please provide review details for successful review" });
        }
        const { reviewedBy, rating, review } = myBody
        if (!validateBody.isValid(rating)) {
            return res.status(400).send({ status: false, message: "Please provide rating or rating field" });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).send({ status: false, message: "Please do rating between 1 and 5" });;
        }
        let bookId = _id
        let reviewedAt = new Date()
        let myReview = { bookId, reviewedBy, rating, review, reviewedAt }
        const reviewCreated = await reviewModel.create(myReview);
        const demoData = await reviewModel.findOne(reviewCreated).select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        if (reviewCreated) {
            let updateReview = await bookModel.findOneAndUpdate({ _id: _id }, { reviews: reviews + 1 })
            if (updateReview) {
                return res.status(201).send({ status: true, message: "success", data: demoData });
            }
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

//------------------------------------------------------------------------------------//

const updateReview = async (req, res) => {
    try {
        const bookParams = req.params.bookId;
        let checkOBJ2 = ObjectId.isValid(bookParams);
        if (!checkOBJ2) {
            return res.status(400).send({ status: false, message: "Please Provide a valid bookId in path params)" });;
        }
        const bookFound = await bookModel.findOne({ _id: bookParams });
        if (!bookFound) {
            return res.status(404).send({ status: false, msg: "This book id Doesn't exist" });
        }
        const reviewParams = req.params.reviewId;
        let checkOBJ3 = ObjectId.isValid(reviewParams);
        if (!checkOBJ3) {
            return res.status(400).send({ status: false, message: "Please Provide a valid reviewId in path params)" });;
        }
        let updateBody = req.body
        if (!validateBody.isValidRequestBody(updateBody)) {
            return res.status(400).send({ status: false, message: "Please provide data to proceed your update request" });
        }
        const { reviewedBy, rating, review } = updateBody
        if (!validateBody.isString(reviewedBy)){
            return res.status(400).send({ status: false, message: "If you are providing reviewedBy key you also have to provide its value" });
        }
        if (!validateBody.isString(rating)){
            return res.status(400).send({ status: false, message: "If you are providing rating key you also have to provide its value" });
        }
        if (!validateBody.isString(review)){
            return res.status(400).send({ status: false, message: "If you are providing review key you also have to provide its value" });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).send({ status: false, message: "Please do rating between 1 and 5" });;
        }
        if (bookFound.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "The book on which you want update is no longer exist" });
        }
        const reviewUpdate = await reviewModel.findOne({ _id: reviewParams });
        if (!reviewUpdate) {
            return res.status(404).send({ status: false, msg: "This review id doesn't exist" });
        }
        if (reviewUpdate.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "The review in which you want update is no longer exist" });
        }
        if (reviewedBy) {
            reviewUpdate.reviewedBy = reviewedBy;
        }
        if (rating) {
            reviewUpdate.rating = rating;
        }
        if (review) {
            reviewUpdate.review = review;
        }
        reviewUpdate.save();
        return res.status(200).send({ status: true, message: "Review is updated successfully", data: reviewUpdate });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

//-------------------------------------------------------------------------------------//

const deleteReview = async (req, res) => {
    try {
        const booksParam = req.params.bookId;
        let checkOBJ4 = ObjectId.isValid(booksParam);
        if (!checkOBJ4) {
            return res.status(400).send({ status: false, message: "Please Provide a valid bookId in path params" });;
        }
        const reviewsParams = req.params.reviewId;
        let checkOBJ5 = ObjectId.isValid(reviewsParams);
        if (!checkOBJ5) {
            return res.status(400).send({ status: false, message: "Please Provide a valid reviewId in path params" });;
        }
        const bookFind = await bookModel.findOne({ _id: booksParam });
        if (!bookFind) {
            return res.status(404).send({ status: false, msg: "This book id doesn't exist" });
        }
        if (bookFind.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "The book is no longer exist" });
        }
        const { _id, reviews } = bookFind
        const reviewData = await reviewModel.findOne({ _id: reviewsParams });
        if (!reviewData) {
            return res.status(404).send({ status: false, msg: "This reviewId doesn't exist" });
        }
        if (reviewData.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "This review has already been deleted" });
        }
        reviewData.isDeleted = true;
        reviewData.save();
        let reviewDeleted = await bookModel.findOneAndUpdate({ _id: _id }, { reviews: reviews - 1 })
        let reviewBookData = await bookModel.findOne({ _id: _id }).select({ title: 1 })
        if (reviewDeleted) {
            return res.status(200).send({ status: true, msg: "Review is deleted successfully", data: { review_deleted_for: reviewBookData, reviewData: reviewData } });
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}



//-----------------------------------------------------------------------------------//
module.exports.createReview = createReview;
module.exports.updateReview = updateReview;
module.exports.deleteReview = deleteReview;