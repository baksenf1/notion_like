import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { Permissions } from "../enums/role.enum";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { getMemberRoleInWorkspace } from "../services/member.service";
import {
  createPageService,
  deletePageService,
  getPageByIdAndWorkspaceIdService,
  getPagesInWorkspaceService,
  updatePageService,
} from "../services/page.service";
import { roleGuard } from "../utils/roleGuard";
import {
  createPageSchema,
  pageIdSchema,
  updatePageSchema,
} from "../validation/page.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";

export const createPageController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createPageSchema.parse(req.body);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_PAGE]);

    const { page } = await createPageService(userId, workspaceId, body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Page created successfully",
      page,
    });
  }
);

export const getAllPagesInWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const pageNumber = parseInt(req.query.pageNumber as string) || 1;

    const { pages, totalCount, totalPages, skip } =
      await getPagesInWorkspaceService(workspaceId, pageSize, pageNumber);

    return res.status(HTTPSTATUS.OK).json({
      message: "Pages fetched successfully",
      pages,
      pagination: {
        totalCount,
        pageSize,
        pageNumber,
        totalPages,
        skip,
        limit: pageSize,
      },
    });
  }
);

export const getPageByIdAndWorkspaceIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const pageId = pageIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { page } = await getPageByIdAndWorkspaceIdService(
      workspaceId,
      pageId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Page fetched successfully",
      page,
    });
  }
);

export const updatePageController = asyncHandler(
  async (req: Request, res: Response) => {
    const pageId = pageIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const body = updatePageSchema.parse(req.body);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_PAGE]);

    const { page } = await updatePageService(workspaceId, pageId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Page updated successfully",
      page,
    });
  }
);

export const deletePageController = asyncHandler(
  async (req: Request, res: Response) => {
    const pageId = pageIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_PAGE]);

    await deletePageService(workspaceId, pageId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Page deleted successfully",
    });
  }
);
