/**
 * Symbiosis HR Payroll — ERP Super Admin Website Editor Module
 * Provides no-code customization: Branding, Announcements, Custom Pages, Feature Flags, Widget Manager
 * All data persisted in localStorage
 */

import { db, TokenStore } from './api-client.js';

// ═══════════════════════════════════════════════════════════════════════════
// 1. STORAGE KEYS & DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════

const EDITOR_KEYS = {
  BRANDING: 'symbiosis_branding',
  ANNOUNCEMENTS: 'symbiosis_announcements',
  CUSTOM_PAGES: 'symbiosis_custom_pages',
  FEATURE_FLAGS: 'symbiosis_feature_flags',
  WIDGET_ORDER: 'symbiosis_widget_order',
  GOOGLE_ACCOUNTS: 'symbiosis_google_accounts'
};

const DEFAULT_BRANDING = {
  appName: 'HR Payroll',
  appSubtitle: 'Management System',
  logoEmoji: '💼',
  primaryColor: '#0071e3',
  loginMessage: 'India Labour Law Compliant · Multi-tenant',
  footerText: '© 2026 Symbiosis HR',
  defaultTheme: 'classic-corporate'
};

const DEFAULT_FEATURE_FLAGS = {
  hr: {
    dashboard: true,
    employees: true,
    attendance: true,
    payroll: true,
    compliance: true,
    reports: true,
    settings: true
  },
  employee: {
    'emp-dashboard': true,
    'emp-payslips': true,
    'emp-tax-declaration': true,
    'emp-leaves': true,
    'emp-profile': true
  }
};

const DEFAULT_GOOGLE_ACCOUNTS = [
  { email: 'system@symbiosis.in', role: 'ERP', orgId: null, empId: null },
  { email: 'hr@tata.in', role: 'HR', orgId: 'org_tata', empId: null },
  { email: 'hr@infy.in', role: 'HR', orgId: 'org_infy', empId: null },
  { email: 'aarav@tata.in', role: 'Employee', orgId: 'org_tata', empId: 'EMP101' },
  { email: 'priya@tata.in', role: 'Employee', orgId: 'org_tata', empId: 'EMP102' },
  { email: 'rohan@tata.in', role: 'Employee', orgId: 'org_tata', empId: 'EMP103' },
  { email: 'vikram@infy.in', role: 'Employee', orgId: 'org_infy', empId: 'EMP201' },
  { email: 'sneha@infy.in', role: 'Employee', orgId: 'org_infy', empId: 'EMP202' }
];

// ═══════════════════════════════════════════════════════════════════════════
// 2. GETTERS & SETTERS
// ═══════════════════════════════════════════════════════════════════════════

function getBranding() {
  try {
    const data = localStorage.getItem(EDITOR_KEYS.BRANDING);
    return data ? { ...DEFAULT_BRANDING, ...JSON.parse(data) } : { ...DEFAULT_BRANDING };
  } catch { return { ...DEFAULT_BRANDING }; }
}

function saveBranding(branding) {
  localStorage.setItem(EDITOR_KEYS.BRANDING, JSON.stringify(branding));
}

