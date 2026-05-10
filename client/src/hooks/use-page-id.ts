import { useParams } from "react-router-dom";

const usePageId = () => {
  const params = useParams();
  return params.pageId as string;
};

export default usePageId;
