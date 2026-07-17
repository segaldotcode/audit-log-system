"use client";

import { useState } from "react";
import { Accordion } from "@/components/ui/accordion";

interface TimelineAccordionProps {
  dateKeys: string[];
  children: React.ReactNode;
}

// Keeps the open/closed state client-side and initialized only once, so a
// server re-render (e.g. after simulating a new event revalidates the page)
// does not hand the uncontrolled Accordion a fresh defaultValue every time.
export function TimelineAccordion({ dateKeys, children }: TimelineAccordionProps) {
  const [defaultValue] = useState(dateKeys);

  return (
    <Accordion multiple defaultValue={defaultValue}>
      {children}
    </Accordion>
  );
}
