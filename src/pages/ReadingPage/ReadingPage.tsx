import { useState, useEffect } from "react";
import "../../App/App.css";
import FolderRead from "../../components/Folder/FolderRead";
import FileContentCardRead from "../../components/FileContentCard/FileContentCardRead";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { Node, Project } from "../../utils/types";
import Header from "../../components/Header/Header";
import { NodeContentService } from "../../utils/NodeContentService";
import { ProjectService } from "../../utils/ProjectService";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const ReadingPage = () => {
  const { projectId } = useParams<{ projectId: string }>();

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

  useEffect(() => {
    localStorage.setItem("activeView", activeView);
  }, [activeView]);

  useEffect(() => {
    if (projectId) {
      ProjectService.getProjectById(projectId)
        .then((project: Project) => {
          if (Array.isArray(project.projectStructure)) {
            setNodes(project.projectStructure);
          }
        })
        .catch((error) => console.error("Error fetching project:", error));
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

  const handleNodeClick = async (node: Node) => {
    if (node.name === "Chapter structure") return;
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

  return (
    <div className="flex flex-col h-screen bg-[#e0dbf4] text-[#362466] dark:bg-[#090325] dark:text-white relative overflow-x-hidden">
      <Header />

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <div
          className={`sticky top-0 left-0 h-screen ${
            menuOpen ? "w-1/4" : "w-19"
          } transition-all duration-500 flex flex-col relative`}
        >
          <div className="bg-[#f4f2fa] dark:bg-[#1e1538] py-2 px-4 flex h-full flex-col justify-between shadow-[inset_0_0_30px_rgba(120,69,239,0.55)] dark:shadow-[inset_0_0_30px_rgba(120,69,239,0.25)] pt-14">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mb-2 py-1 mt-2 px-3 rounded-full hover:bg-[#dedbf0] dark:hover:bg-[#373254] transition cursor-pointer"
            >
              <Bars3Icon className="h-6 w-6 text-[#473885] dark:text-[#c4b5fd]" />
            </button>

            {menuOpen && (
              <ul className="flex-1 space-y-2 overflow-y-auto no-scrollbar px-2">
                {nodes.map((node) => (
                  <FolderRead
                    key={node.id}
                    node={node}
                    onNodeClick={handleNodeClick}
                    selectedNodeId={selectedNode?.id}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Content */}
        <main
          className={`${
            menuOpen ? "w-3/4" : "w-full"
          } transition-all duration-300 p-6 pt-20`}
        >
          <motion.div
            initial={{ backgroundPosition: "0% 0%" }}
            animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="p-[4px] rounded-3xl shadow-[0_0_20px_rgba(120,69,239,0.3)] dark:shadow-[0_0_30px_rgba(120,69,239,0.25)] h-full"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #7c3aed, #db2777, #facc15)",
              backgroundSize: "200% 200%",
            }}
          >
            <div className="bg-[#e9e5f8] dark:bg-[#1e1538] rounded-3xl h-full shadow-[0_0_14px_rgba(120,69,239,0.4)] dark:shadow-[0_0_40px_rgba(120,69,239,0.3)] flex flex-col">
              {selectedNode ? (
                activeView === "file" ? (
                  <FileContentCardRead node={selectedNode} />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-xl text-[#261e3b] dark:text-[#aaa6c3] leading-relaxed">
                      Unknown view selected.
                    </p>
                  </div>
                )
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-xl text-[#261e3b] dark:text-[#aaa6c3] leading-relaxed">
                    Select an element on the left to view its content.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ReadingPage;
