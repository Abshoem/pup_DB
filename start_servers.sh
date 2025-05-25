PUPDB_FILE_PATH=db1.json gunicorn -w 4 -b 127.0.0.1:4000 pupdb.rest:APP &
PUPDB_FILE_PATH=db2.json gunicorn -w 4 -b 127.0.0.1:4001 pupdb.rest:APP &
wait