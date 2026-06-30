/**
 * ============================================================
 *  Good Samaritans — Page Renderer
 *  Populates the HTML dynamically using data from CMS.
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Make sure CMS is loaded
  if (typeof CMS === 'undefined') {
    console.error('CMS engine not found. Ensure cms.js is loaded before render.js.');
    return;
  }

  // Helper to set text content
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  // Helper to set HTML content
  const setHtml = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  // Helper to set image src
  const setImg = (id, src) => {
    const el = document.getElementById(id);
    if (el) {
      // Handle lazy loaded images
      if (el.hasAttribute('data-src')) {
        el.setAttribute('data-src', src);
      } else {
        el.src = src;
      }
    }
  };

  // Helper to set link href
  const setHref = (id, href) => {
    const el = document.getElementById(id);
    if (el) el.href = href;
  };

  // Helper to set background image inline
  const setBgImg = (id, src) => {
    const el = document.getElementById(id);
    if (el) el.style.backgroundImage = `url('${src}')`;
  };

  /* ===========================================================
   *  RENDER FUNCTIONS
   * =========================================================== */

  const renderSite = (data) => {
    setImg('nav-logo-img', data.logo);
    setImg('footer-logo-img', data.logo);
    setText('nav-org-name', data.orgName);
    setText('footer-org-name', data.orgName);
    setText('nav-tagline', data.tagline);
    setText('footer-tagline', data.tagline);
  };

  const renderNavLinks = (data) => {
    const container = document.getElementById('nav-links');
    if (!container) return;
    
    let html = '';
    data.forEach(link => {
      html += `<li><a href="${link.href}">${link.label}</a></li>`;
    });
    // Add the donate button at the end
    const heroData = CMS.get('hero');
    html += `<li><a href="${heroData.donateLink}" class="btn-donate-nav pulse-donate">Donate ♥</a></li>`;
    container.innerHTML = html;

    const footerLinksContainer = document.getElementById('footer-links');
    if (footerLinksContainer) {
      let footerHtml = '';
      data.forEach(link => {
        footerHtml += `<a href="${link.href}">${link.label}</a>`;
      });
      footerLinksContainer.innerHTML = footerHtml;
    }
  };

  const renderHero = (data) => {
    setBgImg('hero-bg', data.bgImage);
    setText('hero-badge-stars', data.badgeStars);
    setText('hero-badge-year', data.badgeYear);
    setText('hero-title-1', data.titleLine1);
    setText('hero-title-2', data.titleLine2);
    setText('hero-title-3', data.titleLine3);
    setText('hero-subtitle', data.subtitle);
    
    setHref('hero-donate-btn', data.donateLink);
    setText('hero-donate-text', data.donateText);
    setHref('hero-learn-btn', data.learnMoreLink);
    setText('hero-learn-text', data.learnMoreText);
    
    // Pass typing phrases to a global variable so script.js can pick it up
    window.GS_TYPING_PHRASES = data.typingPhrases;
  };

  const renderAbout = (data) => {
    setText('about-label', data.label);
    setText('about-title', data.title);
    setText('about-desc', data.description);
    setHtml('about-highlight', data.highlightText);
    setText('about-scripture-text', data.scriptureText);
    setText('about-scripture-ref', data.scriptureRef);
    setImg('about-img', data.image);
    
    const imgEl = document.getElementById('about-img');
    if (imgEl) imgEl.alt = data.imageAlt || 'About Image';
  };

  const renderVision = (data) => {
    setBgImg('vision-bg', data.bgImage);
    setText('vision-label-text', data.label);
    setText('vision-title', data.title);
    setHtml('vision-text', data.text);
    setText('vision-verse', data.verse);
  };

  const renderStats = (data) => {
    const container = document.getElementById('stats-grid');
    if (!container) return;
    
    let html = '';
    data.forEach((stat, index) => {
      // Determine SVG based on icon string
      let svg = '';
      if (stat.icon === 'users') {
        svg = '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
      } else if (stat.icon === 'shield') {
        svg = '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
      } else if (stat.icon === 'heart') {
        svg = '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
      } else if (stat.icon === 'globe') {
        svg = '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
      } else {
        svg = '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'; // info default
      }
      
      const delay = index * 150;
      
      html += `
        <div class="stat-item animate-on-scroll" data-animation="fade-in-up" data-delay="${delay}">
            <div class="stat-icon">${svg}</div>
            <div class="stat-number"><span class="counter" data-target="${stat.number}">0</span>+</div>
            <div class="stat-label">${stat.label}</div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  };

  const renderImpact = (data) => {
    setText('impact-label', data.label);
    setText('impact-title', data.title);
    
    const container = document.getElementById('impact-cards');
    if (!container || !data.cards) return;
    
    let html = '';
    data.cards.forEach((card, index) => {
      const delay = index * 150;
      // Default icon based on title or random SVG if needed, using simple placeholders for now since we didn't store svg code
      // We will just use a generic icon or the image provided in data.
      html += `
        <div class="impact-card animate-on-scroll" data-animation="fade-in-up" data-delay="${delay}">
            <div class="card-color-bar" style="background-color: ${card.color || '#0d6eaa'}"></div>
            <div class="impact-card-image">
                <img src="${card.image}" alt="${card.title}" loading="lazy">
                <div class="impact-card-icon" style="background-color: ${card.color || '#0d6eaa'}">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
            </div>
            <div class="impact-card-content">
                <h3 class="impact-card-title">${card.title}</h3>
                <p class="impact-card-text">${card.text}</p>
            </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  };

  const renderGiving = (data) => {
    setText('giving-left-title', data.leftTitle);
    setText('giving-left-text', data.leftText);
    setHtml('giving-left-blessing', `<em>${data.leftBlessing}</em>`);
    
    setText('giving-main-title', data.mainTitle);
    setHtml('giving-main-script', `${data.mainScript}`);
    setText('giving-main-text', data.mainText);
    setText('giving-main-btn-text', data.mainBtnText);
    setHref('giving-main-btn', data.mainBtnLink);
    setHtml('giving-main-thanks', `<em>${data.mainThanks}</em>`);
    
    setText('giving-right-title', data.rightTitle);
    setText('giving-right-text', data.rightText);
    setHtml('giving-right-blessing', `<em>${data.rightBlessing}</em>`);
  };

  const renderGallery = (data) => {
    setText('gallery-label', data.label);
    setText('gallery-title', data.title);
    
    const container = document.getElementById('gallery-grid');
    if (!container || !data.items) return;
    
    let html = '';
    data.items.forEach(item => {
      const wideClass = item.wide ? 'gallery-item-wide' : '';
      html += `
        <div class="gallery-item ${wideClass}">
            <img src="${item.image}" alt="${item.caption}" loading="lazy">
            <div class="gallery-overlay">
                <p class="gallery-caption">${item.caption}</p>
            </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  };

  const renderMedia = (data) => {
    setText('media-label', data.label);
    setText('media-title', data.title);
    
    const container = document.getElementById('media-grid');
    if (!container || !data.items || data.items.length === 0) {
      if (document.getElementById('media')) document.getElementById('media').style.display = 'none';
      return;
    }
    
    if (document.getElementById('media')) document.getElementById('media').style.display = 'block';

    let html = '';
    data.items.forEach((item, index) => {
      const delay = (index % 3) * 150;
      
      let mediaContent = '';
      if (item.type === 'video') {
        const embedUrl = CMS.driveUrl(item.url, 'video');
        mediaContent = `
          <div class="media-video-wrapper">
             <iframe src="${embedUrl}" width="100%" height="100%" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>
        `;
      } else {
        const embedUrl = CMS.driveUrl(item.url, 'image');
        mediaContent = `<img src="${embedUrl}" alt="${item.title}" loading="lazy" class="media-image">`;
      }

      html += `
        <div class="media-card animate-on-scroll" data-animation="fade-in-up" data-delay="${delay}">
            <div class="media-content-wrapper">
                ${mediaContent}
            </div>
            <div class="media-info">
                <h3 class="media-card-title">${item.title}</h3>
                <p class="media-card-desc">${item.description}</p>
            </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  };

  const renderImpactBanner = (data) => {
    setBgImg('banner-bg', data.bgImage);
    setHtml('banner-text', data.text);
    setText('banner-sub', data.subText);
  };

  const renderPartner = (data) => {
    setText('partner-label', data.label);
    setText('partner-title', data.title);
    
    const container = document.getElementById('partner-grid');
    if (!container || !data.cards) return;
    
    let html = '';
    data.cards.forEach((card, index) => {
      const delay = index * 150;
      const featuredClass = card.featured ? 'featured' : '';
      
      let btnHtml = '';
      if (card.btnText && card.btnLink) {
        btnHtml = `<a href="${card.btnLink}" class="btn btn-donate pulse-donate partner-btn">${card.btnText}</a>`;
      }

      html += `
        <div class="partner-card ${featuredClass} animate-on-scroll" data-animation="fade-in-scale" data-delay="${delay}">
            <div class="partner-icon-circle">${card.emoji}</div>
            <h3 class="partner-card-title">${card.title}</h3>
            <p class="partner-card-text">${card.text}</p>
            ${btnHtml}
        </div>
      `;
    });
    
    container.innerHTML = html;
  };

  const renderFooter = (data) => {
    setText('footer-thank-title', data.thankTitle);
    setHtml('footer-thank-text', `<em>${data.thankText}</em>`);
    setHtml('footer-verse', `<em>${data.verse}</em>`);
    
    setHref('social-facebook', data.socialLinks.facebook || '#');
    setHref('social-instagram', data.socialLinks.instagram || '#');
    setHref('social-youtube', data.socialLinks.youtube || '#');
    setHref('social-whatsapp', data.socialLinks.whatsapp || '#');
  };

  /* ===========================================================
   *  INITIALIZE RENDERING
   * =========================================================== */

  const renderAll = () => {
    try {
      renderSite(CMS.get('site'));
      renderNavLinks(CMS.get('navLinks'));
      renderHero(CMS.get('hero'));
      renderAbout(CMS.get('about'));
      renderVision(CMS.get('vision'));
      renderStats(CMS.get('stats'));
      renderImpact(CMS.get('impact'));
      renderGiving(CMS.get('giving'));
      renderGallery(CMS.get('gallery'));
      renderMedia(CMS.get('media'));
      renderImpactBanner(CMS.get('impactBanner'));
      renderPartner(CMS.get('partner'));
      renderFooter(CMS.get('footer'));
      
      console.log('✅ CMS data rendered to DOM');
    } catch (e) {
      console.error('Error rendering CMS data:', e);
    }
  };

  // Run render first before scripts kick in to ensure DOM is ready
  renderAll();
});
