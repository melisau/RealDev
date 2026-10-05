const python=`import json, sqlite3, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
def database():
    db=sqlite3.connect(':memory:')
    db.execute('CREATE TABLE items (id INTEGER PRIMARY KEY, owner TEXT NOT NULL, name TEXT NOT NULL)')
    db.execute('CREATE TABLE stock (id INTEGER PRIMARY KEY, quantity INTEGER NOT NULL CHECK(quantity>=0))')
    db.executemany('INSERT INTO stock VALUES (?,?)',[(1,10),(2,4)]);db.commit()
    return db
def handle(db,r):
    op=r.get('op')
    if op=='stock':return {'status':200,'stock':[list(row) for row in db.execute('SELECT * FROM stock ORDER BY id')]}
    if op=='transfer':
        a,b,q=r.get('from'),r.get('to'),r.get('quantity')
        if any(type(v)!=int or v<=0 for v in [a,b,q]) or a==b:return {'status':400}
        left=db.execute('SELECT quantity FROM stock WHERE id=?',(a,)).fetchone()
        right=db.execute('SELECT quantity FROM stock WHERE id=?',(b,)).fetchone()
        if left is None or right is None:return {'status':404}
        if left[0]<q:return {'status':409}
        try:
            with db:
                db.execute('UPDATE stock SET quantity=quantity-? WHERE id=?',(q,a))
                if r.get('fail'):raise ValueError('injected fault')
                db.execute('UPDATE stock SET quantity=quantity+? WHERE id=?',(q,b))
            return {'status':204}
        except ValueError:return {'status':500}
    owner=r.get('owner')
    if OWNERSHIP and (type(owner)!=str or not owner.strip()):return {'status':401}
    if op=='create':
        name=r.get('name')
        if type(owner)!=str or not owner.strip() or type(name)!=str or not 1<=len(name.strip())<=80:return {'status':400}
        with db:
            cur=db.execute('INSERT INTO items(owner,name) VALUES (?,?)',(owner.strip(),name.strip()))
        return {'status':201,'id':cur.lastrowid}
    if op=='list':
        rows=db.execute('SELECT * FROM items WHERE owner=? ORDER BY id',(owner.strip(),)) if OWNERSHIP else db.execute('SELECT * FROM items ORDER BY id')
        return {'status':200,'items':[dict(zip(['id','owner','name'],row)) for row in rows]}
    if op=='delete' and OWNERSHIP:
        id=r.get('id')
        if type(id)!=int or id<=0:return {'status':404}
        with db:cur=db.execute('DELETE FROM items WHERE id=? AND owner=?',(id,owner.strip()))
        return {'status':204 if cur.rowcount else 404}
    return {'status':404}
print(json.dumps([handle(database_instance,r) for r in json.load(sys.stdin)]))
`;
function py(ownership){return 'OWNERSHIP='+ (ownership?'True':'False')+'\n'+python.replace('print(json.dumps','database_instance=database()\nprint(json.dumps');}
const csharp=body=>`using System;using System.Collections.Generic;public class Program{public static void Main(){var rows=Console.In.ReadToEnd().Split(new[]{'\\n'},StringSplitOptions.RemoveEmptyEntries);${body}}}`;
export const advancedSolutions={
 'advanced-api-validation':py(false),'advanced-api-ownership':py(true),'advanced-api-transaction':py(true),
 'advanced-dotnet-contract':csharp(`foreach(var row in rows){var p=Array.ConvertAll(row.Split(' '),int.Parse);Console.WriteLine(p[0]==0?401:p[2]<=0?400:p[1]==0?404:p[2]>10?409:201);}`),
 'advanced-dotnet-stock':csharp(`int a=10,b=4;foreach(var row in rows){var p=Array.ConvertAll(row.Split(' '),int.Parse);int status=p[0]<=0?400:p[0]>a?409:p[1]==1?500:204;if(status==204){a-=p[0];b+=p[0];}Console.WriteLine(status+" "+a+" "+b);}`),
 'advanced-dotnet-retry':csharp(`string state="idle";int attempt=0;foreach(var row in rows){string e=row.Trim();if(e=="start"&&(state=="idle"||state=="failed"||state=="cancelled")){state="running";attempt=1;}else if(e=="cancel"&&(state=="running"||state=="failed"))state="cancelled";else if(e=="transient"&&state=="running")state="failed";else if(e=="retry"&&state=="failed"&&attempt<3){state="running";attempt++;}else if(e=="success"&&state=="running")state="done";Console.WriteLine(state+" "+attempt);}`),
 'advanced-unity-events':csharp(`bool enabled=false;int hits=0;foreach(var row in rows){string e=row.Trim();if(e=="enable")enabled=true;else if(e=="disable")enabled=false;else if(e=="event"&&enabled)hits++;Console.WriteLine(hits);}`),
 'advanced-unity-pool':csharp(`bool active=false;int health=0;foreach(var row in rows){var p=row.Trim().Split(' ');if(p[0]=="rent"&&!active){active=true;health=100;}else if(p[0]=="return"){active=false;health=0;}else if(p[0]=="damage"&&active&&int.Parse(p[1])>=0){health=Math.Max(0,health-int.Parse(p[1]));if(health==0)active=false;}Console.WriteLine(health+" "+active.ToString().ToLowerInvariant());}`),
 'advanced-unity-save':csharp(`foreach(var row in rows){var p=row.Trim().Split(' ');long version,health;long result=100;if(p.Length==2&&long.TryParse(p[0],out version)&&long.TryParse(p[1],out health)&&(version==1||version==2)){result=health<=0?0:version==1?(health>=50?100:health*2):Math.Min(100,health);}Console.WriteLine(result);}`)
};
