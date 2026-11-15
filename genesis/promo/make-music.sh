#!/bin/bash
# Synthesises the ambient bed + soft transition hits with ffmpeg (no third-party audio).
cd "$(dirname "$0")"
HITS=""; for ts in 0.2 3.5 7.3 12.4 17 21.2 24.6 30.8; do HITS="$HITS+0.55*gt(t\,$ts)*exp(-4.5*(t-$ts))*sin(2*PI*52*(t-$ts))+0.05*gt(t\,$ts)*exp(-2.2*(t-$ts))*sin(2*PI*659.25*(t-$ts))"; done
PAD="(0.085*sin(2*PI*110*t)+0.07*sin(2*PI*164.81*t)+0.06*sin(2*PI*220*t)+0.05*sin(2*PI*277.18*t)+0.045*sin(2*PI*329.63*t)+0.022*sin(2*PI*554.37*t))*(0.72+0.28*sin(2*PI*0.17*t))+0.03*gt(t\,30.8)*sin(2*PI*880*t)*(1-exp(-1.2*(t-30.8)))"
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc=$PAD$HITS:d=35.6:s=48000" -af "lowpass=f=3200,aecho=0.8:0.7:90|180:0.35|0.22,afade=t=in:d=1.2,afade=t=out:st=33.4:d=2.1,volume=1.6,pan=stereo|c0=c0|c1=c0" music.wav
