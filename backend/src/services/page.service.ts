import PageModel from "../models/page.model";
import { NotFoundException } from "../utils/appError";

const getPageTitle = (title?: string, content?: string) => {
  const explicitTitle = title?.trim();
  if (explicitTitle) return explicitTitle;

  const firstContentLine = content
    ?.split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return firstContentLine || "Untitled";
};

export const createPageService = async (
  userId: string,
  workspaceId: string,
  body: {
    title?: string;
    content?: string;
  }
) => {
  const content = body.content || "";
  const page = new PageModel({
    title: getPageTitle(body.title, content),
    content,
    workspace: workspaceId,
    createdBy: userId,
  });

  await page.save();

  return { page };
};

export const getPagesInWorkspaceService = async (
  workspaceId: string,
  pageSize: number,
  pageNumber: number
) => {
  const totalCount = await PageModel.countDocuments({
    workspace: workspaceId,
  });

  const skip = (pageNumber - 1) * pageSize;

  const pages = await PageModel.find({
    workspace: workspaceId,
  })
    .select("_id title workspace createdBy createdAt updatedAt")
    .skip(skip)
    .limit(pageSize)
    .populate("createdBy", "_id name profilePicture -password")
    .sort({ updatedAt: -1 });

  const totalPages = Math.ceil(totalCount / pageSize);

  return { pages, totalCount, totalPages, skip };
};

export const getPageByIdAndWorkspaceIdService = async (
  workspaceId: string,
  pageId: string
) => {
  const page = await PageModel.findOne({
    _id: pageId,
    workspace: workspaceId,
  });

  if (!page) {
    throw new NotFoundException(
      "Page not found or does not belong to the specified workspace"
    );
  }

  return { page };
};

export const updatePageService = async (
  workspaceId: string,
  pageId: string,
  body: {
    title?: string;
    content?: string;
  }
) => {
  const page = await PageModel.findOne({
    _id: pageId,
    workspace: workspaceId,
  });

  if (!page) {
    throw new NotFoundException(
      "Page not found or does not belong to the specified workspace"
    );
  }

  if (body.content !== undefined) page.content = body.content;
  page.title = getPageTitle(body.title, page.content);

  await page.save();

  return { page };
};

export const deletePageService = async (
  workspaceId: string,
  pageId: string
) => {
  const page = await PageModel.findOne({
    _id: pageId,
    workspace: workspaceId,
  });

  if (!page) {
    throw new NotFoundException(
      "Page not found or does not belong to the specified workspace"
    );
  }

  await page.deleteOne();

  return page;
};
