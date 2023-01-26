export const normalizeServiceInfo = serviceInfo => {
    // Backwards compatibility for:
    // - old type ("group:artifact:version")
    // - and new  ({"group": "...", "artifact": "...", "version": "..."})

    let serviceType = serviceInfo.type;
    if (typeof serviceType === "string") {
        const [group, artifact, version] = serviceType.split(":");
        serviceType = {
            group,
            artifact,
            version,
        };
    }

    return {
        ...serviceInfo,
        type: serviceType,
    };
};
