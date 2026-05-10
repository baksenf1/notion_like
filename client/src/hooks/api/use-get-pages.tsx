import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getPagesInWorkspaceQueryFn } from "@/lib/api";
import { AllPagePayloadType } from "@/types/api.type";

const useGetPagesInWorkspaceQuery = ({
  workspaceId,
  pageSize,
  pageNumber,
  skip = false,
}: AllPagePayloadType) => {
  const query = useQuery({
    queryKey: ["allpages", workspaceId, pageNumber, pageSize],
    queryFn: () =>
      getPagesInWorkspaceQueryFn({
        workspaceId,
        pageSize,
        pageNumber,
      }),
    staleTime: Infinity,
    placeholderData: skip ? undefined : keepPreviousData,
    enabled: !skip,
  });
  return query;
};

export default useGetPagesInWorkspaceQuery;
