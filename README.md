<p align="center">
  <img src="./resources/logo.svg" width="256" height="256"/>
</p>
<h1 align="center">BloomRPC Extended</h1>

<p align="center">A GUI Client for gRPC services</p>

<p align="center">
  A maintained fork of the original <a href="https://github.com/uw-labs/bloomrpc">BloomRPC</a>, which was archived in Jan 2023.<br/>
  <b>BloomRPC Extended</b> aims to provide the simplest and most efficient developer experience for exploring and querying your gRPC services.
</p>

<img src="./resources/editor-preview.gif" />

## Features

- Native gRPC calls with unary, server streaming, client streaming, and bidirectional support
- gRPC-Web support
- Server reflection
- TLS / SSL support
- Import and manage .proto files
- Environment management
- Metadata editor
- Draggable tabs for multiple services

## What's New (vs. original BloomRPC)

- **Tab search/filter** — Quickly find tabs by method or service name
- **Tab grouping by service** — Color-coded dots on each tab, sorted by service name
- **Tab overflow menu** — Dropdown listing all open tabs with badge count
- **Close all tabs** — One-click button to close every open tab
- **Settings modal** — Toggle tab search, grouping, and overflow menu individually; settings persist across restarts

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)

### Development

```bash
# Install dependencies
bun install

# Start the app in development mode
bun run dev
```

### Build

```bash
# Build for production
bun run build

# Package the app
bun run package
```

## Credits

Originally created by [Fabrizio Fenoglio](https://github.com/fenos) at [UtilityWarehouse](https://github.com/uw-labs).

## License

LGPL-3.0-or-later
