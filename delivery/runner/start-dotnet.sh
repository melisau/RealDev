#!/bin/sh
set -eu
mkdir -p /tmp/dotnet
cp -r /seed/home/. /tmp/dotnet/
cp -r /seed/obj /work/obj
dotnet build /trusted/App.csproj --no-restore -p:BaseIntermediateOutputPath=/work/obj/ -p:OutputPath=/work/bin/ >&2
exec dotnet /work/bin/RealDevSubmission.dll
