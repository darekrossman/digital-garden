# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js-based portfolio website for Darek Rossman, featuring dynamic text generation and 3D wireframe visualizations with glitch effects. The portfolio displays creative text blocks that regenerate with variations and includes 3D wireframe objects (cubes and spheres) that add visual interest with controlled randomization.

## Development Commands

```bash
# Install dependencies
npm install

# Generate Panda CSS
npm run prepare

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Rendering**: React 19
- **Styling**: Panda CSS
- **3D Graphics**: Three.js / Three-WebGPU
- **Text Generation**: Meta Llama 3.1 (via OpenAI-compatible Hugging Face API)
- **AI SDK**: AI and OpenAI SDK
- **Animation**: Motion
- **Control Panel**: Leva
- **Markdown**: React Markdown
- **Linting**: Biome

## Core Components

### Text Generation

- `LLMBlock` (components/LLMBlock.tsx): Renders AI-generated text with transition effects and glitch animations
- `llm-canvas.tsx` (components/llm-canvas.tsx): Component for streaming AI-generated text with transition effects
- `inference.ts` (lib/inference.ts): Server action for generating text using Meta Llama 3.1 model via Hugging Face
- `Markdown` (components/markdown.tsx): Custom markdown renderer with randomized styling

### Visual Effects

- `WireframeCube` (components/WireframeCube.tsx): Renders a 3D cube wireframe with glitch effects
- `WireframeSphere` (components/WireframeSphere.tsx): Renders a 3D sphere wireframe with glitch effects
- `Scrambler` (components/scrambler.tsx): Text effect component for creating character scrambling animations

### Configuration and Controls

- `config.ts` (lib/config.ts): Central configuration for all default parameters and options
- `ControlPanel` (components/ControlPanel.tsx): UI component wrapping Leva controls
- `usePageControls` (lib/hooks/usePageControls.ts): Custom hook for managing control panel state

### Main Page

- `Home` (app/page.tsx): Combines all components, manages state, and handles regeneration of content
- `layout.tsx` (app/layout.tsx): Root layout component with font configuration and metadata

### Utilities

- `blockUtils.ts` (lib/blockUtils.ts): Utilities for block generation and manipulation
- `wireframeUtils.ts` (lib/wireframeUtils.ts): Utilities for wireframe generation and styling
- `helpers.ts` (lib/helpers.ts): Shared utility functions for randomization and timing
- `constants.ts` (lib/constants.ts): Default text content and configuration constants
- `promptUtils.ts` (lib/promptUtils.ts): Utilities for building AI prompt templates

### Type Definitions

- `types/index.ts`: Contains type definitions for the application:
  - `BlockStyle`: Type for styling and positioning text blocks
  - `WireframeStyle`: Type for 3D wireframe object properties
  - `ControlValues`: Interface for Leva control panel values

## Key Features

1. **Dynamic Text Generation**: Uses Llama 3.1 to create variations of text with creative formatting
2. **3D Wireframe Objects**: Renders cubes and spheres with configurable glitch effects
3. **Controlled Randomization**: Uses parametric control for randomizing visual elements
4. **Interactive Controls**: Leva panel for adjusting regeneration timing, glitch intensity, and other visual parameters
5. **Glitch Effects**: Both text and 3D elements have built-in randomized glitch effects for visual interest
6. **Centralized Configuration**: All parameters and defaults are managed in a central configuration system
7. **Type-Safe Controls**: Full TypeScript integration for parameters, styles, and control values
8. **Text Scrambling**: Character-level animation effects for creating dynamic text transformations
9. **Responsive Layout**: Adapts to different screen sizes while maintaining visual appeal

## Architecture Notes

- The application uses a client-side approach with React hooks for state management
- Text generation occurs via server actions using the AI SDK with OpenAI-compatible API
- 3D rendering is handled with Three.js components that manage their own animation loops
- Random effects are controlled through the `helpers.ts` utility which provides different distribution patterns
- All application defaults and parameters are centralized in `config.ts` as a single source of truth
- State synchronization between UI controls and component state uses a custom hook pattern
- The configuration system allows for:
  - Consistent defaults across components
  - Type-safe parameter access
  - Centralized parameter management
  - Easy theming and customization
  - Clear separation between configuration and UI
- Block regeneration is handled through a stateful approach with controlled intervals
- Wireframe objects use a shared styling system with randomized placement

## File Structure

```
├── app/                # Next.js App Router components
│   ├── layout.tsx      # Root layout with metadata
│   └── page.tsx        # Home page component
├── components/         # React components
│   ├── ControlPanel.tsx       # Leva control panel wrapper
│   ├── LLMBlock.tsx           # Text block with AI generation
│   ├── WireframeCube.tsx      # 3D cube visualization
│   ├── WireframeSphere.tsx    # 3D sphere visualization
│   ├── llm-canvas.tsx         # AI text streaming component
│   ├── markdown.tsx           # Markdown renderer
│   └── scrambler.tsx          # Text scrambling effect
├── lib/                # Utilities and logic
│   ├── blockUtils.ts          # Block generation utilities
│   ├── config.ts              # Centralized configuration
│   ├── constants.ts           # Static content and constants
│   ├── helpers.ts             # Shared utility functions
│   ├── hooks/                 # Custom React hooks
│   │   └── usePageControls.ts # Control panel state hook
│   ├── inference.ts           # AI text generation
│   ├── promptUtils.ts         # AI prompt utilities
│   └── wireframeUtils.ts      # 3D wireframe utilities
└── types/              # TypeScript type definitions
    └── index.ts        # Shared type interfaces
```

## Environment Variables

- `HUGGINGFACE_TOKEN`: API token for accessing Hugging Face's API (used for text generation)

## Workflow Memories

- always update CLAUDE.md with relevant changes after completing work