import { Request, Response } from "express";
import mongoose from "mongoose";
import NodeContent from "../models/NodeContent";
import NodeContentVersion from "../models/NodeContentVersion";
import Project from "../models/Project";

const MAX_VERSIONS = Number(process.env.MAX_VERSIONS_PER_NODE || 50);

// typed Request when authentication middleware sets user
type AuthenticatedRequest = Request & { user?: { id?: string } };

function getUserIdFromReq(req: Request): string | null {
  // Use typed access but remain safe if not authenticated
  const authReq = req as AuthenticatedRequest;
  return authReq.user?.id ?? null;
}

// Create a new NodeContent entry (prevents duplicates)
export const createNodeContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { nodeId, name, category, content, projectId } = req.body;

  if (!content) {
    res.status(400).json({ error: "Content cannot be empty" });
    return;
  }

  if (!nodeId || !name || !category || !projectId) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const existing = await NodeContent.findOne({ nodeId, projectId });
    if (existing) {
      res.status(409).json({
        error: "NodeContent with this nodeId and projectId already exists",
        existing,
      });
      return;
    }

    const newNodeContent = new NodeContent({
      nodeId,
      name,
      category,
      content,
      projectId,
    });

    const savedNodeContent = await newNodeContent.save();
    res.status(201).json(savedNodeContent);
  } catch (error) {
    console.error("Error saving node content:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all NodeContent entries, or filter by ?nodeId=... and ?projectId=...
export const getNodeContents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { nodeId, projectId } = req.query;

    const filter: Partial<{ nodeId: string; projectId: string }> = {};

    if (nodeId) {
      filter.nodeId = nodeId.toString();
    }

    if (projectId) {
      filter.projectId = projectId.toString();
    }

    const contents = await NodeContent.find(filter);

    res.status(200).json(contents);
  } catch (error) {
    console.error("Error fetching node contents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get a specific NodeContent entry by its nodeId (via URL param)
export const getNodeContentById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { projectId } = req.query;

  if (!projectId) {
    res.status(400).json({ error: "projectId is required" });
    return;
  }

  try {
    const nodeContent = await NodeContent.findOne({
      nodeId: id,
      projectId: projectId.toString(),
    });

    if (!nodeContent) {
      res.status(404).json({
        error: "NodeContent with the given nodeId and projectId not found",
      });
      return;
    }

    res.status(200).json(nodeContent);
  } catch (error) {
    console.error("Error fetching node content by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * UPDATE (PUT) — erstellt vor dem Update eine Version des bisherigen Inhalts
 */
export const updateNodeContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { nodeId } = req.params;
  const { name, category, content, projectId, icon, skipVersion } = req.body;

  if (content === undefined || content === null) {
    res.status(400).json({ error: "Content cannot be empty" });
    return;
  }
  if (!nodeId || !name || !category || !projectId) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  let session: mongoose.ClientSession | null = null;
  let useTransaction = true;

  try {
    // Try to start a session + transaction. If the server does not support it,
    // this may throw or subsequent .session(...) calls will error — we handle that.
    session = await mongoose.startSession();
    try {
      session.startTransaction();
    } catch (txErr) {
      // Transactions not supported on this deployment (standalone). We will fall back.
      console.warn(
        "Transactions not supported, falling back to non-transactional update:",
        txErr,
      );
      try {
        await session.endSession();
      } catch (e) {
        // ensure e used to satisfy eslint rules
        void e;
      }
      session = null;
      useTransaction = false;
    }

    if (useTransaction && session) {
      const existing = await NodeContent.findOne({ nodeId, projectId }).session(
        session,
      );

      if (existing && !skipVersion) {
        await NodeContentVersion.create(
          [
            {
              nodeId: existing.nodeId,
              projectId: existing.projectId,
              name: existing.name,
              category: existing.category,
              content: existing.content,
              userId: getUserIdFromReq(req),
              meta: { from: "updateNodeContent" },
            },
          ],
          { session },
        );
      }

      type UpsertData = {
        name: string;
        category: string;
        content: string;
        projectId: string;
        icon?: string;
      };

      const upsertData: UpsertData = {
        name,
        category,
        content,
        projectId,
      };
      if (icon !== undefined) upsertData.icon = icon;

      const updatedNodeContent = await NodeContent.findOneAndUpdate(
        { nodeId, projectId },
        { $set: upsertData },
        { new: true, upsert: true, setDefaultsOnInsert: true, session },
      );

      await Project.findByIdAndUpdate(
        projectId,
        { $set: { updatedAt: new Date() } },
        { session },
      );

      // trim old versions if exceed MAX_VERSIONS (only when versioning actually used)
      if (!skipVersion) {
        const count = await NodeContentVersion.countDocuments({
          nodeId,
          projectId,
        }).session(session);
        if (count > MAX_VERSIONS) {
          const toDelete = count - MAX_VERSIONS;
          const oldest = (await NodeContentVersion.find({ nodeId, projectId })
            .sort({ createdAt: 1 })
            .limit(toDelete)
            .select("_id")
            .lean()
            .session(session)) as Array<{
            _id: mongoose.Types.ObjectId | string;
          }>;

          const ids = oldest.map((o) => o._id);

          if (ids.length) {
            await NodeContentVersion.deleteMany({ _id: { $in: ids } }).session(
              session,
            );
          }
        }
      }

      await session.commitTransaction();
      await session.endSession();

      res.status(200).json(updatedNodeContent);
      return;
    } else {
      // fallback non-transactional path below
    }
  } catch (error) {
    // if something unexpected happened with session path, we'll try fallback below
    console.error("Error in transactional path (will try fallback):", error);
    if (session) {
      try {
        await session.abortTransaction();
        await session.endSession();
      } catch (e) {
        void e;
      }
      session = null;
    }
    // continue to fallback
  }

  // ------------------------- Non-transactional fallback -------------------------
  try {
    const existing = await NodeContent.findOne({ nodeId, projectId });
    if (existing && !skipVersion) {
      await NodeContentVersion.create({
        nodeId: existing.nodeId,
        projectId: existing.projectId,
        name: existing.name,
        category: existing.category,
        content: existing.content,
        userId: getUserIdFromReq(req),
        meta: { from: "updateNodeContent-fallback" },
      });
    }

    const updatedNodeContent = await NodeContent.findOneAndUpdate(
      { nodeId, projectId },
      {
        $set: {
          name,
          category,
          content,
          projectId,
          ...(icon !== undefined ? { icon } : {}),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    await Project.findByIdAndUpdate(projectId, {
      $set: { updatedAt: new Date() },
    });

    if (!skipVersion) {
      const count2 = await NodeContentVersion.countDocuments({
        nodeId,
        projectId,
      });
      if (count2 > MAX_VERSIONS) {
        const toDelete = count2 - MAX_VERSIONS;
        const oldest = (await NodeContentVersion.find({ nodeId, projectId })
          .sort({ createdAt: 1 })
          .limit(toDelete)
          .select("_id")
          .lean()
          .session(session)) as Array<{
          _id: mongoose.Types.ObjectId | string;
        }>;

        const ids = oldest.map((o) => o._id);
        if (ids.length)
          await NodeContentVersion.deleteMany({ _id: { $in: ids } });
      }
    }

    res.status(200).json(updatedNodeContent);
    return;
  } catch (err) {
    console.error("Fallback update failed:", err);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

/**
 * POST /:nodeId/versions  -> manuell Version anlegen
 */
export const createVersion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { nodeId } = req.params;
  const { projectId, content, name, category, meta } = req.body;
  if (!nodeId || !projectId) {
    res.status(400).json({ error: "nodeId & projectId required" });
    return;
  }
  try {
    const version = await NodeContentVersion.create({
      nodeId,
      projectId,
      name: name ?? "",
      category: category ?? "file",
      content: content ?? "",
      userId: getUserIdFromReq(req),
      meta: meta ?? {},
    });

    // trim
    const count = await NodeContentVersion.countDocuments({
      nodeId,
      projectId,
    });
    if (count > MAX_VERSIONS) {
      const toDelete = count - MAX_VERSIONS;
      const oldest = await NodeContentVersion.find({ nodeId, projectId })
        .sort({ createdAt: 1 })
        .limit(toDelete)
        .select("_id")
        .lean();

      const ids = oldest.map((o) => o._id);
      if (ids.length)
        await NodeContentVersion.deleteMany({ _id: { $in: ids } });
    }

    res.status(201).json(version);
  } catch (error) {
    console.error("createVersion error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * GET /:nodeId/versions?projectId=...&limit=&skip=
 */
export const listVersions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { nodeId } = req.params;
  const projectId = String(req.query.projectId || "");
  if (!nodeId || !projectId) {
    res.status(400).json({ error: "nodeId & projectId required" });
    return;
  }
  try {
    const limit = Math.min(Number(req.query.limit ?? 50), 200);
    const skip = Number(req.query.skip ?? 0);
    const versions = await NodeContentVersion.find({ nodeId, projectId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    res.status(200).json(versions);
  } catch (error) {
    console.error("listVersions error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * GET /:nodeId/versions/:versionId
 */
export const getVersion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { nodeId, versionId } = req.params;
  if (!nodeId || !versionId) {
    res.status(400).json({ error: "nodeId & versionId required" });
    return;
  }
  try {
    const version = await NodeContentVersion.findOne({
      _id: versionId,
      nodeId,
    }).lean();
    if (!version) {
      res.status(404).json({ error: "version not found" });
      return;
    }
    res.status(200).json(version);
  } catch (error) {
    console.error("getVersion error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * POST /:nodeId/versions/:versionId/revert  -> revert: speichere aktuellen state als Version und setze content auf version
 */
export const revertToVersion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { nodeId, versionId } = req.params;
  const { projectId } = req.body;
  if (!nodeId || !versionId || !projectId) {
    res.status(400).json({ error: "nodeId, versionId & projectId required" });
    return;
  }

  let session: mongoose.ClientSession | null = null;
  let useTransaction = true;

  try {
    session = await mongoose.startSession();
    try {
      session.startTransaction();
    } catch (txErr) {
      console.warn(
        "Transactions not supported for revert; falling back:",
        txErr,
      );
      try {
        await session.endSession();
      } catch (e) {
        void e;
      }
      session = null;
      useTransaction = false;
    }

    if (useTransaction && session) {
      const version = await NodeContentVersion.findOne({
        _id: versionId,
        nodeId,
        projectId,
      }).session(session);
      if (!version) {
        await session.abortTransaction();
        await session.endSession();
        res.status(404).json({ error: "version not found" });
        return;
      }

      const existing = await NodeContent.findOne({ nodeId, projectId }).session(
        session,
      );
      if (existing) {
        await NodeContentVersion.create(
          [
            {
              nodeId: existing.nodeId,
              projectId: existing.projectId,
              name: existing.name,
              category: existing.category,
              content: existing.content,
              userId: getUserIdFromReq(req),
              meta: { from: "revert" },
            },
          ],
          { session },
        );
      }

      const updated = await NodeContent.findOneAndUpdate(
        { nodeId, projectId },
        {
          $set: {
            name: version.name,
            category: version.category,
            content: version.content,
            projectId,
            updatedAt: new Date(),
          },
        },
        { new: true, upsert: true, session },
      );

      // trim versions if exceeded
      const count = await NodeContentVersion.countDocuments({
        nodeId,
        projectId,
      }).session(session);
      if (count > MAX_VERSIONS) {
        const toDelete = count - MAX_VERSIONS;
        const oldest = (await NodeContentVersion.find({ nodeId, projectId })
          .sort({ createdAt: 1 })
          .limit(toDelete)
          .select("_id")
          .lean()
          .session(session)) as Array<{
          _id: mongoose.Types.ObjectId | string;
        }>;

        const ids = oldest.map((o) => o._id);
        if (ids.length)
          await NodeContentVersion.deleteMany({ _id: { $in: ids } }).session(
            session,
          );
      }

      await session.commitTransaction();
      await session.endSession();

      res.status(200).json(updated);
      return;
    }
  } catch (error) {
    console.error("Error in transactional revert (will fallback):", error);
    if (session) {
      try {
        await session.abortTransaction();
        await session.endSession();
      } catch (e) {
        void e;
      }
      session = null;
    }
    // Fallthrough to non-transactional handling below
  }

  // Non-transactional fallback for revert
  try {
    const version = await NodeContentVersion.findOne({
      _id: versionId,
      nodeId,
      projectId,
    });
    if (!version) {
      res.status(404).json({ error: "version not found" });
      return;
    }

    const existing = await NodeContent.findOne({ nodeId, projectId });
    if (existing) {
      await NodeContentVersion.create({
        nodeId: existing.nodeId,
        projectId: existing.projectId,
        name: existing.name,
        category: existing.category,
        content: existing.content,
        userId: getUserIdFromReq(req),
        meta: { from: "revert-fallback" },
      });
    }

    const updated = await NodeContent.findOneAndUpdate(
      { nodeId, projectId },
      {
        $set: {
          name: version.name,
          category: version.category,
          content: version.content,
          projectId,
          updatedAt: new Date(),
        },
      },
      { new: true, upsert: true },
    );

    const count = await NodeContentVersion.countDocuments({
      nodeId,
      projectId,
    });
    if (count > MAX_VERSIONS) {
      const toDelete = count - MAX_VERSIONS;
      const oldest = (await NodeContentVersion.find({ nodeId, projectId })
        .sort({ createdAt: 1 })
        .limit(toDelete)
        .select("_id")
        .lean()
        .session(session)) as Array<{
        _id: mongoose.Types.ObjectId | string;
      }>;

      const ids = oldest.map((o) => o._id);
      if (ids.length)
        await NodeContentVersion.deleteMany({ _id: { $in: ids } });
    }

    res.status(200).json(updated);
    return;
  } catch (err) {
    console.error("Fallback revert failed:", err);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};
