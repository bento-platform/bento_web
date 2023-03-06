const childProcess = require("child_process");
const packageData = require("./package.json");

const nodeEnv = process.env.NODE_ENV || "production";

const serviceType = {
    group: "ca.c3g.bento",
    artifact: "web",
    version: packageData.version,
};

const serviceID = process.env.SERVICE_ID || `${serviceType.group}:${serviceType.artifact}`;

const serviceInfo = {
    id: serviceID,
    name: "Bento Web",
    description: "Private-access web interface for the Bento platform.",
    type: serviceType,
    version: packageData.version,
    environment: nodeEnv === "production" ? "prod" : "dev",
    organization: {
        name: "C3G",
        url: "https://www.computationalgenomics.ca",
    },
    contactUrl: "mailto:info@c3g.ca",
    bento: {
        serviceKind: "web",
    },
};


if (nodeEnv === "development") {
    try {
        serviceInfo.bento.gitTag = childProcess.execSync("git describe --tags --abbrev=0");
        serviceInfo.bento.gitBranch = childProcess.execSync("git branch --show-current");
        serviceInfo.bento.gitCommit = childProcess.execSync("git rev-parse HEAD");
    } catch (e) {
        console.warn(`Could not get git information (${e})`);
    }
}

if (typeof require !== "undefined" && require.main === module) {
    console.log(JSON.stringify(serviceInfo, null, 2));
}

module.exports = {
    serviceInfo,
};
