// Import service xử lý logic liên quan đến comment và review
import commentService from '../services/commentService';

// Hàm tạo mới một đánh giá (review) cho sản phẩm
let createNewReview = async (req, res) => {
    try {
        // Gọi service để tạo review mới từ dữ liệu trong request body
        let data = await commentService.createNewReview(req.body);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm lấy danh sách tất cả đánh giá (review) theo ID sản phẩm
let getAllReviewByProductId = async (req, res) => {
    try {
        // Gọi service để lấy tất cả review dựa trên ID sản phẩm từ query param
        let data = await commentService.getAllReviewByProductId(req.query.id);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm trả lời một đánh giá (review) của khách hàng
let ReplyReview = async (req, res) => {
    try {
        // Gọi service để trả lời review với dữ liệu từ request body
        let data = await commentService.ReplyReview(req.body);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm xóa một đánh giá (review)
let deleteReview = async (req, res) => {
    try {
        // Gọi service để xóa review với dữ liệu từ request body
        let data = await commentService.deleteReview(req.body);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm tạo mới một bình luận (comment) cho bài blog
let createNewComment = async (req, res) => {
    try {
        // Gọi service để tạo comment mới từ dữ liệu trong request body
        let data = await commentService.createNewComment(req.body);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm lấy danh sách tất cả bình luận (comment) theo ID bài blog
let getAllCommentByBlogId = async (req, res) => {
    try {
        // Gọi service để lấy tất cả comment dựa trên ID bài blog từ query param
        let data = await commentService.getAllCommentByBlogId(req.query.id);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm trả lời một bình luận (comment) trong bài blog
let ReplyComment = async (req, res) => {
    try {
        // Gọi service để trả lời comment với dữ liệu từ request body
        let data = await commentService.ReplyComment(req.body);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm xóa một bình luận (comment)
let deleteComment = async (req, res) => {
    try {
        // Gọi service để xóa comment với dữ liệu từ request body
        let data = await commentService.deleteComment(req.body);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Xuất module chứa các API controller để sử dụng trong router
module.exports = {
    createNewReview: createNewReview,
    getAllReviewByProductId: getAllReviewByProductId,
    ReplyReview: ReplyReview,
    deleteReview: deleteReview,
    createNewComment: createNewComment,
    getAllCommentByBlogId: getAllCommentByBlogId,
    deleteComment: deleteComment,
    ReplyComment: ReplyComment
};
