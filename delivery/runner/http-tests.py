# Trusted acceptance tester. Runs in a separate container/PID/filesystem from submitted code.
import sys,json,time,urllib.request,urllib.error,sqlite3,concurrent.futures,datetime
kind,phase,seed=sys.argv[1:4]
base='http://127.0.0.1:8080'
def req(method,path,body=None,user='alice',key=None):
    headers={'Content-Type':'application/json'}
    if user: headers['Authorization']='Bearer test-'+user
    if key: headers['Idempotency-Key']=key
    raw=None if body is None else json.dumps(body).encode()
    try: response=urllib.request.urlopen(urllib.request.Request(base+path,data=raw,headers=headers,method=method),timeout=5)
    except urllib.error.HTTPError as e: response=e
    data=response.read(32769)
    if len(data)>32768: raise AssertionError('response exceeds limit')
    try: value=json.loads(data) if data else None
    except Exception: value=data.decode(errors='replace')[:200]
    return response.status,value

def expect(actual,expected):
    if actual!=expected: raise AssertionError('expected '+str(expected)+', received '+str(actual)[:400])
def body(tag):
    return {'resource':seed+'-'+tag,'slot':'2030-01-10T09:00:00Z'} if kind=='booking-api' else {'title':seed+'-'+tag}
path='/bookings' if kind=='booking-api' else '/tickets'
def create(tag,user='alice',key=None,payload=None):
    status,value=req('POST',path,payload or body(tag),user,key);expect(status,201)
    if not isinstance(value,dict) or not isinstance(value.get('id'),int): raise AssertionError('201 needs integer id')
    return value

def auth(): expect(req('GET',path,user=None)[0],401);expect(req('GET',path,user='invalid')[0],401)
def validation():
    invalid=[{}, {'resource':'','slot':'bad'}, {'resource':'x','slot':'2030-01-10T09:07:00Z'}] if kind=='booking-api' else [{},{'title':' '},{'title':'x'*81},{'title':42}]
    for payload in invalid: expect(req('POST',path,payload)[0],400)
def created():
    value=create('persist')
    if kind=='dotnet-board': expect(value.get('status'),'open');expect(value.get('version'),1)
    status,result=req('GET',path);expect(status,200)
    if not any(x.get('id')==value['id'] for x in result.get('items',[])): raise AssertionError('created row absent from list')
def ownership():
    value=create('private',payload={**body('private'),'owner':'bob'})
    status,other=req('GET',path,user='bob');expect(status,200)
    if any(x.get('id')==value['id'] for x in other.get('items',[])): raise AssertionError('body owner allowed cross-user access')
    method,payload=('DELETE',None) if kind=='booking-api' else ('PATCH',{'status':'done','version':1})
    expect(req(method,path+'/'+str(value['id']),payload,'bob')[0],404)
    expect(req(method,path+'/999999',payload)[0],404)
def sql():
    tag="sql'; DROP TABLE x;--"
    value=create(tag)
    connection=sqlite3.connect('file:/data/submission.db?mode=ro',uri=True)
    table='bookings' if kind=='booking-api' else 'tickets'
    columns={x[1] for x in connection.execute('PRAGMA table_info('+table+')')}
    required={'id','owner','resource','slot','cancelled'} if kind=='booking-api' else {'id','owner','title','status','version'}
    if not required.issubset(columns): raise AssertionError('required real SQLite columns missing')
    row=connection.execute('SELECT owner FROM '+table+' WHERE id=?',(value['id'],)).fetchone();expect(row,('alice',));connection.close()
def race():
    payload=body('race')
    with concurrent.futures.ThreadPoolExecutor(2) as executor:
        statuses=list(executor.map(lambda u:req('POST',path,payload,u)[0],['alice','bob']))
    expect(sorted(statuses),[201,409])
    status,items=req('GET',path);expect(status,200)
    mine=[x for x in items['items'] if x.get('resource')==payload['resource']]
    owner='alice' if mine else 'bob';value=mine[0] if mine else next(x for x in req('GET',path,user='bob')[1]['items'] if x.get('resource')==payload['resource'])
    expect(req('DELETE',path+'/'+str(value['id']),user=owner)[0],204)
    create('race',user='bob',payload=payload)
def replay():
    payload=body('replay');key=seed+'-key'
    first=create('replay',key=key,payload=payload)
    status,second=req('POST',path,payload,key=key)
    if status not in [200,201]: raise AssertionError('replay must succeed')
    expect(second.get('id'),first['id'])
    expect(req('POST',path,body('changed'),key=key)[0],409)
    create('other-key',user='bob',key=key)
def status_case():
    value=create('status')
    expect(req('PATCH',path+'/'+str(value['id']),{'status':'bogus','version':1})[0],400)
    status,result=req('PATCH',path+'/'+str(value['id']),{'status':'in-progress','version':1});expect(status,200);expect(result.get('version'),2);expect(result.get('status'),'in-progress')
    expect(req('PATCH',path+'/'+str(value['id']),{'status':'done','version':2})[0],200)
def version():
    value=create('version')
    with concurrent.futures.ThreadPoolExecutor(2) as executor:
        statuses=list(executor.map(lambda state:req('PATCH',path+'/'+str(value['id']),{'status':state,'version':1})[0],['done','in-progress']))
    expect(sorted(statuses),[200,409])
def persistence():
    status,result=req('GET',path);expect(status,200)
    field='resource' if kind=='booking-api' else 'title'
    if not any(x.get(field)==seed+'-persist' for x in result.get('items',[])): raise AssertionError('data missing after restart')

ready=False
for _ in range(160):
    try:
        if req('GET','/health')[0]==200: ready=True;break
    except Exception: pass
    time.sleep(.25)
cases=[]
checks=[('persistence',persistence)] if phase=='restart' else [('auth',auth),('validation',validation),('create',created),('ownership',ownership),('sql',sql)]+([('race',race),('replay',replay)] if kind=='booking-api' else [('status',status_case),('version',version)])
for case_id,check in checks:
    try:
        if not ready: raise AssertionError('application did not start /health within 40 seconds')
        check();cases.append({'id':case_id,'pass':True,'detail':'Acceptance checks passed'})
    except Exception as error: cases.append({'id':case_id,'pass':False,'detail':str(error)[:500]})
print(json.dumps({'cases':cases},ensure_ascii=False))
