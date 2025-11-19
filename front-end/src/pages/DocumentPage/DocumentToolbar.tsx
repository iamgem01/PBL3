import { Tool } from "@/components/Toolbar/Tool";

interface DocumentToolbarProps {
  showToolbar: boolean;
  toolbarPosition: { x: number; y: number };
  onHideToolbar: () => void;
}

export const DocumentToolbar = ({
  showToolbar,
  toolbarPosition,
  onHideToolbar,
}: DocumentToolbarProps) => {

  return (
    <div
    key="portal"
      onMouseDown={(e) => e.preventDefault()}
      className="fixed z-50 transition-all duration-200 ease-out"
      style={{
        display: showToolbar ? "block" : "none",
        left: `${toolbarPosition.x}px`,
        top: `${toolbarPosition.y}px`,
      }}
    >
      <div className="shadow-2xl animate-in fade-in slide-in-from-bottom-2">
        <Tool />
      </div>
    </div>
  );
};
