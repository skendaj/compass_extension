import React, { useEffect, useRef, useState } from 'react';
import { forceSimulation, forceManyBody, forceLink, forceCenter, Simulation, SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import { storageService } from '../services/storageService';
import { GraphData, GraphNode, GraphLink, KnowledgeEntry } from '../types';

interface NodeDatum extends SimulationNodeDatum {
  id: string;
  label: string;
  type: 'entry' | 'tag' | 'user';
}

interface LinkDatum extends SimulationLinkDatum<NodeDatum> {
  source: string | NodeDatum;
  target: string | NodeDatum;
}

const KnowledgeGraph: React.FC = () => {
  const [graph, setGraph] = useState<GraphData>({ nodes: [], links: [] });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simRef = useRef<Simulation<NodeDatum, LinkDatum> | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const onResize = () => {
      const el = svgRef.current;
      if (el) {
        setSize({ w: el.clientWidth || 800, h: el.clientHeight || 600 });
      }
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const load = async () => {
      const entries = await storageService.getAllKnowledgeEntries();
      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];

      entries.forEach((e: KnowledgeEntry) => {
        nodes.push({ id: `entry-${e.id}`, label: e.title, type: 'entry' });
        e.tags.forEach((t) => {
          const tagId = `tag-${t}`;
          if (!nodes.some((n) => n.id === tagId)) {
            nodes.push({ id: tagId, label: t, type: 'tag' });
          }
          links.push({ source: `entry-${e.id}`, target: tagId, weight: 1 });
        });
      });

      setGraph({ nodes, links });
    };
    load();
  }, []);

  useEffect(() => {
    if (!graph.nodes.length) return;

    const nodes: NodeDatum[] = graph.nodes.map((n) => ({ id: n.id, label: n.label, type: n.type }));
    const links: LinkDatum[] = graph.links.map((l) => ({ source: l.source, target: l.target }));

    const sim = forceSimulation<NodeDatum, LinkDatum>(nodes)
      .force('charge', forceManyBody().strength(-120))
      .force('link', forceLink<NodeDatum, LinkDatum>(links).id((d) => d.id).distance(80).strength(0.8))
      .force('center', forceCenter(size.w / 2, size.h / 2))
      .alphaTarget(0.03);

    simRef.current = sim;

    const tick = () => {
      setGraph((g) => ({ ...g }));
    };

    sim.on('tick', tick);

    return () => {
      sim.stop();
      sim.on('tick', null as any);
      simRef.current = null;
    };
  }, [graph.nodes.length, size.w, size.h]);

  const pointerDown = (e: React.PointerEvent, nodeId: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const sim = simRef.current;
    if (!sim) return;
    const node = (sim.nodes() as NodeDatum[]).find((n) => n.id === nodeId);
    if (node) {
      (node as any).fx = e.clientX - (svgRef.current?.getBoundingClientRect().left || 0);
      (node as any).fy = e.clientY - (svgRef.current?.getBoundingClientRect().top || 0);
    }
  };

  const pointerMove = (e: React.PointerEvent, nodeId: string) => {
    if (e.buttons === 0) return;
    const sim = simRef.current;
    if (!sim) return;
    const node = (sim.nodes() as NodeDatum[]).find((n) => n.id === nodeId);
    if (node) {
      (node as any).fx = e.clientX - (svgRef.current?.getBoundingClientRect().left || 0);
      (node as any).fy = e.clientY - (svgRef.current?.getBoundingClientRect().top || 0);
      sim.alpha(0.1).restart();
    }
  };

  const pointerUp = (e: React.PointerEvent, nodeId: string) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    const sim = simRef.current;
    if (!sim) return;
    const node = (sim.nodes() as NodeDatum[]).find((n) => n.id === nodeId);
    if (node) {
      (node as any).fx = null;
      (node as any).fy = null;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 480 }}>
      <svg ref={svgRef} style={{ width: '100%', height: 600 }}>
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.2" />
          </filter>
        </defs>
        {graph.links.map((l, idx) => {
          const sourceNode = (simRef.current?.nodes() as NodeDatum[] | undefined)?.find((n) => n.id === l.source);
          const targetNode = (simRef.current?.nodes() as NodeDatum[] | undefined)?.find((n) => n.id === l.target);
          const x1 = sourceNode ? (sourceNode.x ?? 0) : 0;
          const y1 = sourceNode ? (sourceNode.y ?? 0) : 0;
          const x2 = targetNode ? (targetNode.x ?? 0) : 0;
          const y2 = targetNode ? (targetNode.y ?? 0) : 0;
          return (
            <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#bbb" strokeWidth={1} />
          );
        })}

        {graph.nodes.map((n) => {
          const node = (simRef.current?.nodes() as NodeDatum[] | undefined)?.find((x) => x.id === n.id);
          const cx = node ? node.x ?? 0 : 0;
          const cy = node ? node.y ?? 0 : 0;
          const isTag = n.type === 'tag';
          return (
            <g
              key={n.id}
              transform={`translate(${cx},${cy})`}
              onPointerDown={(e) => pointerDown(e, n.id)}
              onPointerMove={(e) => pointerMove(e, n.id)}
              onPointerUp={(e) => pointerUp(e, n.id)}
              style={{ cursor: 'grab' }}
            >
              <circle r={isTag ? 10 : 14} fill={isTag ? '#FFD580' : '#6EA8FE'} stroke="#333" strokeWidth={0.5} filter="url(#shadow)" />
              <text x={isTag ? 16 : 18} y={5} fontSize={12} fill="#222">{n.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default KnowledgeGraph;
