from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
import json,sqlite3,datetime
from store import connect,initialize
initialize()
class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args): pass
    def reply(self,status,value=None):
        raw=json.dumps(value).encode() if value is not None else b''
        self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
    def auth(self):
        token=self.headers.get('Authorization','')
        if token not in ['Bearer test-alice','Bearer test-bob']: self.reply(401);return None
        return token.removeprefix('Bearer test-')
    def do_GET(self):
        if self.path=='/health': self.reply(200,{'ready':True});return
        user=self.auth()
        if not user:return
        if self.path!='/bookings':self.reply(404);return
        with connect() as db:rows=[dict(r) for r in db.execute('SELECT id,resource,slot FROM bookings WHERE owner=? AND cancelled=0 ORDER BY id',(user,))]
        self.reply(200,{'items':rows})
    def do_POST(self):
        user=self.auth()
        if not user:return
        if self.path!='/bookings':self.reply(404);return
        try:
            body=json.loads(self.rfile.read(int(self.headers.get('Content-Length','0'))));resource=body['resource'];slot=body['slot']
            if not isinstance(resource,str) or not resource.strip() or len(resource)>100 or not isinstance(slot,str) or not slot.endswith('Z'):raise ValueError()
            date=datetime.datetime.fromisoformat(slot.replace('Z','+00:00'))
            if date.minute not in [0,30] or date.second or date.microsecond:raise ValueError()
            resource=resource.strip()
        except Exception:self.reply(400);return
        key=self.headers.get('Idempotency-Key');payload=json.dumps({'resource':resource,'slot':slot},sort_keys=True)
        with connect() as db:
            try:
                db.execute('BEGIN IMMEDIATE')
                prior=db.execute('SELECT payload,response FROM replays WHERE owner=? AND key=?',(user,key)).fetchone() if key else None
                if prior:
                    db.rollback();self.reply(200,json.loads(prior['response'])) if prior['payload']==payload else self.reply(409);return
                row_id=db.execute('INSERT INTO bookings(owner,resource,slot) VALUES(?,?,?)',(user,resource,slot)).lastrowid
                value={'id':row_id,'resource':resource,'slot':slot}
                if key:db.execute('INSERT INTO replays VALUES(?,?,?,?)',(user,key,payload,json.dumps(value)))
                db.commit();self.reply(201,value)
            except sqlite3.IntegrityError:db.rollback();self.reply(409)
    def do_DELETE(self):
        user=self.auth()
        if not user:return
        try:row_id=int(self.path.removeprefix('/bookings/'))
        except Exception:self.reply(404);return
        with connect() as db:
            changed=db.execute('UPDATE bookings SET cancelled=1 WHERE id=? AND owner=? AND cancelled=0',(row_id,user)).rowcount
        self.reply(204 if changed else 404)
ThreadingHTTPServer(('127.0.0.1',8080),Handler).serve_forever()
