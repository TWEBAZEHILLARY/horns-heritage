/* hh-tweaks-app.jsx — mounts the Tweaks panel as a React island over the
   vanilla site and drives window.hhRedesign. Only visible when the user
   turns Tweaks on (host protocol handled inside tweaks-panel.jsx). */

const HH_INIT = (window.hhRedesign && window.hhRedesign.get()) ||
  { theme: 'dark', hero: '1', storyVideo: true, stats: true };

const TWEAK_DEFAULTS = {
  theme: HH_INIT.theme === 'dark' ? 'Dark' : 'Light',
  hero: ({ '1': 'Spotlight', '2': 'Editorial', '3': 'Cinematic' })[String(HH_INIT.hero)] || 'Spotlight',
  storyVideo: !!HH_INIT.storyVideo,
  stats: !!HH_INIT.stats,
  beauty: (document.documentElement.getAttribute('data-hh-skin') !== 'classic'),
};

function HHTweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Push every change through to the live re-skin engine.
  const push = (patch) => { if (window.hhRedesign) window.hhRedesign.set(patch); };

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Look" />
      <TweakToggle
        label="Clean redesign"
        value={t.beauty}
        onChange={(v) => { setTweak('beauty', v); if (window.HHBeauty) window.HHBeauty.set(v); }}
      />
      <TweakSection label="Direction" />
      <TweakRadio
        label="Theme"
        value={t.theme}
        options={['Light', 'Dark']}
        onChange={(v) => { setTweak('theme', v); push({ theme: v === 'Dark' ? 'dark' : 'light' }); }}
      />
      <TweakRadio
        label="Hero style"
        value={t.hero}
        options={['Spotlight', 'Editorial', 'Cinematic']}
        onChange={(v) => {
          setTweak('hero', v);
          const map = { Spotlight: '1', Editorial: '2', Cinematic: '3' };
          push({ hero: map[v] || '1' });
        }}
      />
      <TweakSection label="Motion" />
      <TweakToggle
        label="Story video background"
        value={t.storyVideo}
        onChange={(v) => { setTweak('storyVideo', v); push({ storyVideo: v }); }}
      />
      <TweakToggle
        label="Animated stat counters"
        value={t.stats}
        onChange={(v) => { setTweak('stats', v); push({ stats: v }); }}
      />
    </TweaksPanel>
  );
}

(function mountHHTweaks() {
  const el = document.getElementById('hh-tweaks-root');
  if (!el || !window.React || !window.ReactDOM) return;
  ReactDOM.createRoot(el).render(<HHTweaksApp />);
})();
