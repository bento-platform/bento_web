import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useJsonSchemaValidator } from "@/hooks";
import { fetchDiscoverySchema } from "@/modules/discovery/actions";
import { useService } from "@/modules/services/hooks";
import { useAppSelector } from "@/store";

export const useDiscoverySchema = () => {
  const dispatch = useDispatch();
  const metadataService = useService("metadata");
  useEffect(() => {
    dispatch(fetchDiscoverySchema()).catch((err) => console.error(err));
  }, [dispatch, metadataService]);
  return useAppSelector((state) => state.discovery.discoverySchema);
};

export const useDiscoveryValidator = () => {
  const discoverySchema = useDiscoverySchema();
  return useJsonSchemaValidator(discoverySchema, true);
};
