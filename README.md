gun-rtc
=======
WebRTC Communication layer for gunDB

> **Note:** this project is under development and unfinished.

## What is it
The idea is that you could replace
```html
<script src="gun.js"></script>
```
with
```html
<script src="gun-rtc.js"></script>
```
and automatically upgrade your boring websocket app to a decentralized, resiliant, offline-first, WebRTC driven app. Oh, and if WebRTC isn't supported, you can keep your websockets and still collab with the cool people on WebRTC.

## What's the holdup?
We've been holding off the heavy development until [gun's 0.3](https://github.com/amark/gun/blob/master/CHANGELOG.md) release hit the masses. Now that most of the ecosystem has caught up with the release, we're ready to dive back in and build the future.

> **Update (05/17):** through development, we've come to realize our plugin system could use some love. We're hoping to have a release out soon that allows us to build modules (like gun-rtc) without overloading and masking other plugins just to read and write data. After we've got that resolved, then we can push forward on gun-rtc without needing hackery.

Star this repository to get occasional project updates and to aid my narcissism.
