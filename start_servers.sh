# Node chính (port 4000)
PUPDB_FILE_PATH=./db/db1.json gunicorn -w 4 -b 127.0.0.1:4000 pupdb.rest:APP &

# Node phụ (port 4001)
PUPDB_FILE_PATH=./db/db2.json gunicorn -w 4 -b 127.0.0.1:4001 pupdb.rest:APP &

# Node phụ (port 4002)
PUPDB_FILE_PATH=./db/db3.json gunicorn -w 4 -b 127.0.0.1:4002 pupdb.rest:APP &

wait
