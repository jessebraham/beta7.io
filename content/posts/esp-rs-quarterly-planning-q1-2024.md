+++
title       = "esp-rs Quarterly Planning: Q1 2024"
date        = "2024-01-04"
description = "A brief summary of the organizations plans for the upcoming quarter."
+++

The members of the [esp-rs organization] and the greater community have concluded our quarterly planning meeting for Q1 2024. Below you will find a brief summary of our plans for the coming months. Please note that these are only plans, there are no hard deadlines for any of these tasks, and they may slip to the next quarter if required.

You can check the [Planning: Q4.2023 project] on GitHub to follow the progress of this quarter's tasks.

Retrospective posts on progress made in previous quarters can be found on [Scott Mabin's blog].

[esp-rs organization]: https://github.com/esp-rs/
[planning: q4.2023 project]: https://github.com/orgs/esp-rs/projects/2/views/17
[scott mabin's blog]: https://mabez.dev/blog/posts/

## High-Priority Tasks

### [esp-hal]

We are anticipating delivery of ESP32-P4 devkits some time this quarter, and as such intend to begin adding support for this device to [esp-hal] and the surrounding ecosystem of libraries and tools.

A PAC has already been created for this device, and preliminary support has been added to some libraries and tooling. Once hardware is available, we can confirm these changes are correct and publish new releases.

**Tracking issue:** [Add support for the ESP32-P4 (#643)]

[esp-hal]: https://github.com/esp-rs/esp-hal
[Add support for the ESP32-P4 (#643)]: https://github.com/esp-rs/esp-hal/issues/643

<br />

**Note:** This issue has been carried forward from last quarter.

Hardware-in-loop testing is in-progress. There have been various developments in the embedded testing space as of late, so this has gone through a few iterations and required various updates.

At this point in time, our plan is to use [embedded-test], which in turn uses [probe-rs] as the test runner. This currently only supports the RISC-V devices, however once Xtensa support has been added to [probe-rs] (read below) we can run tests for these devices as well.

A proof-of-concept has already been put together for this, and a basic GPIO test can be run locally on hardware. All that's left to figure out is the CI workflow and runner infrastructure, and then writing various integration tests.

**Tracking issue:** [Set up hardware-in-loop testing (#809)]

[embedded-test]: https://github.com/probe-rs/embedded-test
[probe-rs]: https://github.com/probe-rs/probe-rs
[Set up hardware-in-loop testing (#809)]: https://github.com/esp-rs/esp-hal/issues/809

<br />

Light-/deep-sleep support for the ESP32-C6 is already underway, with limited support already merged into the `main` branch of [esp-hal].

Additional wake-up sources still need to be implemented, and various system state save/restore functionality is still required for light-sleep. We will continue implementing this functionality until sleep support is in a generally usable state.

**Tracking issue:** [Light-/deep-sleep support for ESP32-C6 (#1028)]

[Light-/deep-sleep support for ESP32-C6 (#1028)]: https://github.com/esp-rs/esp-hal/issues/1028

### [espflash]

**Note:** This issue has been carried forward from last quarter.

As discussed in the previous quarter's post, automated testing on hardware gives us some peace of mind as we continue to support more devices and functionality. Testing manually is tedious and error-prone, so this will help us avoid bugs and regressions (we hope!).

Work is underway on this, and some simple proof-of-concept tests are already working. Some minor details still need finalizing, but this should hopefully be completed quite early in the quarter.

**Tracking issue:** [Set up automated testing on hardware (#439)]

[espflash]: https://github.com/esp-rs/espflash
[Set up automated testing on hardware (#439)]: https://github.com/esp-rs/espflash/issues/439

## Medium-Priority Tasks

### [probe-rs]

While many of us have happily been using [probe-rs] with the RISC-V chips, it does _not_ currently support Xtensa.

Due to recent work done on this project, however, Xtensa support is well underway! We plan to continue working on this functionality, and hope to bring it to feature-parity with RISC-V in the coming weeks and months.

**Tracking issue:** [Xtensa architecture tracking issue (#2001)]

[Xtensa architecture tracking issue (#2001)]: https://github.com/probe-rs/probe-rs/issues/2001

## Low-Priority Tasks

### [esp-hal]

Since light-/deep-sleep support is well underway for the ESP32-C6 already, and this device shares many similarities with the ESP32-H2, we're hopeful that we will be able to reuse plenty of the existing code and add support for the ESP32-H2 with much less effort.

This work depends on "full" support being implemented for the ESP32-C6, so is considered lower priority.

**Tracking issue:** [Light-/deep-sleep support for ESP32-H2 (#1029)]

[Light-/deep-sleep support for ESP32-H2 (#1029)]: https://github.com/esp-rs/esp-hal/issues/1029

<br />

We recently have begun working on HALs for the low-power RISC-V core found in the ESP32-C6. This currently has quite limited peripheral support, however basic delays and GPIO functionality have been implemented.

We hope to implement support for the `LP_UART` and `LP_I2C` peripherals this quarter. Once this work is complete, the low-power core should be usable for real-world applications.

**Tracking issue:** [Implement remaining peripheral drivers for `esp32c6-lp-hal` (#1030)]

[Implement remaining peripheral drivers for `esp32c6-lp-hal` (#1030)]: https://github.com/esp-rs/esp-hal/issues/1030
