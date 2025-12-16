# Agent Hooks

Hooks allow agent executions to trigger automatically based on events in the IDE.

## How to Create Hooks
1. Use Command Palette: "Open Kiro Hook UI"
2. Or use the Explorer view "Agent Hooks" section

## Example Use Cases
- Auto-run tests when saving a file
- Update translations when strings change
- Lint code on save
- Generate documentation

## Hook Triggers
- `onMessageSent` - When a message is sent to the agent
- `onAgentComplete` - When an agent execution completes
- `onSessionCreate` - When a new session is created
- `onFileSave` - When a code file is saved
- `onManualTrigger` - When user clicks a manual hook button
