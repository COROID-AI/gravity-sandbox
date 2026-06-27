# Gravity Sandbox — Interactive Single-File Build

Build an interactive **2D N-body gravity simulator** as a single, self-contained `index.html` file.
Bodies attract each other under Newtonian gravity; the user can fling new bodies into orbit and watch the system evolve. It must be visually polished and interactive enough to feature on a public marketing page.

## Hard constraints (auto-fail if violated)

- **One file only**: everything (HTML, CSS, JS) lives in `index.html`.
- **Zero network requests**: no CDNs, no external fonts, no images, no `fetch`. Must run from `file://` offline.
- **No build step**: opening the file in a browser just works.
- **No frameworks or libraries.** Vanilla JS + Canvas. System fonts only.
- Ship clean, readable JavaScript — no dead code, no console errors.

## Core requirements (the gate — these must all work)

1. A `<canvas>` simulation, sized responsively to the viewport, rendering bodies as circles.
2. **Newtonian gravity**: every body attracts every other with force `F = G·m₁·m₂ / r²`, directed along the line between them. Use a small softening term to avoid singularities when bodies overlap.
3. An interesting **starting system** on load (e.g. a star with orbiting planets, or a binary system) that visibly orbits rather than immediately flying apart or collapsing.
4. **Click-and-drag to launch** a new body: the drag vector sets its initial velocity (show an aim/preview line).
5. **Play / Pause** and **Reset**.
6. **Trails** behind moving bodies.
7. Smooth animation with no visible stutter for at least 100 bodies.

### Correctness acceptance test (the build must pass this)

A correct gravity model must produce a **stable circular orbit**. With gravitational constant `G = 1`, a light body at distance `r` from a heavy mass `M`, given tangential speed `v = √(G·M / r)`, must trace a near-circular orbit: over one full period `T = 2π·√(r³ / (G·M))` its distance from the heavy mass stays within ±25% of `r`, it completes exactly ~1 revolution, and no value goes non-finite. A wrong force law (e.g. `1/r` instead of `1/r²`), a sign error, or a missing mass term will fail this. Keep any softening term small (< 1) so it is negligible at `r = 100`.

### Automated grading hook (optional, recommended)

To allow `orbit-test.html` to verify your physics automatically, expose your integration step as a **pure function** on the global scope:

```js
// bodies: array of { x, y, vx, vy, mass }
// dt: time step
// Apply pairwise Newtonian gravity with G = 1, advance by dt (integrator of
// your choice), and return a NEW array of the same shape. Do not mutate input.
window.gravityStep = function (bodies, dt) { /* ... */ };
```

This hook is optional and does not affect the rendered app; it only enables one-click correctness checking. The harness uses a heavy mass `M = 1e6` at the origin and a light test body far from it, so softening and self-gravity of the light body are negligible.

## Weighted quality rubric (score out of 100)

Implement as many as you can, prioritising correctness and polish over raw feature count.

### A. Physics correctness — 30 pts
- 20 — Passes the circular-orbit acceptance test exactly.
- 10 — True pairwise N-body (every body attracts every other), with softening so overlaps don't blow up to `NaN`/`Infinity`.

### B. Core interactivity — 20 pts
- 8 — Click-and-drag to launch a body, with a visible aim/velocity preview.
- 6 — Play / Pause / Reset all work.
- 6 — A non-trivial preset system loads and orbits stably (solar system, binary star, etc.).

### C. Features & depth — 25 pts
- 7 — Fading trails that read clearly without smearing the whole canvas.
- 6 — Adjustable parameters (gravity strength, simulation speed / `dt`, trail length) via real controls.
- 4 — Mass affects body size; bodies merge or collide sensibly when they overlap.
- 4 — Pan and zoom the view.
- 4 — Live readout (body count, and/or total energy) or an "add random system" action.

### D. Visual design & polish — 15 pts
- 6 — Cohesive deep-space palette, glowing bodies, tasteful control layout (not default browser buttons).
- 5 — Pleasing rendering: gradients/glow, smooth anti-aliased trails.
- 4 — Considered typography, spacing, and a short inline "how to use" hint.

### E. Robustness & UX — 10 pts
- 4 — Responsive; launching bodies works with touch on a phone.
- 3 — Handles 200+ bodies without freezing.
- 2 — Keyboard shortcuts (e.g. Space = play/pause, R = reset).
- 1 — No console errors or warnings.

## Deliverable

A single `index.html` that, opened in any modern browser, presents a finished, attractive, fully interactive gravity sandbox meeting the above. Optimise for a screenshot that looks production-ready.

---

### Verifying correctness locally

`orbit-test.html` runs the circular-orbit acceptance test. Serve the folder over HTTP so it can read `index.html`'s optional grading hook:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/orbit-test.html
```

If `window.gravityStep` is exposed, the harness tests your implementation directly. Otherwise it falls back to verifying the reference physics so you can see exactly what a stable orbit looks like.
