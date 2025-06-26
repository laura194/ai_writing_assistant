import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "../App.css";
import Folder from "../components/Folder";
import FileContentCard from "../components/FileContentCard";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { Node, Project } from "../utils/types";
import BottomNavigationBar from "../components/BottomNavigationBar";
import Header from "../components/Header";
import AIProtocolCard from "../components/AIProtocolCard";
import UnsavedChangesDialog from "../components/UnsavedChangesDialog";
import { NodeContentService } from "../utils/NodeContentService";
import FullDocumentCard from "../components/FullDocumentCard";
import { ProjectService } from "../utils/ProjectService";
import { useParams } from "react-router-dom";

const EditPage = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [project, setProject] = useState<Project | null>(null);

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
    if (projectId) {
      ProjectService.getProjectById(projectId)
        .then((project: Project) => {
          if (Array.isArray(project.projectStructure)) {
            setNodes(project.projectStructure);
            setProject(project);
          } else {
            console.error("Project structure is not an array or is undefined!");
          }
        })
        .catch((error) => {
          console.error("Error fetching project:", error);
        });
    } else {
      console.error("Project ID is not available!");
    }

    const savedNodeId = localStorage.getItem("selectedNodeId");
    if (savedNodeId) {
      NodeContentService.getNodeContentById(savedNodeId)
        .then((nodeContent) => {
          if (nodeContent) {
            setSelectedNode({
              id: nodeContent.nodeId || "",
              name: nodeContent.name,
              content: nodeContent.content,
              category: nodeContent.category,
            });
          }
        })
        .catch((error) => console.error("Error fetching node content:", error));
    }
  }, [projectId]);

  useEffect(() => {
    localStorage.setItem("menuOpen", JSON.stringify(menuOpen));
  }, [menuOpen]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const saveProjectStructure = async (updatedNodes: Node[]) => {
    if (!projectId) return;

    // Füge die projectStructure hinzu, wenn sie nicht definiert ist, als leeres Array
    const projectData = {
      name: project?.name || "Untitled Project",
      username: project?.username || "Anonymous",
      projectStructure: updatedNodes || [],
    };

    try {
      await ProjectService.updateProject(projectId, projectData);
      console.log("✅ Project structure updated.");
    } catch (error) {
      console.error("❌ Failed to update project structure:", error);
    }
  };

  const handleNodeClick = async (node: Node) => {
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
      setPendingView("file");
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

  const addChapter = (parentId: string | null, newNode: Node) => {
    const recursiveUpdate = (
      nodes: Node[],
      parentId: string | null
    ): Node[] => {
      return nodes.map((node) => {
        if (node.id === parentId) {
          return { ...node, nodes: [...(node.nodes || []), newNode] };
        }
        if (node.nodes) {
          return { ...node, nodes: recursiveUpdate(node.nodes, parentId) };
        }
        return node;
      });
    };

    const updatedNodes = recursiveUpdate(nodes, parentId);
    setNodes(updatedNodes);
    saveProjectStructure(updatedNodes);
  };

  const deleteChapter = (nodeId: string) => {
    const recursiveDelete = (nodes: Node[], nodeId: string): Node[] => {
      return nodes.filter((node) => {
        if (node.id === nodeId) return false;
        if (node.nodes) node.nodes = recursiveDelete(node.nodes, nodeId);
        return true;
      });
    };

    const updatedNodes = recursiveDelete(nodes, nodeId);
    setNodes(updatedNodes);
    saveProjectStructure(updatedNodes);
  };

  const handleMoveNode = (
    draggedNodeId: string,
    targetNodeId: string | null = null
  ) => {
    let draggedNode: Node | null = null;

    const recursiveRemove = (nodes: Node[]): Node[] => {
      return nodes
        .filter((node) => {
          if (node.id === draggedNodeId) {
            draggedNode = node;
            return false;
          }
          return true;
        })
        .map((node) => ({ ...node, nodes: recursiveRemove(node.nodes || []) }));
    };

    const recursiveAdd = (nodes: Node[]): Node[] => {
      return nodes.map((node) => {
        if (node.id === targetNodeId) {
          return {
            ...node,
            nodes: [...(node.nodes || []), draggedNode!],
          };
        }
        return { ...node, nodes: recursiveAdd(node.nodes || []) };
      });
    };

    setNodes((prevNodes) => {
      const withoutDraggedNode = recursiveRemove(prevNodes); // Entfernen

      // Fallback: Wenn kein Ziel gefunden, füge das Kapitel in die Wurzelebene ein
      if (!draggedNode || !targetNodeId) {
        return [...withoutDraggedNode, draggedNode!];
      }

      // Hinzufügen: Konstante updatedStructure kann für Speicherung in DB genutzt werden
      const updatedStructure = recursiveAdd(withoutDraggedNode);
      return updatedStructure;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
              <ul className="mt-8">
                {" "}
                {/* margin-top nur auf die Liste anwenden */}
                {nodes.map((node) => (
                  <Folder
                    key={node.id}
                    node={node}
                    onMove={handleMoveNode}
                    onNodeClick={handleNodeClick}
                    onAdd={addChapter}
                    onRemove={deleteChapter}
                  />
                ))}
              </ul>
            )}

            <BottomNavigationBar
              activeView={activeView}
              onChangeView={handleViewChange}
              menuOpen={menuOpen}
            />
          </div>

          <div
            className={`${
              menuOpen ? "w-3/4" : "w-full"
            } transition-all duration-300 p-4 bg-gray-400`}
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
    </DndProvider>
  );
};

export default EditPage;
