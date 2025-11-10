import { describe, it, expectTypeOf } from "vitest";
import type { Node, Project } from "./types";

describe("Node type", () => {
  it("should allow a minimal node", () => {
    const node: Node = {
      id: "1",
      name: "File.txt",
    };
    // check that id and name have type string
    expectTypeOf(node.id).toEqualTypeOf<string>();
    expectTypeOf(node.name).toEqualTypeOf<string>();
  });

  it("should allow nested nodes", () => {
    const node: Node = {
      id: "2",
      name: "Folder",
      nodes: [
        {
          id: "3",
          name: "Subfile",
          content: "hello",
        },
      ],
    };
    // nodes is optional, so its type is Node[] | undefined
    expectTypeOf(node.nodes).toEqualTypeOf<Node[] | undefined>();
  });

  it("should allow optional fields", () => {
    const node: Node = {
      id: "4",
      name: "CodeFile.ts",
      category: "code",
      content: "console.log('hi');",
      nodeId: "backend-id-123",
      icon: "📄",
      projectId: "p1",
    };
    // category and projectId are optional string fields -> here they are string
    expectTypeOf(node.category).toEqualTypeOf<string | undefined>();
    expectTypeOf(node.projectId).toEqualTypeOf<string | undefined>();
  });
});

describe("Project type", () => {
  it("should require name, username and projectStructure", () => {
    const project: Project = {
      name: "My Project",
      username: "alice",
      projectStructure: [],
      isPublic: false,
      upvotedBy: [],
      favoritedBy: [],
    };
    // check required props
    expectTypeOf(project.name).toEqualTypeOf<string>();
    expectTypeOf(project.username).toEqualTypeOf<string>();
    expectTypeOf(project.projectStructure).items.toMatchTypeOf<Node>();
  });

  it("should allow optional fields", () => {
    const project: Project = {
      _id: "123",
      name: "Test",
      username: "bob",
      projectStructure: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
      isPublic: false,
      upvotedBy: [],
      favoritedBy: [],
    };
    // optional fields should be strings (when present)
    expectTypeOf(project._id).toEqualTypeOf<string | undefined>();
    expectTypeOf(project.createdAt).toEqualTypeOf<string | undefined>();
    expectTypeOf(project.updatedAt).toEqualTypeOf<string | undefined>();
  });
});
