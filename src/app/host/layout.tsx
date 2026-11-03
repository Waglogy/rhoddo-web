// Everything under /host uses the site theme. `isolate` keeps the login page's
// background glows above this wrapper's background.
export default function HostThemeLayout({ children }: { children: React.ReactNode }) {
  return <div className="theme-site isolate min-h-screen bg-bg text-ink">{children}</div>;
}
