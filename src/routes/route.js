const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const reviewController = require('../controllers/reviewController')
const myMiddleware = require('../middleWares/middleWare')

//---------------------------------------------------------------//

router.post('/register', userController.userRegistration)
router.post('/login', userController.userLogin)

//----------------------------------------------------------------//
router.post('/books', myMiddleware.getUserDetails, bookController.createBook)
router.get('/books', myMiddleware.getUserDetails, bookController.getQueryBooks)
router.get('/books/:bookId', myMiddleware.getUserDetails, bookController.getParamsBook)
router.put('/books/:bookId', myMiddleware.getUserDetails, bookController.updateBookById)
router.delete('/books/:bookId', myMiddleware.getUserDetails, bookController.deleteBookById)

//------------------------------------------------------------------//

router.post('/books/:bookId/review', reviewController.createReview)
router.put('/books/:bookId/review/:reviewId', reviewController.updateReview)
router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview)

//------------------------------------------------------------------//

module.exports = router;