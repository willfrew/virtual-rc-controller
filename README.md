# Virtual RC Controller

Virtual RC Controller interface

## Architecture

```
 _______
|       |
| Game  |
|_______|
   ↑
   | /dev/hidraw*
 __↓____               ________________
|       |             |       |        |
| Linux |  /dev/uhid  | HID   | WS     |
| Kernel| ←---------- | Daemon| Server |
|_______|             |_______|________|
                                 ↑
DESKTOP                          |
 - - - - - - - - - - - - - - - - | ws://...
MOBILE                           |
                               __|______
                              |         |
                              | Browser |
                              |_________|
```
