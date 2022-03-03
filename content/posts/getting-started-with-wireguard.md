+++
title       = "Getting Started With Wireguard"
date        = "2018-12-31"
description = "Creating a simple and performant self-hosted VPN using Wireguard."
+++


[Wireguard](https://www.wireguard.com/) is a modern VPN; it aims to be much simpler than existing VPN solutions, while also being lightweight, secure, and performant. Wireguard is still under development, however it is fairly stable at this point and I figured it was finally time to give it a try.

Wireguard establishes VPN connections by exchanging public keys, much in the same way an SSH connection is created. It uses fancy state-of-the-art cryptographic protocols that you can read more about on their website. Most importantly, once you wrap your head around how Wireguard works, it's incredibly easy to use.


# Table of Contents

* [Installing Wireguard](#installing-wireguard)
* [Generating Public and Private Keys](#generating-public-and-private-keys)
* [Server Setup](#server-setup)
* [Client Setup](#client-setup)
* [Wrapping Up](#wrapping-up)


# Installing Wireguard

This post will assume that our systems are all running Ubuntu. To use our package manager, add the `wireguard/wireguard` PPA and install the `wireguard` package:

```bash
$ sudo add-apt-repository ppa:wireguard/wireguard
$ sudo apt update
$ sudo apt install wireguard
```

If you are not using Ubuntu, there are distribution packages for a number of operating systems documented on [the official Wireguard website](https://www.wireguard.com/install/).


# Generating Public and Private Keys

With the `wireguard` package installed, the `wg` command-line utility becomes available. This tool allows us to generate public and private keys for authenticating our network. Keys will need to be generated on **all** servers and clients.

Below, we generate the required keys and store them in their own respective files. I like to keep my key files in `/etc/wireguard` just to keep them in a common location across all systems, but you are able to store these files wherever you please (or not at all).

```bash
$ umask 077
$ sudo wg genkey | tee privatekey | wg pubkey > publickey
$ sudo mv {public,private}key /etc/wireguard/
```

If you generate your keys ahead of time it's important to keep track of them, as we will be needing them throughout the configuration process.


# Server Setup

We will now begin configuring the server. This involves installing Wireguard, as documented above, as well as configuring our network and making a few tweaks on our server.

At this point, you should already have Wireguard installed (ensure the `wg` utility is available), and have generated public and private keys on your server. If you have not done so already, please make sure these steps have been completed prior to continuing.

We will create a configuration file to define our virtual network. Create the file `/etc/wireguard/wg0.conf` (where **wg0** is the name of our interface) and open it in a text editor, populating it with the following:

```
[Interface]
Address = 10.10.0.1/24
ListenPort = 51820
PrivateKey = <Your Server's Private Key>
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
SaveConfig = true
```

* **Address** defines the local IP address to assign our server on the `wg0` interface, which in this case is `10.10.0.1`, while **ListenPort** sets the UDP port in which to listen on (with `51820` being the default).  
* **PrivateKey** should be set to the value produced and stored in the `/etc/wireguard/privatekey` file created above.  
* **PostUp** and **PostDown** run when the `wg0` interface is brought up and down respectively. **PostUp** allows all clients to share the server's IP addresses, with **PostDown** clearing the rules, which helps keep the tables tidy.  
* **SaveConfig** ensures that anything added while the tunnel is active, such as a newly added client-to-server configuration file, is saved.

Next, we need to make sure our host server allows forwarding traffic from clients to the Internet. This can be enabled in the `/etc/sysctl.conf` file; open it in a text editor and uncomment the following two lines:

```
net.ipv4.ip_forward = 1
net.ipv6.conf.all.forwarding = 1
```

And then reload the configuration by running:

```bash
$ sudo sysctl -p
```

Last, we'll create a firewall rule to allow UDP traffic on the above configured port, verifying the configuration after reloading it:

```bash
$ ufw allow 51820/udp
$ ufw reload
$ ufw status verbose
```

With our VPN server configured, it's time to bring up the interface using the `wg-quick` utility. We will also enable the `wg0` interface by default on boot while we're at it.

```bash
$ sudo wg-quick up wg0
$ sudo systemctl enable wg-quick@wg0
```

And with that, we can verify the network has been created and that the `wg0` interface exists and has an IP address assigned.

```bash
$ sudo wg show
$ ifconfig wg0
```


# Client Setup

With our server configured and accessible to the outside world, we'll configure our first client. Again, it is assumed you are running Ubuntu, however the steps should not differ in any drastic way as far as I know. It is assumed Wireguard is installed, and that public and private keys have been generated on the client system.

We will create another configuration file for our `wg0` interface, this time on the client system. Create the file `/etc.wireguard/wg0.conf` and open it in a text editor:

```
[Interface]
PrivateKey = <Your Client's Private Key>
Address = 10.10.0.2

[Peer]
PublicKey = <Your Server's Public Key>
Endpoint = <Your Server's IP or Hostname>:<Your Server's ListenPort>
AllowedIPs = 0.0.0.0/0, ::/0
```

Here we specify our client's private key and IP address. Since we configured our server to have the address `10.10.0.1`, we set our client's address to `10.10.0.2`.

In addition to the `[Interface]` section, which you should recognize from configuring our server, we also have a new `[Peer]` section. This section tells our client which server to communicate with, and provides the server's public key for authentication purposes. For the `Endpoint` we specify an IP address or hostname along with the configured port, ie.) `example.com:51820`.

Now that we have configured our client, it's time to add the client to the server's list of peers. This is done by running the following command **on the server**:

```bash
$ sudo wg set wg0 peer <Your Client's Public Key> allowed-ips <Your Client's IP Address>
```

Switching back to our client machine, we can finally bring up the `wg0` interface:

```bash
$ sudo wg-quick up wg0
```

With the `wg0` interface up, we can verify that we are connected and have an IP.

```bash
$ sudo wg
# Last two lines of output should be similar to the following
  latest handshake: 4 seconds ago
  transfer: 1.31 KiB received, 5.27 KiB sent
$ ifconfig wg0
$ ping 10.10.0.1
```

The `wg0` interface can be brought up and down at any time by running `sudo wg-quick up wg0` and `sudo wg-quick down wg0` respectively; you should notice your public IP changing with the status of the interface.


# Wrapping Up

As you can see, Wireguard is incredibly simple to set up, taking only a few minutes. Once clients have been connected, it is easy to bring the VPN tunnel up or down, and roaming between connections and public addresses is not a problem, being handled automatically by Wireguard.

The above configuration is very basic and can be improved upon in a number of ways. For example, I am essentially ignoring the existence of IPv6 here; this can be configured as well, and is documented on the Wireguard website.

I am looking forward to the continued development of Wireguard, and will be playing with their new [Wireguard App](https://git.zx2c4.com/wireguard-ios/about/) for iOS in the new future as well.
