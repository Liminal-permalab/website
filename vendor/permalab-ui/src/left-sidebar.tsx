import { useState, type ReactNode } from "react";

export type SidebarItem = {
  id: string;
  label: string;
  icon: string;
  content: ReactNode;
};

export type SidebarFooterItem = {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
};

export function LeftSidebar({ items, footer }: { items: SidebarItem[]; footer?: SidebarFooterItem[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(items[0]?.id ?? null);

  const selectedItem = items.find((item) => item.id === selected);

  return (
    <div className="left-sidebar" data-open={open}>
      {/* Sidebar toggle and items */}
      <nav className="sidebar-nav">
        <button
          type="button"
          className="sidebar-toggle"
          aria-label={open ? "Close sidebar" : "Open sidebar"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className="toggle-icon" />
        </button>

        <div className="sidebar-items">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="sidebar-item"
              aria-selected={item.id === selected}
              title={item.label}
              onClick={() => {
                setSelected(item.id);
                if (!open) setOpen(true);
              }}
            >
              <i className={`icon ${item.icon}`} aria-hidden="true" />
              {open && <span className="label">{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Footer items (profile, settings) */}
        {footer && footer.length > 0 && (
          <div className="sidebar-footer">
            {footer.map((item) => (
              <button
                key={item.id}
                type="button"
                className="sidebar-item"
                title={item.label}
                onClick={item.onClick}
              >
                <i className={`icon ${item.icon}`} aria-hidden="true" />
                {open && <span className="label">{item.label}</span>}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Content panel */}
      {open && selectedItem && (
        <div className="sidebar-content">
          <div className="sidebar-panel">{selectedItem.content}</div>
        </div>
      )}

      {/* Scrim to close sidebar on click outside */}
      {open && <button type="button" className="sidebar-scrim" aria-label="Close sidebar" onClick={() => setOpen(false)} />}
    </div>
  );
}
