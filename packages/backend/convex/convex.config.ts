import { defineApp } from "convex/server";
import workflow from "@convex-dev/workflow/convex.config";
import workpool from "@convex-dev/workpool/convex.config";
import agent from "@convex-dev/agent/convex.config";

const app = defineApp();

app.use(agent);
app.use(workflow);
app.use(workpool, { name: "backgroundJobWorkpool" });

export default app;
