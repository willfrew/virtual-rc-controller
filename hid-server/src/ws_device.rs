use std::{io, thread, time, fs};
use uhid_virt::{Bus, CreateParams, UHIDDevice, };
use usbd_hid::descriptor::SerializedDescriptor;
use actix::{Actor, StreamHandler};
use actix_web_actors::ws;
use serde::Deserialize;
use serde_json;

use crate::reports::{RCControllerInputReport};

#[derive(Deserialize)]
struct Coord {
    x: u8,
    y: u8,
}

#[derive(Deserialize)]
struct WsReport {
    left: Coord,
    right: Coord,
}

pub struct WsControllerActor {
    device: UHIDDevice<fs::File>,
}

impl WsControllerActor {
    pub fn new() -> io::Result<Self> {
        let device = UHIDDevice::create(CreateParams {
            name: String::from("Test RC device"),
            phys: String::from(""),
            uniq: String::from(""),
            bus: Bus::USB,
            vendor: 0x0b04,
            product: 0x1867,
            version: 0,
            country: 0,
            rd_data: RCControllerInputReport::desc().to_vec(),
        })?;
        Ok(Self { device: device })
    }
}

impl Actor for WsControllerActor {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        println!("Connection alive!");
    }

    fn stopped(&mut self, ctx: &mut Self::Context) {
        self.device.destroy();
        println!("Connection closed");
    }
}

/// Handler for ws::Message message
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WsControllerActor {
    fn handle(
        &mut self,
        msg: Result<ws::Message, ws::ProtocolError>,
        ctx: &mut Self::Context,
    ) {
        match msg {
            Ok(ws::Message::Text(json)) => {
                let maybeReport: serde_json::Result<WsReport> = serde_json::from_str(&json);
                match maybeReport {
                    Ok(wsReport) => {
                        let report = RCControllerInputReport {
                            yaw: wsReport.left.x,
                            throttle: wsReport.left.y,
                            pitch: wsReport.right.y,
                            roll: wsReport.right.x,
                            buttons: 0,
                        };
                        unsafe {
                            let report_bytes = any_as_u8_slice(&report);
                            println!("{:?}", report_bytes);
                            self.device.write(report_bytes);
                        }
                        ()
                    },
                    _ => (),
                }
            }
            // Binary message, 4 bytes
            // [yaw, throttle, roll, pitch]
            Ok(ws::Message::Binary(bytes)) => {
                if !bytes.len() == 4 {
                    println!("Couldn't parse binary message: {:?}", bytes)
                } else {
                    let report = RCControllerInputReport {
                        yaw: bytes[0],
                        throttle: bytes[1],
                        pitch: bytes[3],
                        roll: bytes[2],
                        buttons: 0,
                    };
                    unsafe {
                        let report_bytes = any_as_u8_slice(&report);
                        println!("{:?}", report_bytes);
                        self.device.write(report_bytes);
                    }
                }
            }
            _ => (),
        }
    }
}

unsafe fn any_as_u8_slice<T: Sized>(p: &T) -> &[u8] {
    ::std::slice::from_raw_parts(
        (p as *const T) as *const u8,
        ::std::mem::size_of::<T>(),
    )
}

fn for_later() -> io::Result<()> {
    println!("RCControllerInputReport: {:?}\n", RCControllerInputReport::desc());

    loop {
        thread::sleep(time::Duration::from_millis(1000));
    }
}
