"use client";

// 지연 도미노 그래프: 칸 = 같은 기체의 비행 한 편(준비 시간·넘어온 지연 포함), 주황 화살표 = 지연이 넘어간 곳
// (lcc-flow-passenger 의 cascade-graph 를 이 화면 토큰·데이터에 맞춰 옮김)
import { useEffect, useMemo } from "react";
import { Background, Handle, MarkerType, Position, ReactFlow, useEdgesState, useNodesState, type Edge, type Node, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { CascadeLeg } from "@/lib/cascade";
import { delayTone, delayWord, hm } from "@/lib/words";

type FlightData = { c: CascadeLeg; first: boolean; mine: boolean; ko: (c: string | null) => string };
type FlightNode = Node<FlightData, "flight">;

const TONE_VAR = { ok: "var(--ok)", warn: "var(--warn)", bad: "var(--bad)" } as const;
const toneVar = (m: number) => TONE_VAR[delayTone(m) ?? "ok"];

function FlightCard({ data }: NodeProps<FlightNode>) {
  const { c, first, mine, ko } = data;
  const l = c.leg, d = c.depDelayMin;
  const total = Math.max(1, c.carriedMin + c.ownMin);
  return (
    <div className={`w-[200px] rounded-[8px] border bg-surface px-3 py-2.5 text-left ${mine ? "border-accent ring-1 ring-accent" : "border-line-strong"}`}>
      <Handle type="target" position={Position.Left} className="!size-1.5 !min-w-0 !border-0 !bg-ink-3" />
      <div className="flex items-center justify-between gap-2">
        <span className="num text-[15px] font-semibold text-ink">{l.flight_no}</span>
        {mine && <span className="rounded-[4px] bg-accent px-1.5 py-0.5 text-[11px] font-medium text-accent-ink">내 비행기</span>}
      </div>
      <p className="truncate text-sm text-ink-2">{ko(l.dep_airport)} → {ko(l.arr_airport)}</p>
      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <span className="num text-sm text-ink-2">{hm(l.dep_sched_at)} 출발 예정</span>
        <span className="num text-[15px] font-semibold" style={{ color: l.dep_delay_gate_est_min == null && !c.changed ? "var(--ink-3)" : toneVar(d) }}>
          {l.dep_delay_gate_est_min == null && !c.changed ? "기록 없음" : delayWord(d)}
        </span>
      </div>
      <p className={`num mt-1.5 text-[12px] ${c.carriedMin > 0 ? "font-medium text-warn" : "text-ink-3"}`}>
        {first ? "오늘 첫 비행" : c.availMin == null ? "앞 편 기록 없음" : c.carriedMin > 0 ? `${c.availMin > 0 ? `준비 ${Math.round(c.availMin)}분` : "준비 시간 없음"} · 앞 편 지연 ${Math.round(c.carriedMin)}분 넘어옴` : `준비 ${Math.round(c.availMin)}분`}
      </p>
      {d > 15 && (
        <>
          <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-subtle">
            <div style={{ width: `${(c.carriedMin / total) * 100}%`, background: "var(--warn)" }} />
            <div style={{ width: `${(c.ownMin / total) * 100}%`, background: "var(--chart-strong)" }} />
          </div>
          <p className="num mt-1 text-[12px] text-ink-3">앞 편에서 {Math.round(c.carriedMin)}분 · 이 편에서 {Math.round(c.ownMin)}분</p>
        </>
      )}
      <Handle type="source" position={Position.Right} className="!size-1.5 !min-w-0 !border-0 !bg-ink-3" />
    </div>
  );
}

const nodeTypes = { flight: FlightCard };

export function CascadeGraph({ chain, myFlight, ko }: { chain: CascadeLeg[]; myFlight: string; ko: (c: string | null) => string }) {
  const computed = useMemo(() => {
    const nodes: FlightNode[] = chain.map((c, i) => ({
      id: c.leg.flight_no + c.leg.dep_sched_at,
      type: "flight",
      position: { x: i * 236, y: 0 },
      data: { c, first: i === 0, mine: c.leg.flight_no === myFlight, ko },
    }));
    const edges: Edge[] = chain.slice(1).map((c, i) => {
      const hot = c.carriedMin > 0;
      const stroke = hot ? "var(--warn)" : "var(--chart-strong)";
      return {
        id: `e${i}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        animated: hot,
        style: { stroke, strokeWidth: hot ? 2 : 1.25 },
        markerEnd: { type: MarkerType.ArrowClosed, color: hot ? "#d97706" : "#71717a" },
      };
    });
    return { nodes, edges };
  }, [chain, myFlight, ko]);

  // React Flow 가 칸 크기를 재서 저장하도록 상태로 들고, 계산이 바뀌면 덮어쓴다
  const [nodes, setNodes, onNodesChange] = useNodesState<FlightNode>(computed.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(computed.edges);
  useEffect(() => { setNodes(computed.nodes); setEdges(computed.edges); }, [computed, setNodes, setEdges]);

  return (
    <div className="h-[190px] rounded-[8px] border border-line bg-bg">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        colorMode="system" fitView fitViewOptions={{ padding: 0.08, maxZoom: 1 }} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}
        panOnScroll={false} zoomOnScroll={false} preventScrolling={false} proOptions={{ hideAttribution: true }} minZoom={0.5} maxZoom={1.5}
        style={{ background: "transparent" }}>
        <Background gap={24} color="var(--line-strong)" />
      </ReactFlow>
    </div>
  );
}
