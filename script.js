/* ============================================================
   RSS TechLabs - site interactions
   Vanilla JS: nav, scroll-reveal, counters, hero particles, form
   ============================================================ */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky nav + back-to-top visibility ---------- */
  var nav = document.getElementById("nav");
  var toTop = document.getElementById("toTop");

  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    toTop.classList.toggle("is-visible", y > 600);
    highlightNav();
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* ---------- Mobile menu ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });

  // Close the mobile menu after choosing a destination
  navLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Active-link highlighting ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var linkMap = {};
  Array.prototype.forEach.call(navLinks.querySelectorAll("a"), function (a) {
    linkMap[a.getAttribute("href").slice(1)] = a;
  });

  function highlightNav() {
    var pos = window.scrollY + window.innerHeight * 0.35;
    var currentId = sections[0] ? sections[0].id : null;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) currentId = sec.id;
    });
    Object.keys(linkMap).forEach(function (id) {
      linkMap[id].classList.toggle("is-active", id === currentId);
    });
  }

  /* ---------- Scroll-reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll(".stat__num");
  var counterIo = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        counterIo.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach(function (el) { counterIo.observe(el); });

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (prefersReducedMotion) { el.textContent = target; return; }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic for a satisfying settle
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Hero particle network (brand circuit motif) ---------- */
  var canvas = document.getElementById("heroCanvas");
  if (canvas && !prefersReducedMotion) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var COUNT = window.innerWidth < 700 ? 14 : 28;
    var LINK_DIST = 140;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (var i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6
      });
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < COUNT; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(140, 176, 255, 0.4)";
        ctx.fill();

        for (var j = i + 1; j < COUNT; j++) {
          var q = particles[j];
          var dx = p.x - q.x;
          var dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "rgba(140, 176, 255," + 0.1 * (1 - dist / LINK_DIST) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    }

    // Only animate while the hero is on screen — saves CPU/GPU when scrolled away
    var raf = null;
    function start() { if (!raf) raf = requestAnimationFrame(tick); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0 }).observe(document.querySelector(".hero"));
    }
    start();
  }

  /* ---------- Neural-network brain (hero visual) ---------- */
  (function initBrain() {
    var canvas = document.querySelector(".ai-brain-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Brain silhouette described as a union of circles (normalised 0 to 1, y down).
    // Faces left with a stem at the lower-centre - echoing the reference art.
    var CIRCLES = [
      [0.50, 0.44, 0.30], [0.33, 0.30, 0.14], [0.46, 0.25, 0.15], [0.59, 0.25, 0.15],
      [0.71, 0.31, 0.14], [0.26, 0.45, 0.16], [0.75, 0.45, 0.16], [0.40, 0.61, 0.15],
      [0.59, 0.61, 0.15], [0.21, 0.40, 0.12], [0.53, 0.72, 0.085]
    ];

    var W = 0, H = 0, S = 0, path = null, pts = [], edges = [];

    function build() {
      // clientWidth/Height are layout sizes - unaffected by the 3D transforms on ancestors
      var cw = canvas.clientWidth || canvas.parentNode.clientWidth || 300;
      var ch = canvas.clientHeight || canvas.parentNode.clientHeight || 300;
      W = canvas.width = Math.max(1, Math.round(cw * dpr));
      H = canvas.height = Math.max(1, Math.round(ch * dpr));
      S = Math.min(W, H);

      // silhouette path (union of the circles)
      path = new Path2D();
      for (var i = 0; i < CIRCLES.length; i++) {
        var c = CIRCLES[i];
        path.moveTo(c[0] * W + c[2] * S, c[1] * H);
        path.arc(c[0] * W, c[1] * H, c[2] * S, 0, Math.PI * 2);
      }

      // rejection-sample nodes inside the silhouette
      var target = W < 480 ? 120 : 185;
      pts = [];
      var attempts = 0, max = target * 60;
      while (pts.length < target && attempts < max) {
        attempts++;
        var x = Math.random() * W, y = Math.random() * H;
        if (ctx.isPointInPath(path, x, y)) {
          pts.push({ x: x, y: y, ph: Math.random() * 6.283, r: (Math.random() * 1.1 + 0.7) * dpr });
        }
      }

      // connect near neighbours into a mesh
      var dmax = 0.135 * S, dmax2 = dmax * dmax;
      edges = [];
      for (var a = 0; a < pts.length; a++) {
        for (var b = a + 1; b < pts.length; b++) {
          var ddx = pts[a].x - pts[b].x, ddy = pts[a].y - pts[b].y;
          var d2 = ddx * ddx + ddy * ddy;
          if (d2 < dmax2) edges.push([a, b, Math.sqrt(d2) / dmax]);
        }
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      // mesh edges
      ctx.lineWidth = Math.max(1, 0.7 * dpr);
      for (var k = 0; k < edges.length; k++) {
        var e = edges[k], pa = pts[e[0]], pb = pts[e[1]];
        var alpha = (1 - e[2]) * 0.45;
        if (!prefersReducedMotion) alpha *= 0.55 + 0.45 * Math.sin(t * 0.0012 + pa.ph);
        if (alpha <= 0.01) continue;
        ctx.strokeStyle = "rgba(70, 150, 255, " + alpha.toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }

      // glowing nodes
      ctx.shadowColor = "rgba(90, 170, 255, 0.95)";
      ctx.shadowBlur = 6 * dpr;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var tw = prefersReducedMotion ? 1 : 0.55 + 0.45 * Math.sin(t * 0.002 + p.ph);
        ctx.fillStyle = "rgba(205, 232, 255, " + tw.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
    }

    build();
    draw(0); // paint one frame immediately (independent of rAF)

    if (!prefersReducedMotion) {
      var loop = function (t) { draw(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { build(); draw(performance.now()); }, 200);
    });
  })();

  /* ---------- 3D scene parallax (mouse-driven tilt + gentle idle) ---------- */
  (function initScene3D() {
    var s3 = document.querySelector(".s3");
    if (!s3 || prefersReducedMotion) return;
    var stage = s3.querySelector(".s3__stage");

    var baseY = -8, baseX = 5;         // resting tilt
    var targetY = baseY, targetX = baseX;
    var curY = baseY, curX = baseX;
    var frame = 0;

    s3.addEventListener("mousemove", function (e) {
      var r = s3.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
      var py = (e.clientY - r.top) / r.height - 0.5;
      targetY = baseY + px * 12;   // rotateY follows cursor X
      targetX = baseX - py * 10;   // rotateX follows cursor Y
    });
    s3.addEventListener("mouseleave", function () { targetY = baseY; targetX = baseX; });

    (function loop() {
      frame++;
      var idleY = Math.sin(frame * 0.012) * 3;
      var idleX = Math.cos(frame * 0.010) * 1.4;
      curY += (targetY + idleY - curY) * 0.08;
      curX += (targetX + idleX - curX) * 0.08;
      stage.style.transform = "rotateX(" + curX.toFixed(2) + "deg) rotateY(" + curY.toFixed(2) + "deg)";
      requestAnimationFrame(loop);
    })();
  })();

  /* ---------- Contact form (static site - opens mail client) ---------- */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      note.textContent = "Please fill in all fields with valid details.";
      form.reportValidity();
      return;
    }

    var name = document.getElementById("cfName").value.trim();
    var email = document.getElementById("cfEmail").value.trim();
    var subject = document.getElementById("cfSubject").value.trim();
    var message = document.getElementById("cfMessage").value.trim();

    // No backend on a static site - compose the message in the visitor's mail client
    var body = "Name: " + name + "\nEmail: " + email + "\n\n" + message;
    var mailto =
      "mailto:rsstechlab1406@gmail.com" +
      "?subject=" + encodeURIComponent("[Website] " + subject) +
      "&body=" + encodeURIComponent(body);

    window.location.href = mailto;
    note.textContent = "Opening your email app… If nothing happens, write to rsstechlab1406@gmail.com directly.";
    form.reset();
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  // Initial state
  onScroll();
})();
