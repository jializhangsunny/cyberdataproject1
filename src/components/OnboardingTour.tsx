"use client";

import { TourProvider, useTour } from "@reactour/tour";
import { useEffect, CSSProperties } from "react";

interface GenericTourProps {
  steps: Parameters<typeof TourProvider>[0]["steps"];
  storageKey: string;                 // e.g. "tour_done_vuln"
  maskBg?: string;
}

/* ---------- only-once auto start ---------- */
function AutoStart({ storageKey }: { storageKey: string }) {
  const { setIsOpen } = useTour();

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      setIsOpen(true);
    }
  }, [storageKey, setIsOpen]);

  return null;
}

/* ---------- reusable Tour component ---------- */
export default function OnboardingTour({
  steps,
  storageKey,
  maskBg = "rgba(0,0,0,.85)",
}: GenericTourProps) {
  return (
    <TourProvider
      steps={steps}
      onClickClose={({ setIsOpen }) => {
        localStorage.setItem(storageKey, "yes");
        setIsOpen(false); // Actually close the tour
      }}
      components={{
        Close: () => {
          const { setIsOpen } = useTour(); // Get setIsOpen from the tour context
          
          return (
            <button
              onClick={() => {
                localStorage.setItem(storageKey, "yes");
                setIsOpen(false);
              }}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          );
        },
      }}
      styles={{
        popover: (base: any): CSSProperties => ({
          ...base,
          background: "#2563eb",
          color: "#f3f4f6",
          fontSize: 20,
          borderRadius: 8,
          padding: "16px 40px",
          maxWidth: 400,
        }),
        arrow: (base: CSSProperties): CSSProperties => ({
          ...base, 
          color: "#2563eb",
        }),
        badge: (base: CSSProperties): CSSProperties => ({
          ...base, 
          background: "#3b82f6", 
          fontSize: 20,
        }),
        button: (base: CSSProperties): CSSProperties => ({
          ...base,
          background: "#3b82f6",
          fontSize: 20,
          padding: "8px 20px",
        }),
        maskWrapper: (base: any) => ({
          ...base,
          background: maskBg,
        }),
      }}
      showDots
      showBadge
      disableInteraction
      showCloseButton={true} // Make sure this is explicitly set
    >
      <AutoStart storageKey={storageKey} />
    </TourProvider>
  );
}

