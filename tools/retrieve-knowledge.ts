import { defineSchema } from "veryfront/schemas";
import { projectKnowledge } from "veryfront/knowledge";
import { tool } from "veryfront/tool";

const knowledge = projectKnowledge();

export default tool({
  id: "retrieveKnowledge",
  description: "Retrieve approved customer operations knowledge from the project knowledge base.",
  inputSchema: defineSchema((v) =>
    v.object({
      query: v.string().describe("Customer issue or operation to retrieve context for"),
    })
  )(),
  execute: async ({ query }) => knowledge.retrieve(query),
});
