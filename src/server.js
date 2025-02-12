import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initwebRoutes from "./route/web";
import { connectDB } from "./config/connectDB";
import http from 'http';
import { sendMessage } from './services/messageService';
import {
  syncBlockchainLogs,
  addLogToBlockchain,
  getLatestLogs,
  runSync
} from './config/connectDB'; // Import các hàm blockchain

require('dotenv').config();

// Bỏ qua xác thực chứng chỉ SSL
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// Khởi tạo ứng dụng Express
let app = express();

// Middleware xử lý CORS
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Cấu hình body-parser
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Thiết lập view engine
viewEngine(app);

// Khởi tạo routes
initwebRoutes(app);

// // API endpoints cho blockchain
// app.get('/api/blockchain/logs', async (req, res) => {
//   try {
//     const logs = await syncBlockchainLogs();
//     res.json(logs);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.get('/api/blockchain/latest-logs', async (req, res) => {
//   try {
//     const count = parseInt(req.query.count) || 5;
//     const logs = await getLatestLogs(count);
//     res.json(logs);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post('/api/blockchain/sync', async (req, res) => {
//   try {
//     const result = await runSync();
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Tạo HTTP server
const server = http.createServer(app);

// Cấu hình Socket.IO
const socketIo = require("socket.io")(server, {
  cors: {
    origin: "*",
  }
});

// Xử lý kết nối Socket.IO
socketIo.on("connection", (socket) => {
  console.log("Khách hàng mới kết nối: " + socket.id);

  // Xử lý tin nhắn
  socket.on("sendDataClient", function (data) {
    sendMessage(data);
    socketIo.emit("sendDataServer", { data });
  });

  // Xử lý phòng chat
  socket.on("loadRoomClient", function (data) {
    socketIo.emit("loadRoomServer", { data });
  });

  // Thêm sự kiện blockchain
  socket.on("syncBlockchain", async function () {
    try {
      const result = await runSync();
      socketIo.emit("blockchainSyncComplete", result);
    } catch (error) {
      socket.emit("blockchainError", { error: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("Khách hàng đã ngắt kết nối");
  });
});

// Khởi động server
let port = process.env.PORT || 6969;

server.listen(port, async () => {
  console.log("Backend Nodejs đang chạy trên cổng: " + port);

  try {
    // Kết nối database và khởi tạo blockchain
    await connectDB();
    // Chạy đồng bộ blockchain khi khởi động server (tùy chọn)
    const syncResult = await runSync();
    console.log(syncResult);
  } catch (error) {
    console.error("Lỗi khởi động:", error);
  }
});
