export const filterWorkflows = (workflowsByServiceID) =>
    Object.entries(workflowsByServiceID)
        .filter(([_, s]) => !s.isFetching)
        .flatMap(([serviceID, s]) =>
            Object.entries(s.workflows).flatMap(([action, workflowsByAction]) =>
                Object.entries(workflowsByAction).map(([id, v]) => ({
                    ...v,
                    id, // e.g. phenopacket_json, vcf_gz
                    serviceID,
                    action,
                }))
            )
        );
