import { useState, useEffect, useRef } from "react";
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
import { motion } from "framer-motion";

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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debounceSave = (updatedNodes: Node[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveProjectStructure(updatedNodes);
    }, 500);
  };

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

    const savedNodeId = projectId
      ? localStorage.getItem(`selectedNodeId_${projectId}`)
      : null;
    if (savedNodeId && projectId) {
      NodeContentService.getNodeContentById(savedNodeId, projectId)
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
    if (node.name === "Chapter structure") {
      return; // ⛔ prevent click
    }
    const switchNode = async () => {
      try {
        if (!projectId) return;
        const nodeContent = await NodeContentService.getOrCreateNodeContent({
          ...node,
          projectId,
        });
        const fullNode = { ...node, content: nodeContent.content };
        setSelectedNode(fullNode);
        localStorage.setItem(`selectedNodeId_${projectId}`, node.id);
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

  const reloadProjectStructure = () => {
    setNodes([...nodes]); // shallow copy → triggers re-render
  };

  const handleNodeSave = () => {
    reloadProjectStructure();
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
    if (pendingNode && projectId) {
      try {
        const nodeContent = await NodeContentService.getOrCreateNodeContent({
          ...pendingNode,
          projectId,
        });
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

    if (selectedNode) {
      handleNodeClick(selectedNode);
    }
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

    if (selectedNode) {
      const exists = JSON.stringify(updatedNodes).includes(selectedNode.id);
      if (exists) {
        handleNodeClick(selectedNode);
      } else {
        setSelectedNode(null);
      }
    }
  };

  const handleRenameOrIconUpdate = (updatedNode: Node) => {
    const updateNodes = (nodes: Node[], updatedNode: Node): Node[] => {
      return nodes.map((node) => {
        if (node.id === updatedNode.id) {
          return updatedNode;
        }
        if (node.nodes) {
          return { ...node, nodes: updateNodes(node.nodes, updatedNode) };
        }
        return node;
      });
    };

    const updatedNodes = updateNodes(nodes, updatedNode);
    setNodes(updatedNodes);
    saveProjectStructure(updatedNodes);

    if (selectedNode?.id === updatedNode.id) {
      setSelectedNode((prev) =>
        prev
          ? { ...prev, name: updatedNode.name, icon: updatedNode.icon }
          : prev
      );
    }

    // 🟦 Jetzt wie in FileContentCard: NodeContent aktualisieren
    if (projectId) {
      NodeContentService.updateNodeContent(updatedNode.id, {
        projectId,
        nodeId: updatedNode.id,
        name: updatedNode.name,
        icon: updatedNode.icon,
        content: selectedNode?.content || "", // Content bleibt gleich
        category: updatedNode.category,
      }).catch((error) => {
        console.error("❌ Failed to update node content metadata:", error);
      });
    }
  };

  const handleMoveNode = (
    draggedNodeId: string,
    targetNodeId: string
    //asSibling: boolean = false
  ) => {
    const newNodes = [...nodes];
    let draggedNode: Node | null = null;

    const removeNode = (nodes: Node[], id: string): void => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
          draggedNode = nodes[i];
          nodes.splice(i, 1);
          return;
        }
        if (nodes[i].nodes) {
          removeNode(nodes[i].nodes!, id);
        }
      }
    };

    const addNode = (nodes: Node[], targetId: string): void => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === targetId) {
          if (!Array.isArray(nodes[i].nodes)) {
            nodes[i].nodes = [];
          }
          if (draggedNode) {
            nodes[i].nodes!.push(draggedNode);
          }
          return;
        }
        if (nodes[i].nodes) {
          addNode(nodes[i].nodes!, targetId);
        }
      }
    };

    removeNode(newNodes, draggedNodeId);
    if (!draggedNode) return;
    addNode(newNodes, targetNodeId);

    setNodes(newNodes);

    // ✅ Jetzt speichern, aber verzögert (siehe unten)
    debounceSave(newNodes);

    // optional: neu selektieren
    if (selectedNode) {
      const exists = JSON.stringify(newNodes).includes(selectedNode.id);
      setSelectedNode(exists ? selectedNode : null);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-[#090325] text-white relative overflow-hidden overflow-x-hidden">
        <Header />

        <div className="flex flex-1 relative pt-14">
          <div
            className={`${menuOpen ? "w-1/5" : "w-19"} transition-all duration-500 flex flex-col"`}
          >
            <div className="bg-[#1e1538] py-2 px-4 flex flex-1 flex-col justify-between shadow-[inset_0_0_30px_rgba(120,69,239,0.25)]">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="mb-2 py-1 mt-2 px-2 rounded-full hover:bg-[#373254] transition cursor-pointer"
              >
                <Bars3Icon className="h-6 w-6 text-[#c4b5fd]" />
              </button>

              {menuOpen && (
                <ul className="space-y-2 overflow-y-scroll no-scrollbar flex-1 px-2">
                  {nodes.map((node) => (
                    <Folder
                      key={node.id}
                      node={node}
                      onMove={handleMoveNode}
                      onNodeClick={handleNodeClick}
                      onAdd={addChapter}
                      onRemove={deleteChapter}
                      onRenameOrIconUpdate={handleRenameOrIconUpdate}
                    />
                  ))}
                </ul>
              )}
              <div>
                <BottomNavigationBar
                  activeView={activeView}
                  onChangeView={handleViewChange}
                  menuOpen={menuOpen}
                />
              </div>
            </div>
          </div>

          <main
            className={`${menuOpen ? "w-4/5" : "w-full"} transition-all duration-300 p-6`}
          >
            <motion.div
              initial={{ backgroundPosition: "0% 0%" }}
              animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="p-[3px] rounded-3xl shadow-[0_0_30px_rgba(120,69,239,0.25)]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, #7c3aed, #db2777, #facc15)",
                backgroundSize: "200% 200%",
              }}
            >
              <div className="bg-[#1e1538] rounded-3xl p-6 h-full shadow-[0_0_40px_rgba(120,69,239,0.2)]">
                {selectedNode ? (
                  activeView === "file" ? (
                    <FileContentCard
                      node={selectedNode}
                      onDirtyChange={(dirty: boolean) => setIsDirty(dirty)}
                      onSave={handleNodeSave}
                    />
                  ) : activeView === "ai" ? (
                    <AIProtocolCard />
                  ) : activeView === "fullDocument" ? (
                    <FullDocumentCard />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-xl text-[#aaa6c3] leading-relaxed">
                        Unknown view selected.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-xl text-[#aaa6c3] leading-relaxed">
                      Select an element on the left to begin editing.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </main>
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
