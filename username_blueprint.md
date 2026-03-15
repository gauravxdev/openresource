# Technical Blueprint: Unique Username Feature

This blueprint illustrates the architecture and data flow for the unique username feature.

## 1. System Architecture & Data Flow

This flowchart shows the overall flow of data from the UI to the database when a user interacts with the username field.

```mermaid
flowchart TD
    %% Define styles
    classDef ui fill:#2563eb,stroke:#1e40af,stroke-width:2px,color:#fff
    classDef action fill:#059669,stroke:#047857,stroke-width:2px,color:#fff
    classDef db fill:#b91c1c,stroke:#991b1b,stroke-width:2px,color:#fff

    subgraph Frontend
        UI["Profile Form UI"]:::ui
        Debounce["useDebounce Hook"]:::ui
        State["Username State"]:::ui
    end

    subgraph Backend
        CheckAction["checkUsernameAvailability Action"]:::action
        UpdateAction["updateUsername Action"]:::action
        AuthSession["Session Validation"]:::action
    end

    subgraph Database
        PrismaUser["User Model (username)"]:::db
    end

    UI -->|"User Types Name"| Debounce
    Debounce -.->|"Triggers after pause"| CheckAction
    CheckAction --> AuthSession
    AuthSession -->|"Session Valid"| PrismaUser
    PrismaUser -->|"Result: Null or User"| CheckAction
    CheckAction -->|"Returns Success/Error"| State
    State -->|"Updates UI Feedback"| UI

    UI -->|"Clicks Save Profile"| UpdateAction
    UpdateAction --> AuthSession
    AuthSession -->|"Check Unique Again"| PrismaUser
    PrismaUser -->|"Update Record"| UpdateAction
    UpdateAction -->|"Return Status"| UI
```

---

## 2. Sequence Diagram: Real-Time Availability Check

This sequence diagram details the exact interactions that occur when a user types a new username to check if it's available.

```mermaid
sequenceDiagram
    actor User
    participant Browser as ProfileForm
    participant Action as ServerAction
    participant DB as PrismaDatabase

    User->>Browser: Types johndoe
    Note over Browser: Debounce starts
    Browser->>Browser: Keeps typing
    Note over Browser: Debounce resets
    User->>Browser: Stops typing
    Note over Browser: Debounce completes
    Browser->>Browser: Set isChecking = true
    
    Browser->>Action: checkUsernameAvailability
    activate Action
    
    Action->>Action: Validate Auth
    Action->>Action: Validate Format
    
    Action->>DB: Find unique username
    activate DB
    DB-->>Action: Returns null (Available)
    deactivate DB
    
    Action-->>Browser: Return available true
    deactivate Action
    
    Browser->>Browser: Set isChecking = false
    Browser->>Browser: Show Success UI
    
    User->>Browser: Clicks Save Profile
    Browser->>Action: updateUserProfile
    activate Action
    Action->>DB: Update user record
    DB-->>Action: Success
    Action-->>Browser: Return success true
    deactivate Action
    Browser->>User: Toast notification updates
```

---

## 3. Database Schema Changes

```mermaid
erDiagram
    USER ||--o{ SESSION : has
    USER ||--o{ ACCOUNT : owns
    USER {
        String id PK
        String email UK
        String password
        String name
        String username UK
        DateTime createdAt
        DateTime updatedAt
        String image
        String role
    }
```
