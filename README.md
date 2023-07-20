# emv-tools

`emv-tools` is a necessary tool when developing a payment terminal.

## Parsing `R-APDU`

Analyze the `R-APDU` which is the response of the card reader.

![Sample](demo.gif)

### Usage

1. Select the `R-APDU` you want to analyze on the editor.
1. Selection includes Status Word (SW1, SW2).
1. Select `Analyze R-APDU` from the context menu.
1. Analysis results are displayed in a new tab.


### tag name

The following tags display names.
* Tags as described in `EMV 4.4 Book 3 - A2 Data Elements`.
* Tags as described in `ISO 7816-4, 5.1.5 File control information`.

Terminal-specific tags are displayed as `unknown template` or `unknown value`.