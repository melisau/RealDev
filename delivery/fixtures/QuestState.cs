using System;using System.Text.RegularExpressions;using System.Collections.Generic;using UnityEngine;
namespace RealDev.Learner {
 public class QuestState {
  readonly HashSet<string> ids=new HashSet<string>();public int Rewards{get;private set;}public int Collected=>ids.Count;
  public bool Collect(string id){if(string.IsNullOrWhiteSpace(id)||Rewards>0||!ids.Add(id))return false;if(ids.Count>=3)Rewards=1;return true;}
  public void Reset(){ids.Clear();Rewards=0;}
  [Serializable] class Save { public int version; public long health=long.MinValue; }
  public static int LoadHealth(string json){try{if(json==null||!Regex.IsMatch(json,"\"health\"\\s*:\\s*-?[0-9]+\\s*[,}]"))return 100;var s=JsonUtility.FromJson<Save>(json);if(s==null||!(s.version==1||s.version==2)||s.health==long.MinValue)return 100;var h=s.version==1?s.health*2:s.health;return (int)Math.Max(0,Math.Min(100,h));}catch{return 100;}}
 }
}
