/**
 * ============================================================
 *  Good Samaritans — CMS Data Engine
 *  Client-side CMS using localStorage
 * ============================================================
 *
 *  Usage:
 *    CMS.get('hero')           → returns hero section data
 *    CMS.set('hero', data)     → saves hero section data
 *    CMS.getAll()              → returns entire site data
 *    CMS.resetAll()            → clears all edits, restores defaults
 *    CMS.exportJSON()          → returns JSON string for backup
 *    CMS.importJSON(str)       → restores from JSON string
 *    CMS.driveUrl(url, 'img')  → converts Drive sharing link
 */

const CMS = (() => {
  'use strict';

  const STORAGE_KEY = 'gs_cms_data';
  const ADMIN_PASS_KEY = 'gs_admin_pass';

  /* ===========================================================
   *  DEFAULT DATA — matches the original static page content
   * =========================================================== */

  const DEFAULTS = {
    site: {
      logo: 'images/logo.png',
      orgName: 'Good Samaritans',
      tagline: 'Love Your Neighbour',
      adminPassword: 'admin123'
    },

    hero: {
      bgImage: 'images/hero-bg.png',
      badgeStars: '★ ★ ★',
      badgeYear: 'Est. 2022',
      titleLine1: "Serving God's Workers.",
      titleLine2: 'Caring for the Poor.',
      titleLine3: "Sharing Christ's Love.",
      subtitle: 'A faith-driven initiative bringing hope, dignity, and practical help to those in need.',
      typingPhrases: ["Serving God's Workers", 'Caring for the Poor', "Sharing Christ's Love"],
      donateLink: '#giving',
      donateText: 'Give Today',
      learnMoreLink: '#about',
      learnMoreText: 'Learn More'
    },

    about: {
      label: 'About',
      title: 'Good Samaritans',
      description: 'We are a faith-driven initiative dedicated to supporting missionaries, ministries, and underprivileged families.',
      highlightText: 'We share <strong>God\'s love</strong> through practical help, financial support, and Gospel outreach to those in need.',
      scriptureText: 'Truly I tell you, whatever you did for one of the least of these brothers and sisters of mine, you did for me.',
      scriptureRef: '— Matthew 25:40',
      image: 'images/about-image.png',
      imageAlt: 'A child smiling with hope'
    },

    vision: {
      bgImage: 'images/vision-bg.png',
      label: 'Our Vision',
      title: 'Building a Community of Compassion & Faith in Action',
      text: 'Good Samaritans exists to strengthen missionaries and ministries serving God\'s Kingdom and to bring hope, dignity, and practical help to the poor and needy. Through prayer, giving, and partnership, we build a community of <strong>compassion and faith in action</strong>.',
      verse: '"Love your neighbour as yourself." — Mark 12:31'
    },

    stats: [
      { number: 500, label: 'Families Supported', icon: 'users' },
      { number: 50, label: 'Missionaries Supported', icon: 'shield' },
      { number: 1000, label: 'Lives Touched', icon: 'heart' },
      { number: 10, label: 'Regions Reached', icon: 'globe' }
    ],

    impact: {
      label: 'How Your Support Helps',
      title: 'Making a Difference, One Life at a Time',
      cards: [
        {
          image: 'images/support-missionaries.png',
          title: 'Support Missionaries',
          text: 'Helping those who are spreading the Gospel and serving communities on the frontlines.',
          color: '#0d6eaa'
        },
        {
          image: 'images/care-for-poor.png',
          title: 'Care for the Poor',
          text: 'Supporting widows, elderly people, orphans, and vulnerable families with essentials, clothing, and other basic needs.',
          color: '#e8922d'
        },
        {
          image: 'images/share-gospel.png',
          title: 'Share the Gospel',
          text: 'Supporting outreach programs that bring hope, transformation, and eternal life through Jesus Christ.',
          color: '#2ecc71'
        }
      ]
    },

    giving: {
      leftTitle: 'Your Gift Can Change Lives',
      leftText: 'Every contribution, big or small, makes an eternal impact.',
      leftBlessing: 'a blessing. ♥',
      mainTitle: 'Give What You Can',
      mainScript: 'Every gift matters! ♥',
      mainText: "We don't ask how much you give. Whatever you can give, God can use to make a powerful difference in someone's life.",
      mainBtnText: 'Donate Now',
      mainBtnLink: '#',
      mainThanks: 'Thank you for partnering with us. ♥',
      rightTitle: "Your Generosity Builds God's Kingdom",
      rightText: "Your generosity helps bring hope, restores lives, and spreads God's love to those in need.",
      rightBlessing: 'Thank you. ♥'
    },

    gallery: {
      label: 'Our Work in Action',
      title: 'Stories of Hope & Transformation',
      items: [
        { image: 'images/gallery-1.png', caption: 'Standing in Faith', wide: true },
        { image: 'images/gallery-2.png', caption: 'Feeding the Hungry', wide: false },
        { image: 'images/gallery-3.png', caption: 'Educating the Future', wide: false },
        { image: 'images/gallery-4.png', caption: 'Clothing the Needy', wide: false },
        { image: 'images/gallery-5.png', caption: 'Light in Every Village', wide: true }
      ]
    },

    media: {
      label: 'Media & Photos',
      title: 'Moments That Matter',
      items: [
        {
          type: 'image',
          url: 'images/gallery-1.png',
          title: 'Mission in Action',
          description: 'Our volunteers serving communities with love.'
        },
        {
          type: 'image',
          url: 'images/gallery-3.png',
          title: 'Children Learning',
          description: 'Education outreach program in rural areas.'
        }
      ]
    },

    impactBanner: {
      bgImage: 'images/hero-bg.png',
      text: 'Your <strong>generosity</strong> becomes someone\'s <strong>meal</strong>, someone\'s <strong>hope</strong>, and someone\'s <strong>opportunity</strong> to hear about <strong>Jesus</strong>.',
      subText: 'Together, we can make an eternal difference. ♥'
    },

    partner: {
      label: 'Ways to Partner',
      title: 'Join Us in Making a Difference',
      cards: [
        {
          title: 'Pray',
          text: 'Pray with us for the missionaries, communities, and families we serve.',
          emoji: '🙏',
          featured: false
        },
        {
          title: 'Give',
          text: "Give what you can. Every gift, big or small, changes lives and builds God's Kingdom.",
          emoji: '',
          featured: true,
          btnText: 'Donate ♥',
          btnLink: '#giving'
        },
        {
          title: 'Share',
          text: 'Share this message and inspire others to give. Spread the word!',
          emoji: '📤',
          featured: false
        }
      ]
    },

    footer: {
      thankTitle: 'Thank you!',
      thankText: 'May God bless you abundantly. ♥',
      verse: '"And let us not grow weary of doing good." — Galatians 6:9',
      socialLinks: {
        facebook: '#',
        instagram: '#',
        youtube: '#',
        whatsapp: '#'
      }
    },

    navLinks: [
      { label: 'About', href: '#about' },
      { label: 'Vision', href: '#vision' },
      { label: 'Impact', href: '#impact' },
      { label: 'Give', href: '#giving' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'Media', href: '#media' },
      { label: 'Partner', href: '#partner' }
    ]
  };


  /* ===========================================================
   *  PRIVATE HELPERS
   * =========================================================== */

  /** Deep clone an object */
  const clone = (obj) => JSON.parse(JSON.stringify(obj));

  /** Get the entire stored data object (or empty) */
  const readStore = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('CMS: Failed to read localStorage', e);
      return {};
    }
  };

  /** Write entire data object to storage */
  const writeStore = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('CMS: Failed to write to localStorage', e);
    }
  };

  /** Deep merge: target ← source (source wins, but doesn't drop target-only keys) */
  const deepMerge = (target, source) => {
    const result = clone(target);
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        typeof result[key] === 'object' &&
        !Array.isArray(result[key])
      ) {
        result[key] = deepMerge(result[key], source[key]);
      } else {
        result[key] = clone(source[key]);
      }
    }
    return result;
  };


  /* ===========================================================
   *  GOOGLE DRIVE URL CONVERTER
   * =========================================================== */

  /**
   * Convert a Google Drive sharing URL to an embeddable URL.
   *
   * @param {string} url  — Drive sharing link or YouTube link
   * @param {'image'|'video'} type — media type
   * @returns {string} embeddable URL
   *
   * Supported input formats:
   *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   *   https://drive.google.com/open?id=FILE_ID
   *   https://youtu.be/VIDEO_ID
   *   https://www.youtube.com/watch?v=VIDEO_ID
   */
  const convertDriveUrl = (url, type = 'image') => {
    if (!url) return url;

    // Already a direct/embed URL? Return as-is
    if (url.includes('/thumbnail?') || url.includes('/preview') || url.includes('/embed/')) {
      return url;
    }

    // Google Drive: extract file ID
    let driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!driveMatch) {
      driveMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    }

    if (driveMatch) {
      const fileId = driveMatch[1];
      if (type === 'video') {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }

    // YouTube: extract video ID
    let ytMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (!ytMatch) {
      ytMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    }
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // Not a recognized URL — return as-is
    return url;
  };


  /* ===========================================================
   *  PUBLIC API
   * =========================================================== */

  return {
    /** Get defaults (read-only copy) */
    defaults: () => clone(DEFAULTS),

    /**
     * Get data for a specific section.
     * Merges stored data over defaults so new default fields are always present.
     */
    get(section) {
      const stored = readStore();
      const defaultSection = DEFAULTS[section];

      if (!defaultSection) {
        console.warn(`CMS: Unknown section "${section}"`);
        return stored[section] || null;
      }

      if (!stored[section]) return clone(defaultSection);

      // For arrays, stored replaces entirely
      if (Array.isArray(defaultSection)) {
        return clone(stored[section]);
      }

      // For objects, deep-merge so new default keys are preserved
      return deepMerge(defaultSection, stored[section]);
    },

    /** Save data for a specific section */
    set(section, data) {
      const stored = readStore();
      stored[section] = clone(data);
      writeStore(stored);
    },

    /** Get all data (merged with defaults) */
    getAll() {
      const result = {};
      for (const key of Object.keys(DEFAULTS)) {
        result[key] = this.get(key);
      }
      return result;
    },

    /** Clear all edits, restore to defaults */
    resetAll() {
      localStorage.removeItem(STORAGE_KEY);
    },

    /** Export all current data as a JSON string */
    exportJSON() {
      return JSON.stringify(this.getAll(), null, 2);
    },

    /** Import data from a JSON string */
    importJSON(jsonStr) {
      try {
        const data = JSON.parse(jsonStr);
        writeStore(data);
        return true;
      } catch (e) {
        console.error('CMS: Invalid JSON import', e);
        return false;
      }
    },

    /** Convert a Google Drive / YouTube URL to embeddable format */
    driveUrl: convertDriveUrl,

    /** Check admin password */
    checkPassword(input) {
      const site = this.get('site');
      return input === (site.adminPassword || 'admin123');
    },

    /** Update admin password */
    setPassword(newPass) {
      const site = this.get('site');
      site.adminPassword = newPass;
      this.set('site', site);
    }
  };
})();
