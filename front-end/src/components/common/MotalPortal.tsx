"use client";
import { useEffect, useState } from "react";
import type { ReactNode} from "react";
import { createPortal } from "react-dom";

export function ModalPortal({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [container] = useState(() => {
        const el = document.createElement("div");
        el.id = "modal-root";
        el.style.position = "fixed";
        el.style.inset = "0";
        el.style.zIndex = "9999"; // đảm bảo nổi cao nhất
        return el;
    });

    useEffect(() => {
        document.body.appendChild(container);
        setMounted(true);
        return () => {
            document.body.removeChild(container);
        };
    }, [container]);

    return mounted ? createPortal(children, container) : null;
}
