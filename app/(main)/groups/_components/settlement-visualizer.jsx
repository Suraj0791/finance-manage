"use client";

import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import { Users, Info, DollarSign } from "lucide-react";

export default function SettlementVisualizer({ balances = [], settlements = [] }) {
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);

  // Get all unique members (nodes) in the group
  const nodes = useMemo(() => {
    const uniqueUsers = {};
    
    // Add all users from balances to have comprehensive list
    balances.forEach((b) => {
      if (b.user) {
        uniqueUsers[b.user.id] = {
          id: b.user.id,
          name: b.user.name || b.user.email,
          imageUrl: b.user.imageUrl,
          initials: (b.user.name || b.user.email).charAt(0).toUpperCase(),
          netBalance: b.netBalance,
        };
      }
    });

    // Fallback/Ensure users from settlements are present
    settlements.forEach((s) => {
      if (s.from && !uniqueUsers[s.from.id]) {
        uniqueUsers[s.from.id] = {
          id: s.from.id,
          name: s.from.name || s.from.email,
          imageUrl: s.from.imageUrl,
          initials: (s.from.name || s.from.email).charAt(0).toUpperCase(),
          netBalance: 0,
        };
      }
      if (s.to && !uniqueUsers[s.to.id]) {
        uniqueUsers[s.to.id] = {
          id: s.to.id,
          name: s.to.name || s.to.email,
          imageUrl: s.to.imageUrl,
          initials: (s.to.name || s.to.email).charAt(0).toUpperCase(),
          netBalance: 0,
        };
      }
    });

    return Object.values(uniqueUsers);
  }, [balances, settlements]);

  const N = nodes.length;
  const CX = 250;
  const CY = 250;
  const R = 150; // radius of layout circle

  // Calculate position coordinates for each node
  const nodePositions = useMemo(() => {
    const positions = {};
    nodes.forEach((node, index) => {
      const angle = (index * 2 * Math.PI) / N - Math.PI / 2; // start from top
      positions[node.id] = {
        x: CX + R * Math.cos(angle),
        y: CY + R * Math.sin(angle),
        angle,
      };
    });
    return positions;
  }, [nodes, N]);

  // Construct edges (settlement pathways)
  const edges = useMemo(() => {
    return settlements.map((s, idx) => {
      const fromPos = nodePositions[s.from.id];
      const toPos = nodePositions[s.to.id];
      
      if (!fromPos || !toPos) return null;

      // Calculate path arc control point (quadratic Bezier)
      const mx = (fromPos.x + toPos.x) / 2;
      const my = (fromPos.y + toPos.y) / 2;
      
      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      
      // Normal vector
      const nx = -dy / len;
      const ny = dx / len;
      
      // Curved offset (alternates or fixed to avoid straight-line overlaps)
      const offset = 35;
      const qx = mx + nx * offset;
      const qy = my + ny * offset;

      return {
        id: `edge-${idx}`,
        from: s.from.id,
        to: s.to.id,
        fromName: s.from.name || s.from.email,
        toName: s.to.name || s.to.email,
        amount: s.amount,
        d: `M ${fromPos.x} ${fromPos.y} Q ${qx} ${qy} ${toPos.x} ${toPos.y}`,
        textX: qx,
        textY: qy,
      };
    }).filter(Boolean);
  }, [settlements, nodePositions]);

  // Hover highlighting calculations
  const highlightedNodeIds = useMemo(() => {
    if (!hoveredNodeId) return null;
    const ids = new Set([hoveredNodeId]);
    settlements.forEach((s) => {
      if (s.from.id === hoveredNodeId) ids.add(s.to.id);
      if (s.to.id === hoveredNodeId) ids.add(s.from.id);
    });
    return ids;
  }, [hoveredNodeId, settlements]);

  const isEdgeHighlighted = (edge) => {
    if (hoveredEdgeId === edge.id) return true;
    if (hoveredNodeId) {
      return edge.from === hoveredNodeId || edge.to === hoveredNodeId;
    }
    return true;
  };

  const isNodeDimmed = (nodeId) => {
    if (hoveredNodeId) {
      return !highlightedNodeIds.has(nodeId);
    }
    return false;
  };

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-slate-900 border border-slate-800 rounded-xl">
        <Users className="h-12 w-12 mb-3 text-slate-500" />
        <p>No members in this group to visualize.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-900 text-slate-100 rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center w-full">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="flex w-full justify-between items-center mb-6 z-10">
        <div>
          <h4 className="font-bold text-lg text-indigo-400 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Interactive Money Flow Graph
          </h4>
          <p className="text-xs text-slate-400">
            Hover over members to inspect their immediate transaction lines.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <Info className="h-4 w-4 text-indigo-400" />
          <span>Showing simplified debt minimized flow</span>
        </div>
      </div>

      <div className="relative w-full max-w-[450px] aspect-square z-10">
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full select-none"
        >
          <defs>
            {/* Arrowhead marker definition */}
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="28" // Offset to avoid overlapping the node avatar border
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" className="transition-colors duration-200" />
            </marker>
            <marker
              id="arrow-hover"
              viewBox="0 0 10 10"
              refX="28"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7" />
            </marker>
          </defs>

          {/* 1. Render Settlement Edges (Paths) */}
          <g>
            {edges.map((edge) => {
              const active = isEdgeHighlighted(edge);
              const hovered = hoveredEdgeId === edge.id;
              return (
                <g key={edge.id}>
                  {/* Invisible thicker path for easier hovering */}
                  <path
                    d={edge.d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="15"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredEdgeId(edge.id)}
                    onMouseLeave={() => setHoveredEdgeId(null)}
                  />
                  {/* Styled path line */}
                  <path
                    id={edge.id}
                    d={edge.d}
                    fill="none"
                    stroke={hovered ? "#a855f7" : active ? "#6366f1" : "#1e293b"}
                    strokeWidth={hovered ? "3.5" : active ? "2" : "1"}
                    strokeDasharray={active ? "none" : "4 4"}
                    markerEnd={`url(#${hovered ? "arrow-hover" : "arrow"})`}
                    className="transition-all duration-300 pointer-events-none"
                  />
                  {/* Glowing transaction flow particle */}
                  {active && (
                    <circle r="4" fill={hovered ? "#d8b4fe" : "#818cf8"} className="shadow-lg pointer-events-none">
                      <animateMotion dur="4s" repeatCount="indefinite" path={edge.d} />
                    </circle>
                  )}
                </g>
              );
            })}
          </g>

          {/* 2. Render Node Labels & Avatars */}
          <g>
            {nodes.map((node) => {
              const pos = nodePositions[node.id];
              const dimmed = isNodeDimmed(node.id);
              if (!pos) return null;

              // Calculate optimal placement for name labels relative to circle center
              const labelDistance = 38;
              const lx = pos.x + labelDistance * Math.cos(pos.angle);
              const ly = pos.y + labelDistance * Math.sin(pos.angle);
              
              const isRightSide = Math.cos(pos.angle) >= 0;
              const textAnchor = isRightSide ? "start" : "end";

              return (
                <g
                  key={node.id}
                  className={`transition-opacity duration-300 ${dimmed ? "opacity-25" : "opacity-100"}`}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Node Avatar Container */}
                  <foreignObject
                    x={pos.x - 22}
                    y={pos.y - 22}
                    width="44"
                    height="44"
                    className="overflow-visible pointer-events-auto cursor-pointer"
                  >
                    <div
                      className={`w-11 h-11 rounded-full border-2 bg-slate-900 transition-all duration-300 flex items-center justify-center ${
                        hoveredNodeId === node.id
                          ? "border-purple-500 scale-110 shadow-lg shadow-purple-500/20"
                          : node.netBalance > 0.01
                          ? "border-emerald-500"
                          : node.netBalance < -0.01
                          ? "border-rose-500"
                          : "border-slate-700"
                      }`}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={node.imageUrl} alt={node.name} />
                        <AvatarFallback className="bg-slate-800 text-slate-200 font-bold text-sm">
                          {node.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </foreignObject>

                  {/* Name Label */}
                  <text
                    x={lx}
                    y={ly}
                    textAnchor={textAnchor}
                    dominantBaseline="middle"
                    className={`font-semibold text-xs transition-colors duration-200 fill-slate-200 ${
                      hoveredNodeId === node.id ? "fill-purple-400 font-bold" : ""
                    }`}
                  >
                    {node.name.length > 14 ? `${node.name.substring(0, 12)}...` : node.name}
                  </text>

                  {/* Net Balance Value */}
                  <text
                    x={lx}
                    y={ly + 12}
                    textAnchor={textAnchor}
                    dominantBaseline="middle"
                    className={`text-[10px] font-medium ${
                      node.netBalance > 0.01
                        ? "fill-emerald-400"
                        : node.netBalance < -0.01
                        ? "fill-rose-400"
                        : "fill-slate-500"
                    }`}
                  >
                    {node.netBalance > 0.01
                      ? `+${formatCurrency(node.netBalance)}`
                      : node.netBalance < -0.01
                      ? `-${formatCurrency(Math.abs(node.netBalance))}`
                      : "Settled"}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* 3. HTML Tooltip overlays */}
        {hoveredEdgeId && (
          <div
            className="absolute bg-slate-900/95 border border-slate-800 backdrop-blur-sm rounded-lg p-2.5 shadow-xl text-xs text-slate-200 z-20 pointer-events-none transition-all duration-200"
            style={{
              left: `${edges.find((e) => e.id === hoveredEdgeId)?.textX}px`,
              top: `${edges.find((e) => e.id === hoveredEdgeId)?.textY - 30}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {(() => {
              const edge = edges.find((e) => e.id === hoveredEdgeId);
              if (!edge) return null;
              return (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="font-semibold text-rose-400">{edge.fromName}</span>
                    <span>pays</span>
                    <span className="font-semibold text-emerald-400">{edge.toName}</span>
                  </div>
                  <div className="text-center font-bold text-indigo-400 text-sm">
                    {formatCurrency(edge.amount)}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Legend Block */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs z-10 border-t border-slate-900 pt-4 w-full justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-emerald-500 bg-slate-900" />
          <span className="text-slate-400">Creditor (+Owed)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-rose-500 bg-slate-900" />
          <span className="text-slate-400">Debtor (-Owes)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-indigo-500 bg-slate-900 animate-pulse" />
          <span className="text-slate-400">Payment flow</span>
        </div>
      </div>
    </div>
  );
}
