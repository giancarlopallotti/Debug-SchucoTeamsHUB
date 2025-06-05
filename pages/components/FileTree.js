// Percorso: /pages/components/FileTree.js
// Scopo: Visualizzare l'albero cartelle/file da /api/files/tree con ACL già applicata
// Autore: ChatGPT
// Ultima modifica: 30/05/2025

import { useEffect, useState, useRef } from "react";
import Tree from "react-d3-tree";

export default function FileTree({ darkMode = false, onFileClick = () => {} }) {
  const [treeData, setTreeData] = useState([]);
  const containerRef = useRef(null);
  const [translate, setTranslate] = useState({ x: 200, y: 80 });

  // Carica l'albero file
  useEffect(() => {
    fetch("/api/files/tree")
      .then(res => res.json())
      .then(data => setTreeData(Array.isArray(data) ? data : []));
  }, []);

  // Centra il grafico quando le dimensioni container cambiano
  useEffect(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 80 });
    }
  }, [treeData]);

  // Nodo custom per mostrare icona file/cartella + nome
  const renderNode = ({ nodeDatum, toggleNode }) => {
    const isFile = !!nodeDatum.attributes;
    const icon = isFile ? "📄" : "📁";

    return (
      <g onClick={() => isFile && onFileClick(nodeDatum)} style={{ cursor: isFile ? "pointer" : "default" }}>
        <text dx={-10} dy={-10}>{icon}</text>
        <text dx={15} dy={5} style={{ fill: darkMode ? "#fff" : "#000", fontSize: 12 }}>{nodeDatum.name}</text>
      </g>
    );
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "600px", overflow: "auto" }}>
      {treeData.length > 0 ? (
        <Tree
          data={treeData}
          orientation="vertical"
          translate={translate}
          nodeSize={{ x: 200, y: 40 }}
          pathFunc="elbow"
          collapsible
          renderCustomNodeElement={renderNode}
          zoomable
          separation={{ siblings: 1.3, nonSiblings: 1.5 }}
        />
      ) : (
        <p className="italic text-gray-500 p-4">Nessun file visibile.</p>
      )}
    </div>
  );
}
