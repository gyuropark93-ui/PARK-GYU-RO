export function isSafari(): boolean {
  const ua = navigator.userAgent;
  const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(ua);
  return isSafariBrowser;
}

export function getTransitionVideoPath(direction: "forward" | "back"): string {
  const safari = isSafari();
  const ext = safari ? "mov" : "webm";
  return `/assets/transition_${direction}${safari ? "_safari" : ""}.${ext}`;
}
