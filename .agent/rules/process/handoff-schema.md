# 🤝 CROSS-DATA HANDOFF PROTOCOL (MULTI-AGENT HANDOFF SCHEMA)

> Instead of the Product Owner (BA) tossing a messy block of text to the Architect (Lead Engineer) and then the Architect tossing bare text to the Dev, we have a Standard Schema for AI Agents to implicitly understand each other 100% accurately.

Whenever a Workflow is completed to hand off to the next Workflow, the final Output **must be wrapped in JSON or YAML Codeblock format** according to this standard:

## 1. From BA (`/giao-viec` or `/phan-tich`) ➡️ Hand off to Architect
BA's final output must print this data frame:
```json
{
  "$schema": "handoff-ba-to-architect",
  "feature_name": "Business name",
  "core_user_flow": ["Step 1...", "Step 2..."],
  "business_rules": ["Rule 1...", "Rule 2..."],
  "acceptance_criteria": ["Test 1...", "Test 2..."],
  "required_data_fields": ["id", "name", "price"]
}
```

## 2. From Architect (`/thiet-ke-ky-thuat`) ➡️ Hand off to Developer
Architect's final output to report to Manager must contain a clear data frame:
```yaml
schema: handoff-architect-to-dev
component_tree:
  - Parent: [Task]
  - Children: [Sub-task 1, Sub-task 2]
api_contracts:
  endpoint: "/api/v1/..."
  payload_request: "{ id: string }"
  response_format: "{ data: Object, traceId: string }"
interfaces:
  - "IUser { id: string }"
database_impact: "Create new migration: NEXT_20240101_add_table..."
```

## 3. From Developer (`/tho-code`) ➡️ Hand off to Tester
When running `/kiem-tra`, Tester must expect Developer to provide:
```json
{
  "$schema": "handoff-dev-to-tester",
  "tested_urls": ["/dashboard/analytics"],
  "mock_data_used": true,
  "edge_cases_handled": ["Offline", "API Timeout", "Divide by 0"],
  "feature_flag_env": "NEXT_PUBLIC_FF_ANALYTICS"
}
```

> **Rule:** Agent DOES NOT NEED to create a real JSON file, just print a Markdown Code Block containing this format into the log/chat when reporting Done (DONE) so the next contextual chat has a clean structural extraction data.
