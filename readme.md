# ToDoApp 📝More actions

ToDoApp là một ứng dụng quản lý công việc đơn giản giúp người dùng dễ dàng thêm, sửa và xóa các nhiệm vụ trong ngày. Ứng dụng sử dụng **Node.js**, **Express.js**, **PupDB** và **EJS** để tạo ra một công cụ mạnh mẽ nhưng dễ sử dụng cho việc tổ chức và theo dõi công việc cá nhân.

## Mục đích 

ToDoApp được thiết kế để giúp người dùng tổ chức công việc một cách hiệu quả và đơn giản. Nó giúp giảm bớt sự phức tạp trong việc quản lý công việc, giúp người dùng dễ dàng theo dõi và hoàn thành các nhiệm vụ trong ngày.

## Các tính năng chính 

- **Thêm công việc** : Cho phép người dùng thêm các nhiệm vụ vào danh sách công việc.
- **Chỉnh sửa công việc** : Người dùng có thể chỉnh sửa thông tin của nhiệm vụ đã được thêm vào để đảm bảo cập nhật đầy đủ.
- **Xóa công việc** : Cho phép người dùng xóa nhiệm vụ khi đã hoàn thành hoặc không còn cần thiết.
- **Giao diện người dùng đơn giản** : Với giao diện dễ sử dụng và trực quan, người dùng có thể nhanh chóng quản lý công việc của mình.
- **Replication (Sao chép dữ liệu)** : Đồng bộ hóa dữ liệu giữa các thiết bị, giúp người dùng truy cập và cập nhật công việc từ nhiều thiết bị khác nhau một cách liền mạch.
- **Batch Processing (Xử lý hàng loạt)** : Cho phép người dùng thêm, sửa hoặc xóa nhiều nhiệm vụ cùng một lúc, giúp tiết kiệm thời gian và nâng cao hiệu suất làm việc.
- **Leader Election (Bầu chọn người lãnh đạo)** : Trong môi trường phân tán, giúp xác định một node là "lãnh đạo" để điều phối các tác vụ và quản lý dữ liệu công việc, đảm bảo tính đồng bộ giữa các phiên bản.

## Công nghệ sử dụng 

- **Node.js**: Môi trường thực thi JavaScript, giúp xử lý các yêu cầu HTTP nhanh chóng và hiệu quả.
- **Express.js**: Framework web cho Node.js, giúp xây dựng API RESTful một cách nhanh chóng.
- **PupDB**: Cơ sở dữ liệu phân tán, lưu trữ các nhiệm vụ dưới dạng cặp khóa-giá trị (key-value pair).
- **EJS (Template Engine)**: Nhúng dữ liệu động vào giao diện người dùng, cho phép xây dựng các trang HTML động.

## Các thành viên nhóm 👥

- **Nguyễn Đức Thắng** - Mã số sinh viên 22014001
- **Trịnh Văn Toàn** - Mã số sinh viên 22010491

## Cài đặt và sử dụng 

1. **Clone repo**:  
   Clone repository về máy của bạn bằng lệnh sau:
   ```bash
   git clone https://github.com/Abshoem/pup_DB.git
   ```

2. **Chuyển đến thư mục dự án**:  
   Di chuyển vào thư mục dự án đã clone:
   ```bash
   cd /mnt/b/Abshoem/PUPDB
   ```

3. **Chạy server**:  
   Chạy script để khởi động các server:
   ```bash
   ./start_servers.sh
   ```

4. **Cài đặt các thư viện**:  
   Cài đặt thư viện cho dự án:
   ```bash
   npm install node-fetch express ejs
   ```

5. **Chạy ứng dụng**:  
   Sau khi cài đặt thư viện, chạy ứng dụng `app.js`:
   ```bash
   node app.js
   ```

6. **Kiểm tra với Postman**:  
   Sử dụng Postman để kiểm tra các API như `/set`, `/remove`. Gửi yêu cầu POST đến địa chỉ:
   ```bash
   POST http://127.0.0.1:4000/set
   ```




7. **Và trong phần Body của yêu cầu, nhập dữ liệu dạng JSON**:
   ```json
   {
       "key": "mykey",
       "value": "myvalue"
   }
   ```
   hoặc bạn có thể gửi một lúc nhiều key, value vì chúng tôi đã bổ sung tính năng Batch Processing.
   ```json

   [
     { "key": "user1", "value": "John" },
     { "key": "user2", "value": "Jane" },
   ]
   ```
         tương tự với /remove.

8. **Kiểm tra sao chép dữ liệu**:  
   Sau khoảng 5 giây, dữ liệu sẽ được sao chép sang các node phụ (port 4001, 4002, ...). Để kiểm tra, gửi yêu cầu GET đến địa chỉ:
   ```bash
   GET http://127.0.0.1:4001/get?key=mykey
   ```
   Hoặc với các port khác (4002, 4003, ...). Mỗi node phụ sẽ sao chép dữ liệu sau mỗi 5 giây, đảm bảo rằng mọi thay đổi đều được đồng bộ.
