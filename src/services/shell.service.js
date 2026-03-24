const { exec } = require('child_process');

/**
 * Thực thi lệnh Shell và trả về kết quả
 * @param {string} command - Lệnh shell cần chạy
 * @param {number} timeout - Thời gian chờ tối đa (ms)
 * @returns {Promise<string>} - Output của lệnh
 */
function executeCommand(command, timeout = 30000) {
  return new Promise((resolve, reject) => {
    console.log(`💻 Đang thực thi lệnh: ${command}`);
    
    exec(command, { timeout }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Lỗi thực thi: ${error.message}`);
        return resolve(`❌ Lỗi: ${error.message}\n${stderr}`);
      }
      
      if (stderr) {
        return resolve(`⚠️ Cảnh báo: ${stderr}\n\n${stdout}`);
      }
      
      resolve(stdout || "✅ Lệnh đã thực thi thành công (Không có output)");
    });
  });
}

module.exports = {
  executeCommand,
};
