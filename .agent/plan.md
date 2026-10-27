# Project Plan

ZEXA AI - Android Offline Study Assistant. 
APP METADATA:
- App Name: ZEXA AI
- Tagline: "ZIMSEC Offline Study Assistant 📴 No data? No problem."
- Package: com.zexa.aioffline
- Min SDK: 26, Target SDK: 34
- Language: Kotlin
- UI Framework: XML + ViewBinding (NO Compose)
- Architecture: MVVM + Kotlin Coroutines/Flow
- State Management: SharedPreferences/DataStore for user settings, in-memory cache for knowledge pack

CORE FLOW:
1. First Launch: Show education level selector (O-Level / A-Level). Store selection.
2. After selection: Navigate to Main Activity with Bottom Navigation (3 tabs): AI CHAT, SUBJECTS, SETTINGS.
3. Offline features via llama-android and local JSON knowledge pack.

AI MODEL SYSTEM (QWEN 2.5 GGUF):
- RAM-based model choice: <3GB -> 0.5B, >=3GB -> 1.5B.
- Download progress bar.
- llama-android JitPack wrapper.

KNOWLEDGE PACK:
- zimsec_pack.json in assets.
- Keyword matching search.

UI: M3, energetic color scheme, full Edge-to-Edge.

## Project Brief

# ZEXA AI - Project Brief

ZEXA AI is a specialized offline study assistant tailored for the ZIMSEC curriculum. It provides high-quality educational support through a local AI tutor, ensuring students can study effectively without requiring an internet connection.

### Features
1.  **Offline AI Chat:** Interactive tutoring powered by Qwen 2.5 (GGUF) via `llama-android`, providing instant academic explanations and problem-solving help.
2.  **Subject Browsing:** A structured catalog of ZIMSEC subjects allowing students to navigate through localized educational content.
3.  **Education Level Selector:** A configuration tool that allows users to toggle between "Ordinary Level" and "Advanced Level" to filter relevant content and AI context.
4.  **Model & Data Management:** A dedicated settings area to manage local LLM files and update offline subject data packages.

### High-Level Technical Stack
*   **Language:** Kotlin
*   **UI Framework:** XML Layouts with ViewBinding for a performant and traditional View-based UI.
*   **Architecture:** MVVM (Model-View-ViewModel) to ensure a clean separation of concerns and reactive data flow.
*   **Navigation:** Android Navigation Component (Fragment-based) for managing the application's flow and back-stack.
*   **AI Inference:** `llama-android` (llama.cpp) for local execution of GGUF-formatted large language models.
*   **Concurrency:** Kotlin Coroutines for handling background AI inference and data loading without blocking the UI.
*   **UI Components:** Material Design 3 (M3) components for Android to maintain a modern, energetic aesthetic.

## Implementation Steps

### Task_1_UI_Foundation_Navigation: Configure the project for XML-based UI with ViewBinding and Navigation Component. Setup the M3 theme with Edge-to-Edge support. Implement the Education Level Selector as the start destination and the Main Activity with Bottom Navigation (Chat, Subjects, Settings).
- **Status:** IN_PROGRESS
- **Acceptance Criteria:**
  - ViewBinding is enabled and functional
  - Navigation graph with fragments for Selector, Chat, Subjects, and Settings is implemented
  - Level Selector successfully navigates to Main UI and stores user preference
  - Material 3 theme and Edge-to-Edge are applied
  - Project builds successfully
- **StartTime:** 2026-05-17 13:13:47 CAT

### Task_2_Knowledge_Pack_Subjects: Implement the Knowledge Pack system. Parse 'zimsec_pack.json' from assets and implement the Subjects tab UI using RecyclerView to browse localized ZIMSEC content based on the user's selected education level.
- **Status:** PENDING
- **Acceptance Criteria:**
  - zimsec_pack.json is correctly parsed into models
  - Subjects tab displays correct list for O-Level/A-Level
  - Search/Keyword matching is functional within the subjects list
  - Navigation to subject details works

### Task_3_Offline_AI_Chat_Integration: Integrate 'llama-android' via JitPack. Implement the ChatViewModel and ChatFragment. Include logic to select the appropriate Qwen 2.5 model (0.5B vs 1.5B) based on device RAM. Build the offline chat interface.
- **Status:** PENDING
- **Acceptance Criteria:**
  - llama-android dependency is integrated
  - RAM-based model selection logic is implemented
  - AI Chat fragment supports sending/receiving messages offline
  - Progress bar shown during model loading/inference setup

### Task_4_Settings_Assets_Final_Verify: Implement the Settings tab for model/data management. Create an adaptive app icon and finalize the vibrant Material 3 color scheme. Perform a final run and verify all requirements including stability and offline functionality.
- **Status:** PENDING
- **Acceptance Criteria:**
  - Settings tab allows toggling education level and viewing model status
  - Adaptive app icon is correctly implemented
  - Full Edge-to-Edge and M3 aesthetic confirmed
  - App does not crash and passes all functional tests
  - Final verification by critic_agent matches user requirements

