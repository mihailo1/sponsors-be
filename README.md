# Simple Deno App

This is a simple Deno application that starts an HTTP server and serves a React
app with a menu and three pages.

## Requirements

- [Deno](https://deno.land/) (version 1.14.0 or later)
- [Denon](https://deno.land/x/denon) (for live reloading)
- [Node.js](https://nodejs.org/) (for building the React app)

## Installation

You can install Deno using one of the following methods:

### Shell (Mac, Linux):

```sh
curl -fsSL https://deno.land/x/install/install.sh | sh
```

### Homebrew (Mac):

```sh
brew install deno
```

### PowerShell (Windows):

```sh
iwr https://deno.land/x/install/install.ps1 -useb | iex
```

You can install Denon using the following command:

```sh
deno install -qAf --unstable https://deno.land/x/denon/denon.ts
```

Make sure to add the installation path to your system's PATH:

```sh
export PATH="$HOME/.deno/bin:$PATH"
```

Then, reload your shell configuration:

```sh
source ~/.zshrc  # or source ~/.bashrc
```

## Setting Up the React Project

1. Navigate to the `react-app` directory:
   ```sh
   cd /Users/misha/Documents/reps.nosync/sponsors-app/react-app
   ```

2. Install the dependencies:
   ```sh
   yarn
   ```

3. Build the React app:
   ```sh
   yarn build
   ```

## Running the Server

Ensure the React app is built before starting the server. If not, run
`yarn build` in the `react-app` directory.

To start the server with live reloading, run the following command in your
terminal:

```sh
denon start
```

The server will be accessible at `http://localhost:8000/`.

## Troubleshooting

If you encounter the error `TypeError: server is not async iterable`, ensure
that you are using the correct method to handle requests. Update your
`server.ts` file to use `listenAndServe` instead of `serve`.

If you encounter the error `Module not found`, ensure that you have the correct
import paths in your `deps.ts` file.
