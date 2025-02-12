// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Contract BlockchainLog để lưu trữ các bản ghi log trên blockchain
contract BlockchainLog {
    // Định nghĩa cấu trúc Log để lưu thông tin về một bản ghi log
    struct Log {
        string tableName;       // Tên bảng liên quan đến log (ví dụ: "users", "orders", "products")
        uint256 recordId;       // ID của bản ghi trong bảng
        string action;          // Hành động được thực hiện (CREATE, UPDATE, DELETE, etc.)
        string hash;            // Hash của dữ liệu để đảm bảo tính toàn vẹn
        address senderAddress;  // Địa chỉ ví của người thực hiện hành động
        uint256 timestamp;      // Thời gian ghi log (block.timestamp)
    }

    // Mapping để lưu trữ các log theo chỉ mục (ID của log)
    mapping(uint256 => Log) private logs;

    // Biến đếm tổng số log đã lưu (cũng dùng để tạo ID tự động cho log mới)
    uint256 public logCounter;

    // Sự kiện phát ra mỗi khi một log mới được thêm vào
    event LogAdded(
        uint256 logId,
        string tableName,
        uint256 recordId,
        string action,
        string hash,
        address senderAddress,
        uint256 timestamp
    );

    /// @notice Thêm một bản ghi log vào blockchain
    /// @param _tableName Tên bảng liên quan đến log
    /// @param _recordId ID của bản ghi trong bảng
    /// @param _action Hành động thực hiện trên bản ghi (CREATE, UPDATE, DELETE)
    /// @param _hash Giá trị hash của bản ghi để đảm bảo tính toàn vẹn
    function addLog(
        string memory _tableName,
        uint256 _recordId,
        string memory _action,
        string memory _hash
    ) public {
        // Lưu log vào mapping với key là logCounter (tự động tăng)
        logs[logCounter] = Log(
            _tableName,
            _recordId,
            _action,
            _hash,
            msg.sender,  // Địa chỉ của người gọi hàm
            block.timestamp // Thời gian hiện tại của block
        );

        // Phát sự kiện LogAdded để thông báo có log mới
        emit LogAdded(
            logCounter,
            _tableName,
            _recordId,
            _action,
            _hash,
            msg.sender,
            block.timestamp
        );

        // Tăng biến đếm log để dùng cho lần ghi log tiếp theo
        logCounter++;
    }

    /// @notice Lấy thông tin log theo ID
    /// @param _logId ID của log cần truy xuất
    /// @return tableName, recordId, action, hash, senderAddress, timestamp của log
    function getLog(
        uint256 _logId
    )
        public
        view
        returns (
            string memory tableName,
            uint256 recordId,
            string memory action,
            string memory hash,
            address senderAddress,
            uint256 timestamp
        )
    {
        // Kiểm tra xem log có tồn tại hay không
        require(_logId < logCounter, "Log does not exist");

        // Lấy log từ mapping
        Log memory log = logs[_logId];

        // Trả về thông tin log
        return (
            log.tableName,
            log.recordId,
            log.action,
            log.hash,
            log.senderAddress,
            log.timestamp
        );
    }

    /// @notice Trả về tổng số log đã lưu trên blockchain
    /// @return Số lượng log đã lưu trữ
    function getLogCount() public view returns (uint256) {
        return logCounter;
    }
}
