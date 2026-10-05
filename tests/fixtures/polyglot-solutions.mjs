export function solution(task){
 let code=task.starter;
 const changes={
  'python:positive-sum':['sum(numbers)','sum(n for n in numbers if n > 0)'],
  'python:stable-unique':['sorted(set(numbers))','dict.fromkeys(numbers)'],
  'python:health-clamp':['next_health = health - damage','next_health = max(0, min(max_health, health - damage))'],
  'csharp:positive-sum':['numbers.Sum()','numbers.Where(n => n > 0).Sum()'],
  'csharp:stable-unique':['numbers.Distinct().OrderBy(x => x)','numbers.Where(new HashSet<int>().Add)'],
  'csharp:health-clamp':['int next = v[0] - v[1];','int next = Math.Max(0, Math.Min(v[2], v[0] - v[1]));'],
  'java:positive-sum':['sum += value;','if(value > 0) sum += value;'],
  'java:stable-unique':['new TreeSet<>()','new LinkedHashSet<>()'],
  'java:health-clamp':['int next = health - damage;','int next = Math.max(0, Math.min(maxHealth, health - damage));']
 };
 const [before,after]=changes[task.language+':'+task.problem];
 if(!code.includes(before))throw Error('Fixture starter changed');return code.replace(before,after);
}
