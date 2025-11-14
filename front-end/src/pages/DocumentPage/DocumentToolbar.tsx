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
  if (!showToolbar) return null;

  return (
    <div
      className="fixed z-50 transition-all duration-200 ease-out"
      style={{
        left: `${toolbarPosition.x}px`,
        top: `${toolbarPosition.y}px`,
      }}
      onMouseDown={(e) => {
        // Prevent default to avoid losing focus from textarea
        e.preventDefault();
      }}
    >
      <div className="shadow-2xl animate-in fade-in slide-in-from-bottom-2">
        <Tool />
      </div>
    </div>
  );
};
