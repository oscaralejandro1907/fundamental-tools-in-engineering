/* ============================================================
   DRAFTING TABLE — shared behaviour
   Vanilla JS, no dependencies, works from file:// and GitHub Pages
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.textContent = open ? '[ CLOSE ]' : '[ MENU ]';
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- reveal on scroll ---------- */
  var targets = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window) || reduced) {
    Array.prototype.forEach.call(targets, function (t) { t.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(targets, function (t) { io.observe(t); });
  }

  /* ---------- blueprint parallax ---------- */
  var sub = document.querySelector('.substrate');
  if (sub && !reduced && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 18;
      var y = (e.clientY / window.innerHeight - 0.5) * 18;
      sub.style.setProperty('--par-x', x.toFixed(1) + 'px');
      sub.style.setProperty('--par-y', y.toFixed(1) + 'px');
    }, { passive: true });
  }

  /* ---------- drafting crosshair ---------- */
  var cross = document.querySelector('.crosshair');
  if (cross && !reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var cx = 0, cy = 0, raf = null;
    window.addEventListener('mousemove', function (e) {
      cx = e.clientX; cy = e.clientY;
      if (!cross.classList.contains('live')) cross.classList.add('live');
      if (!raf) {
        raf = requestAnimationFrame(function () {
          cross.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
          raf = null;
        });
      }
      var el = e.target;
      var hot = el && el.closest && el.closest('a, button, input, select, .card');
      document.body.classList.toggle('pointing', !!hot);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cross.classList.remove('live'); });
  }

  /* ---------- schematic line-draw ---------- */
  var draw = document.querySelectorAll('.draw');
  Array.prototype.forEach.call(draw, function (svg) {
    var shapes = svg.querySelectorAll('path, line, circle, rect, polyline, polygon');
    Array.prototype.forEach.call(shapes, function (s, i) {
      var len = 0;
      try { len = s.getTotalLength ? s.getTotalLength() : 0; } catch (err) { len = 0; }
      if (!len) return;
      s.style.setProperty('--len', Math.ceil(len));
      s.style.animationDelay = (0.35 + i * 0.07).toFixed(2) + 's';
    });
  });

  /* ---------- isometric drawing: tilt in 3D with the pointer ---------- */
  var stage = document.querySelector('.iso-stage');
  var tilt = stage && stage.querySelector('.iso-tilt');
  if (tilt && !reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var tRaf = null, tx = 0, ty = 0;

    function apply() {
      tilt.style.transform = 'rotateX(' + tx.toFixed(2) + 'deg) rotateY(' + ty.toFixed(2) + 'deg)';
      tRaf = null;
    }

    window.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      var cxs = r.left + r.width / 2;
      var cys = r.top + r.height / 2;
      // normalised offset from the panel centre, damped and clamped
      var nx = Math.max(-1, Math.min(1, (e.clientX - cxs) / (window.innerWidth * 0.55)));
      var ny = Math.max(-1, Math.min(1, (e.clientY - cys) / (window.innerHeight * 0.65)));
      ty = nx * 13;    // yaw
      tx = -ny * 9;    // pitch
      if (!tRaf) tRaf = requestAnimationFrame(apply);
    }, { passive: true });

    // snap back when the pointer leaves the window
    document.addEventListener('mouseleave', function () {
      tx = 0; ty = 0;
      if (!tRaf) tRaf = requestAnimationFrame(apply);
    });

    // a small deliberate nudge on load, so the depth is obvious before any input
    setTimeout(function () {
      tilt.style.transition = 'transform 1.6s ' + 'cubic-bezier(.22,1,.36,1)';
      tx = -5; ty = 11; apply();
      setTimeout(function () {
        tx = 0; ty = 0; apply();
        setTimeout(function () { tilt.style.transition = ''; }, 1700);
      }, 1700);
    }, 1500);
  }

  /* ---------- current year ---------- */
  var y = document.querySelectorAll('[data-year]');
  Array.prototype.forEach.call(y, function (n) { n.textContent = new Date().getFullYear(); });
})();
