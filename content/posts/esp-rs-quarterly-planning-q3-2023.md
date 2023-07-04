+++
title       = "esp-rs Quarterly Planning: Q3 2023"
date        = "2023-07-05"
description = "A brief summary of the organizations plans for the upcoming quarter."
+++

The members of the [esp-rs organization] and the greater community have concluded our quarterly planning meeting for Q3 2023. Below you will find a brief summary of our plans for the coming months. Please note that these are only plans, there are no hard deadlines for any of these tasks, and they may slip to the next quarter if required.

You can check the [Planning: Q3.2023 project] on GitHub to follow the progress of this quarter's tasks.

Retrospective posts on progress made in previous quarters can be found on [Scott Mabin's blog].

[esp-rs organization]: https://github.com/esp-rs/
[planning: q3.2023 project]: https://github.com/orgs/esp-rs/projects/2/views/15
[scott mabin's blog]: https://mabez.dev/blog/posts/

## High-Priority Tasks

### [esp-pacs]

The [ESP32-P4] was announced earlier this year. Now that we have relatively good support for the ESP32-C6 and ESP32-H2 in [esp-hal], we will begin work on creating an [SVD file] and ultimately generating a **P**eripheral **A**ccess **C**rate (PAC) for this device.

Once completed, the SVD file will be available via the [espressif/svd] repository. Once we have an SVD file, the PAC should come shortly after and will be found in the [esp-rs/esp-pacs] repository.

**Tracking issue:** [Create a PAC for the ESP32-P4 (#81)]

[esp-pacs]: https://github.com/esp-rs/esp-pacs
[esp32-p4]: https://www.espressif.com/en/news/ESP32-P4
[svd file]: https://www.keil.com/pack/doc/CMSIS/SVD/html/index.html
[espressif/svd]: https://github.com/espressif/svd/
[esp-rs/esp-pacs]: https://github.com/esp-rs/esp-pacs/
[create a pac for the esp32-p4 (#81)]: https://github.com/esp-rs/esp-pacs/issues/81

### [esp-hal]

Now that the [esp-hal] project has built some momentum and is becoming more usable for real-world projects, we've decided that something needs to be done about the lack of documentation in this project. We've admittedly been neglecting this aspect of the project, and for this reason, a number of community members will begin documenting the HAL throughout this quarter.

Initially, the focus will be on providing module-level documentation for each peripheral driver, as this should give a general overview of how the peripheral works and what it is and isn't capable of. Once we have reasonable module-level documentation, we will shift focus to making improvements to type and function documentation as well.

**Tracking issue:** [Document all packages and peripherals (#29)]

[esp-hal]: https://github.com/esp-rs/esp-hal
[document all packages and peripherals (#29)]: https://github.com/esp-rs/esp-hal/issues/29

<br />

In addition to improving the documentation, we would like to add initial support for running applications on the various low-power cores. The ESP32-S2, ESP32-S3, and ESP32-C6 all have low-power RISC-V cores, so it would be great to be able to take advantage of these.

This functionality is already being worked on, and very early support has been merged into [esp-hal] already, so keep an eye on the tracking issue for  additional updates.

**Tracking issue:** [Add support for the RISC-V ULP (#377)]

[add support for the risc-v ulp (#377)]: https://github.com/esp-rs/esp-hal/issues/377

### [espflash]

After many months of work, the [2.0.0 release] of [espflash] has finally been released! To help us maintain compatibility with as many devices as possible and ensure no regressions sneak in, we plan on adding some hardware-in-loop testing to verify the functionality of [espflash].

These tests will likely run on a schedule, probably once per day, and will flash a known-good application image to a physical target device and confirm that said application is running on-device. Additional tests may be added in the future, but it's likely we'll start relatively simple and build from there.

**Tracking issue:** [Set up automated testing on hardware (#439)]

[2.0.0 release]: https://github.com/esp-rs/espflash/releases/tag/v2.0.0
[espflash]: https://github.com/esp-rs/espflash
[set up automated testing on hardware (#439)]: https://github.com/esp-rs/espflash/issues/439

## Medium-Priority Tasks

### [esp-hal]

While we have some level of `async` support in [esp-hal] already, this is limited to the peripherals and functionality covered by the traits defined in the [embedded-hal-async] package. While these traits covers the most common peripherals, there are many more available which are capable of asynchronous operation.

Over the next quarter, we will begin implementing asynchronous drivers for various peripherals which do _not_ have traits pre-defined for them in [embedded-hal-async]. This will likely start with the various cryptographic peripherals (AES, RSA, etc.), after which we will evaluate which peripheral drivers to work on next.

If there are certain peripherals for which you specifically would like to see async support added, please feel free to comment in the tracking issue for this task, as this will help us prioritize what to work on.

**Tracking issue:** [Implement async support for all applicable peripheral drivers (#361)]

[embedded-hal-async]: https://github.com/rust-embedded/embedded-hal/tree/master/embedded-hal-async
[implement async support for all applicable peripheral drivers (#361)]: https://github.com/esp-rs/esp-hal/issues/361

<br />

Given that we plan on adding support for the low-power coprocessors, it makes sense to also focus on support for the different sleep modes on the high-power cores. This will enable people to write firmware for battery-operated devices, for which low power consumption is a critical requirement.

There is, at the time of writing, an open [pull request] submitted by a community member which adds initial support for both light- and deep-sleep, for the ESP32 specifically. We hope to get this reviewed and merged in the coming weeks, then expand the API to support the other devices as well.

**Tracking issue:** [Implement support for light-/deep-sleep (#375)]

[pull request]: https://github.com/esp-rs/esp-hal/pull/574
[implement support for light-/deep-sleep (#375)]: https://github.com/esp-rs/esp-hal/issues/375

### [esp-wifi]

The [esp-wifi] library provides support for Bluetooth, ESP-NOW, and Wi-Fi across the full line of ESP32 devices. This library is still relatively young, however it has good support for the aforementioned features. We feel it has become usable enough to start building projects with, so we will work towards publishing our first release of this package.

We had hoped to accomplish this last quarter, however, we ended up being blocked on some unpublished dependencies. These packages have now been published, so we are actively preparing for a release of [esp-wifi] at the time of writing.

**Tracking issue:** [Release first version on crates.io (#154)]

[esp-wifi]: https://github.com/esp-rs/esp-wifi
[release first version on crates.io (#154)]: https://github.com/esp-rs/esp-wifi/issues/154

### [esp-flasher-stub]

Some time back we began work on the [esp-flasher-stub] project, with the hope of eventually replacing the stub used in tools such as [espflash], [esptool], and [esptool-js], which is written in C.

We initially made good progress on this project, however, it's always been a lower priority and as such it's fallen behind and been left to bitrot. We are actively working on updating this package and resolving all the breaking changes, then we plan to continue on with development.

To establish some sort of minimum viable product, we have decided to try using the new stub first in [esptool-js], as this project will be more tolerant of bugs and missing features. Once we have a reasonable level of confidence with the new stub, the next project to adopt it will likely be [espflash].

**Tracking issue:** [Initial release usable in other projects (e.g. esptool-js) (#17)]

[esp-flasher-stub]: https://github.com/esp-rs/esp-flasher-stub
[esptool]: https://github.com/espressif/esptool/
[esptool-js]: https://github.com/espressif/esptool-js
[initial release usable in other projects (e.g. esptool-js) (#17)]: https://github.com/esp-rs/esp-flasher-stub/issues/17

## Low-Priority Tasks

We have not identified any low-priority tasks which we would like to focus on this quarter.
