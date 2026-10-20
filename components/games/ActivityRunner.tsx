"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useApp } from "@/components/AppProvider";
import { Character } from "@/components/characters/Character";
import { BigButton } from "@/components/ui/Button";
import { characterById } from "@/content/characters";
import type { Activity } from "@/lib/games/schema";
import { optionCountOf } from "@/lib/games/evaluate";
import { hintText, nextHintLevel, roundOutcome, shouldOfferHint, shouldShowAnswer, type HintLevel } from "@/lib/games/hints";
import type { Observation } from "@/lib/learning/types";
import { buildAttempt } from "@/lib/learning/attempt";
import { newId } from "@/lib/database/data";
import { EngineView } from "./registry";
import { EngineBoundary } from "./EngineBoundary";
import type { AttemptReport } from "./types";

type Stage = "intro" | "play" | "done";
const pick = (list: string[], n: number) => list[n % list.length];

export function ActivityRunner({ activity, backHref }: { activity: Activity; backHref: string }) {
  const app = useApp();
  const router = useRouter();
  const { profile, settings, say, stopSpeaking, chime, recordAttempt } = app;
  const character = characterById(activity.characterId);

  const [seed, setSeed] = useState(() => Math.random().toString(36).slice(2, 8));
  const [stage, setStage] = useState<Stage>("intro");
  const [paused, setPaused] = useState(false);
  const [roundIdx, setRoundIdx] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [hintLevel, setHintLevel] = useState<HintLevel>(0);
  const [attempts, setAttempts] = useState(0);
  const [roundDone, setRoundDone] = useState<null | { outcome: Observation["outcome"] }>(null);
  const [reveal, setReveal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [offerHint, setOfferHint] = useState(false);
  const [breakNote, setBreakNote] = useState(false);
  const observations = useRef<Observation[]>([]);
  const startedAt = useRef(0); // set when play starts
  const recorded = useRef(false);
  const feedbackCount = useRef(0);

  const round = activity.rounds[roundIdx];
  const roundPrompt = (round as { prompt: string }).prompt;
  const hints = (round as { hints?: string[] }).hints ?? [];
  const isLast = roundIdx >= activity.rounds.length - 1;

  const speakAndShow = useCallback((text: string) => { setMessage(text); void say(text); }, [say]);

  // Gentle, optional break reminder. It never stops play.
  useEffect(() => {
    const mins = settings.session.gentleBreakReminderMinutes;
    if (!mins || stage !== "play") return;
    const t = setTimeout(() => setBreakNote(true), mins * 60_000);
    return () => clearTimeout(t);
  }, [settings.session.gentleBreakReminderMinutes, stage]);

  // Speak the prompt when each round begins (after the child pressed Play, so audio is allowed on iPad).
  useEffect(() => {
    if (stage === "play") { void say(roundPrompt); }
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, roundIdx]);

  const finish = useCallback(async (reachedEnd: boolean) => {
    if (recorded.current) return; // prevents duplicate submissions
    recorded.current = true;
    if (profile && observations.current.length > 0) {
      await recordAttempt(buildAttempt({ id: newId("att"), profileId: profile.id, activity, observations: observations.current, reachedEnd, startedAt: startedAt.current, now: new Date() }));
    }
  }, [profile, activity, recordAttempt]);

  const resetRound = () => { setWrong(0); setHintLevel(0); setAttempts(0); setRoundDone(null); setReveal(false); setMessage(null); setOfferHint(false); feedbackCount.current = 0; };

  const onAttempt = useCallback((r: AttemptReport) => {
    if (roundDone) return;
    setAttempts((a) => a + 1);
    if (r.kind === "incorrect") {
      const w = wrong + 1; setWrong(w); chime("try");
      if (shouldShowAnswer(w, hintLevel)) {
        setReveal(true); setRoundDone({ outcome: "shown" }); speakAndShow("Let's do this one together. Look!");
      } else { speakAndShow(pick(activity.feedback.encourage, w - 1)); setOfferHint(shouldOfferHint(w)); }
      return;
    }
    if (r.complete === false) { chime("tap"); speakAndShow(pick(activity.feedback.correct, feedbackCount.current++)); return; }
    chime("correct");
    let outcome = roundOutcome({ openEnded: r.kind === "open", wrongAttempts: wrong, hintLevel, answerShown: false });
    if (r.support === "tapped" && outcome === "independent") outcome = "supported";
    setRoundDone({ outcome });
    speakAndShow(r.message ?? pick(activity.feedback.correct, roundIdx));
  }, [roundDone, wrong, hintLevel, chime, speakAndShow, activity.feedback, roundIdx]);

  const askHint = () => {
    if (roundDone) return;
    const next = nextHintLevel(hintLevel);
    setHintLevel(next); setOfferHint(false);
    if (next >= 4 || shouldShowAnswer(wrong, next)) {
      setReveal(true); setRoundDone({ outcome: "shown" }); speakAndShow("Let's do this one together. Look!");
    } else speakAndShow(hintText(hints, next) ?? "");
  };

  const record = () => {
    if (!roundDone) return;
    observations.current.push({
      activityId: activity.id, activityVersion: activity.version, roundId: round.id, objectiveId: activity.objectiveIds[0],
      outcome: roundDone.outcome, hintsUsed: hintLevel, exampleShown: reveal || hintLevel >= 4, attempts, optionCount: optionCountOf(activity, roundIdx), at: new Date().toISOString(),
    });
  };
  const next = async () => {
    if (!roundDone) return;
    record();
    if (isLast) { await finish(true); chime("done"); setStage("done"); void say(pick(activity.feedback.complete, 0)); }
    else { setRoundIdx((i) => i + 1); resetRound(); }
  };
  const skip = async () => {
    // Skipping records nothing for this round: it is neither success nor failure.
    if (isLast) { await finish(observations.current.length >= activity.completion.minRoundsCompleted); setStage("done"); void say(pick(activity.feedback.complete, 1)); }
    else { setRoundIdx((i) => i + 1); resetRound(); }
  };
  const leave = async () => { stopSpeaking(); await finish(false); router.push(backHref); };

  const replay = () => void say(stage === "intro" ? activity.audioInstructions : roundPrompt);
  const playAgain = () => { recorded.current = false; observations.current = []; startedAt.current = Date.now(); setSeed(Math.random().toString(36).slice(2, 8)); setRoundIdx(0); resetRound(); setStage("play"); };

  const recs = useMemo(() => (stage === "done" ? app.recommendations().filter((r) => r.activity.id !== activity.id).slice(0, 1) : []), [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  if (stage === "intro") {
    return (
      <div className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center gap-6 text-center">
        <Character species={character.species} size={180} mood="cheer" speaking label={character.name} />
        <h2 className="text-3xl font-extrabold">{activity.title}</h2>
        <p className="rounded-3xl bg-white px-6 py-4 text-2xl font-semibold shadow-clay">{activity.instructions}</p>
        {activity.adultSupervision && <p className="rounded-2xl bg-sun/40 px-4 py-2 text-base font-semibold">👩‍🦱 A grown-up should help with this one: {activity.adultSupervision}</p>}
        <div className="flex flex-wrap justify-center gap-4">
          <BigButton variant="soft" onClick={replay} label="Hear the instructions again">🔈 Hear again</BigButton>
          <BigButton size="lg" id="start-activity" onClick={() => { startedAt.current = Date.now(); setStage("play"); void say(activity.audioInstructions); }}>▶ Let&apos;s play!</BigButton>
        </div>
      </div>
    );
  }

  if (stage === "done") {
    const mission = activity.realWorldMission;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center gap-6 text-center" data-testid="complete">
        <Character species={character.species} size={200} mood="cheer" speaking label={character.name} />
        <h2 className="text-4xl font-extrabold">{pick(activity.feedback.complete, 0)}</h2>
        <p aria-hidden className="text-5xl">🌟🌈🌟</p>
        {mission && <p className="rounded-2xl bg-white px-5 py-3 text-lg font-semibold shadow-clay">🏠 Try this with a grown-up: {mission}</p>}
        <div className="flex flex-wrap justify-center gap-4">
          <BigButton variant="soft" onClick={playAgain}>🔁 Play again</BigButton>
          {recs[0] && <BigButton href={`/play/${recs[0].activity.id}`}>➡ Another game</BigButton>}
          <BigButton variant="soft" href={backHref}>🌍 Back</BigButton>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5" data-testid="runner">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={activity.rounds.length} aria-valuenow={roundIdx + 1} aria-label={`Part ${roundIdx + 1} of ${activity.rounds.length}`}>
          {activity.rounds.map((_, i) => (
            <span key={i} aria-hidden className={`size-4 rounded-full border-2 ${i < roundIdx ? "border-good bg-good" : i === roundIdx ? "border-[var(--w-deep)] bg-[var(--w-deep)]" : "border-line bg-white"}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <BigButton variant="soft" onClick={() => setPaused(true)} label="Pause">Pause</BigButton>
          <BigButton variant="soft" onClick={skip} label="Skip this one">⏭ Skip</BigButton>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Character species={character.species} size={72} label={character.name} speaking={!!message} />
        <p className="flex-1 rounded-3xl bg-white px-5 py-4 text-2xl font-bold shadow-clay" data-testid="prompt">{roundPrompt}</p>
        <button type="button" onClick={replay} aria-label="Hear it again" className="tap rounded-full border-2 border-line bg-white px-4 text-2xl shadow-clay">🔈</button>
      </div>

      <div className="flex flex-1 flex-col justify-center">
      <EngineBoundary backHref={backHref}>
        <EngineView key={`${seed}-${roundIdx}`} activity={activity} roundIndex={roundIdx} seed={seed} hintLevel={hintLevel} reveal={reveal} locked={!!roundDone} onAttempt={onAttempt} say={(t: string) => void say(t)} />
      </EngineBoundary>
      </div>

      <div className="flex flex-col items-center gap-3 pt-2">
        <AnimatePresence mode="wait">
          {message && (
            <motion.p key={message} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" data-testid="feedback"
              className={`rounded-full px-6 py-3 text-center text-xl font-extrabold shadow-clay ${roundDone && roundDone.outcome !== "shown" ? "bg-emerald-100 text-good" : "bg-white text-ink"}`}>
              {roundDone && roundDone.outcome !== "shown" ? "✓ " : ""}{message}
            </motion.p>
          )}
        </AnimatePresence>
        {!roundDone && offerHint && <p className="text-lg font-bold text-ink-soft">Would you like a little hint?</p>}
        <div className="flex flex-wrap justify-center gap-3">
          {!roundDone && <BigButton variant={offerHint ? "primary" : "soft"} onClick={askHint} label="Show a hint">💡 Hint</BigButton>}
          {roundDone && <BigButton size="lg" id="continue" onClick={next}>{isLast ? "🎉 All done" : "Next ➡"}</BigButton>}
        </div>
        {hintLevel > 0 && !roundDone && <p className="text-center text-base font-semibold text-ink-soft">{hintText(hints, hintLevel)}</p>}
      </div>

      {breakNote && (
        <div role="status" className="rounded-2xl bg-sun/40 p-3 text-center font-semibold">
          Time for a stretch? You can keep playing or take a break.
          <button type="button" className="ml-3 underline" onClick={() => setBreakNote(false)}>Keep playing</button>
        </div>
      )}

      {paused && (
        <div role="dialog" aria-modal="true" aria-label="Paused" className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-card bg-white p-8 text-center shadow-clay">
            <p className="text-3xl font-extrabold">Taking a pause</p>
            <BigButton size="lg" onClick={() => setPaused(false)}>▶ Keep playing</BigButton>
            <BigButton variant="soft" onClick={leave}>🏠 Stop for now</BigButton>
            <p className="text-sm text-ink-soft">Stopping is always okay. What you have done so far is kept.</p>
          </div>
        </div>
      )}
    </div>
  );
}
