/**
 * Auto Synex — the robot itself: a small hovering character built from
 * primitives in Three.js, so it ships as code rather than a model file.
 *
 * Loaded lazily by synex-bot-embed.js. If WebGL is unavailable the embed keeps
 * its flat SVG robot instead, so nothing here is required for the bot to work.
 *
 *   const robot = await createRobot(canvas, { color: '#17567f' });
 *   robot.look(x, y);        // -1..1, where the pointer is relative to the page
 *   robot.react('talk');     // 'talk' | 'nod' | 'wave'
 *   robot.setHover(true);
 *   robot.dispose();
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function createRobot(canvas, opts = {}) {
  const accent = new THREE.Color(opts.color || '#17567f');
  const glow = accent.clone().lerp(new THREE.Color('#7fe3ff'), 0.65);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearAlpha(0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.05, 8.9);

  // Lighting: soft fill, a key from the upper front, and a brand-coloured rim
  // so the silhouette reads against a dark page.
  scene.add(new THREE.HemisphereLight(0xdceaff, 0x0a1220, 1.05));
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(2.5, 3.4, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(glow.getHex(), 2.2);
  rim.position.set(-3, 1.2, -2.5);
  scene.add(rim);

  const shell = new THREE.MeshStandardMaterial({ color: 0xeaf2fb, metalness: 0.42, roughness: 0.3 });
  const shellDark = new THREE.MeshStandardMaterial({ color: 0x9fb4cc, metalness: 0.7, roughness: 0.35 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x0a1626, metalness: 0.35, roughness: 0.12 });
  const lit = new THREE.MeshStandardMaterial({
    color: glow, emissive: glow, emissiveIntensity: 2.1, roughness: 0.35,
  });
  const brand = new THREE.MeshStandardMaterial({ color: accent, metalness: 0.55, roughness: 0.35 });

  const robot = new THREE.Group();
  scene.add(robot);

  /* ---------------------------------------------------------------- head -- */
  const head = new THREE.Group();
  head.position.y = 0.78;
  robot.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(1.02, 42, 34), shell);
  skull.scale.set(1.02, 0.9, 0.92);
  head.add(skull);

  // Visor: a wide lens that stands proud of the skull, so the face reads as a
  // face from any angle.
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.62, 36, 26), glass);
  visor.scale.set(1.42, 0.88, 0.42);
  visor.position.set(0, 0.06, 0.72);
  head.add(visor);

  const eyes = new THREE.Group();
  eyes.position.set(0, 0.07, 0.95);
  head.add(eyes);
  const eyeGeo = new THREE.SphereGeometry(0.175, 26, 26);
  const eyeL = new THREE.Mesh(eyeGeo, lit);
  const eyeR = new THREE.Mesh(eyeGeo, lit);
  eyeL.position.x = -0.33;
  eyeR.position.x = 0.33;
  eyes.add(eyeL, eyeR);

  // A smile, curved to sit on the chin rather than inside it.
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.038, 10, 22, Math.PI),
    new THREE.MeshStandardMaterial({ color: glow, emissive: glow, emissiveIntensity: 0.9, roughness: 0.4 }),
  );
  smile.rotation.z = Math.PI;
  smile.rotation.x = -0.35;
  smile.position.set(0, -0.42, 0.8);
  head.add(smile);

  // Cheek lights sit just clear of the skull, beside the visor.
  const cheekGeo = new THREE.SphereGeometry(0.09, 16, 16);
  const cheekMat = new THREE.MeshStandardMaterial({
    color: glow, emissive: glow, emissiveIntensity: 1.2, roughness: 0.5,
  });
  for (const x of [-0.63, 0.63]) {
    const c = new THREE.Mesh(cheekGeo, cheekMat);
    c.scale.set(1, 0.8, 0.5);
    c.position.set(x, -0.24, 0.66);
    head.add(c);
  }

  const ears = [];
  for (const x of [-1.04, 1.04]) {
    const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.3, 6, 14), shellDark);
    ear.position.set(x * 0.94, -0.05, 0);
    ear.rotation.z = Math.PI / 2;
    head.add(ear);
    ears.push(ear);
  }

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.62, 12), shellDark);
  antenna.position.y = 1.05;
  head.add(antenna);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 20), lit);
  bulb.position.y = 1.42;
  head.add(bulb);

  /* ---------------------------------------------------------------- body -- */
  const body = new THREE.Group();
  body.position.y = -0.92;
  robot.add(body);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.66, 0.5, 12, 28), shell);
  torso.scale.set(1.06, 1, 0.88);
  body.add(torso);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.3, 18), shellDark);
  collar.position.y = 0.68;
  body.add(collar);
  const core = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.075, 12, 28), lit);
  core.position.set(0, 0.08, 0.52);
  body.add(core);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 18), brand);
  chest.scale.set(1, 1, 0.5);
  chest.position.set(0, -0.42, 0.56);
  body.add(chest);

  // Detached hands — they hover beside the body, which reads friendlier than arms.
  const hands = [];
  for (const x of [-1.05, 1.05]) {
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 20), shellDark);
    hand.position.set(x * 0.92, -0.1, 0.2);
    body.add(hand);
    hands.push(hand);
  }

  // Hover glow standing in for a shadow.
  const pad = new THREE.Mesh(
    new THREE.CircleGeometry(1.15, 40),
    new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0.16 }),
  );
  pad.position.y = -1.9;
  pad.rotation.x = -Math.PI / 2;
  robot.add(pad);

  robot.scale.setScalar(0.96);

  /* ----------------------------------------------------------- animation -- */
  const target = { x: 0, y: 0 };
  // The head aims at a point in space instead of being driven by hand-signed
  // Euler angles: lookAt() cannot be inverted, so "look where the pointer is"
  // stays true however the model is rotated by its parent.
  const aim = new THREE.Vector3(0, 0.78, 9);
  const want = new THREE.Vector3();
  const hp = new THREE.Vector3();
  const state = { hover: false, act: '', actAt: 0, blinkAt: 1.6, blink: 0, fly: 0, flyNow: 0 };
  const clock = new THREE.Clock();
  let elapsed = 0;
  let raf = 0;
  let alive = true;

  function size() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  size();
  const ro = new ResizeObserver(size);
  ro.observe(canvas);

  function frame() {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    // Clock.getElapsedTime() consumes the delta internally, so calling
    // getDelta() after it returns ~0 — which froze every lerp and left the
    // eyes stuck shut mid-blink. Take the delta once and keep the clock here.
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;
    const t = elapsed;

    // Follow the pointer with a lag, so it reads as looking rather than tracking.
    // Screen y grows downward, so a pointer above the robot sits higher in world
    // space — hence the minus on target.y.
    head.getWorldPosition(hp);
    want.set(hp.x + target.x * 5.5, hp.y - target.y * 3.4, hp.z + 8);
    aim.lerp(want, Math.min(1, dt * 6));
    head.lookAt(aim);
    robot.rotation.y += (target.x * 0.23 - robot.rotation.y) * Math.min(1, dt * 4);

    // Scrolling makes it fly: lean into the direction of travel, roll a little,
    // and let the hands stream behind. It settles back when the page stops.
    state.flyNow += (state.fly - state.flyNow) * Math.min(1, dt * 7);
    const f = state.flyNow;
    robot.rotation.x += (f * 0.5 - robot.rotation.x) * Math.min(1, dt * 7);
    robot.rotation.z += (-f * 0.22 - robot.rotation.z) * Math.min(1, dt * 7);
    pad.material.opacity = 0.16 * Math.max(0, 1 - Math.abs(f) * 1.4);

    if (!REDUCED) {
      robot.position.y = Math.sin(t * 1.5) * 0.075;
      head.position.y = 0.62 + Math.sin(t * 1.5 + 0.5) * 0.03;
      hands[0].position.y = -0.1 + Math.sin(t * 1.7) * 0.07 + f * 0.5;
      hands[1].position.y = -0.1 + Math.sin(t * 1.7 + 1.1) * 0.07 + f * 0.5;
      hands[0].position.z = 0.2 - Math.abs(f) * 0.45;
      hands[1].position.z = 0.2 - Math.abs(f) * 0.45;
      ears[0].rotation.x = Math.sin(t * 1.2) * 0.12;
      ears[1].rotation.x = Math.sin(t * 1.2 + 0.7) * 0.12;
      bulb.material.emissiveIntensity = 1.6 + Math.sin(t * 3) * 0.7;
      core.rotation.z = t * 0.8;
    }

    // Blink: a quick vertical squash on both eyes.
    if (!REDUCED) {
      if (t > state.blinkAt) {
        state.blink = 0.16;
        state.blinkAt = t + 3 + Math.random() * 3.5;
      }
      const k = state.blink > 0 ? Math.max(0.08, 1 - state.blink / 0.08) : 1;
      eyeL.scale.y = eyeR.scale.y = k;
      state.blink = Math.max(0, state.blink - dt);
    }

    // Reactions.
    const since = t - state.actAt;
    if (state.act && since < 1.1) {
      const e = Math.sin(since * Math.PI / 1.1);
      if (state.act === 'talk') {
        eyeL.scale.setScalar(1 + e * 0.32);
        eyeR.scale.setScalar(1 + e * 0.32);
        head.position.y += Math.sin(since * 26) * 0.012;
      } else if (state.act === 'nod') {
        head.rotation.x += Math.sin(since * 9) * 0.22 * (1 - since / 1.1);
      } else if (state.act === 'wave') {
        hands[1].position.y = -0.1 + Math.abs(Math.sin(since * 8)) * 0.55;
        hands[1].rotation.z = Math.sin(since * 8) * 0.6;
      }
    } else if (state.act) {
      state.act = '';
      eyeL.scale.setScalar(1);
      eyeR.scale.setScalar(1);
      hands[1].rotation.z = 0;
    }

    const wantScale = state.hover ? 1.06 : 0.96;
    robot.scale.setScalar(robot.scale.x + (wantScale - robot.scale.x) * Math.min(1, dt * 8));

    renderer.render(scene, camera);
  }
  frame();

  // Pause the loop whenever it cannot be seen — a hidden tab or a scrolled-away
  // page should cost nothing.
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? resume() : pause()));
  io.observe(canvas);
  const onVis = () => (document.hidden ? pause() : resume());
  document.addEventListener('visibilitychange', onVis);

  function pause() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  function resume() { if (!raf && alive) { clock.getDelta(); frame(); } }

  return {
    look(x, y) { target.x = clamp(x); target.y = clamp(y); },
    /** -1 (flying down) .. 1 (flying up); driven by scroll velocity. */
    fly(v) { state.fly = clamp(v); },
    setHover(on) { state.hover = !!on; },
    react(kind) { state.act = kind; state.actAt = clock.getElapsedTime(); },
    dispose() {
      alive = false;
      pause();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      scene.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
      renderer.dispose();
    },
  };
}

function clamp(v) { return Math.max(-1, Math.min(1, v)); }