function getAnnouncements() {
  try {
    const data = localStorage.getItem(EDITOR_KEYS.ANNOUNCEMENTS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveAnnouncements(announcements) {
  localStorage.setItem(EDITOR_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
}

function getCustomPages() {
  try {
    const data = localStorage.getItem(EDITOR_KEYS.CUSTOM_PAGES);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveCustomPages(pages) {
  localStorage.setItem(EDITOR_KEYS.CUSTOM_PAGES, JSON.stringify(pages));
}

function getFeatureFlags() {
  try {
    const data = localStorage.getItem(EDITOR_KEYS.FEATURE_FLAGS);
    return data ? JSON.parse(data) : { ...DEFAULT_FEATURE_FLAGS };
  } catch { return { ...DEFAULT_FEATURE_FLAGS }; }
}

function saveFeatureFlags(flags) {
  localStorage.setItem(EDITOR_KEYS.FEATURE_FLAGS, JSON.stringify(flags));
}

function getWidgetOrder() {
  try {
    const data = localStorage.getItem(EDITOR_KEYS.WIDGET_ORDER);
    return data ? JSON.parse(data) : { enabled: ['stats','dept-chart','attendance-chart','compliance-checklist','epf-simulator'], disabled: [] };
  } catch { return { enabled: ['stats','dept-chart','attendance-chart','compliance-checklist','epf-simulator'], disabled: [] }; }
}

function saveWidgetOrder(order) {
  localStorage.setItem(EDITOR_KEYS.WIDGET_ORDER, JSON.stringify(order));
}

function getGoogleAccounts() {
  try {
    const data = localStorage.getItem(EDITOR_KEYS.GOOGLE_ACCOUNTS);
    return data ? JSON.parse(data) : [...DEFAULT_GOOGLE_ACCOUNTS];
  } catch { return [...DEFAULT_GOOGLE_ACCOUNTS]; }
}

function saveGoogleAccounts(accounts) {
  localStorage.setItem(EDITOR_KEYS.GOOGLE_ACCOUNTS, JSON.stringify(accounts));
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. APPLY BRANDING (called on every page render)
// ═══════════════════════════════════════════════════════════════════════════

function applyBranding() {
  const b = getBranding();

  // Update sidebar logo
  const logoIcon = document.querySelector('.sidebar-logo-icon');
  const logoTitle = document.querySelector('.sidebar-logo-title');
  const logoSub = document.querySelector('.sidebar-logo-sub');
  if (logoIcon) logoIcon.textContent = b.logoEmoji;
  if (logoTitle) logoTitle.textContent = b.appName;
  if (logoSub) logoSub.textContent = b.appSubtitle;

  // Update page title
  document.title = `${b.appName} — India Compliance Suite`;

  // Apply primary color to CSS custom property
  if (b.primaryColor && b.primaryColor !== '#0071e3') {
    document.documentElement.style.setProperty('--primary', b.primaryColor);
    // Compute a hover shade (darken by 10%)
    const hex = b.primaryColor.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0,2),16) - 25);
    const g = Math.max(0, parseInt(hex.substr(2,2),16) - 25);
    const bl = Math.max(0, parseInt(hex.substr(4,2),16) - 25);
    document.documentElement.style.setProperty('--primary-hover', `rgb(${r},${g},${bl})`);
    document.documentElement.style.setProperty('--primary-glow', `${b.primaryColor}22`);
    document.documentElement.style.setProperty('--primary-light', `${b.primaryColor}08`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. RENDER ANNOUNCEMENTS BANNER (called from HR/Employee dashboards)
// ═══════════════════════════════════════════════════════════════════════════

function renderAnnouncementBanners(targetAudience) {
  const announcements = getAnnouncements();
  const now = new Date();
  const active = announcements.filter(a => {
    if (a.expiry && new Date(a.expiry) < now) return false;
    if (a.audience === 'all') return true;
    if (a.audience === 'hr' && targetAudience === 'hr') return true;
    if (a.audience === 'employees' && targetAudience === 'employee') return true;
    return false;
  });

  if (active.length === 0) return '';

  const severityMap = {
    info: { bg: 'var(--primary-light)', border: 'var(--primary)', icon: 'ℹ️', color: 'var(--primary)' },
    success: { bg: 'var(--success-light)', border: 'var(--success)', icon: '✅', color: 'var(--success)' },
    warning: { bg: 'var(--warning-light)', border: 'var(--warning)', icon: '⚠️', color: 'var(--warning)' },
    danger: { bg: 'var(--danger-light)', border: 'var(--danger)', icon: '🚨', color: 'var(--danger)' }
  };

  return active.map(a => {
    const s = severityMap[a.severity] || severityMap.info;
    return `
      <div class="announcement-banner" style="background:${s.bg}; border:1px solid ${s.border}; border-left:4px solid ${s.border}; border-radius:10px; padding:14px 18px; margin-bottom:16px; display:flex; gap:12px; align-items:flex-start; animation:slideDown 0.3s ease;">
        <span style="font-size:1.3rem; flex-shrink:0;">${s.icon}</span>
        <div style="flex:1;">
          <strong style="color:${s.color}; font-size:0.92rem; display:block; margin-bottom:4px;">${a.title}</strong>
          <p style="margin:0; font-size:0.83rem; color:var(--text-body); line-height:1.5;">${a.body}</p>
        </div>
        ${a.expiry ? `<span style="font-size:0.7rem; color:var(--text-muted); white-space:nowrap;">Expires: ${a.expiry}</span>` : ''}
      </div>
    `;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. CHECK FEATURE FLAGS (called from sidebar builder)
// ═══════════════════════════════════════════════════════════════════════════

function isFeatureEnabled(role, tabKey) {
  const flags = getFeatureFlags();
  if (role === 'HR' && flags.hr) {
    return flags.hr[tabKey] !== false;
  }
  if (role === 'Employee' && flags.employee) {
    return flags.employee[tabKey] !== false;
  }
  return true; // ERP always has full access
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. RENDER CUSTOM PAGE CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function renderCustomPage(pageId) {
  const pages = getCustomPages();
  const page = pages.find(p => p.id === pageId);
  if (!page) return '<div class="empty-state"><p>Page not found.</p></div>';

  return `
    <div class="animate-in">
      <div class="page-header" style="margin-bottom:28px;">
        <div class="page-header-left">
          <h2>${page.icon || '📄'} ${page.title}</h2>
          <p>${page.subtitle || 'Custom page created by admin'}</p>
        </div>
        <button class="btn btn-print no-print" onclick="window.print()">🖨️ Print Page</button>
      </div>
      <div class="card">
        <div class="card-body custom-page-content" style="padding:24px; font-size:0.92rem; line-height:1.7; color:var(--text-body);">
          ${page.content}
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. MAIN EDITOR RENDERER (ERP Super Admin only)
// ═══════════════════════════════════════════════════════════════════════════

function renderWebsiteEditor() {
  const b = getBranding();
  const announcements = getAnnouncements();
  const pages = getCustomPages();
  const flags = getFeatureFlags();
  const widgets = getWidgetOrder();
  const googleAccounts = getGoogleAccounts();

  const editorSubTab = window._editorSubTab || 'branding';

  const subTabBtn = (id, label, icon) => `
    <button class="editor-subtab-btn ${editorSubTab === id ? 'active' : ''}" onclick="window._editorSubTab='${id}'; renderWebsiteEditor();">
      <span>${icon}</span> ${label}
    </button>
  `;

  let subContent = '';

  // ── BRANDING TAB ──────────────────────────────────────────────────────
  if (editorSubTab === 'branding') {
    subContent = `
      <div class="editor-section">
        <h3 class="editor-section-title">🎨 Brand Identity & Theme</h3>
        <p class="editor-section-desc">Customize the app's name, logo, colors, and login message. Changes apply instantly.</p>
        <div class="editor-form-grid">
          <div class="form-group">
            <label class="form-label">Application Name</label>
            <input class="form-control" type="text" id="ed-app-name" value="${b.appName}" placeholder="HR Payroll">
          </div>
          <div class="form-group">
            <label class="form-label">Subtitle / Tagline</label>
            <input class="form-control" type="text" id="ed-app-subtitle" value="${b.appSubtitle}" placeholder="Management System">
          </div>
          <div class="form-group">
            <label class="form-label">Logo Emoji</label>
            <input class="form-control" type="text" id="ed-logo-emoji" value="${b.logoEmoji}" placeholder="💼" maxlength="4" style="font-size:1.5rem; text-align:center; width:80px;">
          </div>
          <div class="form-group">
            <label class="form-label">Primary Accent Color</label>
            <div style="display:flex; gap:10px; align-items:center;">
              <input type="color" id="ed-primary-color" value="${b.primaryColor}" style="width:50px; height:40px; border:none; cursor:pointer; border-radius:8px;">
              <code id="ed-color-hex" style="font-size:0.82rem;">${b.primaryColor}</code>
            </div>
          </div>
          <div class="form-group" style="grid-column: span 2;">
            <label class="form-label">Login Page Welcome Message</label>
            <input class="form-control" type="text" id="ed-login-msg" value="${b.loginMessage}" placeholder="India Labour Law Compliant · Multi-tenant">
          </div>
          <div class="form-group" style="grid-column: span 2;">
            <label class="form-label">Footer Text</label>
            <input class="form-control" type="text" id="ed-footer-text" value="${b.footerText}" placeholder="© 2026 Symbiosis HR">
          </div>
        </div>
        <div style="display:flex; gap:12px; margin-top:20px;">
          <button class="btn btn-primary" onclick="saveBrandingFromEditor()">💾 Save & Apply Branding</button>
          <button class="btn btn-secondary" onclick="resetBrandingToDefaults()">↩ Reset to Defaults</button>
        </div>
      </div>

      <div class="editor-section" style="margin-top:28px;">
        <h3 class="editor-section-title">🖥️ Live Preview</h3>
        <div class="editor-preview-box">
          <div class="preview-sidebar-mock">
            <div style="display:flex; align-items:center; gap:10px; padding:14px;">
              <div style="width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg, ${b.primaryColor}, #4f46e5); display:flex; align-items:center; justify-content:center; font-size:1.2rem;">${b.logoEmoji}</div>
              <div>
                <div style="font-weight:700; font-size:0.88rem; color:#f1f5f9;">${b.appName}</div>
                <div style="font-size:0.68rem; color:#94a3b8;">${b.appSubtitle}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ── ANNOUNCEMENTS TAB ─────────────────────────────────────────────────
  else if (editorSubTab === 'announcements') {
    subContent = `
      <div class="editor-section">
        <h3 class="editor-section-title">📢 Announcement Manager</h3>
        <p class="editor-section-desc">Create pinned banners visible on HR and Employee dashboards. Set audience targeting and expiry dates.</p>

        <div class="card editor-form-card" style="margin-bottom:20px;">
          <div class="card-header"><h4 style="margin:0; font-size:0.9rem;">➕ New Announcement</h4></div>
          <div class="card-body" style="padding:16px;">
            <div class="editor-form-grid">
              <div class="form-group">
                <label class="form-label">Title</label>
                <input class="form-control" type="text" id="ann-title" placeholder="Important: Payroll Deadline">
              </div>
              <div class="form-group">
                <label class="form-label">Severity</label>
                <select class="form-control" id="ann-severity">
                  <option value="info">ℹ️ Info (Blue)</option>
                  <option value="success">✅ Success (Green)</option>
                  <option value="warning">⚠️ Warning (Orange)</option>
                  <option value="danger">🚨 Critical (Red)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Target Audience</label>
                <select class="form-control" id="ann-audience">
                  <option value="all">All Users</option>
                  <option value="hr">HR Admins Only</option>
                  <option value="employees">Employees Only</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Expiry Date (optional)</label>
                <input class="form-control" type="date" id="ann-expiry">
              </div>
              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label">Message Body</label>
                <textarea class="form-control" id="ann-body" rows="3" placeholder="Describe the announcement..."></textarea>
              </div>
            </div>
            <button class="btn btn-primary" onclick="addAnnouncementFromEditor()" style="margin-top:12px;">📢 Publish Announcement</button>
          </div>
        </div>

        <h4 style="font-size:0.88rem; margin-bottom:12px; color:var(--text-h);">Active Announcements (${announcements.length})</h4>
        ${announcements.length === 0 ? '<p style="color:var(--text-muted); font-size:0.84rem;">No announcements yet. Create one above.</p>' : ''}
        ${announcements.map((a, i) => `
          <div class="announcement-list-item">
            <div style="flex:1;">
              <strong style="font-size:0.88rem;">${a.title}</strong>
              <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">
                <span class="badge badge-${a.severity === 'danger' ? 'error' : a.severity}">${a.severity}</span>
                <span class="badge badge-neutral">${a.audience}</span>
                ${a.expiry ? `<span style="margin-left:6px;">Expires: ${a.expiry}</span>` : '<span style="margin-left:6px;">No expiry</span>'}
              </div>
              <p style="margin:6px 0 0; font-size:0.82rem; color:var(--text-body);">${a.body.substring(0, 120)}${a.body.length > 120 ? '...' : ''}</p>
            </div>
            <button class="btn btn-sm btn-danger" onclick="deleteAnnouncementFromEditor(${i})">🗑️ Delete</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ── CUSTOM PAGES TAB ──────────────────────────────────────────────────
  else if (editorSubTab === 'pages') {
    subContent = `
      <div class="editor-section">
        <h3 class="editor-section-title">📝 Custom Pages Builder</h3>
        <p class="editor-section-desc">Create new pages that appear in the sidebar. Use the WYSIWYG editor below — supports headings, lists, bold, links.</p>

        <div class="card editor-form-card" style="margin-bottom:20px;">
          <div class="card-header"><h4 style="margin:0; font-size:0.9rem;">➕ Create New Page</h4></div>
          <div class="card-body" style="padding:16px;">
            <div class="editor-form-grid">
              <div class="form-group">
                <label class="form-label">Page Title</label>
                <input class="form-control" type="text" id="page-title" placeholder="e.g. Company Policies">
              </div>
              <div class="form-group">
                <label class="form-label">Icon Emoji</label>
                <input class="form-control" type="text" id="page-icon" placeholder="📋" maxlength="4" style="width:80px; font-size:1.3rem; text-align:center;">
              </div>
              <div class="form-group">
                <label class="form-label">Subtitle (optional)</label>
                <input class="form-control" type="text" id="page-subtitle" placeholder="e.g. Employee handbook and guidelines">
              </div>
              <div class="form-group">
                <label class="form-label">Visible To</label>
                <select class="form-control" id="page-audience">
                  <option value="all">All Roles (HR + Employees)</option>
                  <option value="hr">HR Admins Only</option>
                  <option value="employees">Employees Only</option>
                </select>
              </div>
            </div>
            <div class="form-group" style="margin-top:12px;">
              <label class="form-label">Page Content (HTML supported)</label>
              <div class="wysiwyg-toolbar">
                <button type="button" onclick="document.execCommand('bold')" title="Bold"><b>B</b></button>
                <button type="button" onclick="document.execCommand('italic')" title="Italic"><i>I</i></button>
                <button type="button" onclick="document.execCommand('underline')" title="Underline"><u>U</u></button>
                <span class="toolbar-divider"></span>
                <button type="button" onclick="document.execCommand('formatBlock','','h2')" title="Heading">H2</button>
                <button type="button" onclick="document.execCommand('formatBlock','','h3')" title="Subheading">H3</button>
                <button type="button" onclick="document.execCommand('formatBlock','','p')" title="Paragraph">¶</button>
                <span class="toolbar-divider"></span>
                <button type="button" onclick="document.execCommand('insertUnorderedList')" title="Bullet List">•</button>
                <button type="button" onclick="document.execCommand('insertOrderedList')" title="Number List">1.</button>
                <span class="toolbar-divider"></span>
                <button type="button" onclick="editorInsertLink()" title="Insert Link">🔗</button>
                <button type="button" onclick="editorInsertImage()" title="Insert Image">🖼️</button>
                <button type="button" onclick="editorInsertTable()" title="Insert Table">📊</button>
              </div>
              <div id="page-content-editor" class="wysiwyg-editor" contenteditable="true" style="min-height:200px;">
                <p>Start typing your page content here...</p>
              </div>
            </div>
            <button class="btn btn-primary" onclick="addCustomPageFromEditor()" style="margin-top:12px;">📄 Publish Page</button>
          </div>
        </div>

        <h4 style="font-size:0.88rem; margin-bottom:12px; color:var(--text-h);">Published Pages (${pages.length})</h4>
        ${pages.length === 0 ? '<p style="color:var(--text-muted); font-size:0.84rem;">No custom pages yet.</p>' : ''}
        ${pages.map((p, i) => `
          <div class="announcement-list-item">
            <div style="flex:1;">
              <strong style="font-size:0.88rem;">${p.icon || '📄'} ${p.title}</strong>
              <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">
                <span class="badge badge-info">${p.audience}</span>
                <span style="margin-left:6px;">ID: ${p.id}</span>
              </div>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-secondary" onclick="previewCustomPage('${p.id}')">👁️ Preview</button>
              <button class="btn btn-sm btn-danger" onclick="deleteCustomPageFromEditor(${i})">🗑️ Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ── FEATURE FLAGS TAB ─────────────────────────────────────────────────
  else if (editorSubTab === 'flags') {
    subContent = `
      <div class="editor-section">
        <h3 class="editor-section-title">🎛️ Feature Flags — Module Visibility</h3>
        <p class="editor-section-desc">Toggle sidebar modules on or off for HR and Employee roles. Disabled modules will be hidden from the sidebar and inaccessible.</p>

        <div class="editor-flags-grid">
          <div class="card" style="margin-bottom:0;">
            <div class="card-header"><h4 style="margin:0; font-size:0.9rem;">🏢 HR Admin Modules</h4></div>
            <div class="card-body" style="padding:16px;">
              ${Object.entries(flags.hr || DEFAULT_FEATURE_FLAGS.hr).map(([key, enabled]) => `
                <label class="flag-toggle-row">
                  <span class="flag-label">${getModuleLabel('hr', key)}</span>
                  <input type="checkbox" class="flag-checkbox" data-role="hr" data-key="${key}" ${enabled ? 'checked' : ''} onchange="toggleFeatureFlag('hr', '${key}', this.checked)">
                  <span class="flag-switch"></span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="card" style="margin-bottom:0;">
            <div class="card-header"><h4 style="margin:0; font-size:0.9rem;">👤 Employee Self-Service Modules</h4></div>
            <div class="card-body" style="padding:16px;">
              ${Object.entries(flags.employee || DEFAULT_FEATURE_FLAGS.employee).map(([key, enabled]) => `
                <label class="flag-toggle-row">
                  <span class="flag-label">${getModuleLabel('employee', key)}</span>
                  <input type="checkbox" class="flag-checkbox" data-role="employee" data-key="${key}" ${enabled ? 'checked' : ''} onchange="toggleFeatureFlag('employee', '${key}', this.checked)">
                  <span class="flag-switch"></span>
                </label>
              `).join('')}
            </div>
          </div>
        </div>
        <p style="font-size:0.78rem; color:var(--text-muted); margin-top:16px;">💡 Feature flag changes take effect immediately when the user navigates or refreshes.</p>
      </div>
    `;
  }

  // ── DASHBOARD WIDGETS TAB ─────────────────────────────────────────────
  else if (editorSubTab === 'widgets') {
    const allWidgets = [
      { id: 'stats', name: 'Stats Overview Cards', icon: '📊' },
      { id: 'dept-chart', name: 'Department Distribution Chart', icon: '🍩' },
      { id: 'attendance-chart', name: 'Attendance Overview Chart', icon: '📅' },
      { id: 'compliance-checklist', name: 'Compliance Checklist', icon: '✅' },
      { id: 'epf-simulator', name: 'EPF Cost Simulator', icon: '🧮' }
    ];

    subContent = `
      <div class="editor-section">
        <h3 class="editor-section-title">🧩 Dashboard Widget Manager</h3>
        <p class="editor-section-desc">Enable or disable individual dashboard widgets for the HR Dashboard. Disabled widgets will be hidden.</p>

        <div class="widget-manager-list">
          ${allWidgets.map(w => {
            const isEnabled = widgets.enabled.includes(w.id);
            return `
              <div class="widget-manager-item ${isEnabled ? '' : 'disabled'}">
                <div style="display:flex; align-items:center; gap:12px; flex:1;">
                  <span style="font-size:1.4rem;">${w.icon}</span>
                  <div>
                    <strong style="font-size:0.88rem;">${w.name}</strong>
                    <div style="font-size:0.74rem; color:var(--text-muted);">Widget ID: ${w.id}</div>
                  </div>
                </div>
                <label class="flag-toggle-row" style="margin:0; padding:0; border:none;">
                  <input type="checkbox" class="flag-checkbox" ${isEnabled ? 'checked' : ''} onchange="toggleDashboardWidget('${w.id}', this.checked)">
                  <span class="flag-switch"></span>
                </label>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ── GOOGLE ACCOUNTS TAB ───────────────────────────────────────────────
  else if (editorSubTab === 'google') {
    subContent = `
      <div class="editor-section">
        <h3 class="editor-section-title">🔐 Google Sign-In Account Mapping</h3>
        <p class="editor-section-desc">Link Google email addresses to system roles. When a user signs in with Google, their email is matched to determine access.</p>

        <div class="card editor-form-card" style="margin-bottom:20px;">
          <div class="card-header"><h4 style="margin:0; font-size:0.9rem;">➕ Link New Google Account</h4></div>
          <div class="card-body" style="padding:16px;">
            <div class="editor-form-grid">
              <div class="form-group">
                <label class="form-label">Google Email Address</label>
                <input class="form-control" type="email" id="goog-email" placeholder="user@gmail.com">
              </div>
              <div class="form-group">
                <label class="form-label">Assigned Role</label>
                <select class="form-control" id="goog-role" onchange="toggleGoogleOrgField()">
                  <option value="ERP">🛡️ ERP Super Admin</option>
                  <option value="HR">🏢 HR Admin</option>
                  <option value="Employee">👤 Employee</option>
                </select>
              </div>
              <div class="form-group" id="goog-org-group" style="display:none;">
                <label class="form-label">Organization</label>
                <select class="form-control" id="goog-org" onchange="populateGoogleEmployees(this.value)">
                  <option value="">Select...</option>
                </select>
              </div>
              <div class="form-group" id="goog-emp-group" style="display:none;">
                <label class="form-label">Employee</label>
                <select class="form-control" id="goog-emp">
                  <option value="">Select organization first...</option>
                </select>
              </div>
            </div>
            <button class="btn btn-primary" onclick="addGoogleAccountFromEditor()" style="margin-top:12px;">🔗 Link Account</button>
          </div>
        </div>

        <h4 style="font-size:0.88rem; margin-bottom:12px; color:var(--text-h);">Linked Accounts (${googleAccounts.length})</h4>
        <div class="table-wrap">
          <table class="data-table" style="font-size:0.82rem;">
            <thead>
              <tr><th>Email</th><th>Role</th><th>Org ID</th><th>Emp ID</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${googleAccounts.map((a, i) => `
                <tr>
                  <td><code>${a.email}</code></td>
                  <td><span class="badge badge-${a.role === 'ERP' ? 'info' : a.role === 'HR' ? 'warning' : 'success'}">${a.role}</span></td>
                  <td>${a.orgId || '—'}</td>
                  <td>${a.empId || '—'}</td>
                  <td><button class="btn btn-sm btn-danger" onclick="deleteGoogleAccountFromEditor(${i})">Remove</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  return `
    <div class="animate-in">
      <div class="page-header" style="margin-bottom:24px;">
        <div class="page-header-left">
          <h2>🛠️ Website Editor</h2>
          <p>No-code customization panel — modify branding, announcements, pages, features, and Google account linking.</p>
        </div>
      </div>

      <div class="editor-subtab-bar">
        ${subTabBtn('branding', 'Branding', '🎨')}
        ${subTabBtn('announcements', 'Announcements', '📢')}
        ${subTabBtn('pages', 'Custom Pages', '📝')}
        ${subTabBtn('flags', 'Feature Flags', '🎛️')}
        ${subTabBtn('widgets', 'Widgets', '🧩')}
        ${subTabBtn('google', 'Google Accounts', '🔐')}
      </div>

      ${subContent}
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. EDITOR ACTION HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

function saveBrandingFromEditor() {
  const b = {
    appName: document.getElementById('ed-app-name').value.trim() || 'HR Payroll',
    appSubtitle: document.getElementById('ed-app-subtitle').value.trim() || 'Management System',
    logoEmoji: document.getElementById('ed-logo-emoji').value.trim() || '💼',
    primaryColor: document.getElementById('ed-primary-color').value || '#0071e3',
    loginMessage: document.getElementById('ed-login-msg').value.trim(),
    footerText: document.getElementById('ed-footer-text').value.trim(),
    defaultTheme: 'classic-corporate'
  };
  saveBranding(b);
  applyBranding();
  showToast('Branding Saved', 'Your branding changes have been applied.', 'success');
}

function resetBrandingToDefaults() {
  if (!confirm('Reset all branding to factory defaults?')) return;
  localStorage.removeItem(EDITOR_KEYS.BRANDING);
  // Reset CSS overrides
  document.documentElement.style.removeProperty('--primary');
  document.documentElement.style.removeProperty('--primary-hover');
  document.documentElement.style.removeProperty('--primary-glow');
  document.documentElement.style.removeProperty('--primary-light');
  applyBranding();
  renderWebsiteEditor();
  showToast('Reset Complete', 'Branding has been restored to defaults.', 'info');
}

function addAnnouncementFromEditor() {
  const title = document.getElementById('ann-title').value.trim();
  const body = document.getElementById('ann-body').value.trim();
  const severity = document.getElementById('ann-severity').value;
  const audience = document.getElementById('ann-audience').value;
  const expiry = document.getElementById('ann-expiry').value || null;

  if (!title || !body) { alert('Title and body are required.'); return; }

  const announcements = getAnnouncements();
  announcements.unshift({ id: Date.now(), title, body, severity, audience, expiry, created: new Date().toISOString() });
  saveAnnouncements(announcements);
  window._editorSubTab = 'announcements';
  renderWebsiteEditor();
  showToast('Published', `Announcement "${title}" is now live.`, 'success');
}

function deleteAnnouncementFromEditor(index) {
  if (!confirm('Delete this announcement?')) return;
  const announcements = getAnnouncements();
  announcements.splice(index, 1);
  saveAnnouncements(announcements);
  window._editorSubTab = 'announcements';
  renderWebsiteEditor();
}

function addCustomPageFromEditor() {
  const title = document.getElementById('page-title').value.trim();
  const icon = document.getElementById('page-icon').value.trim() || '📄';
  const subtitle = document.getElementById('page-subtitle').value.trim();
  const audience = document.getElementById('page-audience').value;
  const content = document.getElementById('page-content-editor').innerHTML;

  if (!title) { alert('Page title is required.'); return; }

  const pages = getCustomPages();
  const id = 'custom-' + Date.now();
  pages.push({ id, title, icon, subtitle, audience, content, created: new Date().toISOString() });
  saveCustomPages(pages);
  window._editorSubTab = 'pages';
  renderWebsiteEditor();
  showToast('Page Published', `"${title}" is now available in the sidebar.`, 'success');
}

function deleteCustomPageFromEditor(index) {
  if (!confirm('Delete this custom page? It will be removed from all sidebars.')) return;
  const pages = getCustomPages();
  pages.splice(index, 1);
  saveCustomPages(pages);
  window._editorSubTab = 'pages';
  renderWebsiteEditor();
}

function previewCustomPage(pageId) {
  const container = document.getElementById('app-body');
  if (container) container.innerHTML = renderCustomPage(pageId);
}

function toggleFeatureFlag(role, key, enabled) {
  const flags = getFeatureFlags();
  if (!flags[role]) flags[role] = {};
  flags[role][key] = enabled;
  saveFeatureFlags(flags);
}

function toggleDashboardWidget(widgetId, enabled) {
  const order = getWidgetOrder();
  if (enabled) {
    if (!order.enabled.includes(widgetId)) order.enabled.push(widgetId);
    order.disabled = order.disabled.filter(id => id !== widgetId);
  } else {
    order.enabled = order.enabled.filter(id => id !== widgetId);
    if (!order.disabled.includes(widgetId)) order.disabled.push(widgetId);
  }
  saveWidgetOrder(order);
}

function toggleGoogleOrgField() {
  const role = document.getElementById('goog-role').value;
  const orgGroup = document.getElementById('goog-org-group');
  const empGroup = document.getElementById('goog-emp-group');

  if (role === 'HR' || role === 'Employee') {
    orgGroup.style.display = '';
    // Populate org dropdown dynamically
    const orgSelect = document.getElementById('goog-org');
    if (orgSelect && typeof db !== 'undefined') {
      const orgs = db.getOrganizations();
      orgSelect.innerHTML = '<option value="">Select...</option>' + orgs.map(o => `<option value="${o.org_id}">${o.name}</option>`).join('');
    }
  } else {
    orgGroup.style.display = 'none';
  }

  if (role === 'Employee') {
    empGroup.style.display = '';
    const orgSelect = document.getElementById('goog-org');
    if (orgSelect) {
      populateGoogleEmployees(orgSelect.value);
    }
  } else {
    empGroup.style.display = 'none';
  }
}

function populateGoogleEmployees(orgId) {
  const empSelect = document.getElementById('goog-emp');
  if (!empSelect) return;
  if (!orgId) {
    empSelect.innerHTML = '<option value="">Select organization first...</option>';
    return;
  }
  if (typeof db !== 'undefined') {
    const emps = db.getEmployees(orgId);
    empSelect.innerHTML = '<option value="">Select...</option>' + emps.map(e => `<option value="${e.emp_id}">${e.name} (${e.emp_id})</option>`).join('');
  }
}

function addGoogleAccountFromEditor() {
  const email = document.getElementById('goog-email').value.trim().toLowerCase();
  const role = document.getElementById('goog-role').value;
  const orgId = document.getElementById('goog-org')?.value || null;
  const empId = document.getElementById('goog-emp')?.value || null;

  if (!email || !email.includes('@')) { alert('Valid email is required.'); return; }
  if ((role === 'HR' || role === 'Employee') && !orgId) { alert('Please select an organization.'); return; }

  const accounts = getGoogleAccounts();
  // Check for duplicate
  if (accounts.find(a => a.email === email)) {
    alert('This email is already linked. Remove it first to re-link.');
    return;
  }

  accounts.push({ email, role, orgId: orgId || null, empId: empId || null });
  saveGoogleAccounts(accounts);
  window._editorSubTab = 'google';
  renderWebsiteEditor();
  showToast('Account Linked', `${email} → ${role}`, 'success');
}

function deleteGoogleAccountFromEditor(index) {
  if (!confirm('Remove this Google account link?')) return;
  const accounts = getGoogleAccounts();
  accounts.splice(index, 1);
  saveGoogleAccounts(accounts);
  window._editorSubTab = 'google';
  renderWebsiteEditor();
}

// ── WYSIWYG helpers ──────────────────────────────────────────────────────

function editorInsertLink() {
  const url = prompt('Enter URL:', 'https://');
  if (url) document.execCommand('createLink', false, url);
}

function editorInsertImage() {
  const url = prompt('Enter image URL:', 'https://');
  if (url) document.execCommand('insertImage', false, url);
}

function editorInsertTable() {
  const html = `<table style="width:100%; border-collapse:collapse; margin:12px 0;">
    <thead><tr><th style="border:1px solid #ddd; padding:8px; background:#f0f0f0;">Header 1</th><th style="border:1px solid #ddd; padding:8px; background:#f0f0f0;">Header 2</th><th style="border:1px solid #ddd; padding:8px; background:#f0f0f0;">Header 3</th></tr></thead>
    <tbody><tr><td style="border:1px solid #ddd; padding:8px;">Cell 1</td><td style="border:1px solid #ddd; padding:8px;">Cell 2</td><td style="border:1px solid #ddd; padding:8px;">Cell 3</td></tr></tbody>
  </table>`;
  document.execCommand('insertHTML', false, html);
}

// ── Module label helper ─────────────────────────────────────────────────

function getModuleLabel(role, key) {
  const labels = {
    hr: { dashboard: '📊 Dashboard', employees: '👥 Employees', attendance: '📅 Attendance', payroll: '💸 Payroll', compliance: '🛡️ Compliance', reports: '📈 Reports', settings: '⚙️ Settings' },
    employee: { 'emp-dashboard': '📋 My Dashboard', 'emp-payslips': '📄 My Payslips', 'emp-tax-declaration': '📊 Tax Declaration', 'emp-leaves': '📆 My Leaves', 'emp-profile': '👤 My Profile' }
  };
  return (labels[role] && labels[role][key]) || key;
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. GOOGLE SIGN-IN HANDLER (called from login page)
// ═══════════════════════════════════════════════════════════════════════════

function handleGoogleCredentialResponse(response) {
  // Decode the JWT token from Google
  const payload = parseJwt(response.credential);
  if (!payload || !payload.email) {
    alert('Google Sign-In failed: could not read account information.');
    return;
  }

  const email = payload.email.toLowerCase();
  const name = payload.name || email;
  const picture = payload.picture || null;

  // Look up email in linked accounts
  const accounts = getGoogleAccounts();
  const match = accounts.find(a => a.email === email);

  if (!match) {
    // No linked account found
    alert(`Account not registered.\n\nThe Google account "${email}" is not linked to any role in this system.\n\nPlease contact your ERP administrator to link your account, or sign in with username/password.`);
    return;
  }

  // Auto-login with matched role
  const mockTokenPayload = {
    role: match.role,
    org_id: match.orgId || 'org_tata',
    emp_id: match.empId || null,
    email: email,
    username: name,
    exp: Math.floor(Date.now() / 1000) + 86400  // 24h local session
  };
  TokenStore.setLocalPayload(mockTokenPayload);

  window.state.isLoggedIn = true;
  window.state.currentRole = match.role;
  window.state.currentOrgId = match.orgId || 'org_tata';
  window.state.currentEmployeeId = match.empId || null;
  window.state.currentUser = name;

  // Save session
  if (typeof saveSessionState === 'function') saveSessionState();

  // Show toast
  if (typeof showToast === 'function') {
    showToast('Google Sign-In', `Welcome, ${name}! Logged in as ${match.role}.`, 'success');
  }

  // Render the app
  if (typeof renderCurrentView === 'function') renderCurrentView();
  if (typeof renderDatabaseExplorer === 'function') renderDatabaseExplorer();
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('JWT parse error:', e);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  getBranding,
  saveBranding,
  getAnnouncements,
  saveAnnouncements,
  getCustomPages,
  saveCustomPages,
  getFeatureFlags,
  saveFeatureFlags,
  getWidgetOrder,
  saveWidgetOrder,
  getGoogleAccounts,
  saveGoogleAccounts,
  applyBranding,
  renderAnnouncementBanners,
  isFeatureEnabled,
  renderCustomPage,
  renderWebsiteEditor,
  handleGoogleCredentialResponse,
  parseJwt,
  // Action handlers
  saveBrandingFromEditor,
  resetBrandingToDefaults,
  addAnnouncementFromEditor,
  deleteAnnouncementFromEditor,
  addCustomPageFromEditor,
  deleteCustomPageFromEditor,
  previewCustomPage,
  toggleFeatureFlag,
  toggleDashboardWidget,
  toggleGoogleOrgField,
  populateGoogleEmployees,
  addGoogleAccountFromEditor,
  deleteGoogleAccountFromEditor,
  editorInsertLink,
  editorInsertImage,
  editorInsertTable
};
