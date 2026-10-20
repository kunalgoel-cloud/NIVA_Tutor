import { ParentGate } from "@/components/parent/ParentGate";
import { ParentShell } from "@/components/parent/ParentShell";

export const metadata = { title: "Grown-ups · Little Wonder World" };

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <ParentGate><ParentShell>{children}</ParentShell></ParentGate>;
}
