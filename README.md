# Collaborative Sketchpad: A Multiplayer Drawing Game

## Overview

This is a collaborative sketchpad, developed using socket.io, HTML, CSS, and JavaScript. It allows users to connect with others via unique room codes, create and share real-time sketches, and save their creations either in the shared workspace or locally.

![Game Screenshot](./assets/game-screenshot.png)

## Credits

Base code provided by Craig @cdev010
![Banana](./public/icons/icons8-banana-48.png)

## Features

- **Collaborative Workspace**: Create and share real-time sketches with others.
- **Multiplayer Support**: Connect with others via unique room codes.
- **Real-time Updates**: Workspace status and sketches update in real-time.
- **Local Storage**: Sketches are saved locally and can be accessed anytime.

## How It Works

- Users join a workspace using a unique code.
- Real-time sketching allows for collaborative work.
- Sketches are saved locally and linked to your socket.io connection.

### Workspace Initialization

- Connect to the workspace using a unique code.
- Workspace status updates for all users.

### Workspace Interaction

- Join or leave using a unique code.
- User names are displayed in a list.
- Sketches are saved in local storage and can be accessed anytime.

### Drawing Tools

- Users can select from a variety of colors and stroke sizes.
- Users can clear the canvas at any time.

### Saving and Loading Sketches

- Sketches are automatically saved locally in real-time.
- Users can load their saved sketches anytime.

## Tech Stack

- Socket.io
- JavaScript
- HTML/CSS
- ![Banana](./public/icons/icons8-banana-48.png)

## Installation

1. Clone the repository.
2. Run `npm install`.
3. Run `npm start`.

## Usage

Open `localhost:3000` in your browser and follow the on-screen instructions.

## Contributing

Feel free to submit issues or pull requests.

## License

MIT
