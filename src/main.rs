use std::{io, thread, time};
use usbd_hid::descriptor::generator_prelude::*;
use uhid_virt::{Bus, CreateParams, UHIDDevice};

#[gen_hid_descriptor(
    (collection = APPLICATION, usage_page = GENERIC_DESKTOP, usage = 0x02) = { // Mouse
        (collection = PHYSICAL, usage = 0x01) = { // Pointer
            (usage_page = 0x09,) = { // Button
                (usage_min = 0x01, usage_max = 0x03) = { // Button 1 -> Button 3
                    #[packed_bits 3] buttons=input;
                }
            };
            (usage_page = GENERIC_DESKTOP,) = {
                (usage = 0x30,) = { // X
                    #[item_settings data,variable,relative] x=input;
                };
                (usage = 0x31,) = { // Y
                    #[item_settings data,variable,relative] y=input;
                }
            }
        }
    }
)]
#[repr(packed)]
struct MouseInputReport {
    buttons: u8,
    x: i8,
    y: i8,
}

unsafe fn any_as_u8_slice<T: Sized>(p: &T) -> &[u8] {
    ::std::slice::from_raw_parts(
        (p as *const T) as *const u8,
        ::std::mem::size_of::<T>(),
    )
}

fn main() -> io::Result<()> {
    println!("MouseInputReport: {:?}\n", MouseInputReport::desc());

    let mut device = UHIDDevice::create(CreateParams {
        name: String::from("Test device"),
        phys: String::from(""),
        uniq: String::from(""),
        bus: Bus::USB,
        vendor: 0x0b04,
        product: 0x1867,
        version: 0,
        country: 0,
        rd_data: MouseInputReport::desc().to_vec(),
    })?;
    loop {
        thread::sleep(time::Duration::from_millis(1000));
        let report = MouseInputReport {
            buttons: 0,
            x: -10,
            y: -5,
        };
        unsafe {
            let report_bytes = any_as_u8_slice(&report);
            println!("{:b}", report_bytes[0]);
            println!("{:?}", report_bytes);
            device.write(report_bytes)?;
        };
    }
}
