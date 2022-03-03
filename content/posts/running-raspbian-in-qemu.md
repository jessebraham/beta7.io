+++
title       = "Running Raspbian in QEMU"
date        = "2018-08-15"
description = "Emulate an ARM system using QEMU to run Raspbian on x86_64 hardware."
+++


> QEMU is a generic and open source machine emulator and virtualizer.  
> <cite>[https://www.qemu.org/](https://www.qemu.org/)</cite>

QEMU performs hardware virtualization, allowing users to run software compiled for any supported architecture. This allows us to emulate an ARM system (in this case, based roughly on the RaspberryPi 3) on an x86_64 machine, for example. This is incredibly handy, especially when developing for embedded devices, and can shave considerable time off of the development lifecycle.

There has been a fair bit written on this topic already, so I'm not going to waste any time here and will just outline the major steps without much explanation. This post is mostly just serving as a reminder to myself how to do this. If anything doesn't make sense, or you would like more details, consult the `qemu` and `qemu-system-arm` manpages, or the almighty internet.


# Install QEMU

First things first, let's install QEMU using our system's package manager. Specifically, the `qemu-system-arm` package if you're running a Debian-based system:

```bash
$ sudo apt update && sudo apt install -y qemu-system-arm
$ qemu-system-arm --version
QEMU emulator version 2.11.1(Debian 1:2.11+dfsg-1ubuntu7.4)
Copyright (c) 2003-2017 Fabrice Bellard and the QEMU Project developers
```

Additional architectures such as `-ppc`, `-mips`, and `-sparc` are available as well. Alternatively you can install the `qemu` metapackage from the apt repositories, which includes each system rather than exclusively `-arm`.


# Download the Required Files

With QEMU installed, we will create a working directory to keep our files contained. The location of this directory is not important. I will refer to this directory as `$PROJECT_DIR` henceforth. All commands are to be run from within this directory.

We will begin by downloading a pair of files:

- The QEMU kernel from [dhruvvyas90/qemu-rpi-kernel](https://github.com/dhruvvyas90/qemu-rpi-kernel/)
- The most recent Raspbian Lite image from the [official RaspberryPi website](https://raspberrypi.org/).

Once the downloads have completed, unzip the archive to expose the `.img` file.

```bash
$ wget https://github.com/dhruvvyas90/qemu-rpi-kernel/blob/master/kernel-qemu-4.4.34-jessie\?raw\=true -O kernel-qemu-4.4.34-jessie
# Produces: $PROJECT_DIR/kernel-qemu-4.4.34-jessie
$ wget https://downloads.raspberrypi.org/raspbian_lite/images/raspbian_lite-2018-06-29/2018-06-27-raspbian-stretch-lite.zip
# Produces: $PROJECT_DIR/2018-06-27-raspbian-stretch-lite.zip
$ unzip 2018-06-27-raspbian-stretch-lite.zip
# Produces: $PROJECT_DIR/2018-06-27-raspbian-stretch-lite.img
```


# Mount and Edit the Image

Now that we have the Raspbian `.img` file, we will determine the starting offset of its boot sector. We'll accomplish this using `fdisk`, piping to `tail` and `awk` to clean up the output:

```bash
$ fdisk -l 2018-06-27-raspbian-stretch-lite.img | tail -n1 | awk '{print $2}'
98304
```

Since sectors are 512 bytes in length, we will multiply the above value by 512 to give us the sector's offset in bytes.  

> `offset = (image start sector * 512B) = (98304 * 512B) = 50,331,648B`

Create a directory to mount the Raspbian image to. Provide the above calculated offset in bytes, and set the filesystem type to EXT4.

```bash
$ sudo mkdir /mnt/raspbian
$ sudo mount -v -o offset=50331648 -t ext4 2018-06-27-raspbian-stretch-lite.img /mnt/raspbian
```

With the image mounted, open `/etc/ld.so.preload` and comment out each line by adding a `#` to the beginning of it. Save and close the file, and unmount the image.

```bash
$ sudo vim /mnt/raspbian/etc/ld.so.preload
$ sudo umount /mnt/raspbian
```


# Run the Virtual Machine

Finally, we're able to run the virtual machine:

```bash
$ sudo qemu-system-arm -no-reboot \
    # set the machine, cpu and memory
    -machine versatilepb -cpu arm1176 -m 256 \
    # specify the kernel (4.9.XX-stretch doesn't work for whatever reason?)
    -kernel ./kernel-qemu-4.4.34-jessie \
    # provide the image file as a drive, and set the root partition
    -drive format=raw,file=2018-06-27-raspbian-stretch-lite.img \
    -append "root=/dev/sda2 panic=1 rootfstype=ext4 rw" \
    # configure serial
    -serial stdio \
    # configure virtual networking
    -net nic -net user -net tap,ifname=vnet0,script=no,downscript=no
```

After running the above command, you should be greeted with a small window displaying the Raspbian boot up process. You will be able to log in as usual using the default username/password, `pi` and `raspberry`, once the system has fully loaded.
