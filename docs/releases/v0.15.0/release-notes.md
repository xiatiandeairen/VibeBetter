# v0.15.0 Release Notes — Customizable Decision Rule Types

Foundation for user-defined decision rules beyond built-in ones.

- `DecisionRule` interface — typed condition/action pairs for metric thresholds
- `DEFAULT_RULES` — 4 built-in rules (AI Success, PSRI High Risk, TDI Critical, Hotspot Warning)
- Operators: gt, lt, eq, gte, lte
- Action levels: CRITICAL, WARNING, INFO
- Exported from `@vibebetter/shared` for use by rules engine consumers
