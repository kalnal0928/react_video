# Settings Feature Design Document

## Overview

The Settings feature adds user-configurable options to the video player, starting with seek interval customization. The feature uses React Context for state management and localStorage for persistence.

## Architecture

### Component Structure
```
App
├── MenuBar
│   └── SettingsButton (new)
├── SettingsModal (new)
└── MainLayout
    └── VideoPlayer
        └── VideoControls (updated with settings)
```

### State Management
- Extend existing AppContext to include settings state
- Settings stored in `state.settings` object
- Actions: `SET_SETTINGS`, `RESET_SETTINGS`, `UPDATE_SETTING`

### Data Flow
1. User clicks settings button → Opens modal
2. User modifies setting → Updates context state
3. Context state change → Saves to localStorage
4. Keyboard handler reads from context → Uses configured seek interval

## Components and Interfaces

### 1. Settings Context Extension

```typescript
// Add to types.ts
interface Settings {
  seekInterval: number; // seconds, default: 5, range: 1-60
}

interface AppState {
  // ... existing fields
  settings: Settings;
}

type AppAction = 
  // ... existing actions
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'UPDATE_SETTING'; payload: { key: keyof Settings; value: any } }
  | { type: 'RESET_SETTINGS' };
```

### 2. SettingsButton Component

**Location:** `src/renderer/components/MenuBar/SettingsButton.tsx`

**Props:** None

**Functionality:**
- Renders a gear icon button in the menu bar
- Opens settings modal on click
- Styled to match existing menu bar buttons

### 3. SettingsModal Component

**Location:** `src/renderer/components/Settings/SettingsModal.tsx`

**Props:**
```typescript
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Functionality:**
- Modal overlay with settings form
- Number input for seek interval (1-60 seconds)
- Save button (auto-saves on change)
- Reset to defaults button
- Close button (X icon)

### 4. useKeyboardControls Hook Update

**Location:** `src/renderer/hooks/useKeyboardControls.ts`

**Changes:**
- Read `seekInterval` from settings context
- Use configured value instead of hardcoded 5 seconds

## Data Models

### Settings Storage

**localStorage key:** `videoPlayer_settings`

**Default values:**
```typescript
const DEFAULT_SETTINGS: Settings = {
  seekInterval: 5
};
```

**Storage format:**
```json
{
  "seekInterval": 5
}
```

## Error Handling

### Validation
- Seek interval must be integer between 1-60
- Invalid values revert to previous valid value
- Show error toast for invalid inputs

### localStorage Errors
- If localStorage is unavailable, settings work in-memory only
- Show warning toast on first settings change
- Gracefully degrade to default values if load fails

## Testing Strategy

### Unit Tests (Optional)
- Settings reducer actions
- Settings validation logic
- localStorage save/load functions

### Integration Tests (Optional)
- Settings modal open/close
- Setting value updates context
- Keyboard controls use configured interval

### Manual Testing
1. Open settings modal
2. Change seek interval to 10 seconds
3. Close and reopen app
4. Verify setting persisted
5. Press arrow keys, verify 10-second seeks
6. Reset to defaults, verify 5-second seeks

## UI/UX Considerations

### Settings Button Placement
- Add to right side of menu bar
- Use gear icon (⚙️) for universal recognition
- Tooltip: "Settings"

### Modal Design
- Centered overlay with backdrop
- Clean, minimal design matching app theme
- Clear labels and input validation feedback
- Responsive layout

### Accessibility
- Keyboard navigation (Tab, Enter, Escape)
- Focus management (trap focus in modal)
- ARIA labels for screen readers
- Clear error messages

## Implementation Notes

1. Start with settings infrastructure (context, storage)
2. Add settings button to menu bar
3. Create settings modal component
4. Update keyboard controls to use settings
5. Add validation and error handling
6. Test persistence across sessions
