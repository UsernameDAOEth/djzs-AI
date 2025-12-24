import React, { useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Text } from "@react-three/drei";

/* ==================== DATA ==================== */

type Zone = { code: string; title: string; desc: string };
const ZONES: Zone[] = [
  { code: "01", title: "DYOR", desc: "Research hub: narratives, docs, audits, threads." },
  { code: "02", title: "DID", desc: "Identity, access, signatures, proofs." },
  { code: "03", title: "TESTNET", desc: "Ship fast: experiments, wallets, deployments." },
  { code: "04", title: "DESO", desc: "Social graphs, posts, community intel." },
  { code: "05", title: "RWA", desc: "Real-world assets, tokenization, infra tracking." },
  { code: "06", title: "DEPIN", desc: "Networks, hardware, sensors, distributed infra." },
  { code: "07", title: "DEFI", desc: "Liquidity, risk, positions, strategies." },
  { code: "08", title: "DEAI", desc: "Agent workflows, tools, automations." },
  { code: "09", title: "DESCI", desc: "Research logs, experiments, evidence." },
  { code: "10", title: "TIME", desc: "Timelines, retrospectives, future planning." },
];

type Agent = {
  id: string;
  name: string;
  zoneCode: string;
  tagline: string;
  can: string[];
};

const AGENTS: Agent[] = [
  { id: "agent_01", name: "DYOR Agent", zoneCode: "01", tagline: "Turns messy links into clean research notes.", can: ["Summarize threads", "Extract tokenomics", "Track audits"] },
  { id: "agent_02", name: "DID Agent", zoneCode: "02", tagline: "Keeps identity, access, and proofs organized.", can: ["Access checklists", "Proof logs", "Permission maps"] },
  { id: "agent_03", name: "Testnet Agent", zoneCode: "03", tagline: "Ships experiments + tracks deployments.", can: ["Deploy logs", "Checklist runs", "Bug triage"] },
  { id: "agent_04", name: "DeSo Agent", zoneCode: "04", tagline: "Turns social noise into signal.", can: ["Trend snapshots", "Influencer watch", "Narrative shifts"] },
  { id: "agent_05", name: "RWA Agent", zoneCode: "05", tagline: "Maps real-world assets + infra narratives.", can: ["Project briefs", "Regulatory notes", "Partner tracking"] },
  { id: "agent_06", name: "DePIN Agent", zoneCode: "06", tagline: "Tracks networks, nodes, devices, incentives.", can: ["Network health", "Token incentives", "Hardware notes"] },
  { id: "agent_07", name: "DeFi Agent", zoneCode: "07", tagline: "Strategy + risk assistant.", can: ["Position journal", "Risk checks", "Strategy templates"] },
  { id: "agent_08", name: "DeAI Agent", zoneCode: "08", tagline: "Builds automations + agent playbooks.", can: ["Prompt packs", "Workflow maps", "Tool evals"] },
  { id: "agent_09", name: "DeSci Agent", zoneCode: "09", tagline: "Experiment logs with evidence-first formatting.", can: ["Protocol templates", "Citations", "Result summaries"] },
  { id: "agent_10", name: "Time Agent", zoneCode: "10", tagline: "Chronicles timelines + builds retrospectives.", can: ["Weekly reviews", "Roadmaps", "Decision logs"] },
];

/* ==================== COSMIC BACKGROUND ==================== */

