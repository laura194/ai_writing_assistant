import { Request, Response } from "express";
import Project from "../models/Project";
import NodeContent from "../models/NodeContent";
import AiProtocol from "../models/AIProtocol";

// Create a new Project entry
export const createProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    name,
    username,
    projectStructure,
    isPublic,
    tags,
    titleCommunityPage,
    category,
    typeOfDocument,
    authorName,
  } = req.body;

  if (!name || !username || !projectStructure) {
    res.status(400).json({
      error:
        "Alle Pflichtfelder (name, username, projectStructure) sind erforderlich",
    });
    return;
  }

  try {
    const newProject = new Project({
      name,
      username,
      projectStructure,
      isPublic: isPublic ?? false,
      tags: tags ?? [],
      titleCommunityPage: titleCommunityPage ?? "",
      category: category ?? "",
      typeOfDocument: typeOfDocument ?? "",
      authorName: authorName ?? "",
    });

    await newProject.save(); // Pre-save hook encrypts data

    // Query back to get decrypted data for response
    const savedProject = await Project.findById(newProject._id);
    res.status(201).json(savedProject);
  } catch (error) {
    console.error("Fehler beim Erstellen des Projekts:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
};

// Get a project by its ID
export const getProjectById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Project ID is required" });
      return;
    }

    const project = await Project.findById(id); // Post-findOne hook decrypts

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all projects
export const getAllProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const projects = await Project.find(); // Post-find hook decrypts
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching all projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Changed from findOneAndUpdate to find + save pattern
export const updateProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const {
    name,
    username,
    projectStructure,
    isPublic,
    tags,
    titleCommunityPage,
    category,
    typeOfDocument,
    authorName,
  } = req.body;

  if (!id) {
    res.status(400).json({ error: "Project ID is required" });
    return;
  }

  try {
    // Find the project first
    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // Update fields
    if (name !== undefined) project.name = name;
    if (username !== undefined) project.username = username;
    if (projectStructure !== undefined)
      project.projectStructure = projectStructure;
    if (isPublic !== undefined) project.isPublic = isPublic;
    if (tags !== undefined) project.tags = tags;
    if (titleCommunityPage !== undefined)
      project.titleCommunityPage = titleCommunityPage;
    if (category !== undefined) project.category = category;
    if (typeOfDocument !== undefined) project.typeOfDocument = typeOfDocument;
    if (authorName !== undefined) project.authorName = authorName;

    // Save (triggers pre-save encryption hook)
    await project.save();

    // Query back to get decrypted data
    const updatedProject = await Project.findById(id);
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all projects by username
export const getProjectsByUsername = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { username } = req.query;

  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  try {
    const projects = await Project.find({ username: username.toString() }).sort(
      { createdAt: -1 },
    ); // Post-find hook decrypts

    if (projects.length === 0) {
      res.status(404).json({ error: "No projects found for this username" });
      return;
    }

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects by username:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get the last 3 recent created projects by username
export const getRecentProjectsByUsername = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { username } = req.query;

  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  try {
    const projects = await Project.find({ username: username.toString() })
      .sort({ createdAt: -1 })
      .limit(3); // Post-find hook decrypts

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching recent projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a project by its ID
export const deleteProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: "Project ID is required" });
    return;
  }

  try {
    // Get project details before deletion (for response)
    const project = await Project.findById(id); // ✅ Post-findOne hook decrypts

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // Delete the project
    await Project.deleteOne({ _id: id });

    // Delete related data
    const deletedNodeContents = await NodeContent.deleteMany({ projectId: id });
    const deletedAiProtocols = await AiProtocol.deleteMany({ projectId: id });

    res.status(200).json({
      message: "Project and related data successfully deleted",
      deletedProject: project,
      deletedNodeContents: deletedNodeContents.deletedCount,
      deletedAiProtocols: deletedAiProtocols.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all public projects
export const getPublicProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const publicProjects = await Project.find({ isPublic: true }).sort({
      createdAt: -1,
    }); // Post-find hook decrypts

    if (publicProjects.length === 0) {
      res.status(404).json({ error: "No public projects found" });
      return;
    }

    res.status(200).json(publicProjects);
  } catch (error) {
    console.error("Error fetching public projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Toggle Upvote
export const toggleUpvote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { username } = req.body;

  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  try {
    const project = await Project.findById(id); // Post-findOne hook decrypts
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const hasVoted = project.upvotedBy.includes(username);
    if (hasVoted) {
      project.upvotedBy = project.upvotedBy.filter((u) => u !== username);
    } else {
      project.upvotedBy.push(username);
    }

    await project.save(); // Pre-save hook encrypts

    // Query back to get decrypted data
    const updatedProject = await Project.findById(id);
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error toggling upvote:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Toggle Favorite
export const toggleFavorite = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { username } = req.body;

  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  try {
    const project = await Project.findById(id); // Post-findOne hook decrypts
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const hasFavorited = project.favoritedBy.includes(username);
    if (hasFavorited) {
      project.favoritedBy = project.favoritedBy.filter((u) => u !== username);
    } else {
      project.favoritedBy.push(username);
    }

    await project.save(); // Pre-save hook encrypts

    // Query back to get decrypted data
    const updatedProject = await Project.findById(id);
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
