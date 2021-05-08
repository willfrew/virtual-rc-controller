use usbd_hid::descriptor::generator_prelude::*;

/*
 * For more information about the various constants listed here, see:
 *  https://usb.org/sites/default/files/hut1_22.pdf
 */

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
pub struct MouseInputReport {
    pub buttons: u8,
    pub x: i8,
    pub y: i8,
}

#[gen_hid_descriptor(
    (collection = APPLICATION, usage_page = GENERIC_DESKTOP, usage = JOYSTICK) = {
        (usage_min = X, usage_max = Y) = { // X, Y
            #[item_settings data,variable,relative] yaw=input;
            #[item_settings data,variable,relative] throttle=input;
        }
    },
    (collection = APPLICATION, usage_page = GENERIC_DESKTOP, usage = JOYSTICK) = {
       (usage = 0x32, ) = { // Z
            #[item_settings data,variable,relative] pitch=input;
        };
       (usage = 0x35, ) = { // Rz
            #[item_settings data,variable,relative] roll=input;
        }
    }
)]
#[repr(packed)]
pub struct RCControllerInputReport {
    pub yaw: i8,
    pub throttle: i8,
    pub pitch: i8,
    pub roll: i8,
}
