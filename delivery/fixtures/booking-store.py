import sqlite3,os,json
DB=os.environ['SQLITE_PATH']
def connect():
    db=sqlite3.connect(DB,timeout=5,isolation_level=None)
    db.row_factory=sqlite3.Row
    return db
def initialize():
    with connect() as db:
        db.executescript('CREATE TABLE IF NOT EXISTS bookings(id INTEGER PRIMARY KEY,owner TEXT NOT NULL,resource TEXT NOT NULL,slot TEXT NOT NULL,cancelled INTEGER NOT NULL DEFAULT 0); CREATE UNIQUE INDEX IF NOT EXISTS active_slot ON bookings(resource,slot) WHERE cancelled=0; CREATE TABLE IF NOT EXISTS replays(owner TEXT,key TEXT,payload TEXT,response TEXT,PRIMARY KEY(owner,key));')
