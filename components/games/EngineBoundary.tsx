"use client";
import { Component, type ReactNode } from "react";
import { BigButton } from "@/components/ui/Button";

/** If an activity fails while drawing, show a calm fallback instead of a crashed app. */
export class EngineBoundary extends Component<{ children: ReactNode; backHref: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { console.error("Activity failed to render:", error.message); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-card bg-white p-8 text-center shadow-clay">
        <div aria-hidden className="text-6xl">🛠️</div>
        <p className="text-xl font-bold">This game needs a grown-up&apos;s help to get fixed.</p>
        <p className="text-ink-soft">Let&apos;s play something else!</p>
        <BigButton href={this.props.backHref}>Pick another game</BigButton>
      </div>
    );
  }
}
