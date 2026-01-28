import { useParams } from "react-router";

export const useDraft = () => {
  const params = useParams();
  const draftId = params.draftId;
  const draftName = params.draftName;
  return { draftId, draftName };
};
