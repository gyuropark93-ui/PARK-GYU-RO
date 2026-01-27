export function isSafari(): boolean {
  const ua = navigator.userAgent;
  const isChromium = /CriOS|Chrome|Chromium|EdgiOS|Edge/i.test(ua);
  const isFirefox = /FxiOS|Firefox/i.test(ua);
  const isOpera = /OPR|Opera/i.test(ua);
  const hasSafari = /Safari/i.test(ua);
  const isAppleWebKit = /AppleWebKit/i.test(ua);
  return hasSafari && isAppleWebKit && !isChromium && !isFirefox && !isOpera;
}

export function getTransitionVideoPath(direction: "forward" | "back"): string {
  const safari = isSafari();
  const ext = safari ? "mp4" : "webm";
  return `/assets/transition_${direction}${safari ? "_safari" : ""}.${ext}`;
}
