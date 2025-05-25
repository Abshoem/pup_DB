#hướng dẫn dùng

chạy trên terminal
PUPDB_FILE_PATH=db1.json gunicorn -w 4 -b 127.0.0.1:4000 pupdb.rest:APP &
PUPDB_FILE_PATH=db2.json gunicorn -w 4 -b 127.0.0.1:4001 pupdb.rest:APP &
wait

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
