#hướng dẫn dùng
cd /mnt/b/Abshoem/PUPDB

chạy trên terminal
./start_servers.sh

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
