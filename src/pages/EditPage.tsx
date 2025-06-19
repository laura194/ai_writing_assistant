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
import { NodeContentService } from "../utils/NodeContentService";
import FullDocumentCard from "../components/FullDocumentCard";

const EditPage = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
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
  const [pendingView, setPendingView] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("activeView", activeView);
  }, [activeView]);

  useEffect(() => {
    fetch("/projectStructure.json")
      .then((response) => response.json())
      .then((data: Node[]) => setNodes(data))
      .catch((error) => console.error("Error loading JSON:", error));

    const savedNodeId = localStorage.getItem("selectedNodeId");
    if (savedNodeId) {
      NodeContentService.getNodeContentById(savedNodeId)
        .then((nodeContent) => {
          if (nodeContent) {
            setSelectedNode({
              id: nodeContent.nodeId,
              name: nodeContent.name,
              content: nodeContent.content,
              category: nodeContent.category,
            });
          }
        })
        .catch((error) => console.error("Error fetching node content:", error));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("menuOpen", JSON.stringify(menuOpen));
  }, [menuOpen]);

  useEffect(() => {
    // Handle the beforeunload event for browser navigation
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        event.returnValue = message; // Standard for most browsers
        return message; // For some older browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const handleNodeChange = async (node: Node) => {
    const switchNode = async () => {
      try {
        const nodeContent =
          await NodeContentService.getOrCreateNodeContent(node);
        const fullNode = { ...node, content: nodeContent.content };
        setSelectedNode(fullNode);
        localStorage.setItem("selectedNodeId", node.id);
        setActiveView("file");
      } catch (error) {
        console.error("Error loading node content:", error);
      }
    };

    if (isDirty) {
      setPendingNode(node);
      setPendingView("file"); // Default view when switching nodes
      setShowDialog(true);
    } else {
      switchNode();
    }
  };

  const handleViewChange = (newView: string) => {
    if (isDirty) {
      setPendingView(newView);
      setShowDialog(true);
    } else {
      setActiveView(newView);
    }
  };

  const handleDialogConfirm = async () => {
    if (pendingNode) {
      // Switching the node and view after confirmation
      try {
        const nodeContent =
          await NodeContentService.getOrCreateNodeContent(pendingNode);
        const fullNode = { ...pendingNode, content: nodeContent.content };
        setSelectedNode(fullNode);
        localStorage.setItem("selectedNodeId", pendingNode.id);
      } catch (error) {
        console.error("Error loading node content after confirmation:", error);
      }
      setPendingNode(null);
    }

    if (pendingView) {
      // Set the view after the dialog is confirmed
      setActiveView(pendingView);
      setPendingView(null);
    }

    setIsDirty(false);
    setShowDialog(false);
  };

  const handleDialogCancel = () => {
    setShowDialog(false);
    setPendingNode(null);
    setPendingView(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 relative">
        <button
          className="absolute top-1 left-1 bg-gray-600 hover:bg-gray-500 p-2 rounded"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Bars3Icon className="h-5 w-5 text-white" />
        </button>

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
                      onNodeClick={handleNodeChange}
                    />
                  ))}
                </ul>
              </li>
            </ul>
          )}

          <BottomNavigationBar
            activeView={activeView}
            onChangeView={handleViewChange}
            menuOpen={menuOpen}
          />
        </div>

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
              <FullDocumentCard />
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
        onCancel={handleDialogCancel}
        onConfirm={handleDialogConfirm}
      />
    </div>
  );
};

export default EditPage;
