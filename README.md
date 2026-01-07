# React Visualized

This project aims to be a deep-dive visualization tool for understanding React internals. It goes beyond simple API usage to show how React works under the hood, including:

- **Memory Management**: Visualizing the Call Stack and Heap during component execution.
- **Hooks Implementation**: How hooks are stored in memory (linked lists) and how they persist state.
- **Fiber Architecture**: Visualizing the Fiber tree, reconciliation, and the work loop.
- **Execution Flow**: Step-by-step execution of the React internal logic.

## Architecture

The project consists of two main parts:

1.  **The Simulation Engine (`src/engine`)**:
    - A custom, minimal implementation of React (compatible with a subset of React API).
    - Instrumented to emit detailed trace events (e.g., `FUNCTION_CALL`, `HOOK_MOUNT`, `FIBER_UPDATE`).
    - Runs in the browser main thread or a worker.

2.  **The Visualizer (`src/visualizer`)**:
    - Consumes the trace events from the engine.
    - Renders the internal state using:
        - **React Flow**: For the Fiber tree and dependency graphs.
        - **Memory View**: For Stack/Heap visualization.
        - **Code Editor**: To show and edit the source code being simulated.

## Tech Stack

- **Framework**: Vite + React + TypeScript
- **State Management**: Zustand
- **Visualization**: React Flow (@xyflow/react), Framer Motion
- **Editor**: Monaco Editor

## Getting Started

1.  `npm install`
2.  `npm run dev`
