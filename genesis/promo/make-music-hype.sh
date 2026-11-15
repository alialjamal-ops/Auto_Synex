#!/bin/bash
# High-energy bed at 120 BPM, synthesised with ffmpeg only (no third-party audio).
# Layers: riser → kick, off-beat bass, hats, clap, arpeggio, pad → impacts on the main cuts → tail.
cd "$(dirname "$0")"
D="between(t,2,27.99)"                       # drums on
FULL="between(t,5,27.99)"                    # arp + clap enter with the product
BRK="(1-between(t,19.5,19.99))*(1-between(t,25.5,25.99))"   # half-beat breaks before the drops
N="(random(0)*2-1)"
ROOT="(55*eq(mod(floor(t/4),4),0)+43.65*eq(mod(floor(t/4),4),1)+49*eq(mod(floor(t/4),4),2)+55*eq(mod(floor(t/4),4),3))"
KICK="0.95*$D*$BRK*sin(2*PI*(46+115*exp(-24*mod(t,0.5)))*mod(t,0.5))*exp(-6.5*mod(t,0.5))"
BASS="0.34*$D*$BRK*(sin(2*PI*$ROOT*t)+0.45*sin(4*PI*$ROOT*t)+0.2*sin(6*PI*$ROOT*t))*exp(-4.5*mod(t+0.25,0.5))*(1-exp(-70*mod(t+0.25,0.5)))"
HAT="0.10*$D*$BRK*$N*exp(-55*mod(t,0.25))+0.09*$D*$BRK*$N*exp(-16*mod(t+0.25,0.5))"
CLAP="0.26*$FULL*$BRK*$N*exp(-22*mod(t+0.5,1))"
ARPF="($ROOT*8*(1*eq(mod(floor(t*8),4),0)+1.1892*eq(mod(floor(t*8),4),1)+1.4983*eq(mod(floor(t*8),4),2)+2*eq(mod(floor(t*8),4),3)))"
ARP="0.055*$FULL*(sin(2*PI*$ARPF*t)+0.33*sin(6*PI*$ARPF*t))*exp(-10*mod(t,0.125))"
PAD="0.05*(sin(2*PI*$ROOT*4*t)+sin(2*PI*$ROOT*4*1.4983*t)+0.8*sin(2*PI*$ROOT*8*1.1892*t))*(0.6+0.4*sin(2*PI*0.25*t))*min(1,t/1.5)"
RISE=""; for t0 in 2 20 26; do RISE="$RISE+between(t,$t0-1.6,$t0)*pow((t-$t0+1.6)/1.6,2)*(0.22*$N+0.10*sin(2*PI*(180+420*(t-$t0+1.6))*(t-$t0+1.6)))"; done
BOOM=""; for t0 in 1 2 20 26 28; do BOOM="$BOOM+gte(t,$t0)*(0.85*sin(2*PI*(38+30*exp(-8*(t-$t0)))*(t-$t0))*exp(-2.6*(t-$t0))+0.22*$N*exp(-5*(t-$t0)))"; done
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc='$KICK+$BASS+$HAT+$CLAP+$ARP+$PAD$RISE$BOOM':d=30.6:s=48000" \
  -af "highpass=f=28,aecho=0.8:0.5:60:0.18,volume=1.2,alimiter=limit=0.85:attack=3:release=60,afade=t=in:d=0.2,afade=t=out:st=28.6:d=1.9,volume=-1.5dB,pan=stereo|c0=c0|c1=c0" music-hype.wav
