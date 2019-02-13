prerequisites

.create table Log (TimeStamp: datetime, Message: string)

.create table Log ingestion json mapping 'LogMapping' '[{"column":"TimeStamp","path":"$.timestamp","datatype":"datetime"},{"column":"Message","path":"$.message","datatype":"string"}]'

.add database Event users ('aadapp=<appID>;<authorityID')

.add database Event ingestors ('aadapp=<appID>;<authorityID')



npm install

edit ingest.js to add values for appId, appKey and authorityId (and check clusterName)

npm run ingest

