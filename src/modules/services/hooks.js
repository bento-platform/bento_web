import { useEffect, useMemo } from "react";
import { fetchBentoServices, fetchDataTypes, fetchServices } from "./actions";
import { useAppDispatch, useAppSelector } from "@/store";

export const useBentoServices = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchBentoServices()).catch((err) => console.error(err));
  }, [dispatch]);
  return useAppSelector((state) => state.bentoServices);
};

export const useBentoService = (kind) => {
  const bentoServices = useBentoServices();
  return bentoServices.itemsByKind[kind];
};

export const useServices = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchServices()).catch((err) => console.error(err));
  }, [dispatch]);
  return useAppSelector((state) => state.services); // From service registry; service-info style
};

export const useService = (kind) => {
  const services = useServices();
  return services.itemsByKind[kind];
};

export const useDataTypes = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchDataTypes()).catch((err) => console.error(err));
  }, [dispatch]);
  return useAppSelector((state) => state.serviceDataTypes);
};

export const useWorkflows = () => {
  const isFetchingAllServices = useServices().isFetchingAll;
  const { isFetching: isFetchingServiceWorkflows, items: serviceWorkflows } = useAppSelector(
    (state) => state.serviceWorkflows,
  );

  const workflowsLoading = isFetchingAllServices || isFetchingServiceWorkflows;

  return useMemo(() => {
    const workflowsByType = {
      ingestion: { items: [], itemsByID: {} },
      analysis: { items: [], itemsByID: {} },
      export: { items: [], itemsByID: {} },
    };

    Object.entries(serviceWorkflows).forEach(([workflowType, workflowTypeWorkflows]) => {
      if (!(workflowType in workflowsByType)) return;

      // noinspection JSCheckFunctionSignatures
      Object.entries(workflowTypeWorkflows).forEach(([k, v]) => {
        const wf = { ...v, id: k };
        workflowsByType[workflowType].items.push(wf);
        workflowsByType[workflowType].itemsByID[k] = wf;
      });
    });

    return { workflowsByType, workflowsLoading };
  }, [serviceWorkflows, workflowsLoading]);
};
