/* =========================================================
   PEREZ TECH — main.js
   ========================================================= */
(function () {
  'use strict';

  /* -------------------------------------------------------
     CONFIGURAÇÃO DE WHATSAPP E MENSAGENS
     ------------------------------------------------------- */
  // Substitua pelo número oficial (55 + DDD + Número)
  const WHATSAPP_NUMBER = '5517992411660'; 
  
  // Mensagens dinâmicas: dependendo do botão que o cliente clicar, a mensagem muda.
  const WHATSAPP_MESSAGES = {
    geral: 'Olá! Vim pelo site da PEREZ TECH e gostaria de saber mais sobre as soluções de vocês.',
    seguranca: 'Olá! Vim pelo site da PEREZ TECH e gostaria de um orçamento para Segurança e CFTV.',
    automacao: 'Olá! Vim pelo site da PEREZ TECH e gostaria de saber mais sobre Automação Residencial.',
    redes: 'Olá! Vim pelo site da PEREZ TECH e gostaria de um projeto de Redes e Infraestrutura.',
    audiovisual: 'Olá! Vim pelo site da PEREZ TECH e gostaria de informações sobre Áudio e Vídeo / Home Cinema.',
    digital: 'Olá! Vim pelo site da PEREZ TECH e quero saber mais sobre as Plaquetas NFC e Soluções Digitais.'
  };

  // Verifica as preferências do usuário (acessibilidade)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* -------------------------------------------------------
     1. Links de WhatsApp Contextualizados
     ------------------------------------------------------- */
  function setupWhatsApp() {
    const links = document.querySelectorAll('[data-wa]');
    
    links.forEach((el) => {
      // Pega a qual serviço o botão pertence. Se não tiver, usa 'geral'.
      const service = el.getAttribute('data-service') || 'geral';
      const msg = WHATSAPP_MESSAGES[service] || WHATSAPP_MESSAGES.geral;
      
      // Monta a URL com a mensagem codificada para a web
      const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
      
      // Aplica o link ao botão
      el.setAttribute('href', url);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
  }

  /* -------------------------------------------------------
     2. Navbar e Barra de Progresso
     ------------------------------------------------------- */
  function setupNav() {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    const progressBar = document.querySelector('.progress__bar');

    // Lógica para abrir e fechar o menu no celular
    if (toggle && links) {
      const setOpen = (open) => {
        links.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
      };

      toggle.addEventListener('click', () => {
        setOpen(!links.classList.contains('is-open'));
      });

      // Fecha o menu ao clicar em qualquer link
      links.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => setOpen(false));
      });

      // Fecha o menu ao clicar fora dele
      document.addEventListener('click', (e) => {
        if (links.classList.contains('is-open') && !links.contains(e.target) && !toggle.contains(e.target)) {
          setOpen(false);
        }
      });
    }

    // Otimização de Scroll (Navbar escura + Barra de progresso no topo)
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      
      requestAnimationFrame(() => {
        const y = window.scrollY;
        
        // Ativa o fundo escuro da navbar após rolar um pouco
        if (nav) nav.classList.toggle('is-scrolled', y > 24);
        
        // Atualiza a barrinha de progresso no topo
        if (progressBar) {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const ratio = max > 0 ? Math.min(y / max, 1) : 0;
          progressBar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* -------------------------------------------------------
     3. Animações de Revelação ao Rolar (Reveal)
     ------------------------------------------------------- */
  function setupReveal() {
    // Aplica um atraso (stagger) entre os elementos de um mesmo grupo
    document.querySelectorAll('[data-stagger]').forEach((parent) => {
      const children = parent.querySelectorAll('.reveal');
      children.forEach((el, i) => {
        el.style.setProperty('--d', (i * 80) + 'ms');
      });
    });

    const revealEls = document.querySelectorAll('.reveal');
    const stepsSection = document.querySelector('.steps');

    // Se o usuário prefere movimento reduzido, mostra tudo direto
    if (prefersReduced || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
      if (stepsSection) stepsSection.classList.add('is-visible');
      return;
    }

    // Observador de interseção: anima o elemento quando ele entra na tela
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Para de observar depois que animou
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealEls.forEach((el) => observer.observe(el));
    
    // Observa a seção de "Passos" para animar a linha conectora
    if (stepsSection) {
      const stepsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            stepsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });
      stepsObserver.observe(stepsSection);
    }
  }

  /* -------------------------------------------------------
     4. Gerador de QR Code (SVG Decorativo)
     ------------------------------------------------------- */
  function buildQRSvg(seedValue) {
    const size = 25;
    let seed = seedValue || 1337;
    
    // Gerador de números pseudo-aleatórios para criar o padrão visual
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    const grid = Array.from({ length: size }, () => new Array(size).fill(0));

    // Desenha os quadrados de localização (os 3 cantos)
    const drawFinder = (r0, c0) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const edge = r === 0 || r === 6 || c === 0 || c === 6;
          const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[r0 + r][c0 + c] = (edge || core) ? 1 : 0;
        }
      }
    };
    drawFinder(0, 0); 
    drawFinder(0, size - 7); 
    drawFinder(size - 7, 0);

    // Espaçamento e padrões de sincronia
    for (let i = 0; i < 8; i++) {
      grid[7][i] = 0; grid[i][7] = 0; 
      grid[7][size - 1 - i] = 0; grid[i][size - 8] = 0;
      grid[size - 8][i] = 0; grid[size - 1 - i][7] = 0;
    }
    for (let i = 8; i < size - 8; i++) {
      grid[6][i] = (i % 2 === 0) ? 1 : 0; 
      grid[i][6] = (i % 2 === 0) ? 1 : 0;
    }

    // Padrão de alinhamento (canto inferior direito)
    const ar = size - 9, ac = size - 9;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const edge = r === 0 || r === 4 || c === 0 || c === 4;
        const center = r === 2 && c === 2;
        grid[ar + r][ac + c] = (edge || center) ? 1 : 0;
      }
    }

    // Preenche o resto com os pontinhos aleatórios
    const reserved = (r, c) => 
      (r < 9 && c < 9) || (r < 9 && c >= size - 8) || 
      (r >= size - 8 && c < 9) || (r >= ar - 1 && r <= ar + 5 && c >= ac - 1 && c <= ac + 5);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!reserved(r, c)) grid[r][c] = rnd() > 0.52 ? 1 : 0;
      }
    }

    // Monta o SVG em string
    let rects = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c]) rects += '<rect x="' + c + '" y="' + r + '" width="1" height="1"/>';
      }
    }
    
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true"><rect width="' + size + '" height="' + size + '" fill="#ffffff"/><g fill="#0a1120">' + rects + '</g></svg>';
  }

  function setupQR() {
    document.querySelectorAll('[data-qr]').forEach((el) => {
      const seed = parseInt(el.getAttribute('data-seed') || '1337', 10);
      el.innerHTML = buildQRSvg(seed);
    });
  }

  /* -------------------------------------------------------
     5. Parallax Tilt 3D (Efeito de inclinação da placa)
     ------------------------------------------------------- */
  function setupTilt() {
    if (!finePointer || prefersReduced) return;
    
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const max = parseFloat(el.getAttribute('data-tilt')) || 8;
      const scene = el.closest('.scene') || el.closest('.demo') || el;
      let raf = null;
      
      scene.addEventListener('pointermove', (e) => {
        const rect = scene.getBoundingClientRect();
        // Calcula a posição do mouse relativa ao centro do elemento
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          // Aplica rotação 3D e efeito de brilho (variáveis CSS)
          el.style.setProperty('--ry', (px * max * 2).toFixed(2) + 'deg');
          el.style.setProperty('--rx', (-py * max * 2).toFixed(2) + 'deg');
          el.style.setProperty('--mx', ((px + 0.5) * 100).toFixed(1) + '%');
          el.style.setProperty('--my', ((py + 0.5) * 100).toFixed(1) + '%');
        });
      });
      
      // Volta ao normal quando o mouse sai
      scene.addEventListener('pointerleave', () => {
        el.style.setProperty('--rx', '0deg'); 
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* -------------------------------------------------------
     6. Cartões Digitais 3D (Flip no toque/clique)
     ------------------------------------------------------- */
  function setupCards() {
    document.querySelectorAll('.dcard').forEach((card) => {
      const toggleFlip = () => card.classList.toggle('is-flipped');
      
      card.addEventListener('click', toggleFlip);
      
      // Acessibilidade via teclado (Enter e Espaço)
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { 
          e.preventDefault(); 
          toggleFlip(); 
        }
      });
      
      // Efeito de luz seguindo o mouse no cartão
      if (finePointer) {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty('--mx', `${x}%`);
          card.style.setProperty('--my', `${y}%`);
        });
      }
    });
  }

  /* -------------------------------------------------------
     7. Scroll Suave com Compensação de Navbar
     ------------------------------------------------------- */
  function setupSmoothAnchors() {
    if (prefersReduced) return;
    
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (!id || id === '#') return;
        
        const target = document.querySelector(id);
        if (!target) return;
        
        e.preventDefault();
        
        // Altura da navbar fixa para não esconder o título da seção
        const navHeight = 80;
        const y = target.getBoundingClientRect().top + window.scrollY - (id === '#hero' ? 0 : navHeight);
        
        window.scrollTo({ 
          top: Math.max(y, 0), 
          behavior: 'smooth' 
        });
      });
    });
  }

  /* -------------------------------------------------------
     8. Simulador NFC Interativo (Arrastar ou Clicar)
     ------------------------------------------------------- */
  function setupNFCInteractive() {
    const demo = document.getElementById('nfc-demo');
    const plaque = document.getElementById('nfc-plaque');
    const phone = document.getElementById('nfc-phone');
    const chipText = document.getElementById('nfc-chip');
    
    if (!demo || !plaque || !phone) return;
    
    let isTapped = false;

    const triggerNFC = () => {
      if (isTapped) return;
      isTapped = true;
      
      // Ativa a animação do celular indo em direção à placa
      demo.classList.add('is-tapped');
      chipText.innerHTML = '<span class="chip-dot" style="background:#22d3ee;box-shadow:0 0 10px #22d3ee"></span> Avaliação aberta com sucesso!';
      
      // Reseta a animação após 4 segundos para permitir testar de novo
      setTimeout(() => {
        demo.classList.remove('is-tapped');
        isTapped = false;
        chipText.innerHTML = '<span class="chip-dot"></span> Clique na placa ou arraste o celular';
      }, 4500);
    };

    // 1. Gatilho por Clique na Placa
    plaque.addEventListener('click', triggerNFC);

    // 2. Gatilho por Arrastar o Celular (Drag and Drop)
    let startX, startY;
    
    phone.addEventListener('pointerdown', (e) => {
      startX = e.clientX;
      startY = e.clientY;
      phone.setPointerCapture(e.pointerId);
    });

    phone.addEventListener('pointerup', (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Se o usuário arrastou para a esquerda ou para baixo com força suficiente
      if (deltaX < -50 || deltaY > 50) {
        triggerNFC();
      }
    });
  }

  /* -------------------------------------------------------
     9. Personalizador de Cores da Placa
     ------------------------------------------------------- */
  function setupPlaqueCustomizer() {
    const swatches = document.querySelectorAll('.swatch');
    const plaque = document.querySelector('.demo__plaque .plaque');
    
    if (!swatches.length || !plaque) return;

    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        // Remove a seleção anterior
        swatches.forEach(s => s.classList.remove('is-active'));
        swatch.classList.add('is-active');
        
        const color = swatch.getAttribute('data-color');
        const texts = plaque.querySelectorAll('.plaque__hint, .plaque__bottom strong');
        
        // Muda a cor baseada na escolha
        if (color === 'graphite') {
          plaque.style.background = 'radial-gradient(120% 90% at 18% 0%, rgba(34, 211, 238, .16), transparent 58%), linear-gradient(158deg, #17233c 0%, #0b1322 52%, #070c16 100%)';
          plaque.style.borderColor = 'rgba(120, 160, 220, .22)';
          texts.forEach(t => t.style.color = ''); // Restaura a cor original do CSS
        } else if (color === 'wood') {
          plaque.style.background = 'radial-gradient(120% 90% at 18% 0%, rgba(180, 120, 60, .2), transparent 58%), linear-gradient(158deg, #3d2616 0%, #25150a 52%, #140b05 100%)';
          plaque.style.borderColor = 'rgba(180, 120, 60, .3)';
          texts.forEach(t => t.style.color = '');
        } else if (color === 'pearl') {
          plaque.style.background = 'radial-gradient(120% 90% at 18% 0%, rgba(255, 255, 255, .5), transparent 58%), linear-gradient(158deg, #e2e8f0 0%, #cbd5e1 52%, #94a3b8 100%)';
          plaque.style.borderColor = 'rgba(255, 255, 255, .5)';
          texts.forEach(t => t.style.color = '#0b1220'); // Escurece o texto para dar contraste no fundo claro
        }
      });
    });
  }

  /* -------------------------------------------------------
     10. Botões Magnéticos (Efeito de atração do mouse)
     ------------------------------------------------------- */
  function setupMagneticButtons() {
    if (!finePointer || prefersReduced) return;
    
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        // Calcula a distância do mouse até o centro do botão
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const strength = 0.3; // Força da atração (0.3 é sutil e elegante)
        
        // Move o botão levemente em direção ao mouse
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      
      // Quando o mouse sai, o botão volta para o lugar
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* -------------------------------------------------------
     11. Atualiza o Ano no Rodapé
     ------------------------------------------------------- */
  function setupYear() {
    const el = document.getElementById('year');
    if (el) {
      el.textContent = new Date().getFullYear();
    }
  }

  /* -------------------------------------------------------
     Inicialização de Todas as Funções
     ------------------------------------------------------- */
  function init() {
    setupWhatsApp();
    setupNav();
    setupQR();
    setupReveal();
    setupTilt();
    setupCards();
    setupSmoothAnchors();
    setupNFCInteractive();
    setupPlaqueCustomizer();
    setupMagneticButtons();
    setupYear();
  }

  // Roda o script apenas quando o HTML estiver carregado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();