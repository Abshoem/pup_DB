# ToDoApp 📝

ToDoApp là một ứng dụng quản lý công việc đơn giản giúp người dùng dễ dàng thêm, sửa và xóa các nhiệm vụ trong ngày. Ứng dụng sử dụng **Node.js**, **Express.js**, **PupDB** và **EJS** để tạo ra một công cụ mạnh mẽ nhưng dễ sử dụng cho việc tổ chức và theo dõi công việc cá nhân.

## Mục đích 🎯

ToDoApp được thiết kế để giúp người dùng tổ chức công việc một cách hiệu quả và đơn giản. Nó giúp giảm bớt sự phức tạp trong việc quản lý công việc, giúp người dùng dễ dàng theo dõi và hoàn thành các nhiệm vụ trong ngày.

## Các tính năng chính 🔑

- **Thêm công việc** ➕: Cho phép người dùng thêm các nhiệm vụ vào danh sách.
- **Chỉnh sửa công việc** ✏️: Người dùng có thể chỉnh sửa thông tin của nhiệm vụ đã được thêm vào.
- **Xóa công việc** 🗑️: Cho phép người dùng xóa nhiệm vụ khi đã hoàn thành hoặc không cần thiết.
- **Giao diện người dùng đơn giản** 💻: Với giao diện dễ sử dụng, người dùng có thể nhanh chóng quản lý công việc của mình.
- **Replication (Sao chép dữ liệu)** 🔄: Đồng bộ hóa dữ liệu giữa các thiết bị, giúp người dùng truy cập và cập nhật công việc từ nhiều thiết bị khác nhau một cách liền mạch.
- **Batch Processing (Xử lý hàng loạt)** ⚙️: Cho phép người dùng thêm, sửa hoặc xóa nhiều nhiệm vụ cùng một lúc, giúp tiết kiệm thời gian và nâng cao hiệu suất làm việc.
- **Leader Election (Bầu chọn người lãnh đạo)** 👑: Trong môi trường phân tán, giúp xác định một node là "lãnh đạo" để điều phối các tác vụ và quản lý dữ liệu công việc, đảm bảo tính đồng bộ giữa các phiên bản.

## Công nghệ sử dụng 🛠️

- **Node.js**: Môi trường thực thi JavaScript, giúp xử lý các yêu cầu HTTP nhanh chóng.
- **Express.js**: Framework web cho Node.js, giúp xây dựng API RESTful.
- **PupDB**: Cơ sở dữ liệu phân tán, lưu trữ các nhiệm vụ dưới dạng cặp khóa-giá trị.
- **EJS (Template Engine)**: Nhúng dữ liệu động vào giao diện người dùng.

## Các thành viên nhóm 👥

- **Nguyễn Đức Thắng** - Mã số sinh viên 22014001
- **Trịnh Văn Toàn** - Mã số sinh viên 22010491

## Cài đặt và sử dụng ⚡

1. **Clone repo**:  
   Clone repository về máy của bạn bằng lệnh sau:
   ```bash
   git clone https://github.com/Abshoem/pup_DB.git
2. **Chuyển đến thư mục dự án**:
   Di chuyển vào thư mục dự án đã clone:
   ```bash
   cd /mnt/b/Abshoem/PUPDB
3. **Chạy server**:
   Chạy script để khởi động các server:
   ```bash
   ./start_servers.sh
4. **Cài đặt thư viện node-fetch**:
   Cài đặt thư viện node-fetch:
   ```bash
   npm install node-fetch
5. **Chạy ứng dụng replicate.js**:
   Sau khi cài đặt thư viện, chạy ứng dụng replicate.js:
   ```bash
   node replicate.js
6. **Kiểm tra với Postman**:
   Sử dụng Postman để kiểm tra việc sao chép dữ liệu. Gửi yêu cầu POST đến địa chỉ:
   ```nginx
   POST http://127.0.0.1:4000/set
7. **Và trong phần Body của yêu cầu, nhập dữ liệu dạng JSON**:
   ```json
   {
       "key": "mykey",
       "value": "myvalue"
   }
8. **Kiểm tra sao chép dữ liệu**:
   Sau khoảng 5 giây, dữ liệu sẽ được sao chép sang node phụ (port 4001). Để kiểm tra, gửi yêu cầu GET đến địa chỉ:
   ```sql
   GET http://127.0.0.1:4001/get?key=mykey

## Lời kết 💬

Cảm ơn bạn đã tham gia và sử dụng **ToDoApp**! Ứng dụng này được phát triển với mục tiêu đơn giản hóa việc quản lý công việc hàng ngày và giúp người dùng theo dõi nhiệm vụ một cách dễ dàng và hiệu quả. Chúng tôi hy vọng rằng bạn sẽ có trải nghiệm tốt với ứng dụng.

Chúc bạn thành công và luôn hoàn thành công việc một cách hiệu quả! 🚀

