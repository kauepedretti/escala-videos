#!/bin/bash
# uso: render_ep.sh epN DUR N
cd /home/claude/$1 || exit 1
dur=$2 n=$3 start=0 i=0; : > chunks.txt
while (( $(echo "$start < $dur" | bc) )); do
  end=$(echo "s=$start+10; if (s>$dur) $dur else s" | bc); name=chunk$(printf %02d $i)
  [ -f $name.mp4 ] || node render.cjs video $start $end $name 2>&1 | grep -v "GL Driver" | tail -1
  echo "file '$name.mp4'" >> chunks.txt; start=$end; i=$((i+1))
done
ffmpeg -y -v error -f concat -safe 0 -i chunks.txt -c copy video.mp4
ffmpeg -y -v error -i video.mp4 -i narracao.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart "$4"
ffmpeg -y -v error -i "$4" -vf "fps=1/3.5,scale=200:356,tile=9x2" -frames:v 1 chk.jpg
echo "EP$n PRONTO $(date +%T)"
