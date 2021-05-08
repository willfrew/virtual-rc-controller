use std::{io, thread, time};
use uhid_virt::{Bus, CreateParams, UHIDDevice};
use usbd_hid::descriptor::SerializedDescriptor;

mod reports;
use reports::{RCControllerInputReport};

unsafe fn any_as_u8_slice<T: Sized>(p: &T) -> &[u8] {
    ::std::slice::from_raw_parts(
        (p as *const T) as *const u8,
        ::std::mem::size_of::<T>(),
    )
}

fn main() -> io::Result<()> {
    println!("RCControllerInputReport: {:?}\n", RCControllerInputReport::desc());

    let mut device = UHIDDevice::create(CreateParams {
        name: String::from("Test device"),
        phys: String::from(""),
        uniq: String::from(""),
        bus: Bus::USB,
        vendor: 0x0b04,
        product: 0x1867,
        version: 0,
        country: 0,
        rd_data: RCControllerInputReport::desc().to_vec(),
    })?;
    loop {
        thread::sleep(time::Duration::from_millis(1000));
        let report = RCControllerInputReport {
            yaw: 10,
            throttle: 10,
            pitch: 10,
            roll: 10,
        };
        unsafe {
            let report_bytes = any_as_u8_slice(&report);
            println!("{:?}", report_bytes);
            device.write(report_bytes)?;
        };
    }
}
