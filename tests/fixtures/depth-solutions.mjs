const cs=(setup,body)=>`using System;using System.Collections.Generic;
public class Program {public static void Main(){${setup} string line;while((line=Console.ReadLine())!=null){var p=line.Split(new[]{' '},StringSplitOptions.RemoveEmptyEntries);${body}}}}`;
export const depthSolutions={
 'advanced-dotnet-version':cs('int balance=100,version=1;',`int status=400,v,d;if(p.Length==1&&p[0]=="read")status=200;else if(p.Length==3&&p[0]=="write"&&int.TryParse(p[1],out v)&&int.TryParse(p[2],out d)){long next=(long)balance+d;if(v!=version)status=409;else if(next<0||next>100000)status=422;else{balance=(int)next;version++;status=200;}}Console.WriteLine(status+" "+balance+" "+version);`),
 'advanced-dotnet-idempotency':cs('int balance=100;var saved=new Dictionary<string,int>();',`int status=400,amount,fail;if(p.Length==1&&p[0]=="read")status=200;else if(p.Length==4&&p[0]=="buy"&&int.TryParse(p[2],out amount)&&amount>0&&int.TryParse(p[3],out fail)&&(fail==0||fail==1)){if(saved.ContainsKey(p[1]))status=saved[p[1]]==amount?200:409;else if(amount>balance)status=409;else if(fail==1)status=500;else{balance-=amount;saved[p[1]]=amount;status=201;}}Console.WriteLine(status+" "+balance+" "+saved.Count);`),
 'advanced-unity-async':cs('bool enabled=false;int generation=0,value=0;',`int n,v;if(p.Length==1&&p[0]=="enable")enabled=true;else if(p.Length==1&&p[0]=="disable"&&enabled){enabled=false;generation++;}else if(p.Length==1&&p[0]=="start"&&enabled)generation++;else if(p.Length==3&&p[0]=="success"&&int.TryParse(p[1],out n)&&int.TryParse(p[2],out v)&&enabled&&n==generation)value=v;Console.WriteLine(enabled.ToString().ToLower()+" "+generation+" "+value);`),
 'advanced-unity-rewards':cs('int coins=0;var saved=new Dictionary<string,int>();',`int status=400,amount,fail;if(p.Length==1&&(p[0]=="read"||p[0]=="restart"))status=200;else if(p.Length==4&&p[0]=="reward"&&int.TryParse(p[2],out amount)&&amount>0&&int.TryParse(p[3],out fail)&&(fail==0||fail==1)){if(saved.ContainsKey(p[1]))status=saved[p[1]]==amount?200:409;else if((long)coins+amount>int.MaxValue)status=422;else if(fail==1)status=500;else{coins+=amount;saved[p[1]]=amount;status=201;}}Console.WriteLine(status+" "+coins+" "+saved.Count);`)
};
export const checkoutHandler=`def handle(db,r):
    owner=r.get('owner')
    if owner not in ('ada','bob'): return {'status':401}
    op=r.get('op')
    if op=='snapshot': return {'status':200,'balance':db.execute('SELECT balance FROM wallets WHERE owner=?',(owner,)).fetchone()[0],'stock':[list(row) for row in db.execute('SELECT id,stock FROM products ORDER BY id')],'orders':db.execute('SELECT count(*) FROM orders WHERE owner=?',(owner,)).fetchone()[0]}
    if op!='checkout': return {'status':404}
    key,cart=r.get('key'),r.get('cart')
    if not isinstance(key,str) or not key.strip() or len(key.strip())>80 or not isinstance(cart,list) or not 1<=len(cart)<=10: return {'status':400}
    if any(not isinstance(x,dict) or any(type(x.get(k)) is not int or x[k]<=0 for k in ('product_id','quantity')) for x in cart): return {'status':400}
    if len({x['product_id'] for x in cart})!=len(cart): return {'status':400}
    payload=json.dumps(sorted([[x['product_id'],x['quantity']] for x in cart]))
    prior=db.execute('SELECT id,payload FROM orders WHERE owner=? AND request_key=?',(owner,key.strip())).fetchone()
    if prior: return {'status':200,'id':prior[0]} if prior[1]==payload else {'status':409}
    total=0
    for x in cart:
        row=db.execute('SELECT stock,price FROM products WHERE id=?',(x['product_id'],)).fetchone()
        if not row:return {'status':404}
        if row[0]<x['quantity']:return {'status':409}
        total+=row[1]*x['quantity']
    if total>db.execute('SELECT balance FROM wallets WHERE owner=?',(owner,)).fetchone()[0]:return {'status':402}
    try:
        with db:
            for x in cart:
                db.execute('UPDATE products SET stock=stock-? WHERE id=?',(x['quantity'],x['product_id']))
                if r.get('fail') is True:raise RuntimeError('injected')
            db.execute('UPDATE wallets SET balance=balance-? WHERE owner=?',(total,owner))
            id=db.execute('INSERT INTO orders(owner,request_key,payload) VALUES(?,?,?)',(owner,key.strip(),payload)).lastrowid
        return {'status':201,'id':id}
    except RuntimeError:return {'status':500}
`;
export const reconcileHandler=`def handle(db,r):
    owner=r.get('owner')
    if owner not in ('ada','bob'):return {'status':401}
    if r.get('op') not in ('status','webhook'):return {'status':404}
    id=r.get('order_id')
    if type(id) is not int or id<=0:return {'status':404}
    row=db.execute('SELECT state FROM payments WHERE id=? AND owner=?',(id,owner)).fetchone()
    if not row:return {'status':404}
    if r['op']=='status':return {'status':200,'state':row[0],'events':db.execute('SELECT count(*) FROM events WHERE order_id=?',(id,)).fetchone()[0]}
    eid,kind=r.get('event_id'),r.get('type')
    if not isinstance(eid,str) or not eid.strip() or len(eid.strip())>80 or kind not in ('paid','cancelled'):return {'status':400}
    prior=db.execute('SELECT order_id,type FROM events WHERE owner=? AND event_id=?',(owner,eid.strip())).fetchone()
    if prior:return {'status':200 if prior==(id,kind) else 409}
    if row[0] not in ('pending',kind):return {'status':409}
    try:
        with db:
            db.execute('INSERT INTO events VALUES(?,?,?,?)',(owner,eid.strip(),id,kind))
            if r.get('fail') is True:raise RuntimeError('injected')
            db.execute('UPDATE payments SET state=? WHERE id=?',(kind,id))
        return {'status':200}
    except RuntimeError:return {'status':500}
`;