9. **Truy cập: Mở trình duyệt và nhập http://localhost:3000 để sử dụng.**

## Các API Endpoint 📡

### **/get?key=<key-goes-here>** (Method: GET)
- **Mô tả**: API này sử dụng phương thức `get()` của PupDB để lấy giá trị của một key.
- **Ví dụ**:
  ```bash
  curl -XGET http://localhost:4000/get?key=test
  ```

### **/set** (Method: POST)
- **Mô tả**: API này sử dụng phương thức `set()` của PupDB để thiết lập giá trị cho một key.
- **Ví dụ**:
  ```bash
  curl -XPOST http://localhost:4000/set -H 'Content-Type: application/json' -d '{"key": "test", "value": "1234"}'
  ```

### **/remove/<key-goes-here>** (Method: DELETE)
- **Mô tả**: API này sử dụng phương thức `remove()` của PupDB để xóa một key khỏi cơ sở dữ liệu.
- **Ví dụ**:
  ```bash
  curl -XDELETE http://localhost:4000/remove/test
  ```

### **/keys** (Method: GET)
- **Mô tả**: API này sử dụng phương thức `keys()` của PupDB để lấy danh sách các key trong cơ sở dữ liệu.
- **Ví dụ**:
  ```bash
  curl -XGET http://localhost:4000/keys
  ```

### **/values** (Method: GET)
- **Mô tả**: API này sử dụng phương thức `values()` của PupDB để lấy danh sách các giá trị (values) của các key trong cơ sở dữ liệu.
- **Ví dụ**:
  ```bash
  curl -XGET http://localhost:4000/values
  ```

### **/items** (Method: GET)
- **Mô tả**: API này sử dụng phương thức `items()` của PupDB để lấy danh sách các cặp [key, value] trong cơ sở dữ liệu.
- **Ví dụ**:
  ```bash
  curl -XGET http://localhost:4000/items
  ```

### **/dumps** (Method: GET)
- **Mô tả**: API này sử dụng phương thức `dumps()` của PupDB để lấy chuỗi dump toàn bộ cơ sở dữ liệu.
- **Ví dụ**:
  ```bash
  curl -XGET http://localhost:4000/dumps
  ```

### **/truncate-db** (Method: POST)
- **Mô tả**: API này sử dụng phương thức `truncate_db()` của PupDB để xóa toàn bộ dữ liệu trong cơ sở dữ liệu.
- **Ví dụ**:
  ```bash
  curl -XPOST http://localhost:4000/truncate-db
  ```

### **/add** (Method: POST)
- **Mô tả**: API này cho phép thêm công việc mới vào danh sách công việc.
- **Ví dụ**:
  ```bash
  curl -XPOST http://localhost:3000/add -H 'Content-Type: application/json' -d '{"title": "New task"}'
  ```

### **/batch-add** (Method: POST)
- **Mô tả**: API này cho phép thêm nhiều công việc vào danh sách cùng một lúc.
```bash
  curl -XPOST http://localhost:3000/batch-add -H 'Content-Type: application/json' -d '{"titles": "Task 1 Task 2Task 3"}'
  ```


### **/complete/:id** (Method: POST)
- **Mô tả**: API này đánh dấu một công việc là đã hoàn thành.
- **Ví dụ**:
  ```bash
  curl -XPOST http://localhost:3000/complete/your-todo-id
  ```

### **/edit/:id** (Method: POST)
- **Mô tả**: API này cho phép chỉnh sửa tiêu đề của công việc đã có.
- **Ví dụ**:
  ```bash
  curl -XPOST http://localhost:3000/edit/your-todo-id -H 'Content-Type: application/json' -d '{"title": "Updated task"}'
  ```

### **/delete/:id** (Method: POST)
- **Mô tả**: API này xóa một công việc khỏi danh sách.
- **Ví dụ**:
  ```bash
  curl -XPOST http://localhost:3000/delete/your-todo-id
  ```

### **/truncate-db** (Method: POST)
- **Mô tả**: API này xóa toàn bộ dữ liệu trong cơ sở dữ liệu (truncate).
- **Ví dụ**:
  ```bash
  curl -XPOST http://localhost:3000/truncate-db
  ```

## Lời kết 💬

Cảm ơn bạn đã tham gia và sử dụng **ToDoApp**! Ứng dụng này được phát triển với mục tiêu đơn giản hóa việc quản lý công việc hàng ngày và giúp người dùng theo dõi nhiệm vụ một cách dễ dàng và hiệu quả. Chúng tôi hy vọng rằng bạn sẽ có trải nghiệm tuyệt vời với ứng dụng.
