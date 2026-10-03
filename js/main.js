(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Menú móvil */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    var closeMenu = function () {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menú');
    };
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* Carrusel */
  var slides = document.querySelectorAll('.slide');
  var dotsBox = document.getElementById('dots');
  var pp = document.getElementById('pp');
  var video = document.getElementById('heroVideo');
  var idx = 0, timer = null, playing = !reduce;

  slides.forEach(function (_, i) {
    var b = document.createElement('button');
    b.className = 'dot';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
    b.addEventListener('click', function () { go(i, true); });
    dotsBox.appendChild(b);
  });
  var dots = dotsBox.children;

  function go(n, user) {
    idx = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) {
      s.classList.toggle('active', i === idx);
      s.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
    });
    for (var i = 0; i < dots.length; i++) dots[i].setAttribute('aria-selected', i === idx);
    if (user && playing) restart();
  }
  function restart() { clearInterval(timer); if (playing) timer = setInterval(function () { go(idx + 1); }, 7000); }
  function setPlaying(p) {
    playing = p;
    pp.innerHTML = p ? '&#10074;&#10074;' : '&#9654;';
    pp.setAttribute('aria-label', p ? 'Pausar carrusel' : 'Reanudar carrusel');
    restart();
  }
  document.getElementById('prev').addEventListener('click', function () { go(idx - 1, true); });
  document.getElementById('next').addEventListener('click', function () { go(idx + 1, true); });
  pp.addEventListener('click', function () { setPlaying(!playing); });
  go(0);
  setPlaying(playing);

  if (video) {
    if (reduce) { video.pause(); video.removeAttribute('autoplay'); }
    document.addEventListener('visibilitychange', function () {
      if (reduce) return;
      if (document.hidden) video.pause(); else video.play().catch(function () {});
    });
  }

  /* Animación de entrada */
  var rev = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.12 });
    rev.forEach(function (el) { io.observe(el); });
  } else {
    rev.forEach(function (el) { el.classList.add('in'); });
  }

  /* Formulario: arma el mensaje y abre WhatsApp (sin enviar datos a terceros hasta que la persona lo confirma) */
  var form = document.getElementById('form');
  var msg = document.getElementById('msg');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.className = 'msg err';
      var f = form.elements;
      if (f.web.value) return; // anti-spam (campo trampa)
      var nombre = f.nombre.value.trim().slice(0, 80);
      var email = f.email.value.trim().slice(0, 120);
      var texto = f.mensaje.value.trim().slice(0, 1000);
      if (!nombre || !texto) { msg.textContent = 'Completá tu nombre y el mensaje.'; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Ingresá un correo electrónico válido.'; return; }
      if (!f.acepto.checked) { msg.textContent = 'Tenés que aceptar la Política de Privacidad.'; return; }
      var t = 'Hola, soy ' + nombre + ' (' + email + '). ' + texto;
      window.open('https://wa.me/543492660022?text=' + encodeURIComponent(t), '_blank', 'noopener');
      msg.className = 'msg';
      msg.textContent = 'Se abrió WhatsApp con tu consulta. ¡Gracias!';
      form.reset();
    });
  }

  /* Aviso de cookies */
  var ck = document.getElementById('cookie');
  var KEY = 'gi_cookies_ok';
  var seen = false;
  try { seen = localStorage.getItem(KEY) === '1'; } catch (err) {}
  if (ck && !seen) ck.hidden = false;
  var ok = document.getElementById('ck-ok');
  if (ok) ok.addEventListener('click', function () {
    try { localStorage.setItem(KEY, '1'); } catch (err) {}
    ck.hidden = true;
  });
})();
