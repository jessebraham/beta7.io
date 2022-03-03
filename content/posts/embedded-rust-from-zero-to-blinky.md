+++
title       = "Embedded Rust: From Zero to Blinky"
date        = "2019-01-22"
description = "Getting acquainted with embedded development using Rust."
+++


[Rust](http://rust-lang.org/) is showing great promise in the embedded world, and offers many benefits (like memory safety!). In this post, we will walk through developing a basic application for an STM32 microcontroller. I developed this using a [NUCLEO-F091RC](https://www.st.com/en/evaluation-tools/nucleo-f091rc.html) development board, but it should be easily adaptable to most STM32 devices.

# Table of Contents

- [Toolchain Setup](#toolchain-setup)  
- [A Simple Application](#a-simple-application)  
- [Compilation & Flashing](#compilation-flashing)  
- [Wrapping Up](#wrapping-up)  


# Toolchain Setup

We need to make sure that we have an up-to-date version of Rust installed. If you do not have Rust installed, please refer to the [official documentation](https://www.rust-lang.org/tools/install) for installation instructions.

At the time of writing I am using version `1.32.0` from the *stable* release channel; it is my understanding that *stable* versions prior to `1.30.0` will not work, however some *beta* or *nightly* releases may. To avoid problems it's recommended to use the most recent version of Rust available to you.

```bash
$ rustup default stable
$ rustup update
$ rustc --version
rustc 1.32.0 (9fda7c223 2019-01-16)
```

With Rust installed and up to date, we need to add support for our required compilation target, which differs depending on the type of microcontroller in use. Refer to the below table to determine the suitable target for your application:

| Target                  | Series                 | FPU     |
|:------------------------|:-----------------------|:--------|
| `thumbv6m-none-eabi`    | Cortex-M0, Cortex-M0+  | No      |
| `thumbv7m-none-eabi`    | Cortex-M3              | No      |
| `thumbv7em-none-eabi`   | Cortex-M4, Cortex-M7   | No      |
| `thumbv7em-none-eabihf` | Cortex-M4F, Cortex-M7F | **Yes** |

Since I am using a Cortex-M0 device in this case, I chose the `thumbv6m-none-eabi` instruction set for the compilation target:

```bash
$ rustup target add thumbv6m-none-eabi
```

While not critical, I also recommend installing the `cargo-generate` and `cargo-binutils` packages. They provide some helpful tools to get up and running quickly with new projects, and to simplify debugging. They can (optionally) be installed by running the following:

```bash
$ cargo install cargo-generate cargo-binutils
$ rustup component add llvm-tools-preview  # for cargo-binutils
```

With both Rust and Cargo installed and configured, it's time to install the last of the prerequisites: [OpenOCD](http://openocd.org/) and [GDB](https://www.gnu.org/software/gdb/). These tools will be used for flashing and debugging the embedded device. This is not a guide on OpenOCD or GDB, so if you are unfamiliar with either it would be worth doing a bit of reading prior to continuing; both are mature tools with plenty of information available.

Depending on your Operating System, there may be multiple versions of GDB available; just ensure it's compatible with ARM. On Ubuntu 18.04 you can use the `gdb-multiarch` package:

```bash
$ sudo apt update
$ sudo apt install -y openocd gdb-multiarch
```


# A Simple Application

With the prerequisites installed, we can finally move on to the application itself. As is tradition, we will blink an LED.

With more complicated projects it may be beneficial to generate the project skeleton using the `cargo-generate` command and one of many available templates, such as [cortex-m-quickstart](https://github.com/rust-embedded/cortex-m-quickstart). However, since our application is so basic we will build it from scratch.

## Project Setup

There are a number of files that we need to create and populate prior to writing any code. Begin by generating the project using Cargo:

```bash
$ cargo new stm32f0-rust-blinky
$ cd stm32f0-rust-blinky/
```

We will next add a configuration file to the project to instruct Cargo to compile for the appropriate target by default. In the root of the project, create the directory `.cargo/`. Create and open `.cargo/config` in the editor of your choice, adding the following (substituting `runner` and/or `target` if necessary):

```toml
[target.thumbv6m-none-eabi]
runner = 'gdb-multiarch'
rustflags = [
  "-C", "link-arg=-Tlink.x",
]

[build]
target = "thumbv6m-none-eabi"
```

Since different devices have varying amounts of Flash and RAM, we need to define a linker file to reflect such; its values will need to be updated according to the values in the datasheet of your specific device (in the *Memory Mapping* section), however I have included safe lower-bounds below which *should* work on most/all devices for the sake of this example. Note that using this linker file on a device with more available Flash and/or RAM will render that memory unusable by the application.

Create the file `memory.x` in the root of your project, and populate it with the following, updating the `ORIGIN` and `LENGTH` fields if required:

```
MEMORY
{
  /* NOTE K = KiBi = 1024 bytes */
  FLASH : ORIGIN = 0x08000000, LENGTH = 16K
  RAM   : ORIGIN = 0x20000000, LENGTH = 4K
}

/* NOTE: Do *NOT* modify `_stack_start` unless you know what you are doing. */
_stack_start = ORIGIN(RAM) + LENGTH(RAM);
```

Last, we'll update `Cargo.toml`; open it in a text editor and add the prerequisite crates under `[dependencies]`. If you are not using an STM32F0 series device, change the the `stm32f0xx-hal` crate to the appropriate alternative. If you are using a different device make sure to update the `features` as well. We will additionally add some configuration for the `release` build profile at the end of the file.

```toml
[dependencies]
cortex-m = "0.5.8"
cortex-m-rt = "0.6.7"
panic-halt = "0.2.0"
stm32f0xx-hal =  { version = "0.12.0", features = ["stm32f091"]}

[profile.release]
debug = true
lto = true
opt-level = "s"
```

## Writing the Application

With all that boring stuff out of the way, we can finally get to some code! All source for this project will be contained within `src/main.rs`. At this point you can open `src/main.rs` and delete its contents, then add the following:

```rust
#![no_main]
#![no_std]

#[allow(unused)]
use panic_halt;

extern crate stm32f0xx_hal;
use stm32f0xx_hal::{delay::Delay, prelude::*, stm32};

use cortex_m::peripheral::Peripherals;
use cortex_m_rt::entry;

#[entry]
fn main() -> ! {
  // TODO: write me
}
```

Here we are using the `#![no_main]` and `#![no_std]` crate-level attributes to indcate that we won't use the standard `main` function interface, and to link to the *core* crate rather than the *std* crate. While not the entire picture, the [core](https://doc.rust-lang.org/core/) crate is essentially a platform-agnostic version of the *std* crate.

`panic_halt` provides a `panic_handler` that defines the panicking behavior of the program. The inclusion of this is merely to avoid needing to define our own handler. There are other handlers available as well if you'd prefer, such as `panic_abort` and `panic_semihosting`; choose whichever is most suitable for your application.

`stm32f0xx_hal` provides a hardware abstraction on top of the peripheral access API for the STM32F0 family of microcontrollers.

`cortex_m` provides generic low-level access to Cortex-M processors.

Our main function is marked with the `#[entry]` attribute from `cortex_m_rt`, which is used to mark the entry point of the application in the absence of the traditional `main` function.

With the skeleton of the application in place, we'll move on to actually doing something: blinking an LED. To accomplish this, we will utilize the `GPIO` and `Delay` peripherals. Let's update our `main` function:

```rust
#[entry]
fn main() -> ! {
    if let (Some(mut p), Some(cp)) = (stm32::Peripherals::take(), Peripherals::take()) {
        cortex_m::interrupt::free(move |cs| {
            // Configure clock to 8 MHz (i.e. the default) and freeze it
            let mut rcc = p.RCC.configure().sysclk(8.mhz()).freeze(&mut p.FLASH);

            // (Re-)configure PA1 as output
            let gpioa = p.GPIOA.split(&mut rcc);
            let mut led = gpioa.pa1.into_push_pull_output(cs);

            // Get delay provider
            let mut delay = Delay::new(cp.SYST, &rcc);

            // Toggle the LED roughly every second
            loop {
                led.toggle();
                delay.delay_ms(1_000_u16);
            }
        });
    }

    loop {
        continue;
    }
}
```

This should be pretty straight forward. We get a reference to both the low-level as well as the HAL peripherals, configure the GPIO pin and delay provider, and toggle the pin's state every 1000 milliseconds.


# Compilation & Flashing

At this point, you should be able to build the project. To do so, we simply run `cargo build --release` in the root project directory. Once the build has completed, you should see the newly created `target/` directory in the project root.

With a binary in hand, it's time to move our attention to flashing the device. To do this we will be using OpenOCD, which will require a configuration file to operate properly. We will also create a simple script for flashing the device while we're at it, because I can never remember which flags and options to use.

In the root of the project create the file `openocd.cfg` containing the following:

```
source [find interface/stlink-v2-1.cfg]
source [find target/stm32f0x.cfg]

init
flash probe 0
```

Note that the first source needs to be updated to reflect whichever programmer you are using. I am using an ST-LINK v2, so I have specified the `stlink-v2-1.cfg` file. On Ubuntu, these configuration files can be found in `/usr/share/openocd/scripts/interface`.

Next, create `flash_device.sh`:

```sh
#!/bin/sh

if (( $# != 1 )); then
    echo "Usage:"
    echo "$0 <filename of firmware in ELF format>"
    exit 1
fi

openocd -f openocd.cfg -c "program $1 verify reset exit"
```

With your programmer connected via USB, and your programmer connected to your device, make the `flash_device.sh` script executable and run it to flash the executable:

```bash
$ chmod a+x flash_device.sh
$ ./flash_device.sh target/thumbv6m-none-eabi/release/stm32f0-rust-blinky
```

This should finish very quickly, and upon completion your LED connected to `PA1` should be blinking.


# Wrapping Up

With that, we've successfully programmed a microcontroller using Rust. Sure, it's not very exciting, but it's a start. Depending on your device, there is currently varying levels of HAL support, but it's improving every day, so more complex applications are already possible.

The project built throughout this post can be found in the [stm32f0-rust-blinky](https://github.com/jessebraham/stm32f0-rust-blinky) repository.

For more information on embedded devlopment in Rust, check out the [Embedded Rust Documentation](https://docs.rust-embedded.org/), [Embedded Rust Book](https://rust-embedded.github.io/book/), and [Embedded Rust FAQ](https://docs.rust-embedded.org/faq.html).

More device crates for STM32 devices can be found in the [stm32-rs](https://github.com/stm32-rs) organization.
