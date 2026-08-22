---
title: "Build with Podman"
sidebar_position: 5
description: "Build RDK BSP with a Podman container"
---

# Build with Podman

Podman is an alternative to Docker. It is daemonless and runs as a non-root user by default, providing better security. The build workflow is basically the same as Docker.

## Prerequisites

- Podman installed on the host machine
- BSP source code obtained (see [Set up the development environment](./01_environment_build.md))

## Installing Podman

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y podman
```

## Building Inside the Container

```bash
# Pull the build image
podman pull docker.io/ubuntu:22.04

# Start a container and mount the source root directory (rdk-gen)
podman run -it --name rdk-build \
  -v /path/to/rdk-gen:/workspace:Z \
  docker.io/ubuntu:22.04 /bin/bash

# Install dependencies and the cross-compilation toolchain inside the container
# (same as Docker, see Build with Docker)

# Build inside the container (in rootless mode, writing to /opt and mounts requires proper permissions)
cd /workspace
./pack_image.sh
```

:::tip :Z Label
Under SELinux, the mounted directory must add the `:Z` label, otherwise it cannot be accessed inside the container.
:::

## Differences from Docker

| Aspect | Docker | Podman |
| --- | --- | --- |
| Daemon | Requires dockerd | No daemon needed |
| Root privileges | Runs as root by default | Supports rootless |
| Command compatibility | `docker` | `podman` (alias docker=podman for compatibility) |
| Image format | OCI | OCI (compatible with Docker Hub) |

## Related Documentation

- [Set up the development environment](./01_environment_build.md)
- [Build with Docker](./04_docker_build.md)
- [BSP source directory structure](./02_bsp_source_layout.md)
