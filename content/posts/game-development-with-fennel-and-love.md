+++
title       = "Game Development with Fennel and LÖVE"
date        = "2020-02-20"
description = "Exploring 2D game development with some added Lispy-goodness."
+++


Game development is a topic that has always interested me, but I've never really devoted much time to it. I've made a few attempts in the past trying to jump in with both feet, using big engines like [Godot] or [Unity]. Unsurprisingly, I failed repeatedly, and each time I would move on to something else.

I decided to take another swing at the whole game development thing, instead this time I'd start with the basics and nothing more. No 3D, no procedural generation, no AI; just simple arcade-style games. I recently discovered [Fennel], and thought it'd be interesting to try and use it with the popular [LÖVE] framework for Lua. I've known about LÖVE for quite some time, but just wasn't interested enough in learning [Lua] to ever use it.

[Godot]: https://godotengine.org/
[Unity]: https://unity.com/

## Fennel

[Fennel] is a simple Lisp dialect which compiles to [Lua]. It aims to be expressive and easy to use while avoiding adding any overhead compared to [Lua]. Fennel is fully compatible with Lua, allowing us to make calls to Lua libraries from Fennel and vice versa. Plus, we get compile-time macros!

The [official tutorial] is a great resource which gives a brief and easily digestible introduction to the language and its core features. Once you've made it through the tutorial, the [reference] goes into more detail.

[Fennel]: https://fennel-lang.org/
[Lua]: https://www.lua.org/
[official tutorial]: https://fennel-lang.org/tutorial
[reference]: https://fennel-lang.org/reference

## LÖVE

[LÖVE] is a popular framework for making 2D games using Lua. It's free and open-source, and supports Windows, macOS, Linux, Android, and iOS.

More information is available at the [LÖVE wiki].

[LÖVE]: https://love2d.org/
[LÖVE wiki]: https://love2d.org/wiki/Main_Page

# First Steps

The first thing I set out to do was set up the minimal boilerplate for creating a LÖVE-compatible application using Fennel. After a bit of searching around, I stumbled upon [alexjgriffith/min-love2d-fennel] which is a much more evolved version of what I have set out to do. This is a great resource and I suggest taking a closer look at it. I will definitely be using this project as a reference in the future.

Within a few minutes I had a rough idea of what was required, so I set out to write some code. A minimal project might look something like this:

```
lib/
  fennel.lua
conf.lua
main.lua
wrap.fnl
```

Fennel is embeddable, which means we can download a single file, `fennel.lua`, and include it in our project. In the case of this example, the file is located in the `lib` directory.

`conf.lua` is run before the LÖVE modules are loaded, and is (unsurprisingly) used for configuration. Things such as the window height/width and title can be set here, among other things. More information is available in the [config file documentation]. Its contents might look something like this:

```lua
function love.conf(t)
    t.window.width = 640
    t.window.height = 400
    t.window.title = "Your Awesome Title"
end
```

`main.lua` is the main entry point for LÖVE; see [Getting Started] in the documentation for more details. For our purposes, this contains a small amount of boilerplate for bootstrapping the Fennel compiler and loading our source:

```lua
-- Bootstrap the compiler
fennel = require("lib.fennel")
table.insert(package.loaders, fennel.make_searcher({correlate=true}))

-- Require our Fennel source file
require("wrap")
```

`wrap.fnl` is the Fennel source file we load from `main.lua`. Note that this file can be named whatever you'd like, just be sure to update any references to this file accordingly. Translating the traditional *Hello World* application results in:

```clojure
(fn love.draw []
  (love.graphics.print "Hello World" 400 300))
```

Assuming LÖVE has been installed and is available on your `PATH`, running `love .` in the project directory should open a window containing the text *Hello World*.

[alexjgriffith/min-love2d-fennel]: https://gitlab.com/alexjgriffith/min-love2d-fennel
[Getting Started]: https://love2d.org/wiki/Getting_Started
[config file documentation]: https://love2d.org/wiki/Config_Files
[Simple Game Tutorials for LÖVE]: https://simplegametutorials.github.io/

# Practice Makes Perfect

After a bit of fumbling around I was reasonably confident I had things working. I found [Simple Game Tutorials for LÖVE] (another great resource!) in the LÖVE wiki and decided to work through a few of the tutorials, writing Fennel instead of Lua.

## Snake

I began with the [Snake] tutorial. Initially I struggled a bit translating the code due to the fact I am learning Lua, Fennel and LÖVE all at once. After a brief period of frustration, things started to flow and my efficiency rapidly increased. Fennel does a fantastic job of mirroring the Lua syntax, so translation doesn't require much thought or effort. Some things such as variables, conditionals, and looping may require some adjustments, but otherwise the code tends to translate incredibly well.

First impressions of all technologies involved were pretty positive here. LÖVE, Lua, and Fennel are all quite simple, and each has ample documentation. Lua has some oddities (1-indexing being the most painful for me) which leak through to Fennel, but overall both languages were quite easy to pick up. I ended up with fewer lines of Fennel in my (admittedly naive) implementation than there were lines of Lua in the tutorial, which is a victory in my books.

[Snake]: https://simplegametutorials.github.io/snake/

## Bird

The [Bird] tutorial goes through the process of creating simple a Flappy Bird clone. Having one game under my belt already this was a much smoother process, and I had an implementation in very little time. There were no real surprises here, and I likely could have skipped this example altogether. Regardless, I had fun and got a bit more practice in writing Fennel.

Upon completion of this game, it had become pretty clear that managing global state was going to require a more elegant solution. Being a relative novice to functional programming I unfortunately did not have an immediate solution to this. This is definitely an area I plan to dive deeper into in the near future.

[Bird]: https://simplegametutorials.github.io/bird/

## Blocks

At this point I felt like I understood the basics of Fennel and LÖVE, but decided to go through one final guide. [Blocks] takes us through the process of building a simple a Tetris clone. This seemed like a bit more complex of a game than the previous two, even if only slightly.

Overall this game was relatively straight forward to port, but dealing with nested tables became a bit cumbersome. I'm almost certainly missing something here, but I'm sure this will become easier with more experience. Global state was starting to pile up as well, but for small projects such as these I consider that acceptable.

[Blocks]: https://simplegametutorials.github.io/blocks/

# Final Thoughts

Overall I'm incredibly happy with Fennel and LÖVE. As a novice to the language, the framework, and game development in general, I found it all quite intuitive and easy to jump in to. The games mentioned in this post combined took only a few hours spread through the week, and already I feel like I have a decent handle on things.

As mentioned previously, handling mutable state is an area I need to spend some more time researching. I'm sure a significant amount of what currently exists can be eliminated altogether just by restructuring the code with immutability in mind.

There are also a number of libraries which provide some quality-of-life improvements, specifically [lume]. Since the completion of these three games, I have also found [How to LÖVE] which I will likely spend some time reading through with the hope of learning some better design patterns.

I look forward to undertaking more complicated projects in the future using Fennel and LÖVE in the future, and encourage you to explore both.

All source code is available at [jessebraham/fennel-game-dev].

[jessebraham/fennel-game-dev]: https://github.com/jessebraham/fennel-game-dev
[lume]: https://github.com/rxi/lume/
[How to LÖVE]: https://sheepolution.com/learn/book/contents
