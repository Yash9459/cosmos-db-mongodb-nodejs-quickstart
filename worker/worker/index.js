import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB || "demo";
const qCol = process.env.QUEUE_COLLECTION || "NotificationQueue";
const hCol = process.env.HISTORY_COLLECTION || "NotificationHistory";

const client = new MongoClient(uri);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  await client.connect();
  const db = client.db(dbName);
  const queue = db.collection(qCol);
  const history = db.collection(hCol);

  console.log("Worker started");
  while (true) {
    const jobs = await queue.find({ status: "PENDING" }).limit(25).toArray();
    for (const j of jobs) {
      try {
        // TODO: call SMS/Email provider here
        await queue.updateOne({ _id: j._id }, { $set: { status: "SENT", sentAt: new Date() }});
        await history.insertOne({ jobId: j._id, status: "SENT", ts: new Date() });
      } catch (e) {
        await queue.updateOne({ _id: j._id }, { $set: { status: "ERROR", error: e.message }});
        await history.insertOne({ jobId: j._id, status: "ERROR", ts: new Date(), error: e.message });
      }
    }
    await sleep(3000);
  }
}
run().catch(err => { console.error(err); process.exit(1); });
