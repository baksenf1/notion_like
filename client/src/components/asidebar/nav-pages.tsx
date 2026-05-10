import {
  ArrowRight,
  FileText,
  Loader,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Permissions } from "@/constant";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useConfirmDialog from "@/hooks/use-confirm-dialog";
import useGetPagesInWorkspaceQuery from "@/hooks/api/use-get-pages";
import { createPageMutationFn, deletePageMutationFn } from "@/lib/api";
import { AllPageResponseType, PaginationType } from "@/types/api.type";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import PermissionsGuard from "../resuable/permission-guard";
import { ConfirmDialog } from "../resuable/confirm-dialog";

export function NavPages() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const { isMobile } = useSidebar();
  const { context, open, onOpenDialog, onCloseDialog } = useConfirmDialog();

  const [pageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { mutate: createPage, isPending: isCreating } = useMutation({
    mutationFn: createPageMutationFn,
  });

  const { mutate: deletePage, isPending: isDeleting } = useMutation({
    mutationFn: deletePageMutationFn,
  });

  const { data, isPending, isFetching, isError } =
    useGetPagesInWorkspaceQuery({
      workspaceId,
      pageSize,
      pageNumber,
    });

  const pages = data?.pages || [];
  const pagination = data?.pagination || ({} as PaginationType);
  const hasMore = pagination?.totalPages > pageNumber;

  const fetchNextPage = () => {
    if (!hasMore || isFetching) return;
    setPageSize((prev) => prev + 5);
  };

  const handleCreatePage = () => {
    createPage(
      {
        workspaceId,
        data: {
          title: "",
          content: "",
        },
      },
      {
        onSuccess: (data) => {
          const page = data.page;

          queryClient.setQueryData(["page", workspaceId, page._id], data);
          queryClient.setQueriesData<AllPageResponseType>(
            { queryKey: ["allpages", workspaceId] },
            (oldData) => {
              if (!oldData) return oldData;

              const alreadyExists = oldData.pages.some(
                (item) => item._id === page._id
              );
              if (alreadyExists) return oldData;

              const currentPageSize =
                oldData.pagination?.pageSize || oldData.pages.length + 1;
              const totalCount = (oldData.pagination?.totalCount || 0) + 1;

              return {
                ...oldData,
                pages: [page, ...oldData.pages].slice(0, currentPageSize),
                pagination: {
                  ...oldData.pagination,
                  totalCount,
                  totalPages: Math.ceil(totalCount / currentPageSize),
                },
              };
            }
          );
          queryClient.invalidateQueries({
            queryKey: ["allpages", workspaceId],
            refetchType: "inactive",
          });
          navigate(`/workspace/${workspaceId}/page/${page._id}`);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleConfirm = () => {
    if (!context) return;
    deletePage(
      {
        workspaceId,
        pageId: context?._id,
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: ["allpages", workspaceId],
          });
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });

          navigate(`/workspace/${workspaceId}`);
          setTimeout(() => onCloseDialog(), 100);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="w-full justify-between pr-0">
          <span>Pages</span>

          <PermissionsGuard requiredPermission={Permissions.CREATE_PAGE}>
            <button
              onClick={handleCreatePage}
              type="button"
              disabled={isCreating}
              className="flex size-5 items-center justify-center rounded-full border disabled:opacity-50"
            >
              {isCreating ? (
                <Loader className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
            </button>
          </PermissionsGuard>
        </SidebarGroupLabel>

        <SidebarMenu className="max-h-[220px] scrollbar overflow-y-auto pb-2">
          {isError ? (
            <SidebarMenuItem>
              <p className="px-2 text-xs text-destructive">Error occured</p>
            </SidebarMenuItem>
          ) : null}
          {isPending ? (
            <SidebarMenuItem>
              <Loader className="mx-auto size-5 animate-spin" />
            </SidebarMenuItem>
          ) : null}

          {!isPending && pages?.length === 0 ? (
            <SidebarMenuItem className="pl-3">
              <p className="text-xs text-muted-foreground">
                Pages you create will show up here.
              </p>
              <PermissionsGuard requiredPermission={Permissions.CREATE_PAGE}>
                <Button
                  variant="link"
                  type="button"
                  className="h-0 p-0 text-[13px] underline font-semibold mt-4"
                  onClick={handleCreatePage}
                  disabled={isCreating}
                >
                  Create a page
                  <ArrowRight />
                </Button>
              </PermissionsGuard>
            </SidebarMenuItem>
          ) : (
            pages.map((item) => {
              const pageUrl = `/workspace/${workspaceId}/page/${item._id}`;

              return (
                <SidebarMenuItem key={item._id}>
                  <SidebarMenuButton asChild isActive={pageUrl === pathname}>
                    <Link to={pageUrl}>
                      <FileText />
                      <span>{item.title || "Untitled"}</span>
                    </Link>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 rounded-lg"
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "end" : "start"}
                    >
                      <DropdownMenuItem onClick={() => navigate(pageUrl)}>
                        <FileText className="text-muted-foreground" />
                        <span>Open Page</span>
                      </DropdownMenuItem>

                      <PermissionsGuard requiredPermission={Permissions.DELETE_PAGE}>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={isDeleting}
                          onClick={() => onOpenDialog(item)}
                        >
                          <Trash2 className="text-muted-foreground" />
                          <span>Delete Page</span>
                        </DropdownMenuItem>
                      </PermissionsGuard>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              );
            })
          )}

          {hasMore && (
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-sidebar-foreground/70"
                disabled={isFetching}
                onClick={fetchNextPage}
              >
                <MoreHorizontal className="text-sidebar-foreground/70" />
                <span>{isFetching ? "Loading..." : "More"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroup>

      <ConfirmDialog
        isOpen={open}
        isLoading={isDeleting}
        onClose={onCloseDialog}
        onConfirm={handleConfirm}
        title="Delete Page"
        description={`Are you sure you want to delete ${
          context?.title || "this page"
        }? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
