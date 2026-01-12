'use client';

import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';

interface RelationshipEdgeData {
  sourceColumn: string;
  targetColumn: string;
}

export default function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}: EdgeProps<RelationshipEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#8b5cf6',
        }}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[10px] px-2 py-1 rounded-full font-medium shadow-sm border border-purple-200 dark:border-purple-800">
            FK
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
