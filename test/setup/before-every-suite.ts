import * as pactum from "pactum";
const port = process.env.PORT;
pactum.request.setBaseUrl(`http:localhost:${port}/api/v3`);
const stash = pactum.stash;
stash.loadData('test/data');
