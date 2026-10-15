using System;
namespace RealDev.Learner { public static class QuestSignals { public static event Action<string> Collected; public static void Collect(string id){Collected?.Invoke(id);} } }
