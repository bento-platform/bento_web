import { useMemo } from "react";
import { useSelector } from "react-redux";

export const useWorkflows = () => {
    const isFetchingAllServices = useSelector((state) => state.services.isFetchingAll);
    const isFetchingServiceWorkflows = useSelector((state) => state.serviceWorkflows.isFetching);

    const workflowsLoading = isFetchingAllServices || isFetchingServiceWorkflows;

    const serviceWorkflows = useSelector((state) => state.serviceWorkflows.items);

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
    }, [serviceWorkflows, workflowsLoading])
};
