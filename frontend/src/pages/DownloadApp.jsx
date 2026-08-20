import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

// ── Icons ──────────────────────────────────────────────────────────────────────

const AndroidIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
    <path d="M17.523 15.341a.53.53 0 0 1-.53-.53V9.19a.53.53 0 0 1 1.06 0v5.621a.53.53 0 0 1-.53.53zm-11.046 0a.53.53 0 0 1-.53-.53V9.19a.53.53 0 0 1 1.06 0v5.621a.53.53 0 0 1-.53.53zM8.13 5.243l-.98-1.698a.2.2 0 1 0-.347.2l.99 1.715A6.03 6.03 0 0 0 5.97 8.5h12.06a6.03 6.03 0 0 0-1.823-3.04l.99-1.715a.2.2 0 1 0-.347-.2l-.98 1.698A5.97 5.97 0 0 0 12 4.5a5.97 5.97 0 0 0-3.87.743zM9.75 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm4.5 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zM5.97 9.5v7.72c0 .71.58 1.28 1.29 1.28h.74v2.97a.53.53 0 0 0 1.06 0V18.5h1.88v2.97a.53.53 0 0 0 1.06 0V18.5h1.88v2.97a.53.53 0 0 0 1.06 0V18.5h.74c.71 0 1.29-.57 1.29-1.28V9.5H5.97z" />
  </svg>
);

const WindowsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
    <path d="M3 5.557L10.053 4.5v6.82H3V5.557zm7.053 6.93H3v6.827L10.053 20.5v-8.013zm.894-6.987L21 4v7.5h-9.947V5.5h-.106zm.106 7.5H21V20l-9.947 1.5V13z" />
  </svg>
);

const LinuxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
    <path d="M12.504 0c-.155 0-.315.008-.48.021C7.975.135 3.255 3.891 2.103 8.062a13.572 13.572 0 0 0 0 5.972c.745 2.83 2.668 5.3 5.225 6.886A10.85 10.85 0 0 0 12.5 22c1.954 0 3.866-.524 5.52-1.513 2.557-1.586 4.48-4.056 5.225-6.886a13.572 13.572 0 0 0 0-5.972C22.093 3.458 17.38-.135 12.98.021a8.973 8.973 0 0 0-.476-.021zm-.042 1.956c.362 0 .72.03 1.073.087 2.784.448 5.275 2.366 6.557 4.904.714 1.41 1.01 2.98.854 4.553-.156 1.572-.761 3.072-1.762 4.289a8.654 8.654 0 0 1-3.482 2.512 8.634 8.634 0 0 1-4.246.523 8.658 8.658 0 0 1-3.982-1.67A8.695 8.695 0 0 1 4.97 14.05a8.691 8.691 0 0 1-.32-4.262c.436-2.6 2.124-4.893 4.432-6.122a8.67 8.67 0 0 1 3.38-.71zm-.478 1.686c-.26.003-.513.057-.756.16-.628.265-1.047.87-1.047 1.547v.553c0 .46.187.895.517 1.218l.44.43-.012 1.12-.003.133c-.003.19.01.38.038.568l.008.06-.437.332c-.268.204-.42.52-.41.852l.012.44c.01.373.232.706.57.875l.69.348.098.384c.135.534.397 1.03.768 1.44l.07.079-.098.42c-.083.353.012.724.254.994l.457.517c.268.305.667.464 1.066.424l.432-.043.35.26c.4.298.874.474 1.365.51l.12.008.222.31c.177.247.44.416.734.467l.615.105c.327.056.66-.033.917-.244l.5-.417.448.043c.41.04.822-.107 1.115-.401l.57-.566c.254-.251.374-.601.325-.947l-.044-.302.25-.278c.312-.348.49-.8.49-1.27v-.51a1.47 1.47 0 0 0-.35-.955l-.084-.093.033-.494c.02-.3-.07-.598-.252-.838l-.36-.476.01-.208c.014-.303-.098-.6-.311-.82l-.434-.449.053-1.046.06-1.185c.025-.5-.194-.982-.583-1.302-.39-.32-.904-.437-1.393-.314l-.453.117-.35-.248c-.337-.24-.748-.35-1.16-.314l-.037.004-.328-.21a1.515 1.515 0 0 0-.804-.23z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.18 1.27-2.16 3.8.03 3.02 2.65 4.03 2.68 4.04l-.07.28zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const PlusSquareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const WifiOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

// ── iOS Guide Modal ─────────────────────────────────────────────────────────────

const IOSGuideModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl z-10">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white shadow-lg">
          <AppleIcon />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Install on iPhone / iPad</h2>
          <p className="text-slate-400 text-xs">Open this page in <strong className="text-white">Safari</strong> first</p>
        </div>
      </div>
      <ol className="space-y-4 mb-5">
        {[
          { step: 1, icon: <ShareIcon />, title: 'Tap the Share button', desc: 'Tap the share icon (↑) at the bottom toolbar of Safari.' },
          { step: 2, icon: <PlusSquareIcon />, title: 'Add to Home Screen', desc: 'Scroll the menu and tap "Add to Home Screen".' },
          { step: 3, icon: <CheckCircleIcon />, title: 'Tap Add', desc: 'Tap "Add" in the top-right. The app icon will appear on your home screen.' },
        ].map((s) => (
          <li key={s.step} className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">{s.step}</div>
            <div>
              <div className="flex items-center gap-2 text-white font-semibold text-sm mb-0.5">
                <span className="text-slate-400">{s.icon}</span>{s.title}
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-xs text-amber-300 leading-relaxed mb-4">
        ⚠️ <strong>Note:</strong> This only works in <strong>Safari</strong>. If you're using Chrome on iOS, open this page in Safari first.
      </div>
      <button onClick={onClose} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-2xl transition-colors text-sm">Got it!</button>
    </div>
  </div>
);

// ── Internet Required Banner ────────────────────────────────────────────────────

const InternetWarningBanner = () => (
  <div className="max-w-3xl mx-auto mb-10">
    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 md:p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">
        <WifiOffIcon />
      </div>
      <div className="text-left">
        <p className="text-red-400 font-bold text-sm mb-1">⚠️ Internet Connection Required</p>
        <p className="text-slate-300 text-sm leading-relaxed">
          This app <strong className="text-white">cannot work without an internet connection.</strong>{' '}
          It needs to load products, process orders, and sync your account from our servers. While it installs on your device like a native app,
          it will show a <strong className="text-white">"Server Offline" page</strong> if you have no internet.
          Always keep your device connected to use W!FO Mart.
        </p>
      </div>
    </div>
  </div>
);

// ── Already Installed Banner ────────────────────────────────────────────────────

const InstalledBanner = () => (
  <div className="max-w-md mx-auto bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3 mb-8">
    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
      <CheckCircleIcon />
    </div>
    <div className="text-left">
      <p className="text-green-400 font-semibold text-sm">App Already Installed!</p>
      <p className="text-slate-400 text-xs">You're running W!FO Mart as an installed app. 🎉</p>
    </div>
  </div>
);

// ── App Card ───────────────────────────────────────────────────────────────────

const AppCard = ({ app, status, onInstall }) => {
  const isInstalled = status === 'installed';
  const isUnavailable = status === 'unavailable';
  const isLoading = status === 'loading';
  const isIOS = status === 'ios-guide';

  const getButtonLabel = () => {
    if (isInstalled) return '✓ Already Installed';
    if (isLoading) return 'Installing…';
    if (isIOS) return 'View iOS Install Guide';
    if (isUnavailable) return 'Not Supported in This Browser';
    return `Install for ${app.platform}`;
  };

  const getBtnStyle = () => {
    if (isInstalled) return 'from-green-600 to-green-700 opacity-80 cursor-default';
    if (isUnavailable) return 'from-slate-600 to-slate-700 opacity-50 cursor-not-allowed';
    return `${app.btnClass} cursor-pointer`;
  };

  return (
    <div className={`relative bg-slate-900 border rounded-3xl p-6 flex flex-col gap-5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isInstalled ? 'border-green-500/40' : 'border-slate-800 hover:border-slate-600'}`}>

      {/* Badge */}
      <div className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-1 ${app.badgeBg}`}>
        {isInstalled ? '✓ Installed' : app.badge}
      </div>

      {/* Icon */}
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-lg text-white`}>
        {app.icon}
      </div>

      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white">{app.platform}</h2>
        <p className="text-slate-500 text-sm">{app.subtitle}</p>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800/60 rounded-xl px-3 py-2">
          <p className="text-slate-500 text-[10px] uppercase tracking-wider">Version</p>
          <p className="text-white text-sm font-semibold">v{app.version}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl px-3 py-2">
          <p className="text-slate-500 text-[10px] uppercase tracking-wider">Type</p>
          <p className="text-white text-sm font-semibold">PWA App</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl px-3 py-2">
          <p className="text-slate-500 text-[10px] uppercase tracking-wider">Updated</p>
          <p className="text-white text-sm font-semibold">{app.updated}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl px-3 py-2">
          <p className="text-slate-500 text-[10px] uppercase tracking-wider">Internet</p>
          <p className="text-red-400 text-sm font-semibold">Required</p>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-2">
        {app.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="flex-shrink-0 mt-0.5 text-base leading-none">{feat.startsWith('✅') ? '' : ''}</span>
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      {/* iOS Limitations */}
      {app.limitations && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
          <p className="text-red-400 font-bold text-xs uppercase tracking-widest mb-2.5">⚠️ iOS Limitations</p>
          <ul className="space-y-1.5">
            {app.limitations.map((lim) => (
              <li key={lim} className="text-xs text-slate-400 leading-relaxed">{lim}</li>
            ))}
          </ul>
        </div>
      )}

      {/* iOS How to Install */}
      {app.howToInstall && (
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-4">
          <p className="text-white font-bold text-xs uppercase tracking-widest mb-3">📲 How to Install</p>
          <ol className="space-y-2.5">
            {app.howToInstall.map((s) => (
              <li key={s.step} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5">{s.step}</span>
                <span className="text-xs text-slate-300 leading-relaxed">
                  <span className="mr-1">{s.icon}</span>{s.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Internet note per card */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 flex items-start gap-2">
        <span className="text-red-400 mt-0.5 flex-shrink-0"><WifiOffIcon /></span>
        <p className="text-slate-400 text-xs leading-relaxed">Requires active internet. Will not open offline.</p>
      </div>

      {/* Install Button */}
      <button
        id={`install-btn-${app.id}`}
        onClick={() => !isInstalled && !isUnavailable && !isLoading && onInstall(app)}
        disabled={isInstalled || isUnavailable || isLoading}
        className={`mt-auto w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl
          font-bold text-white text-sm bg-gradient-to-r transition-all duration-300 shadow-lg active:scale-95
          disabled:cursor-not-allowed ${getBtnStyle()}`}
      >
        {isLoading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Installing…
          </>
        ) : getButtonLabel()}
      </button>
    </div>
  );
};

// ── App Definitions ────────────────────────────────────────────────────────────

const appDefs = [
  {
    id: 'android',
    platform: 'Android',
    subtitle: 'Android 8.0+  •  Chrome / Samsung Browser',
    version: '1.0.0',
    updated: 'Aug 2026',
    icon: <AndroidIcon />,
    gradient: 'from-green-500 to-emerald-600',
    badgeBg: 'bg-green-500/10 text-green-400 border-green-500/20',
    btnClass: 'from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500',
    features: [
      '✅ Works in Chrome & Samsung Browser',
      '✅ Installs like a native Android app',
      '✅ Home screen icon & splash screen',
      '✅ Push notifications for orders',
    ],
    limitations: [
      '❌ Cannot work without internet connection',
      '❌ Not available on Play Store (install from browser)',
      '❌ Some older Android browsers may not support install',
      '❌ App data resets if browser cache is cleared',
    ],
    howToInstall: [
      { step: 1, icon: '🌐', text: 'Open this page in Chrome or Samsung Browser on Android' },
      { step: 2, icon: '🟢', text: 'Tap the "Install for Android" button on this page' },
      { step: 3, icon: '📥', text: 'Tap "Install" in the browser popup that appears' },
      { step: 4, icon: '✅', text: 'App icon appears on your home screen — tap to open!' },
    ],
    badge: 'Android',
  },
  {
    id: 'windows',
    platform: 'Windows & Linux',
    subtitle: 'Windows 10/11 & Linux  •  Chrome / Edge',
    version: '1.0.0',
    updated: 'Aug 2026',
    icon: (
      <div className="flex gap-1 items-center">
        <WindowsIcon />
        <span className="text-white/60 text-xs font-bold">+</span>
        <LinuxIcon />
      </div>
    ),
    gradient: 'from-blue-500 to-indigo-600',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    btnClass: 'from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500',
    features: [
      '✅ Works in Chrome & Edge on Windows/Linux',
      '✅ Runs as a standalone desktop app (no browser bar)',
      '✅ Taskbar / Dock pinning like a real app',
      '✅ Desktop notifications for orders',
    ],
    limitations: [
      '❌ Cannot work without internet connection',
      '❌ Not available on Microsoft Store or Snap Store',
      '❌ Only Chrome & Edge support install (not Firefox)',
      '❌ Uninstall from browser settings, not Control Panel',
    ],
    howToInstall: [
      { step: 1, icon: '🌐', text: 'Open this page in Chrome or Microsoft Edge on your PC' },
      { step: 2, icon: '🟦', text: 'Click the "Install for Windows & Linux" button above' },
      { step: 3, icon: '💻', text: 'Click "Install" in the browser dialog that pops up' },
      { step: 4, icon: '✅', text: 'App opens in its own window — find it pinned to your taskbar!' },
    ],
    badge: 'PC / Linux',
  },
  {
    id: 'ios',
    platform: 'iPhone & iPad',
    subtitle: 'iOS 14+  •  Safari only',
    version: '1.0.0',
    updated: 'Aug 2026',
    icon: <AppleIcon />,
    gradient: 'from-slate-400 to-slate-600',
    badgeBg: 'bg-slate-400/10 text-slate-300 border-slate-400/20',
    btnClass: 'from-slate-500 to-slate-700 hover:from-slate-400 hover:to-slate-600',
    features: [
      '✅ Works fully in Safari browser',
      '✅ Add to home screen (acts like native app)',
      '✅ Full-screen, no browser toolbar',
      '✅ All shopping features work normally',
    ],
    limitations: [
      '❌ Only works in Safari — not Chrome/Firefox on iOS',
      '❌ No automatic install popup (manual steps needed)',
      '❌ Push notifications only on iOS 16.4+ (limited)',
      '❌ Cannot work without internet connection',
    ],
    howToInstall: [
      { step: 1, icon: '🌐', text: 'Open this page in Safari on your iPhone or iPad' },
      { step: 2, icon: '📤', text: 'Tap the Share button (↑) at the bottom of Safari' },
      { step: 3, icon: '➕', text: 'Scroll down and tap \'Add to Home Screen\'' },
      { step: 4, icon: '✅', text: 'Tap \'Add\' — the app icon appears on your home screen!' },
    ],
    badge: 'iOS',
  },
];

// ── Main Page ──────────────────────────────────────────────────────────────────

const DownloadApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [cardStatus, setCardStatus] = useState({ android: 'checking', windows: 'checking', ios: 'checking' });

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const isAndroid = /android/i.test(navigator.userAgent);
    const isDesktop = !ios && !isAndroid;

    setIsStandalone(standalone);

    if (standalone) {
      setCardStatus({ android: 'installed', windows: 'installed', ios: 'installed' });
      return;
    }

    setCardStatus({
      android: isAndroid ? 'ready' : 'unavailable',
      windows: isDesktop ? 'ready' : 'unavailable',
      ios: ios ? 'ios-guide' : 'unavailable',
    });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      const isAndroid = /android/i.test(navigator.userAgent);
      const isDesktop = !isAndroid && !/iphone|ipad|ipod/i.test(navigator.userAgent);

      setCardStatus((prev) => ({
        ...prev,
        ...(isAndroid ? { android: 'ready' } : {}),
        ...(isDesktop ? { windows: 'ready' } : {}),
      }));
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async (app) => {
    if (app.id === 'ios') {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      toast(
        (t) => (
          <div className="flex flex-col gap-1">
            <p className="font-bold text-white text-sm">Install via Browser Menu</p>
            <p className="text-slate-300 text-xs leading-relaxed">
              Click the <strong>install icon (⊕)</strong> in your address bar,
              or open <strong>Browser Menu → "Install W!FO Mart"</strong>
            </p>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="mt-1 text-xs text-[#FF8C00] font-semibold self-start"
            >
              Got it ✕
            </button>
          </div>
        ),
        {
          duration: 6000,
          style: {
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '14px 16px',
            maxWidth: '340px',
          },
          icon: '📲',
        }
      );
      return;
    }

    setCardStatus((prev) => ({ ...prev, [app.id]: 'loading' }));

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setCardStatus((prev) => ({ ...prev, [app.id]: 'installed' }));
        setDeferredPrompt(null);
      } else {
        setCardStatus((prev) => ({ ...prev, [app.id]: 'ready' }));
      }
    } catch {
      setCardStatus((prev) => ({ ...prev, [app.id]: 'ready' }));
    }
  };

  return (
    <>
      <SEO
        title="Download W!FO Mart App | Android, iOS, Windows & Linux"
        description="Install the W!FO Mart PWA on your Android, iPhone, Windows PC, or Linux. Internet connection is required to use the app."
      />

      {showIOSGuide && <IOSGuideModal onClose={() => setShowIOSGuide(false)} />}

      <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

        {/* ── Hero ── */}
        <div className="relative pt-10 pb-16 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-orange-500/8 via-purple-600/8 to-blue-500/8 blur-3xl" />
          </div>

          <div className="relative">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-8">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-[#FF8C00]">Download App</span>
            </div>

            {/* Logo */}
            <div className="flex items-center justify-center mb-7">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF8C00] to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30 ring-4 ring-orange-500/10">
                <img src="/logo.png" alt="W!FO MART" className="w-14 h-14 object-contain" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
              Get the{' '}
              <span className="bg-gradient-to-r from-[#FF8C00] via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                W!FO Mart
              </span>{' '}
              App
            </h1>

            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-5">
              W!FO Mart is a <strong className="text-white">Progressive Web App (PWA)</strong> — it installs directly from your browser onto Android, iPhone, Windows PC, or Linux.
              No app store needed. It works just like a native app but{' '}
              <strong className="text-red-400">requires an active internet connection</strong> to load products and process orders.
            </p>

            {/* PWA pill */}
            <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-2 text-sm text-slate-300 mb-8">
              <span className="text-lg">📱</span>
              <span><strong className="text-white">PWA</strong> — installs from browser, no app store required</span>
            </div>

            {/* Already installed */}
            {isStandalone && <InstalledBanner />}

            {/* ⚠️ Internet warning */}
            <InternetWarningBanner />
          </div>
        </div>

        {/* ── Cards ── */}
        <div className="max-w-6xl mx-auto px-4 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {appDefs.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                status={cardStatus[app.id]}
                onInstall={handleInstall}
              />
            ))}
          </div>

          {/* ── What is a PWA? ── */}
          <div className="mt-20 bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-10">
            <h2 className="text-2xl font-bold text-white mb-2">What exactly is a PWA?</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              A <strong className="text-white">Progressive Web App (PWA)</strong> is a website that can be installed on your device and opens like a normal app — without needing to visit the App Store or Play Store.
              Once installed, it gets its own icon, opens full-screen, and can even send you push notifications.
              However, unlike traditional apps, <strong className="text-red-400">it still needs the internet to fetch data from our servers</strong>. Think of it as a shortcut to our website that looks and feels native.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: '✅', label: 'Works like a native app', col: 'text-green-400' },
                { icon: '✅', label: 'No app store required', col: 'text-green-400' },
                { icon: '✅', label: 'Push notifications for orders', col: 'text-green-400' },
                { icon: '✅', label: 'Home screen / desktop icon', col: 'text-green-400' },
                { icon: '❌', label: 'Cannot work offline', col: 'text-red-400' },
                { icon: '❌', label: 'No internet = blank/error screen', col: 'text-red-400' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className={`text-sm font-medium ${item.col}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── How to install ── */}
          <div className="mt-14">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">How to Install</h2>
            <p className="text-slate-400 text-center mb-10">Choose your device and follow the steps below.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: '🤖',
                  title: 'Android',
                  color: 'from-green-500 to-emerald-600',
                  steps: [
                    'Open this page in Chrome or Samsung Browser',
                    'Tap the "Install for Android" button above',
                    'Tap "Install" in the browser popup',
                    'App icon appears on your home screen!',
                  ],
                },
                {
                  icon: '🖥️',
                  title: 'Windows & Linux',
                  color: 'from-blue-500 to-indigo-600',
                  steps: [
                    'Open this page in Chrome or Edge',
                    'Tap the "Install for Windows & Linux" button',
                    'Click "Install" in the browser popup',
                    'App opens as a standalone desktop window!',
                  ],
                },
                {
                  icon: '🍎',
                  title: 'iPhone / iPad',
                  color: 'from-slate-400 to-slate-600',
                  steps: [
                    'Open this page in Safari (not Chrome)',
                    'Tap the share icon (↑) at the bottom',
                    'Tap "Add to Home Screen"',
                    'Tap "Add" — icon appears on your home screen!',
                  ],
                },
              ].map((p) => (
                <div key={p.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-all">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>{p.icon}</div>
                  <h3 className="text-white font-bold mb-4">{p.title}</h3>
                  <ol className="space-y-3">
                    {p.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                        <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5`}>{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>

          {/* Back */}
          <div className="mt-14 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default DownloadApp;
