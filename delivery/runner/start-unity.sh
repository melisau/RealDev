#!/bin/sh
set -eu
cp -r /trusted/unity-project /work/project
cp /submission/Assets/Learner/QuestState.cs /work/project/Assets/Learner/QuestState.cs
cp /submission/Assets/Learner/QuestBehaviour.cs /work/project/Assets/Learner/QuestBehaviour.cs
for phase in EditMode PlayMode; do
 rm -f "/results/$phase.xml"
 /opt/unity/Editor/Unity -batchmode -nographics -runTests -projectPath /work/project -testPlatform "$phase" -testResults "/results/$phase.xml" -logFile "/work/$phase.log" -forgetProjectPath || test -s "/results/$phase.xml"
done
