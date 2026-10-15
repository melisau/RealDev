using NUnit.Framework;using RealDev.Learner;
public class QuestAcceptanceEdit {
 [Test] public void UniqueReward(){var s=new QuestState();s.Collect("A");s.Collect("A");s.Collect("B");Assert.AreEqual(2,s.Collected);Assert.AreEqual(0,s.Rewards);s.Collect("C");s.Collect("C");s.Collect("D");Assert.AreEqual(1,s.Rewards);}
 [Test] public void Reset(){var s=new QuestState();s.Collect("A");s.Collect("B");s.Collect("C");s.Reset();Assert.AreEqual(0,s.Collected);Assert.AreEqual(0,s.Rewards);s.Collect("A");s.Collect("B");s.Collect("C");Assert.AreEqual(1,s.Rewards);}
 [Test] public void Migration(){Assert.AreEqual(60,QuestState.LoadHealth("{\"version\":1,\"health\":30}"));Assert.AreEqual(30,QuestState.LoadHealth("{\"version\":2,\"health\":30}"));Assert.AreEqual(100,QuestState.LoadHealth("{\"version\":1,\"health\":2147483647}"));Assert.AreEqual(0,QuestState.LoadHealth("{\"version\":2,\"health\":-3}"));}
 [Test] public void Corrupt(){foreach(var x in new[]{"bad","{}","{\"version\":3,\"health\":30}","{\"version\":2,\"health\":\"x\"}"})Assert.AreEqual(100,QuestState.LoadHealth(x));}
}
