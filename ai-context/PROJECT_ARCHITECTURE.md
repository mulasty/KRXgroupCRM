# Project Architecture

This project is an immersive WebGL portfolio website.

The architecture separates responsibilities into layers:

UI Layer
React components and navigation.

Interaction Layer
Cursor system, hover detection, scroll input.

Scene Layer
WebGL scene objects and 3D mockups.

Effects Layer
Particles, shaders and lighting.

Data Layer
JSON datasets describing projects and visual effects.

Rendering Layer
Three.js and WebGL rendering pipeline.

Core systems are located in:

/systems
/three
/interactions
/animations
/shaders
/data

The SceneManager coordinates WebGL scenes and updates.