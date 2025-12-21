import { useMemo, useState } from "react";
import XmtpConnect from "../components/XmtpConnect";

type Room = { id: string; name: string; unread: number };

export default function Chat() {
  const rooms: Room[] = useMemo(
    () => [
      { id: "lounge", name: "Members Lounge", unread: 2 },
      { id: "trades", name: "Trades", unread: 7 },
      { id: "predictions", name: "Predictions", unread: 0 },
      { id: "events", name: "Events", unread: 1 },
      { id: "payments", name: "Payments", unread: 0 },
    ],
    []
  );

  const [activeRoomId, setActiveRoomId] = useState(rooms[0]?.id ?? "lounge");
  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>
          DJZS Chat
          <span style={{ opacity: 0.6, marginLeft: 8, fontWeight: 700 }}>
            / {activeRoom?.name ?? "—"}
          </span>
        </div>
        <div style={{ minWidth: 380 }}>
          <XmtpConnect />
        </div>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "280px 1fr 300px" }}>
        <aside
          style={{
            borderRight: "1px solid rgba(255,255,255,0.12)",
            padding: 12,
            overflow: "auto",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>Rooms</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rooms.map((room) => {
              const active = room.id === activeRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  data-testid={`button-room-${room.id}`}
                  style={{
                    textAlign: "left",
                    padding: "10px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: active ? "rgba(255,255,255,0.10)" : "transparent",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <span style={{ fontWeight: 800 }}>{room.name}</span>
                  {room.unread > 0 && (
                    <span
                      style={{
                        minWidth: 22,
                        height: 22,
                        borderRadius: 999,
                        padding: "0 8px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 900,
                        background: "rgba(255,255,255,0.18)",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                      aria-label={`${room.unread} unread`}
                      data-testid={`badge-unread-${room.id}`}
                    >
                      {room.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 16, fontSize: 12, opacity: 0.65 }}>
            (Next: bind rooms to XMTP groups + compute unread counts from last-read markers.)
          </div>
        </aside>

        <main style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
            <MessageList />
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", padding: 12 }}>
            <Composer />
          </div>
        </main>

        <aside
          style={{
            borderLeft: "1px solid rgba(255,255,255,0.12)",
            padding: 12,
            overflow: "auto",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>Members Online</div>
          <MemberList />
          <div style={{ marginTop: 16, fontSize: 12, opacity: 0.65 }}>
            (Next: presence + typing + admin tools.)
          </div>
        </aside>
      </div>
    </div>
  );
}

function MessageList() {
  const messages = [
    {
      id: "m1",
      sender: "alice.eth",
      body: "Welcome to the lounge.",
      relative: "2 hours ago",
      exact: "2025-12-20 3:12:44 PM",
    },
    {
      id: "m2",
      sender: "you",
      body: "Let's run trades + predictions in here.",
      relative: "1 hour ago",
      exact: "2025-12-20 4:10:05 PM",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {messages.map((m) => (
        <div
          key={m.id}
          data-testid={`card-message-${m.id}`}
          style={{
            padding: 12,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontWeight: 900 }} data-testid={`text-sender-${m.id}`}>{m.sender}</div>
            <div title={m.exact} style={{ fontSize: 12, opacity: 0.7, cursor: "help" }} data-testid={`text-time-${m.id}`}>
              {m.relative}
            </div>
          </div>

          <div style={{ marginTop: 6, lineHeight: 1.35 }} data-testid={`text-body-${m.id}`}>{m.body}</div>

          <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
            <ReactionChip emoji="🔥" count={2} />
            <ReactionChip emoji="👍" count={1} />
            <button
              style={{
                border: "1px dashed rgba(255,255,255,0.18)",
                background: "transparent",
                color: "white",
                borderRadius: 999,
                padding: "4px 10px",
                cursor: "pointer",
                opacity: 0.8,
              }}
              title="Add reaction (wire later)"
              data-testid={`button-add-reaction-${m.id}`}
            >
              +
            </button>
          </div>
        </div>
      ))}

      <div style={{ fontSize: 12, opacity: 0.65, paddingLeft: 4 }} data-testid="text-typing-indicator">someone is typing…</div>
    </div>
  );
}

function ReactionChip({ emoji, count }: { emoji: string; count: number }) {
  return (
    <span
      style={{
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.06)",
        borderRadius: 999,
        padding: "4px 10px",
        fontSize: 13,
        cursor: "pointer",
        userSelect: "none",
      }}
      title="Reaction (wire later)"
    >
      {emoji} {count}
    </span>
  );
}

function Composer() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <input
        placeholder="Message… (Text / Trade / Prediction / Event / Pay coming next)"
        data-testid="input-message"
        style={{
          flex: 1,
          padding: "12px 12px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.16)",
          background: "rgba(0,0,0,0.25)",
          color: "white",
          outline: "none",
        }}
      />
      <button
        data-testid="button-send"
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(255,255,255,0.08)",
          color: "white",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        Send
      </button>
    </div>
  );
}

function MemberList() {
  const members = [
    { name: "alice.eth", status: "online" },
    { name: "bob.eth", status: "online" },
    { name: "trader.agent.eth", status: "online" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {members.map((m, idx) => (
        <div
          key={m.name}
          data-testid={`card-member-${idx}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 10px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ fontWeight: 800 }} data-testid={`text-member-name-${idx}`}>{m.name}</div>
          <div style={{ fontSize: 12, opacity: 0.75 }} data-testid={`text-member-status-${idx}`}>{m.status}</div>
        </div>
      ))}
    </div>
  );
}
