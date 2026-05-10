import { useEffect, useState } from "react";
import { Loader, Save } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import usePageId from "@/hooks/use-page-id";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { editPageMutationFn, getPageByIdQueryFn } from "@/lib/api";
import { AllPageResponseType } from "@/types/api.type";

const PageDetails = () => {
  const workspaceId = useWorkspaceId();
  const pageId = usePageId();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["page", workspaceId, pageId],
    queryFn: () => getPageByIdQueryFn({ workspaceId, pageId }),
    enabled: !!workspaceId && !!pageId,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: editPageMutationFn,
  });

  useEffect(() => {
    if (!data?.page) return;
    setTitle(data.page.title === "Untitled" ? "" : data.page.title);
    setContent(data.page.content || "");
  }, [data?.page]);

  const handleSave = () => {
    mutate(
      {
        workspaceId,
        pageId,
        data: {
          title,
          content,
        },
      },
      {
        onSuccess: (data) => {
          const page = data.page;

          queryClient.setQueryData(["page", workspaceId, pageId], data);
          queryClient.setQueriesData<AllPageResponseType>(
            { queryKey: ["allpages", workspaceId] },
            (oldData) => {
              if (!oldData) return oldData;

              return {
                ...oldData,
                pages: oldData.pages.map((item) =>
                  item._id === page._id ? { ...item, ...page } : item
                ),
              };
            }
          );
          queryClient.invalidateQueries({
            queryKey: ["allpages", workspaceId],
            refetchType: "inactive",
          });
          setTitle(page.title === "Untitled" ? "" : page.title);
          toast({
            title: "Saved",
            description: "Page updated successfully",
            variant: "success",
          });
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

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl py-8">
      <div className="mb-6 flex items-center justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          <span className="relative flex size-4 items-center justify-center">
            <Loader
              className={`absolute animate-spin ${
                isPending ? "opacity-100" : "opacity-0"
              }`}
            />
            <Save
              className={`absolute size-4 ${
                isPending ? "opacity-0" : "opacity-100"
              }`}
            />
          </span>
          <span>Save</span>
        </Button>
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Untitled"
        className="mb-4 w-full border-none bg-transparent text-4xl font-bold tracking-normal outline-none placeholder:text-muted-foreground/50 md:text-5xl"
      />

      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write anything..."
        className="min-h-[520px] resize-none border-none bg-transparent px-0 text-base leading-7 shadow-none outline-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
      />
    </div>
  );
};

export default PageDetails;
