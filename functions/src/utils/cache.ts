// functions/src/utils/cache.ts
import NodeCache from "node-cache";

const cache = new NodeCache({stdTTL: 3600}); // 1 hour TTL

export default cache;
