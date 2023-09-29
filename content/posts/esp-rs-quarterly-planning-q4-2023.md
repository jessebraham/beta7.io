+++
title       = "esp-rs Quarterly Planning: Q4 2023"
date        = "2023-09-29"
description = "A brief summary of the organizations plans for the upcoming quarter."
+++

The members of the [esp-rs organization] and the greater community have concluded our quarterly planning meeting for Q4 2023. Below you will find a brief summary of our plans for the coming months. Please note that these are only plans, there are no hard deadlines for any of these tasks, and they may slip to the next quarter if required.

You can check the [Planning: Q4.2023 project] on GitHub to follow the progress of this quarter's tasks.

Retrospective posts on progress made in previous quarters can be found on [Scott Mabin's blog].

[esp-rs organization]: https://github.com/esp-rs/
[planning: q4.2023 project]: https://github.com/orgs/esp-rs/projects/2/views/16
[scott mabin's blog]: https://mabez.dev/blog/posts/

## High-Priority Tasks

### [esp-pacs]

**Note:** This issue has been carried forward from last quarter.

The [ESP32-P4] was announced earlier this year. Now that we have relatively good support for the ESP32-C6 and ESP32-H2 in [esp-hal], we will work on creating an [SVD file] and ultimately generating a **P**eripheral **A**ccess **C**rate (PAC) for this device. Work on the SVD is already underway, with the majority of peripherals present within it.

Once completed, the SVD file will be available via the [espressif/svd] repository. Once we have an SVD file, the PAC should come shortly after and will be found in the [esp-rs/esp-pacs] repository.

**Tracking issue:** [Create a PAC for the ESP32-P4 (#81)]

[esp-pacs]: https://github.com/esp-rs/esp-pacs
[esp32-p4]: https://www.espressif.com/en/news/ESP32-P4
[svd file]: https://www.keil.com/pack/doc/CMSIS/SVD/html/index.html
[espressif/svd]: https://github.com/espressif/svd/
[esp-rs/esp-pacs]: https://github.com/esp-rs/esp-pacs/
[create a pac for the esp32-p4 (#81)]: https://github.com/esp-rs/esp-pacs/issues/81

### [esp-hal]

**Note:** This issue has been carried forward from last quarter.

We would like to add initial support for running applications on the various low-power cores. The ESP32-S2, ESP32-S3, and ESP32-C6 all have low-power RISC-V cores, so it would be great to be able to take advantage of these.

This functionality is already being worked on, and very early support has been merged into [esp-hal] already, so keep an eye on the tracking issue for additional updates. There is already preliminary support for the ESP32-C6 via [esp32c6-lp-hal], and we plan to start work on the ESP32-S2/S3 soon.

**Tracking issue:** [Add support for the RISC-V ULP (#377)]

[esp-hal]: https://github.com/esp-rs/esp-hal
[esp32c6-lp-hal]: https://github.com/esp-rs/esp-hal/tree/main/esp32c6-lp-hal
[add support for the risc-v ulp (#377)]: https://github.com/esp-rs/esp-hal/issues/377

<br />

We also would like to set up some automated testing for [espflash] using real hardware. It would be valuable to have an automated process in which we can verify the various features of the tool without the tedium of doing this manually.

We have some infrastructure in place for this already in the form of self-hosted GitHub runners which have various devices physically connected to them. We need to next design and implement the software side of this testing infrastructure.

**Tracking issue:** [Set up automated testing on hardware (#439)]

[espflash]: https://github.com/esp-rs/espflash
[Set up automated testing on hardware (#439)]: https://github.com/esp-rs/espflash/issues/439

## Medium-Priority Tasks

### [esp-hal]

**Note:** This issue has been carried forward from last quarter.

While we have some level of `async` support in [esp-hal] already, this is limited to the peripherals and functionality covered by the traits defined in the [embedded-hal-async] package. While these traits cover the most common peripherals, there are many more available which are capable of asynchronous operation.

Over the next quarter, we will continue implementing asynchronous drivers for various peripherals which do _not_ have traits pre-defined for them in [embedded-hal-async].

If there are certain peripherals for which you specifically would like to see async support added, please feel free to comment in the tracking issue for this task, as this will help us prioritize what to work on.

**Tracking issue:** [Implement async support for all applicable peripheral drivers (#361)]

[embedded-hal-async]: https://github.com/rust-embedded/embedded-hal/tree/master/embedded-hal-async
[implement async support for all applicable peripheral drivers (#361)]: https://github.com/esp-rs/esp-hal/issues/361

<br />

**Note:** This issue has been carried forward from last quarter.

Given that we plan on adding support for the low-power coprocessors, it makes sense to also focus on support for the different sleep modes on the high-power cores. This will enable people to write firmware for battery-operated devices, for which low power consumption is a critical requirement.

We, at the time of writing, support light- and deep-sleep modes for the ESP32 and ESP32-S3. Moving forward, the plans are to expand the API to support the other devices as well.

**Tracking issue:** [Implement support for light-/deep-sleep (#375)]

[pull request]: https://github.com/esp-rs/esp-hal/pull/574
[implement support for light-/deep-sleep (#375)]: https://github.com/esp-rs/esp-hal/issues/375

<br />

We would also like to (finally) get some hardware-in-loop testing going for the various HAL packages. As we continue to add support for additional devices and peripherals, testing becomes more difficult and regressions more likely.

We have some infrastructure in place for this already in the form of self-hosted GitHub runners which have various devices physically connected to them. We need to next design and implement the software side of this testing infrastructure.

**Tracking issue:** [Set up hardware-in-loop testing (#809)]

[Set up hardware-in-loop testing (#809)]: https://github.com/esp-rs/esp-hal/issues/809

### [esp-wifi]

**Note:** This issue has been carried forward from last quarter.

The [esp-wifi] library provides support for Bluetooth, ESP-NOW, and Wi-Fi across the full line of ESP32 devices. This library is still relatively young, however it has good support for the aforementioned features. We feel it has become usable enough to start building projects with, so we will work towards publishing our first release of this package.

We had hoped to accomplish this last quarter, however, we ended up being blocked on some unpublished dependencies. These packages have now been published, so we are actively preparing for a release of [esp-wifi] at the time of writing.

**Tracking issue:** [Release first version on crates.io (#154)]

[esp-wifi]: https://github.com/esp-rs/esp-wifi
[release first version on crates.io (#154)]: https://github.com/esp-rs/esp-wifi/issues/154

## Low-Priority Tasks

We have not identified any low-priority tasks which we would like to focus on this quarter.
