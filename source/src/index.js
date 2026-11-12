(function() {
    
  lucide.createIcons();

  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const arrow = item.querySelector('.faq-arrow');
    if (question && answer && arrow) {
      question.addEventListener('click', () => {
        const isActive = answer.classList.contains('active');
        document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('active'));
        document.querySelectorAll('.faq-arrow').forEach(a => a.classList.remove('active'));
        if (!isActive) {
          answer.classList.add('active');
          arrow.classList.add('active');
        }
      });
    }
  });

  const browseToolsBtn = document.getElementById('browse-tools-btn');
  if (browseToolsBtn) {
    browseToolsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const mockWindow = document.querySelector('.mock-window');
      if (mockWindow) {
        mockWindow.style.transition = 'box-shadow 0.15s ease, border-color 0.15s ease';
        mockWindow.style.borderColor = '#1bd96a';
        mockWindow.style.boxShadow = '0 0 0 2px rgba(27,217,106,0.4)';
        setTimeout(() => {
          mockWindow.style.borderColor = '';
          mockWindow.style.boxShadow = '';
        }, 1000);
      }
    });
  }

  const rotatingText = document.getElementById('hero-rotating-text');
  if (rotatingText) {
    const words = ['customizations', 'crosshairs', 'textures', 'clients', 'scripts'];
    let index = 0;
    setInterval(() => {
      rotatingText.classList.add('text-animate-out');
      setTimeout(() => {
        index = (index + 1) % words.length;
        rotatingText.textContent = words[index];
        rotatingText.classList.remove('text-animate-out');
        rotatingText.classList.add('text-animate-in');
        setTimeout(() => {
          rotatingText.classList.remove('text-animate-in');
        }, 300);
      }, 250);
    }, 3000);
  }

  const MAX_TILT = 25;
  const SCALE_ON_HOVER = 1.05;
  const LERP = 0.2;

  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach(card => {
    let rafId = null;
    let targetRX = 0, targetRY = 0;
    let currentRX = 0, currentRY = 0;
    let isHovering = false;

    const isTouch = window.matchMedia('(hover: none)').matches;

    function onMouseMove(e) {
      if (isTouch) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = x / rect.width;
      const py = y / rect.height;

      targetRY = (px - 0.5) * 2 * MAX_TILT;
      targetRX = -(py - 0.5) * 2 * MAX_TILT;

      isHovering = true;

      if (!rafId) rafId = requestAnimationFrame(animate);
    }

    function onMouseLeave() {
      targetRX = 0;
      targetRY = 0;
      isHovering = false;
      if (!rafId) rafId = requestAnimationFrame(animate);
    }

    function animate() {
      currentRX += (targetRX - currentRX) * LERP;
      currentRY += (targetRY - currentRY) * LERP;

      const scale = isHovering ? SCALE_ON_HOVER : 1;
      card.style.transform =
        `rotateX(${currentRX.toFixed(2)}deg) rotateY(${currentRY.toFixed(2)}deg) scale(${scale})`;

      const doneX = Math.abs(targetRX - currentRX) < 0.05;
      const doneY = Math.abs(targetRY - currentRY) < 0.05;

      if (!isHovering && doneX && doneY) {
        card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        rafId = null;
        return;
      }

      rafId = requestAnimationFrame(animate);
    }

    if (!isTouch) {
      card.addEventListener('mousemove', onMouseMove);
      card.addEventListener('mouseleave', onMouseLeave);
    }
  });

  const CLIENT_ICON_FALLBACK = 'assets/icon.png';

  fetch('https://raw.githubusercontent.com/imnotkoolkid/KCH/refs/heads/main/data/clients.json')
    .then(r => r.json())
    .then(data => {
      const grid = document.getElementById('clientGrid');
      const centerName = document.getElementById('clientCenterName');
      if (!grid || !centerName) return;

      // only show clients that actually have an icon
      const clients = data.filter(c => c && c.name && c.icon && c.icon.trim() !== '');
      if (!clients.length) return;

      clients.forEach(client => {
        const node = document.createElement('div');
        node.className = 'client-node';
        node.dataset.name = client.name;
        if (client.downloadUrl) node.dataset.url = client.downloadUrl;

        const img = document.createElement('img');
        img.src = client.icon;
        img.alt = client.name + ' logo';
        img.loading = 'lazy';
        img.draggable = false;
        img.onerror = () => { img.src = CLIENT_ICON_FALLBACK; };
        node.appendChild(img);

        node.addEventListener('mouseenter', () => {
          centerName.textContent = client.name;
          centerName.classList.add('visible');
          grid.querySelectorAll('.client-node').forEach(n => n.classList.remove('active'));
          node.classList.add('active');
        });

        node.addEventListener('mouseleave', () => {
          centerName.classList.remove('visible');
          node.classList.remove('active');
        });

        // click opens the download/release page in a new tab
        if (client.downloadUrl) {
          node.addEventListener('click', () => {
            window.open(client.downloadUrl, '_blank', 'noopener');
          });
        }

        grid.appendChild(node);
      });
    })
    .catch(e => console.error('Error loading clients data:', e));

  const BLOCKED_IMG_PREFIX = 'https://i.pinimg.com/736x/a1/cd/44/a1cd44f6617beebb9794877ef59082a1.jpg';

  fetch('https://raw.githubusercontent.com/imnotkoolkid/KCH/refs/heads/main/data/maps.json')
    .then(r => r.json())
    .then(d => {
      const s = document.getElementById('map-image-slider');
      if (!s) return;
        
      const seen = new Set();
      const t = d.filter(i => {
        if (!i || !i.img) return false;
        if (i.img.startsWith(BLOCKED_IMG_PREFIX)) return false;
        if (seen.has(i.img)) return false;
        seen.add(i.img);
        return true;
      });
      if (!t.length) return;

      s.innerHTML = '<div class="loader"></div>';
      const loader = s.querySelector('.loader');
      const l = {};
      let c = 0, iT = false;

      function loadSequentially(index) {
        if (index >= t.length) return;
        const im = document.createElement('img');
        im.src = t[index].img;
        im.alt = t[index].name || 'Map Preview';
        im.className = 'slider-image';
        if (index === 0) im.classList.add('active');
        im.onload = () => {
          l[index] = true;
          if (index === 0 && loader) loader.style.display = 'none';
          loadSequentially(index + 1);
        };
        im.onerror = () => {
          l[index] = true;
          loadSequentially(index + 1);
        };
        s.appendChild(im);
      }

      loadSequentially(0);

      function next() {
        if (iT || t.length < 2) return;
        const n = (c + 1) % t.length;
        if (!l[n]) {
          const int = setInterval(() => { if (l[n]) { clearInterval(int); trans(n); } }, 200);
        } else {
          trans(n);
        }
      }

      function trans(n) {
        iT = true;
        const ims = s.querySelectorAll('.slider-image');
        ims[c].classList.add('slide-out');
        ims[n].classList.add('slide-in');
        setTimeout(() => {
          ims[c].classList.remove('active', 'slide-out');
          ims[n].classList.add('active');
          ims[n].classList.remove('slide-in');
          c = n;
          iT = false;
        }, 800);
      }

      setInterval(next, 4000);
    })
    .catch(e => console.error('Error loading Maps data:', e));

  document.querySelectorAll('.feature-img-container img').forEach(img => {
    if (img.complete) {
      const loader = img.parentElement.querySelector('.loader');
      if (loader) loader.style.display = 'none';
    } else {
      img.addEventListener('load', function() {
        const loader = this.parentElement.querySelector('.loader');
        if (loader) loader.style.display = 'none';
      });
    }
  });

  window.addEventListener('load', () => {
    document.querySelectorAll('.feature-img-container .loader').forEach(loader => {
      const img = loader.nextElementSibling;
      if (img && img.complete) loader.style.display = 'none';
    });
  });
})();
