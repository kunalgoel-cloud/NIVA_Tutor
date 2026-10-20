"use client";
import dynamic from "next/dynamic";
import type { Activity } from "@/lib/games/schema";
import type { AttemptReport } from "./types";
import type { HintLevel } from "@/lib/games/hints";

// Engines are lazy-loaded so the first screen stays light.
// To add an engine: add its type to lib/games/schema.ts, build a component that follows the EngineProps
// contract (components/games/types.ts), declare it below and add a case to EngineView.
const TapChoose = dynamic(() => import("./engines/TapChoose"));
const CountCollect = dynamic(() => import("./engines/CountCollect"));
const MatchPair = dynamic(() => import("./engines/MatchPair"));
const CompletePattern = dynamic(() => import("./engines/CompletePattern"));
const ListenRespond = dynamic(() => import("./engines/ListenRespond"));

export type EngineViewProps = {
  activity: Activity; roundIndex: number; seed: string; hintLevel: HintLevel; reveal: boolean; locked: boolean;
  onAttempt: (r: AttemptReport) => void; say: (t: string) => void;
};

export function EngineView({ activity, roundIndex, ...rest }: EngineViewProps) {
  const common = { activity, seed: rest.seed, hintLevel: rest.hintLevel, reveal: rest.reveal, locked: rest.locked, onAttempt: rest.onAttempt, say: rest.say };
  switch (activity.engine) {
    case "tap-choose": return <TapChoose {...common} round={activity.rounds[roundIndex]} />;
    case "count-collect": return <CountCollect {...common} round={activity.rounds[roundIndex]} />;
    case "match-pair": return <MatchPair {...common} round={activity.rounds[roundIndex]} />;
    case "complete-pattern": return <CompletePattern {...common} round={activity.rounds[roundIndex]} />;
    case "listen-respond": return <ListenRespond {...common} round={activity.rounds[roundIndex]} />;
  }
}
