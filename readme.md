#hướng dẫn dùng
cd /mnt/b/Abshoem/PUPDB

chạy trên terminal
./start_servers.sh

cài thư viện node-fetch

npm install node-fetch

sau đó

node replicate.js

test bằng postman
ví dụ

POST http://127.0.0.1:4000/set
Body (JSON):
{
"key": "mykey",
"value": "myvalue"
}

Sau khoảng 5 giây, dữ liệu sẽ được replicate sang node phụ (port 4001).

Gửi request đọc dữ liệu node phụ:

sql
Sao chép
GET http://127.0.0.1:4001/get?key=mykey
