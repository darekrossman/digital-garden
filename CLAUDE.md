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
- **Language**: TypeScript
- **Rendering**: React 19
- **Styling**: Panda CSS
- **3D Graphics**: Three.js
- **Text Generation**: Meta Llama 3.1 (via Hugging Face API)
- **Animation**: Motion
- **Control Panel**: Leva
- **Markdown**: React Markdown
- **Linting**: Biome

## Core Components

### Text Generation

- `LLMCanvas` (components/llm-canvas.tsx): Renders AI-generated text with transition effects
- `inference.ts` (lib/inference.ts): Server action for generating text using Meta Llama 3.1 model via Hugging Face
- `Markdown` (lib/markdown.tsx): Custom markdown renderer with randomized styling

### 3D Visualization

- `WireframeCube` (components/WireframeCube.tsx): Renders a 3D cube wireframe with glitch effects
- `WireframeSphere` (components/WireframeSphere.tsx): Renders a 3D sphere wireframe with glitch effects

### Main Page

- `Home` (app/page.tsx): Combines all components, manages state, and handles regeneration of content
- Uses Leva for interactive control panel to adjust visual parameters

## Key Features

1. **Dynamic Text Generation**: Uses Llama 3.1 to create variations of text with creative formatting
2. **3D Wireframe Objects**: Renders cubes and spheres with configurable glitch effects
3. **Controlled Randomization**: Uses parametric control for randomizing visual elements
4. **Interactive Controls**: Leva panel for adjusting regeneration timing, glitch intensity, and other visual parameters
5. **Glitch Effects**: Both text and 3D elements have built-in randomized glitch effects for visual interest

## Architecture Notes

- The application uses a client-side approach with React hooks for state management
- Text generation occurs via server actions using the AI SDK
- 3D rendering is handled with Three.js components that manage their own animation loops
- Random effects are controlled through the `helpers.ts` utility which provides different distribution patterns

## Environment Variables

- `HUGGINGFACE_TOKEN`: API token for accessing Hugging Face's API (used for text generation)