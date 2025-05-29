// Percorso: /components/widgets/WidgetStruttura.js
// Scopo: Visualizzazione struttura team con avatar e admin evidenziato
// Autore: ChatGPT
// Ultima modifica: 29/05/2025

import { useEffect, useState, useRef } from "react";
import Tree from "react-d3-tree";

export default function WidgetStruttura({ darkMode }) {
  const [treeData, setTreeData] = useState([]);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    fetch("/api/teams/structure")
      .then(res => res.ok ? res.json() : [])
      .then(data => setTreeData(data));
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, [treeData]);

  // Nodo personalizzato
  const renderCustomNode = ({ nodeDatum }) => {
    return (
      <g>
        <circle r={15} fill={darkMode ? "#4B5563" : "#2563EB"} />
        <foreignObject width={160} height={70} x={20} y={-35}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {nodeDatum.attributes?.avatar && (
              <img src={nodeDatum.attributes.avatar}
                   style={{ width: 30, height: 30, borderRadius: "50%" }} />
            )}
            <div style={{ fontSize: 12, color: darkMode ? "#fff" : "#111" }}>
              {nodeDatum.name}
              {nodeDatum.attributes?.isAdmin ? " 🌟" : ""}
            </div>
          </div>
        </foreignObject>
      </g>
    );
  };

  return (
    <div
      className={`rounded-xl shadow-md p-4 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
    >
      <h3 className="text-lg font-semibold mb-3">Struttura Organizzativa</h3>

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "550px",
          overflow: "auto",
          border: "1px solid #ccc",
          borderRadius: 8,
          background: darkMode ? "#1f2937" : "#f9fafb"
        }}
      >
        {treeData.length > 0 ? (
          <Tree
            data={treeData}
            orientation="vertical"
            translate={{ x: dimensions.width / 2, y: 80 }}
            zoom={0.9}
            nodeSize={{ x: 260, y: 110 }}
            separation={{ siblings: 1.3, nonSiblings: 2 }}
            zoomable={true}
            collapsible={false}
            renderCustomNodeElement={renderCustomNode}
          />
        ) : (
          <p className="italic text-gray-500 p-4">Nessuna struttura disponibile.</p>
        )}
      </div>
    </div>
  );
}
