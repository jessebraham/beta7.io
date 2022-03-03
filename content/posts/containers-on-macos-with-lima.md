+++
title       = "Containers on macOS with Lima"
date        = "2021-10-08"
description = "Finding a suitable Docker replacement for macOS."
+++


Since Docker decided that [they do not want developers to use their product anymore](https://www.docker.com/blog/updating-product-subscriptions/), I've been forced to find a suitable replacement. I had received a number of recommendations for [podman](https://podman.io/), unfortunately at the time of writing it seems that local volumes are not well supported on macOS.

After a bit of searching around, I stumbled across [Lima](https://github.com/lima-vm/lima). Lima is sort of like [WSL](https://docs.microsoft.com/en-us/windows/wsl/about), but for macOS; it launches Linux virtual machines with support for file sharing, port forwarding, [containerd](https://containerd.io/), and more. More information on Lima can be found in [the README](https://github.com/lima-vm/lima/blob/master/README.md).

# Installation

Lima can be installed using [homebrew](https://brew.sh/):

```bash
$ brew install lima
```

Once installation has completed, we need to start Lima:

```bash
$ limactl start
```

Note that this process can take some time. If this command is being run for the first time, you will be asked if you are happy with the default or if you would like to change any settings at one point. Generally the default settings are fine, so you are safe to accept them and move forward.

Setting `alias docker="lima nerdctl"` in your `.bashrc` (or your preferred shell's equivalent) may help ease the transition.

# Configuration (optional)

One thing to note regarding the default settings: if you plan on writing to your home directory (ie. `~/`) or any subdirectories from containers via volumes you will need to modify the settings to allow this.

You can either change this setting during the setup process outlined above, or after installation and setup has completed.

If you change the settings after, remember to first stop the process with:

```bash
$ limactl stop
```

The configuration file can be found at `~/.lima/default/lima.yaml`.

Find the `- location "~"` entry and set its `writable` attribute to `true`. Once the configuration has been updated you can restart the Lima process with:

```bash
$ limactl start
```

# Running Containers

With Lima installed and configured, we can finally create containers! This is done with Lima's `nerdctl` subcommand, which is a drop-in replacement for the default Docker client. Containers can be created just as you normally would, just using the `lima nerdtl` command instead:

```bash
$ lima nerdctl run --rm -it -v $(pwd):/data python /bin/bash
```

# Wrapping Up

This post just scratches the surface of what is possible with Lima and `nerdctl`, but should get you back to being productive again.
