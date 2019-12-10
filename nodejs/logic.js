const dialogflow = require("dialogflow");
const uuid = require("uuid");
const sdk = require("@aleximp/coco-sdk-nodejs");
const fs = require("fs");

const keyFilename = "./keys/service_account.json";
const projectId = JSON.parse(fs.readFileSync(keyFilename)).project_id;
const sessionId = uuid.v4();
const sessionClient = new dialogflow.SessionsClient({
  projectId,
  keyFilename
});
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

var conv = new sdk.ComponentSession("Introduction_ed41cb77c01605", "test");

// var isHandlingAccountOpen = false;
const stages = ["name","workout","schedule","reminder"]
var stage = "name";

async function processCoco(input) {
  const response = await conv.call(input);
  console.dir(response)
  if (response instanceof Error) {
    return Promise.resolve("ERROR");
  }
  return Promise.resolve(response);
}
const processName = async (input)=>{
  const res = await processCoco(input)

  if (res.component_done) {
    stage = "workout"
  }
  return Promise.resolve(res.response);
  
  // Introduction_ed41cb77c01605
}


const processdf = async (input)=>{
  console.log(`sending to df`);


  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: input,
        languageCode: "en-US"
      }
    }
  };
  try {
    const responses = await sessionClient.detectIntent(request);
    console.log(`df result received`);
    const result = responses[0].queryResult;
    if (result.intent.displayName === "account.open") {
      isHandlingAccountOpen = true;
      return processCoco(input);
    }
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }
    return Promise.resolve(result.fulfillmentText);
  } catch (e) {
    console.log(e.message);
    Promise.resolve(
      "AN ERROR HAS OCCURRED. WE APOLOGIZE FOR THE INCONVENIENCE"
    );
  }
}
async function process(input) {
  var r = "";

  switch (stage) {
    case "name":
      r = await processName(input);
      break;
    case "workout":
      r = await processdf(input);
      break;
    default:
      break;
  }
  return Promise.resolve(r);

}



exports.process = process;
