import { Router } from "express";
import {
  createPageController,
  deletePageController,
  getAllPagesInWorkspaceController,
  getPageByIdAndWorkspaceIdController,
  updatePageController,
} from "../controllers/page.controller";

const pageRoutes = Router();

pageRoutes.post("/workspace/:workspaceId/create", createPageController);

pageRoutes.get("/workspace/:workspaceId/all", getAllPagesInWorkspaceController);

pageRoutes.get("/:id/workspace/:workspaceId", getPageByIdAndWorkspaceIdController);

pageRoutes.put("/:id/workspace/:workspaceId/update", updatePageController);

pageRoutes.delete("/:id/workspace/:workspaceId/delete", deletePageController);

export default pageRoutes;