function CosmicBackground() {
  return (
    <>
      <style>{`
        @keyframes drift {
          0% { transform: translate3d(0,0,0) scale(1); opacity: .65; }
          50% { transform: translate3d(-2%,1.5%,0) scale(1.03); opacity: .80; }
          100% { transform: translate3d(0,0,0) scale(1); opacity: .65; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-10%) rotate(0deg); opacity: .0; }
          25% { opacity: .18; }
          50% { transform: translateX(10%) rotate(8deg); opacity: .08; }
          100% { transform: translateX(-10%) rotate(0deg); opacity: .0; }
        }
        @keyframes stars {
          0% { background-position: 0px 0px; }
          100% { background-position: 800px 600px; }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#05070c]" />
        <div
          className="absolute inset-0"
          style={{
            animation: "drift 14s ease-in-out infinite",
            background:
              "radial-gradient(900px 480px at 20% 30%, rgba(120,200,255,0.14), transparent 60%)," +
              "radial-gradient(900px 520px at 80% 55%, rgba(255,160,220,0.12), transparent 60%)," +
              "radial-gradient(1000px 520px at 50% -10%, rgba(255,255,255,0.10), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-35"
          style={{
            animation: "stars 40s linear infinite",
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.75) 1px, transparent 1px)," +
              "radial-gradient(rgba(255,255,255,0.45) 1px, transparent 1px)",
            backgroundSize: "90px 90px, 140px 140px",
            backgroundPosition: "0 0, 40px 60px",
          }}
        />
        <div
          className="absolute -inset-20"
          style={{
            animation: "shimmer 10s ease-in-out infinite",
            background:
              "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.08) 45%, transparent 60%)",
            filter: "blur(18px)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.82))]" />
      </div>
    </>
  );
}

/* ==================== 3D ZONE CUBES ==================== */

function ZoneCube({
  zone,
  position,
  onPick,
}: {
  zone: Zone;
  position: [number, number, number];
  onPick: (z: Zone) => void;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.006;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.9) * 0.14;

    const target = hovered ? 1.14 : 1.0;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.14);
  });

  return (
    <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.55}>
      <group position={position}>
        <RoundedBox
          ref={ref}
          args={[1.12, 1.12, 1.12]}
          radius={0.18}
          smoothness={6}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => onPick(zone)}
        >
          <meshStandardMaterial
            metalness={0.78}
            roughness={0.20}
            color={hovered ? "#ffffff" : "#9ad7ff"}
            emissive={hovered ? "#58c7ff" : "#0b1b2a"}
            emissiveIntensity={hovered ? 1.25 : 0.65}
          />
        </RoundedBox>

        <Text
          position={[0, 0, 0.78]}
          fontSize={0.18}
          color={hovered ? "#0b0f18" : "#e7f7ff"}
          anchorX="center"
          anchorY="middle"
        >
          {zone.code} {zone.title}
        </Text>
      </group>
    </Float>
  );
}

function ZoneCubes3D({ onPickZone }: { onPickZone: (z: Zone) => void }) {
  const positions = useMemo(
    () =>
      [
        [-2.2, 1.2, 0],
        [-0.7, 1.35, 0],
        [0.8, 1.15, 0],
        [2.3, 1.25, 0],
        [-2.35, -0.2, 0],
        [-0.75, 0.05, 0],
        [0.85, -0.1, 0],
        [2.35, -0.2, 0],
        [-1.15, -1.5, 0],
        [1.15, -1.55, 0],
      ] as [number, number, number][],
    []
  );

  return (
    <div className="w-full h-[560px] rounded-[28px] overflow-hidden border border-white/10 bg-black/30">
      <Canvas camera={{ position: [0, 0, 7.8], fov: 45 }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 8, 6]} intensity={1.15} />
        <pointLight position={[0, 0, 6]} intensity={0.95} />

        {ZONES.map((z, i) => (
          <ZoneCube key={z.code} zone={z} position={positions[i]} onPick={onPickZone} />
        ))}
      </Canvas>
    </div>
  );
}

/* ==================== UI ATOMS ==================== */

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70">
      <span className="h-2 w-2 rounded-full bg-white/70" />
      {children}
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
      <div className="text-lg font-semibold tracking-tight text-white">{title}</div>
      {subtitle ? <div className="mt-1 text-sm text-white/60">{subtitle}</div> : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}

/* ==================== HOME PAGE ==================== */

export default function Home() {
  const [, setLocation] = useLocation();
  const { address, isConnected } = useAccount();
  const [picked, setPicked] = useState<Zone | null>(null);
  const [agentPicked, setAgentPicked] = useState<Agent | null>(null);

  const agentsForPicked = useMemo(() => {
    if (!picked) return AGENTS.slice(0, 4);
    return AGENTS.filter((a) => a.zoneCode === picked.code);
  }, [picked]);

  function shortAddr(a?: string) {
    if (!a) return "";
    return `${a.slice(0, 6)}…${a.slice(-4)}`;
  }

  return (
    <div className="min-h-screen text-white">
      <CosmicBackground />

      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500" />
            <div className="leading-tight">
              <div className="font-semibold">Username DAO</div>
              <div className="text-xs text-white/55">Identity Layer</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://dj-z-s.box/"
              className="hidden sm:inline-flex px-4 py-2 rounded-2xl border border-white/12 text-white/80 hover:text-white hover:border-white/20 transition"
            >
              DJ-Z-S Box
            </a>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-6 pt-8 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <Pill>Username as a Brand → Zones → Members layer</Pill>

              <h1 className="mt-5 text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                Mint a username.
                <br />
                Turn it into a Web3 brand + workflow hub.
              </h1>

              <p className="mt-4 text-base text-white/70 max-w-xl leading-relaxed">
                <span className="text-white/90 font-semibold">usernamedjzs.xyz</span> is the public identity layer for DJ-Z-S. Claim a username as a brand, and organize your
                output into <span className="text-white/90 font-semibold">10 Zones</span>.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {isConnected ? (
                  <>
                    <button
                      onClick={() => setLocation("/chat")}
                      className="px-5 py-3 rounded-2xl bg-white text-black font-semibold hover:opacity-95 transition"
                    >
                      Enter Chat
                    </button>
                  </>
                ) : (
                  <div className="text-sm text-white/60">Connect your wallet to enter chat</div>
                )}
                <a
                  href="https://dj-z-s.box/"
                  className="px-5 py-3 rounded-2xl border border-white/12 text-white/85 hover:text-white hover:border-white/20 transition"
                >
                  Members: DJ-Z-S Box
                </a>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-sm font-semibold">Wallet identity</div>
                  <div className="mt-1 text-xs text-white/60">
                    {address ? `Connected: ${shortAddr(address)}` : "Connect wallet to begin"}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-sm font-semibold">Zones model</div>
                  <div className="mt-1 text-xs text-white/60">
                    Click a cube to preview a Zone + its agent.
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-sm font-semibold">Members layer</div>
                  <div className="mt-1 text-xs text-white/60">
                    DJ-Z-S Box: encrypted gated coordination.
                  </div>
                </div>
              </div>
            </div>

            <div>
              <ZoneCubes3D
                onPickZone={(z) => {
                  setPicked(z);
                  setAgentPicked(null);
                }}
              />
              <div className="mt-3 text-xs text-white/55">
                Tip: hover a cube to glow; click to load Zone + agent preview.
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card
              title={picked ? `Zone ${picked.code} — ${picked.title}` : "Pick a Zone"}
              subtitle={picked ? picked.desc : "Click any 3D cube to preview the Zone + its AI agent."}
            >
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setLocation("/chat")}
                  className="px-4 py-2 rounded-2xl border border-white/12 text-white/85 hover:border-white/20 hover:text-white transition"
                >
                  Enter Chat
                </button>
                <a
                  href="https://dj-z-s.box/"
                  className="px-4 py-2 rounded-2xl border border-white/12 text-white/85 hover:border-white/20 hover:text-white transition"
                >
                  Open DJ-Z-S Box
                </a>
              </div>

              <div className="mt-4 rounded-3xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-white/55">Positioning (public vs members)</div>
                <div className="mt-2 text-sm text-white/75 leading-relaxed">
                  <span className="text-white/90 font-semibold">usernamedjzs.xyz</span> = public identity layer (mint a username as a brand).
                  <br />
                  <span className="text-white/90 font-semibold">dj-z-s.box</span> = members-only encrypted chat with structured tools.
                </div>
              </div>
            </Card>

            <Card
              title={agentPicked ? agentPicked.name : "AI Agent Preview"}
              subtitle={agentPicked ? agentPicked.tagline : "Agents are Zone-specific helpers."}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {agentsForPicked.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAgentPicked(a)}
                    className={`text-left rounded-3xl border p-4 transition ${
                      agentPicked?.id === a.id
                        ? "border-white/25 bg-white/[0.06]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="text-xs text-white/55">Zone {a.zoneCode}</div>
                    <div className="mt-1 font-semibold">{a.name}</div>
                    <div className="mt-1 text-sm text-white/65">{a.tagline}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {a.can.slice(0, 2).map((c) => (
                        <span
                          key={c}
                          className="text-xs rounded-2xl border border-white/10 bg-black/30 px-2 py-1 text-white/75"
                        >
                          {c}
                        </span>
                      ))}
                      {a.can.length > 2 ? (
                        <span className="text-xs text-white/45">+{a.can.length - 2} more</span>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>

              {agentPicked ? (
                <div className="mt-4 rounded-3xl border border-white/10 bg-black/30 p-4">
                  <div className="text-sm font-semibold">What it can do</div>
                  <ul className="mt-2 space-y-1 text-sm text-white/70">
                    {agentPicked.can.map((c) => (
                      <li key={c}>• {c}</li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => setLocation("/chat")}
                      className="px-4 py-2 rounded-2xl bg-white text-black font-semibold hover:opacity-95 transition"
                    >
                      Enter Chat
                    </button>
                    <a
                      href="https://dj-z-s.box/"
                      className="px-4 py-2 rounded-2xl border border-white/12 text-white/85 hover:border-white/20 hover:text-white transition"
                    >
                      DJ-Z-S Box →
                    </a>
                  </div>
                </div>
              ) : null}
            </Card>
          </div>
        </section>

        <footer className="mx-auto max-w-6xl px-6 pb-10 text-sm text-white/55">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10 pt-6">
            <div>© {new Date().getFullYear()} Username DAO / DJ-Z-S</div>
            <div className="flex gap-4">
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
              <Link href="/chat" className="hover:text-white transition">
                Chat
              </Link>
              <a className="hover:text-white transition" href="https://dj-z-s.box/">
                DJ-Z-S Box
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
