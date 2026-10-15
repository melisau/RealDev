using NUnit.Framework;using UnityEngine;using UnityEngine.SceneManagement;using UnityEngine.TestTools;using System.Collections;using RealDev.Learner;
public class QuestAcceptancePlay {
 GameObject obj;QuestBehaviour behaviour;
 [SetUp] public void Setup(){obj=new GameObject("quest");behaviour=obj.AddComponent<QuestBehaviour>();}
 [TearDown] public void Cleanup(){if(obj)Object.DestroyImmediate(obj);}
 [Test] public void Events(){QuestSignals.Collect("A");QuestSignals.Collect("B");QuestSignals.Collect("C");QuestSignals.Collect("C");Assert.AreEqual(1,behaviour.State.Rewards);}
 [Test] public void Disable(){obj.SetActive(false);QuestSignals.Collect("A");Assert.AreEqual(0,behaviour.State.Collected);obj.SetActive(true);obj.SetActive(false);obj.SetActive(true);QuestSignals.Collect("A");QuestSignals.Collect("B");QuestSignals.Collect("C");Assert.AreEqual(1,behaviour.State.Rewards);}
 [Test] public void Pool(){QuestSignals.Collect("A");QuestSignals.Collect("B");QuestSignals.Collect("C");behaviour.ResetForPool();Assert.AreEqual(0,behaviour.State.Rewards);Assert.AreEqual(0,behaviour.State.Collected);}
 [UnityTest] public IEnumerator Scene(){var state=behaviour.State;var scene=SceneManager.CreateScene("temp-quest");SceneManager.MoveGameObjectToScene(obj,scene);yield return SceneManager.UnloadSceneAsync(scene);QuestSignals.Collect("A");Assert.AreEqual(0,state.Collected);}
}
