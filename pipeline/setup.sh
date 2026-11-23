#!/bin/bash
# Recria o ambiente de render em /home/claude a partir do repositório.
# uso: bash /home/claude/escala-videos/pipeline/setup.sh
set -e
R=/home/claude/escala-videos/pipeline; B=/home/claude
mkdir -p $B/ep3 $B/ep40 $B/outro_kit $B/final
cp $R/ep3/*.js $B/ep3/; cp $R/lib3d.js $R/earth_sprite.js $R/render_ep.sh $R/outro_to.sh $B/
cp $R/outro_kit/* $B/outro_kit/
cp $R/package.json $B/ep40/ && (cd $B/ep40 && npm install --silent)
ln -sfn $B/ep40/node_modules $B/outro_kit/node_modules
echo "Ambiente pronto. Node modules em $B/ep40/node_modules"
