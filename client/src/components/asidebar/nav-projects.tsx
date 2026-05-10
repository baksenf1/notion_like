import {
  ArrowRight,
  Folder,
  Loader,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import { ConfirmDialog } from "../resuable/confirm-dialog";
import { Button } from "../ui/button";
import { Permissions } from "@/constant";
import PermissionsGuard from "../resuable/permission-guard";
import { useState } from "react";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import {
  AllProjectResponseType,
  PaginationType,
  ProjectType,
} from "@/types/api.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProjectMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function NavProjects() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { isMobile } = useSidebar();
  const { onOpen } = useCreateProjectDialog();
  const [projectToDelete, setProjectToDelete] = useState<ProjectType | null>(
    null
  );

  const [pageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: deleteProjectMutationFn,
  });

  const { data, isPending, isFetching, isError } =
    useGetProjectsInWorkspaceQuery({
      workspaceId,
      pageSize,
      pageNumber,
    });

  const projects = data?.projects || [];
  const pagination = data?.pagination || ({} as PaginationType);
  const hasMore = pagination?.totalPages > pageNumber;

  const fetchNextPage = () => {
    if (!hasMore || isFetching) return;
    setPageSize((prev) => prev + 5);
  };

  const handleConfirm = () => {
    if (!projectToDelete) return;
    mutate(
      {
        workspaceId,
        projectId: projectToDelete._id,
      },
      {
        onSuccess: async (data) => {
          const deletedProjectId = projectToDelete._id;

          queryClient.setQueriesData<AllProjectResponseType>(
            { queryKey: ["allprojects", workspaceId] },
            (oldData) => {
              if (!oldData) return oldData;

              const projects = oldData.projects.filter(
                (project) => project._id !== deletedProjectId
              );
              const totalCount = Math.max(
                (oldData.pagination?.totalCount || 1) - 1,
                0
              );
              const pageSize = oldData.pagination?.pageSize || projects.length;

              return {
                ...oldData,
                projects,
                pagination: {
                  ...oldData.pagination,
                  totalCount,
                  totalPages: pageSize ? Math.ceil(totalCount / pageSize) : 0,
                },
              };
            }
          );

          queryClient.removeQueries({
            queryKey: ["singleProject", deletedProjectId],
          });
          await queryClient.invalidateQueries({
            queryKey: ["allprojects", workspaceId],
          });
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });

          navigate(`/workspace/${workspaceId}`);
          setProjectToDelete(null);
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
          <span>Projects</span>

          <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
            <button
              onClick={onOpen}
              type="button"
              className="flex size-5 items-center justify-center rounded-full border"
            >
              <Plus className="size-3.5" />
            </button>
          </PermissionsGuard>
        </SidebarGroupLabel>
        <SidebarMenu className="pb-2">
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

          {!isPending && projects?.length === 0 ? (
            <SidebarMenuItem className="pl-3">
              <p className="text-xs text-muted-foreground">
                There is no projects in this Workspace yet. Projects you create
                will show up here.
              </p>
              <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
                <Button
                  variant="link"
                  type="button"
                  className="h-0 p-0 text-[13px] underline font-semibold mt-4"
                  onClick={onOpen}
                >
                  Create a project
                  <ArrowRight />
                </Button>
              </PermissionsGuard>
            </SidebarMenuItem>
          ) : (
            projects.map((item) => {
              const projectUrl = `/workspace/${workspaceId}/project/${item._id}`;

              return (
                <SidebarMenuItem key={item._id}>
                  <SidebarMenuButton asChild isActive={projectUrl === pathname}>
                    <Link to={projectUrl}>
                      {item.emoji}
                      <span>{item.name}</span>
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
                      <DropdownMenuItem
                        onClick={() => navigate(`${projectUrl}`)}
                      >
                        <Folder className="text-muted-foreground" />
                        <span>View Project</span>
                      </DropdownMenuItem>

                      <PermissionsGuard
                        requiredPermission={Permissions.DELETE_PROJECT}
                      >
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={isLoading}
                          onClick={(event) => {
                            event.preventDefault();
                            setProjectToDelete(item);
                          }}
                        >
                          <Trash2 className="text-muted-foreground" />
                          <span>Delete Project</span>
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
        isOpen={!!projectToDelete}
        isLoading={isLoading}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleConfirm}
        title="Delete Project"
        description={`Are you sure you want to delete ${
          projectToDelete?.name || "this item"
        }? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
