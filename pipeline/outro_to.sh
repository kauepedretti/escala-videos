#!/bin/bash
# uso: apply_outro.sh epdir N T1 "TAG"
set -e
d=/home/claude/$1; n=$(printf %02d $2); T1=$3; tag="COMPARTILHE COM UM AMIGO CURIOSO"
src=$d/old_final.mp4; f=/home/claude/final/escala-do-absurdo-ep$n.mp4
Tc=$(echo "$T1 - 0.02" | bc -l)
cd /home/claude/outro_kit && rm -rf frn_$n && node render_outro.cjs "$tag" frn_$n
ffmpeg -v error -y -i $src -framerate 30 -i frn_$n/%03d.png -i outro.wav -filter_complex \
"[0:v]trim=0:$Tc,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=4.6[b];[1:v]setpts=PTS-STARTPTS+$Tc/TB[o];[b][o]overlay=eof_action=pass:format=auto,format=yuv420p[v];\
[0:a]atrim=0:$Tc,asetpts=PTS-STARTPTS,aresample=44100,aformat=channel_layouts=stereo[a0];[2:a]aformat=channel_layouts=stereo[a1];[a0][a1]concat=n=2:v=0:a=1[a]" \
-map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset veryfast -r 30 -c:a aac -b:a 192k -movflags +faststart $f.tmp.mp4
mv $f.tmp.mp4 $f; rm -rf frn_$n
echo "EP$n VINHETA $(ffprobe -v error -show_entries format=duration -of csv=p=0 $f)"
