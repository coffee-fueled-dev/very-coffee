import type { RegisteredPost } from "@/lib/post";
import affordanceLattices from "./affordance-lattices";
import portManifold from "./port-manifold";
import portAffordanceFibration from "./port-affordance-fibration";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "TA Structures",
  tags: ["lattice theory", "differential geometry", "category theory"],
  summary: "Optional algebraic and geometric enrichments of core TA",
  posts: { affordanceLattices, portManifold, portAffordanceFibration },
} satisfies RegisteredPost;
