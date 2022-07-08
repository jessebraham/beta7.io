+++
title       = "Bare-Metal Rust on ESP32: A Brief Overview"
date        = "2022-07-08"
description = "A brief and general overview of the ecosystem surrounding bare-metal Rust on Espressif devices."
+++

For the last year, I have been working at Espressif to help enable first-class Rust support for their line of ESP32 devices. During this period I started the [esp-hal](https://github.com/esp-rs/esp-hal) project, which is a bare-metal, `no_std` Hardware Abstraction Layer (HAL) with support for the ESP32, ESP32-C3, ESP32-S2, and ESP32-S3; support for additional chips is planned as well. This project has now received contributions by a number of colleagues and community members, and we are slowly working towards publishing our first releases of each HAL crate.

This post will only be covering crates required for bare-metal development. If you are interested in developing for Espressif devices with access to the Rust Standard Library (`std`) you can instead check out the [esp-idf-hal](https://github.com/esp-rs/esp-idf-hal), [esp-idf-svc](https://github.com/esp-rs/esp-idf-svc), and [esp-idf-sys](https://github.com/esp-rs/esp-idf-sys) crates.

Below is a brief overview of some of the more important crates and tools required for bare-metal development on these devices. Future posts will dive deeper into actually developing applications. Most crates related to Rust on Espressif devices, both `std` and `no_std`, can be found in the [esp-rs](https://github.com/esp-rs) organization on GitHub.

# Rust

You will obviously need to have installed the [Rust programming language](https://rust-lang.org) and its associated build tool and package manager, Cargo, before you can do anything.

If you are targeting the ESP32-C3 (or any other RISC-V chip, if you're reading this in the future) then you are able to use the mainline Rust compiler.

If you are targeting the ESP32, ESP32-S2, or ESP32-S3 (in general, any Xtensa chip) then you will need to use our [Rust compiler fork](https://github.com/esp-rs/rust) for the time being. Pre-compiled artifacts and installation scripts are available in the [rust-build](https://github.com/esp-rs/rust-build) repository for Linux, macOS, and Windows.

# esp-pacs

The [esp-pacs](https://github.com/esp-rs/esp-pacs) repository contains [SVD files](https://www.keil.com/pack/doc/CMSIS/SVD/html/index.html) for each supported chip, along with any necessary patch files. SVDs are sourced from [espressif/svd](https://github.com/espressif/svd) and are patched as needed using [stm32-rs/svdtools](https://github.com/stm32-rs/svdtools). Patches are periodically upstreamed to the official SVDs.

This monorepo additionally contains an application in the `xtask` directory which handles patching SVDs, generating Peripheral Access Crates (PAC), and building the aforementioned crates. The PACs are generated using [rust-embedded/svd2rust](https://github.com/rust-embedded/svd2rust).

One PAC is generated for each supported chip, with each providing register- and field-level access to a given chip's peripherals. This package provides the lowest level of interaction we generally have with a device.

# esp-hal

The [esp-hal](https://github.com/esp-rs/esp-hal) repository contains packages providing HALs for each supported chip, as well as some additional packages which contain peripheral drivers common to all devices, as well as procmacros for accomplishing various things such as defining interrupt handlers and placing procedures in RAM. These HAL packages build on top of each chip's respective PAC, providing a higher-level interface for interacting with peripherals.

Each HAL implements the traits defined by [embedded-hal](https://github.com/rust-embedded/embedded-hal) which allows for interoperability with any drivers which also implement these traits. We have currently implemented all relevant stable traits, as well as a number which are defined in the upcoming `1.0.0` alpha release.

Though this project is still far from being production ready, it is more than usable for non-critical projects. Basic communication protocols have been implemented (`I2C`, `SPI`, `UART`) and additional peripheral drivers are available as well (with more being added all the time).

# esp-template

We provide a template for use with [cargo-generate](https://github.com/cargo-generate/cargo-generate) in the [esp-template](https://github.com/esp-rs/esp-template) repository. This allows you to generate all the files and configuration needed for a simple bare-metal application. Generating a project from this template is as simple as running:

```bash
$ cargo generate https://github.com/esp-rs/esp-template
```

&hellip; and then answering the prompts.

One of the prompts gives you the option of enabling support for [Visual Studio Code Remote Contains](https://code.visualstudio.com/docs/remote/containers), which allows you to encapsulate your entire development environment in a container and use this seamlessly from Visual Studio Code.

# esp-backtrace

As the name implies, [esp-backtrace](https://github.com/esp-rs/esp-backtrace) enables backtraces in `no_std` applications. It additionally provides a panic handler and exception handler, both behind features.

This crate makes debugging issues much easier, especially when compared to common solutions such as `panic-halt` which simply halt execution when something goes wrong.

# esp-alloc

A simple `no_std` allocator is provided in the [esp-alloc](https://github.com/esp-rs/esp-alloc) repository. This allocator is built on top of the [phil-opp/linked-list-allocator](https://github.com/phil-opp/linked-list-allocator) crate, which does most of the heavy lifting.

While it's often advisable to avoid allocations in such limited environments, there are scenarios when an allocator is still required and/or desirable.

# esp-println

[esp-println](https://github.com/esp-rs/esp-println) allows for printing over UART, USB Serial JTAG, or RTT without any required dependencies. This uses the ROM functions directlym rather than having to depend on a PAC and/or HAL for this functionality. The communication method to use can be selected using their respective features. This crate also provides `print!()` and `println!()` implementations which can be used as you normally would.

This crate is useful for building packages which need this functionality but do not want to pull in larger dependencies. A good example of this is [esp-backtrace](https://github.com/esp-rs/esp-backtrace).

# esp-wifi

While still incredibly experimental, [esp-wifi](https://github.com/esp-rs/esp-wifi) contains the groundwork for enabling `no_std` Bluetooth and Wi-Fi functionality. At the time of writing, this proof of concept only supports the ESP32 and the ESP32-C3, but support for additional chips is planned as well.

This unfortunately is not very usable yet, but keep an eye on the project to follow development! We hope to continue to make progress on this front over the coming months.

# Wrapping Up

In the roughly 9 months since development started on this front, we've made incredible progress! The ecosystem is becoming more viable with each passing week, and I'm very excited to see where things are in a few months time.

If you're interested in following development, I recommend following the [esp-rs](https://github.com/esp-rs) organization on GitHub and joining the [esp-rs Matrix channel](https://matrix.to/#/#esp-rs:matrix.org), where members both from Espressif and the community hang out.
