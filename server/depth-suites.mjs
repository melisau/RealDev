// Independent server-only cases; never included in the public starter contract.
const p=(input,expected)=>({input,expected}),checkout=(key,cart,extra={})=>({op:'checkout',owner:'ada',key,cart,...extra}),snap=(owner='ada')=>({op:'snapshot',owner}),item=(product_id,quantity)=>({product_id,quantity});
const state=(balance,q1,q2,orders)=>({status:200,balance,stock:[[1,q1],[2,q2]],orders});
const event=(event_id,type='paid',extra={})=>({op:'webhook',owner:'ada',order_id:1,event_id,type,...extra}),status={op:'status',owner:'ada',order_id:1},payment=(s,events)=>({status:200,state:s,events});
export const depthSuites={
 'advanced-dotnet-version':[
 p('read\nwrite 1 -20\nwrite 1 -20\nread\n','200 100 1\n200 80 2\n409 80 2\n200 80 2'),
 p('write 1 -101\nwrite 1 -100\nwrite 2 -1\n','422 100 1\n200 0 2\n422 0 2'),
 p('write 1 2147483647\nwrite 1 99900\nwrite 2 1\n','422 100 1\n200 100000 2\n422 100000 2'),
 p('write nope 2\nwrite 1 2 extra\nwrite 0 -1000\n','400 100 1\n400 100 1\n409 100 1'),
 p('write 1 -10\nwrite 2 5\nwrite 3 7\n','200 90 2\n200 95 3\n200 102 4')],
 'advanced-dotnet-idempotency':[
 p('buy k1 20 0\nbuy k1 20 0\nread\n','201 80 1\n200 80 1\n200 80 1'),
 p('buy k1 100 0\nbuy k1 100 0\nbuy k1 1 0\nbuy k2 1 0\n','201 0 1\n200 0 1\n409 0 1\n409 0 1'),
 p('buy k1 20 1\nread\nbuy k1 20 0\n','500 100 0\n200 100 0\n201 80 1'),
 p('buy k1 -1 0\nbuy k1 20 2\nbuy k1 nope 0\n','400 100 0\n400 100 0\n400 100 0'),
 p('buy a 30 0\nbuy b 40 0\nbuy a 30 1\nbuy c 31 0\n','201 70 1\n201 30 2\n200 30 2\n409 30 2')],
 'advanced-unity-async':[
 p('enable\nstart\ndisable\nenable\nsuccess 1 99\n','true 0 0\ntrue 1 0\nfalse 2 0\ntrue 2 0\ntrue 2 0'),
 p('enable\nstart\nstart\nsuccess 1 10\nsuccess 2 20\n','true 0 0\ntrue 1 0\ntrue 2 0\ntrue 2 0\ntrue 2 20'),
 p('disable\nstart\nsuccess 0 5\nenable\nenable\n','false 0 0\nfalse 0 0\nfalse 0 0\ntrue 0 0\ntrue 0 0'),
 p('enable\nstart\nsuccess 1 7\ndisable\ndisable\nenable\nstart\nsuccess 2 11\nsuccess 3 12\n','true 0 0\ntrue 1 0\ntrue 1 7\nfalse 2 7\nfalse 2 7\ntrue 2 7\ntrue 3 7\ntrue 3 7\ntrue 3 12'),
 p('enable\nstart\nsuccess bad 8\nsuccess 1 nope\nsuccess 1 -2\n','true 0 0\ntrue 1 0\ntrue 1 0\ntrue 1 0\ntrue 1 -2')],
 'advanced-unity-rewards':[
 p('reward q1 10 0\nrestart\nreward q1 10 0\n','201 10 1\n200 10 1\n200 10 1'),
 p('reward q1 10 1\nrestart\nreward q1 10 0\n','500 0 0\n200 0 0\n201 10 1'),
 p('reward q1 10 0\nreward q1 20 0\nreward q2 5 0\n','201 10 1\n409 10 1\n201 15 2'),
 p('reward q1 0 0\nreward q1 nope 0\nreward q1 1 2\n','400 0 0\n400 0 0\n400 0 0'),
 p('reward q1 2147483647 0\nreward q2 1 0\nreward q1 2147483647 0\n','201 2147483647 1\n422 2147483647 1\n200 2147483647 1')],
 'advanced-checkout-atomic':[
 p([checkout('a',[item(1,2)]),checkout('a',[item(1,2)]),snap()],[{status:201,id:1},{status:200,id:1},state(160,3,2,1)]),
 p([checkout('x',[item(1,1),item(2,1)],{fail:true}),snap(),checkout('x',[item(1,1),item(2,1)]),snap()],[{status:500},state(200,5,2,0),{status:201,id:1},state(130,4,1,1)]),
 p([checkout('x',[item(1,1,{price:0})]),checkout('x',[item(1,2)]),checkout('y',[item(1,6)]),checkout('z',[item(9,1)]),snap()],[{status:201,id:1},{status:409},{status:409},{status:404},state(180,4,2,1)]),
 p([checkout('x',[item(1,5),item(2,2)],{owner:'bob'}),checkout('b',[item(1,true)]),checkout('c',[]),checkout('d',[item(1,1),item(1,1)]),snap(),snap('evil')],[{status:402},{status:400},{status:400},{status:400},state(200,5,2,0),{status:401}]),
 p([checkout("x'); DROP TABLE products;--",[{...item(2,1),price:0}]),checkout("x'); DROP TABLE products;--",[item(2,1)],{owner:'bob'}),snap('bob'),snap()],[{status:201,id:1},{status:201,id:2},state(50,5,0,1),state(150,5,0,1)])],
 'advanced-checkout-reconcile':[
 p([event('e1'),event('e1'),status],[{status:200},{status:200},payment('paid',1)]),
 p([event('e1','paid',{fail:true}),status,event('e1'),status],[{status:500},payment('pending',0),{status:200},payment('paid',1)]),
 p([event('e1','cancelled'),event('e2'),event('e1'),status],[{status:200},{status:409},{status:409},payment('cancelled',1)]),
 p([event('e1','paid',{owner:'bob'}),event('e1','paid',{order_id:true}),event('','paid'),event('e1','unknown'),status],[{status:404},{status:404},{status:400},{status:400},payment('pending',0)]),
 p([event("x'); DROP TABLE payments;--"),event('e2'),event('e3','cancelled'),status,{op:'status',owner:'bob',order_id:2}],[{status:200},{status:200},{status:409},payment('paid',2),payment('pending',0)])]
};