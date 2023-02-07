const packageData = require("./package.json");

const serviceType = {
    group: "ca.c3g.bento",
    artifact: "web",
    version: packageData.version,
};

const serviceID = process.env.SERVICE_ID || `${serviceType.group}:${serviceType.artifact}`;

const serviceInfo = () => ({
    id: serviceID,
    name: "Bento Web",
    description: "Private-access web interface for the Bento platform.",
    type: serviceType,
    version: packageData.version,
    organization: {
        name: "C3G",
        url: "https://www.computationalgenomics.ca",
    },
    contactUrl: "mailto:info@c3g.ca",
    bento: {
        serviceKind: "web",
    },
});

if (typeof require !== "undefined" && require.main === module) {
    console.log(JSON.stringify(serviceInfo(), null, 2));
}

module.exports = {
    serviceInfo,
};