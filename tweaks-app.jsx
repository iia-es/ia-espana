/* eslint-disable */
// Tweaks app for IIA — wraps the shared TweaksPanel + useTweaks from tweaks-panel.jsx
// Calls window.__iia.applyTweaks() so the vanilla scroll-app code can react.

const { useEffect } = React;

const ACCENT_SWATCHES = [
  '#cc785c', // coral (Claude DS default)
  '#b33a1f', // rust (previous site accent)
  '#1f6a6c', // teal
  '#5d4e8f', // muted plum
  '#1a1a1a', // ink / monochrome
];

const SCROLL_STYLES = ['fade-slide', 'no-fade-out', 'instant'];
const SCROLL_LABELS = {
  'fade-slide': 'Cinemática',
  'no-fade-out': 'Solo entrada',
  'instant':     'Sin animación',
};

function IIATweaksApp() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

  // Apply tweaks to the page whenever they change
  useEffect(() => {
    if (window.__iia && window.__iia.applyTweaks) {
      window.__iia.applyTweaks(t);
    }
  }, [t.accent, t.scrollStyle, t.showRail]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Color de acento" />
      <TweakColor
        label="Acento"
        value={t.accent}
        options={ACCENT_SWATCHES}
        onChange={(v) => setTweak('accent', v)}
      />

      <TweakSection label="Estilo de scroll" />
      <TweakSelect
        label="Animaciones"
        value={t.scrollStyle}
        options={SCROLL_STYLES.map(s => ({ value: s, label: SCROLL_LABELS[s] }))}
        onChange={(v) => setTweak('scrollStyle', v)}
      />

      <TweakSection label="Navegación" />
      <TweakToggle
        label="Rail lateral de capítulos"
        value={t.showRail}
        onChange={(v) => setTweak('showRail', v)}
      />
    </TweaksPanel>
  );
}

// Mount
(function mount() {
  const host = document.createElement('div');
  host.id = 'tweaks-mount';
  document.body.appendChild(host);
  ReactDOM.createRoot(host).render(<IIATweaksApp />);
})();
