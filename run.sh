#!/bin/env bash

(cd hid-server; cargo build && sudo ./target/debug/virtual-rc-controller) &
(cd ui; yarn start) &

wait
