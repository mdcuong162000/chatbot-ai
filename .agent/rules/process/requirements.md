# 📌 RULE: CONFIRM REQUIREMENTS BEFORE EXECUTING

## Principle

Always re-confirm requirements with **Manager** before initiating execution.

## When to apply

- Receiving a new task from anyone in the team
- Mid-way change request
- Conflict between new request and current design

## Confirmation process

```
1. Read original request carefully
2. If unclear → ASK AGAIN, don't guess
3. Rewrite request in technical language:
   - What to do? (component / API / fix bug)
   - What is Input? What is Output?
   - Affects which files/modules?
4. Send back to Manager for confirmation
5. Only start coding when confirmed ✅
```

## Template to ask when unclear

```
❓ NEED REQUIREMENT CLARIFICATION:

Original request: "[copy request]"

I understand it as: [interpret based on your understanding]

Questions to confirm:
1. [specific question 1]
2. [specific question 2]
```

## Template to rewrite technical requirements

```
✅ TECHNICAL REQUIREMENT (after solid understanding):

Feature: [feature name]
Description: [short technical description]
Files to create/edit: [list of files]
API to call: [endpoint / platform]
Input: [input data]
Output: [expected result]
Edge cases: [special scenarios]
```

> ❌ **Do not**: Assume requirements and just code
> ✅ **Must do**: Ask → get confirmation → then code
