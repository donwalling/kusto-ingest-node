const IngestClient = require("azure-kusto-ingest").IngestClient;
const IngestStatusQueues = require("azure-kusto-ingest").IngestStatusQueues;
const IngestionProps = require("azure-kusto-ingest").IngestionProperties;
const { ReportLevel, ReportMethod } = require("azure-kusto-ingest").IngestionPropertiesEnums;
const KustoConnectionStringBuilder = require("azure-kusto-data").KustoConnectionStringBuilder;
const { DataFormat, JsonColumnMapping } = require("azure-kusto-ingest").IngestionPropertiesEnums;
const { BlobDescriptor } = require("azure-kusto-ingest").IngestionDescriptors;

const clusterName = 'excmonitorade.eastus2';
const appId = 
const appKey = 
const authorityId = 

const ingestClient = new IngestClient(
    KustoConnectionStringBuilder.withAadApplicationKeyAuthentication(
        `https://ingest-${clusterName}.kusto.windows.net`, appId, appKey, authorityId
    ),
    new IngestionProps(
        "Event",
        "Log",
        DataFormat.json,
        null,
        "LogMapping",
        null,
        null,
        null,
        null,
        false,
        ReportLevel.FailuresAndSuccesses,
        ReportMethod.Queue)
);

const statusQueues = new IngestStatusQueues(ingestClient);
let response = null;

function waitForFailures() {
    statusQueues.failure.isEmpty((err, empty) => {
        if (err) throw new Error(err);

        if (empty && !response) {
            console.log("no errors...");
            return setTimeout(waitForFailures, 1000);
        }
        else {
            response = true;
            statusQueues.failure.pop((err, failures) => {
                if (err) throw new Error(err);

                for (let failure of failures) {
                    console.log(JSON.stringify(failure));
                }

            });
        }
    });
}

function waitForSuccess() {
    statusQueues.success.isEmpty((err, empty) => {
        if (err) throw new Error(err);

        if (empty && !response) {
            console.log("no successes...");
            return setTimeout(waitForSuccess, 1000);
        }
        else {
            response = true;
            statusQueues.success.pop((err, successes) => {
                if (err) throw new Error(err);

                for (let success of successes) {
                    console.log(JSON.stringify(success));
                }

            })
        }
    });
}

console.log("Ingest from file");

ingestClient.ingestFromFile("file.json", null, (err) => {
    if (err) {
        console.log(err);
    }

    console.log("Ingestion done?");


    setTimeout(waitForFailures, 0);
    setTimeout(waitForSuccess, 0);
});

