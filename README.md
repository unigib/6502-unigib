# 6502 Emulator for CSS45102

![University of Gibraltar logo](./logo.png)

This repository contains a browser-based 6502 assembler and emulator for use
in the University of Gibraltar's CSS45102 class. It is based on
[skilldrick/6502js](https://github.com/skilldrick/6502js), with a larger
syntax-coloured editor and source-line highlighting while stepping through a
program. The interface uses the University of Gibraltar logo and a matching
red accent palette.

The emulator is intended for learning and experimenting with 6502 assembly. It
provides an assembler, a simulated screen, CPU register and status display, a
single-step debugger, and a memory monitor.

## Run the emulator

1. Clone or download this repository.
2. Open `index.html` in a modern web browser.
3. Enter a program in the code editor and select **Assemble**.
4. Select **Run** to execute continuously, or enable **Debugger** and select
   **Step** to execute one instruction at a time.

The page loads jQuery from Google's CDN, so an internet connection is needed
when opening the emulator unless that dependency is made available locally.

## Your first program

Enter this example in the editor:

```asm
; Write the red colour value to the first screen pixel
LDA #$02
STA $0200
BRK
```

Select **Assemble**, then **Run**. The first pixel of the simulated 32-by-32
screen should turn red. `BRK` stops the program.

## Basic controls

- **Assemble** checks the source and loads the program into simulated memory.
  Programs start at address `$0600` by default.
- **Run** executes the assembled program. It changes to **Stop** while the
  program is running.
- **Reset** resets the CPU and simulated memory.
- **Hexdump** displays the assembled bytes.
- **Disassemble** displays the bytes as 6502 instructions.
- **Debugger** enables single-stepping. Select **Step** to execute the
  instruction at the current program counter (PC); the editor highlights the
  corresponding source line. **Jump to ...** accepts a label or an address,
  such as `$0600`.
- **Monitor** displays a range of memory. Enter the start address and length
  as hexadecimal values.
- **Notes** shows the emulator's memory map and screen colour values.

## Assembly syntax

- Instructions are written using standard 6502 mnemonics, such as `LDA`, `STA`,
  `ADC`, `JMP`, and `BRK`. Mnemonics are case-insensitive.
- Immediate values use `#`, for example `LDA #$2a`. Hexadecimal values use `$`
  and binary values use `%`; decimal values can also be used.
- Memory operands can be written as hexadecimal addresses, for example
  `STA $0200`.
- Define a label with a colon and refer to it by name:

  ```asm
  start:
      LDA #$01
      JMP start
  ```

- Start a comment with `;`.
- `DCB` emits comma-separated decimal or hexadecimal bytes, for example
  `DCB $01,$02,3`.
- The `* = $address` form changes where code is assembled. The CPU reset entry
  point remains `$0600`, so code assembled elsewhere will need a jump from that
  address.

The emulator includes some teaching-oriented memory locations:

- `$00fe` contains a new random byte on each instruction.
- `$00ff` contains the ASCII code of the last key pressed.
- `$0200` through `$05ff` map to the 32-by-32 screen, one byte per pixel. The
  low four bits of each byte select its colour.

## Credits and license

This version is adapted from [skilldrick/6502js](https://github.com/skilldrick/6502js).
See [LICENSE](./LICENSE) for the applicable license terms.
