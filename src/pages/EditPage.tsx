import { useState, useEffect } from "react";
import "../App.css";
import Folder from "../components/Folder";
import FileContentCard from "../components/FileContentCard";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { Node } from "../utils/types";
import BottomNavigationBar from "../components/BottomNavigationBar";
import Header from "../components/Header";
import AIProtocolCard from "../components/AIProtocolCard";
import UnsavedChangesDialog from "../components/UnsavedChangesDialog";

const EditPage = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodeContents, setNodeContents] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(() => {
    const savedMenuOpen = localStorage.getItem("menuOpen");
    return savedMenuOpen ? JSON.parse(savedMenuOpen) : true;
  });

  const [activeView, setActiveView] = useState(() => {
    const savedView = localStorage.getItem("activeView");
    return savedView ? savedView : "file";
  });

  const [isDirty, setIsDirty] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNode, setPendingNode] = useState<Node | null>(null);

  useEffect(() => {
    localStorage.setItem("activeView", activeView);
  }, [activeView]);

  useEffect(() => {
    // Load the project structure
    // This should be replaced with the actual database
    fetch("/projectStructure.json")
      .then((response) => response.json())
      .then((data: Node[]) => setNodes(data))
      .catch((error) => console.error("Error loading JSON:", error));

    // Load the file content
    // This should be replaced with the actual database
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
    if (isDirty) {
      setPendingNode(node);
      setShowDialog(true);
      return;
    }

    const contentNode = nodeContents.find((item) => item.id === node.id);
    const fullNode = contentNode || { ...node, content: "..." };

    setSelectedNode(fullNode);
    localStorage.setItem("selectedNodeId", node.id);
    setActiveView("file");
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 relative">
        {/* Button to open/close the menu */}
        <button
          className="absolute top-1 left-1 bg-gray-600 hover:bg-gray-500 p-2 rounded"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Bars3Icon className="h-5 w-5 text-white" />
        </button>

        {/* Menu */}

        <div
          className={`${
            menuOpen ? "w-1/4" : "w-12"
          } transition-all duration-300 overflow-hidden bg-gray-200 text-black p-4 flex flex-col justify-between`}
        >
          {menuOpen && (
            <ul>
              <li className="my-1.5">
                <ul className="pl-10">
                  {nodes.map((node) => (
                    <Folder
                      node={node}
                      key={node.id}
                      onNodeClick={handleNodeClick}
                    />
                  ))}
                </ul>
              </li>
            </ul>
          )}
          {/* BottomNavigationBar */}

          <BottomNavigationBar
            activeView={activeView}
            onChangeView={setActiveView}
            menuOpen={menuOpen}
          />
        </div>

        {/* Main Content */}

        <div
          className={`${menuOpen ? "w-3/4" : "w-full"} transition-all duration-300 p-4 bg-gray-400`}
        >
          {selectedNode ? (
            activeView === "file" ? (
              <FileContentCard
                node={selectedNode}
                onDirtyChange={(dirty: boolean) => setIsDirty(dirty)}
              />
            ) : activeView === "ai" ? (
              <AIProtocolCard />
            ) : activeView === "fullDocument" ? (
              <p>Full Document</p>
            ) : (
              <p>Settings</p>
            )
          ) : (
            <p>Select an element.</p>
          )}
        </div>
      </div>
      <UnsavedChangesDialog
        isOpen={showDialog}
        onCancel={() => {
          setShowDialog(false);
          setPendingNode(null);
        }}
        onConfirm={() => {
          if (pendingNode) {
            const contentNode = nodeContents.find(
              (item) => item.id === pendingNode.id
            );
            const fullNode = contentNode || { ...pendingNode, content: "..." };

            setSelectedNode(fullNode);
            localStorage.setItem("selectedNodeId", pendingNode.id);
            setActiveView("file");
            setPendingNode(null);
          }
          setShowDialog(false);
        }}
      />
    </div>
  );
};

export default EditPage;
