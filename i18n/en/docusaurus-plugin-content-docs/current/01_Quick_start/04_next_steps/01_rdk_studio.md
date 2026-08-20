---
sidebar_position: 1
title: "Using RDK Studio"
description: "Introduction and download of the RDK Studio integrated development environment"
---

# Using RDK Studio

**RDK Studio** is the integrated development environment (IDE) built by D-Robotics for RDK development boards. It provides one-stop development capabilities including code editing, remote compilation, debugging, model deployment, and performance profiling, so you don't need to manually set up a cross-compilation environment on the host machine.

## Download and Installation

:::warning Upgrade Notice
- To provide a richer and more convenient development experience, we have fully upgraded RDK Studio. The old version has been removed; please go to the [official download page](https://developer.d-robotics.cc/rdkstudio) to download the latest version.
- For a user guide to the new RDK Studio, see: [RDK Studio User Manual](https://developer.d-robotics.cc/rdk_studio_doc/category/1-product-intro)
:::

## Core Features

| Feature | Description |
| --- | --- |
| Remote development | Connect to the board over SSH; edit → compile → run → debug inside the IDE, with no manual scp needed |
| Model deployment | Visualized full workflow of model conversion → deployment → inference verification |
| Performance profiling | Runtime metric monitoring such as BPU/CPU load, memory usage, and frame rate |
| Demo management | Built-in management of RDK sample projects; run [algorithm demos](/Demos/algorithm_demo/summary) with one click |

## Comparison with Manually Setting Up a Development Environment

| Aspect | RDK Studio | Manual setup ([5.1.1](/Advanced_development/environment_build/environment_build)) |
| --- | --- | --- |
| Installation | Just download the installer | Install toolchain + dependencies |
| Compilation | One click inside the IDE | Command line mk_*.sh |
| Debugging | Graphical debugger | gdb / printf |

## Related Documentation

- [Using TogetheROS.Bot](./02_trosb.md)
- [Development Environment and Compilation](/Advanced_development/environment_build/environment_build)
- [Algorithm Toolchain Development Guide](/Advanced_development/algorithm_toolchain)
