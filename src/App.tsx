import { useState, useEffect } from "react";
import "./App.css";
import Folder from "./components/Folder";
import FileContentCard from "./components/FileContentCard";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { Node } from "./utils/types";
import AiProtocolTable from "./components/AIProtocolTable";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

/**
 * App component that manages the main layout and state of the application.
 * This component fetches data, manages the selection of nodes, handles the menu state,
 * and renders the file content or a placeholder message based on the selected node.
 *
 * @component
 * @returns - The main application layout.
 */
function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodeContents, setNodeContents] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(() => {
    const savedMenuOpen = localStorage.getItem("menuOpen");
    return savedMenuOpen ? JSON.parse(savedMenuOpen) : true;
  });
  const [showAiProtocol, setShowAiProtocol] = useState(false);

  useEffect(() => {
    fetch("/projectStructure.json")
      .then((response) => response.json())
      .then((data: Node[]) => setNodes(data))
      .catch((error) => console.error("Error loading JSON:", error));

    fetch("/fileContent.json")
      .then((response) => response.json())
      .then((data: Node[]) => {
        setNodeContents(data);

        const savedNodeId = localStorage.getItem("selectedNodeId");
        if (savedNodeId) {
          const savedNode = data.find((item) => item.id === savedNodeId);
          if (savedNode) {
            setSelectedNode(savedNode);
          }
        }
      })
      .catch((error) =>
        console.error("Error loading node content JSON:", error)
      );
  }, []);
  useEffect(() => {
    localStorage.setItem("menuOpen", JSON.stringify(menuOpen));
  }, [menuOpen]);

  const handleNodeClick = (node: Node) => {
    const content = nodeContents.find((item) => item.id === node.id);
    setSelectedNode(content || null);
    localStorage.setItem("selectedNodeId", node.id);
  };

  return (
    <div className="flex h-screen relative">
      <button
        className="absolute top-1 left-1 bg-gray-600 hover:bg-gray-500 p-2 rounded"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Bars3Icon className="h-5 w-5 text-white" />
      </button>

      <div
        className={`${
          menuOpen ? "w-1/4" : "w-12"
        } transition-all duration-300 overflow-hidden bg-gray-200 text-black p-4`}
      >
        {menuOpen && (
          <div className="flex flex-col h-full justify-between">
            <ul className="overflow-y-auto">
              <li className="my-1.5">
                <ul className="pl-10">
                  {nodes.map((node) => (
                    <Folder
                      node={node}
                      key={node.id}
                      onNodeClick={(node) => {
                        setShowAiProtocol(false); // Protokoll ausblenden, wenn anderes ausgewählt wird
                        handleNodeClick(node);
                      }}
                    />
                  ))}
                </ul>
              </li>
            </ul>
            <button
              className="w-10 h-10 bg-gray-600 text-white rounded hover:bg-gray-500 flex items-center justify-center mt-4 ml-2"
              onClick={() => {
                setShowAiProtocol(true);
                setSelectedNode(null);
              }}
              title="KI-Protokoll anzeigen"
            >
              <DocumentTextIcon className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>

      <div
        className={`${
          menuOpen ? "w-3/4" : "w-full"
        } transition-all duration-300 p-4 bg-gray-400 overflow-y-auto`}
      >
        {showAiProtocol ? (
          <AiProtocolTable />
        ) : selectedNode ? (
          <FileContentCard node={selectedNode} />
        ) : (
          <p>Wähle ein Element aus.</p>
        )}
      </div>
    </div>
  );
}

export default App;
