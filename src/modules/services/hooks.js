import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBentoServices, fetchServices } from "./actions";
import { fetchExtraPropertiesSchemaTypes } from "@/modules/metadata/actions";
import { fetchDiscoverySchema } from "@/modules/discovery/actions";
import { performGetGohanVariantsOverviewIfPossible } from "@/modules/explorer/actions";

export const useBentoServices = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchBentoServices()).catch((err) => console.error(err));
    }, [dispatch]);
    return useSelector((state) => state.bentoServices);
};

export const useBentoService = (kind) => {
    const bentoServices = useBentoServices();
    return bentoServices.itemsByKind[kind];
};

export const useServices = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchServices()).catch((err) => console.error(err));
    }, [dispatch]);
    return useSelector((state) => state.services);  // From service registry; service-info style
};

export const useService = (kind) => {
    const services = useServices();
    return services.itemsByKind[kind];
};

export const useWorkflows = () => {
    const isFetchingAllServices = useServices().isFetchingAll;
    const {
        isFetching: isFetchingServiceWorkflows,
        items: serviceWorkflows,
    } = useSelector((state) => state.serviceWorkflows);

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


export const useMetadataDependentData = () => {
    const dispatch = useDispatch();
    const metadata = useBentoService("metadata");
    useEffect(() => {
        if (!metadata?.url) return;
        dispatch(fetchExtraPropertiesSchemaTypes());
        dispatch(fetchDiscoverySchema());
    }, [metadata, dispatch]);
};

export const useGohanDependentData = () => {
    const dispatch = useDispatch();
    const gohan = useBentoService("gohan");
    useEffect(() => {
        if (!gohan?.url) return;
        dispatch(performGetGohanVariantsOverviewIfPossible());
    }, [gohan, dispatch]);
};
