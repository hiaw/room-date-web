import { defineApp } from "convex/server";
import r2 from "@convex-dev/r2/convex.config";
import geospatial from "@convex-dev/geospatial/convex.config";

const app = defineApp();
app.use(r2);
app.use(geospatial);

export default app;
