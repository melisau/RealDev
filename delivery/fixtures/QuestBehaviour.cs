using UnityEngine;
namespace RealDev.Learner { public class QuestBehaviour:MonoBehaviour { public QuestState State=new QuestState();void OnEnable(){QuestSignals.Collected+=OnCollect;}void OnDisable(){QuestSignals.Collected-=OnCollect;}void OnCollect(string id){State.Collect(id);}public void ResetForPool(){State.Reset();} } }
