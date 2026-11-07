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
single-step debugger, and a memory monitor. The editor includes syntax
highlighting, line numbers, and source-line highlighting while debugging.

This is a static web application: there is no build step, package install, or
server-side runtime required. The project is designed for classroom use and
quick experimentation with 6502 machine code.

## Project layout

- `index.html` — the browser UI and embedded editor.
- `assembler.js` — assembler, emulator core, and UI logic.
- `samples.js` — bundled sample programs.
- `samples/` — example assembly files, including the Snake game.
- `style.css` — styling for the classroom-themed interface.
- `logo.png` — University of Gibraltar branding.

## Run the emulator

1. Clone or download this repository.
2. Serve the folder from a local web server for the most reliable browser
   experience:

   ```bash
   cd 6502js
   python -m http.server 8000
   ```

   Then open <http://localhost:8000/> in a modern browser.
3. You can also open `index.html` directly in a browser, though a local web
   server is recommended for smoother behaviour and compatibility.
4. Enter a program in the code editor and select **Assemble**.
5. Select **Run** to execute continuously, or enable **Debugger** and select
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
- Use **Samples** and **Load Sample** to put a built-in example in the editor.
  The included samples demonstrate screen colour, keyboard input, labels and
  loops, and the seven-segment display, including a counter and a byte-value
  display example. To try the Snake program, select **Open ASM**, choose
  `samples/snake.asm`, then assemble and run it. Steer Snake with the arrow
keys or on-screen arrow buttons.
- **Open ASM** opens a local `.asm`, `.s`, `.6502`, or `.txt` file in the
  editor. **Save ASM** downloads the current source as an assembly file.
  Replacing non-empty editor contents asks for confirmation.
- The editor displays line numbers and syntax highlighting. When debugging,
  the current instruction's source line is highlighted and scrolled into view.
- **Run** executes the assembled program. It changes to **Stop** while the
  program is running. Use **Execution rate** to select an approximate rate
  from 1 MHz down to 1 Hz (about one instruction per second). At 10 Hz and
  1 Hz, the registers update after each instruction and the next source line
  is highlighted, making program flow easier to follow. Browser timing is
  approximate; the emulator does not model individual 6502 clock cycles.
- **Reset** resets the CPU and simulated memory.
- **Hexdump** displays the assembled bytes.
- **Disassemble** displays the bytes as 6502 instructions.
- **Debugger** enables single-stepping. Select **Step** to execute the
  instruction at the current program counter (PC); the editor highlights the
  corresponding source line. **Jump to ...** accepts a label or an address,
  such as `$0600`.
- Click the emulated screen and use the keyboard arrow keys or the on-screen
  directional buttons. The directional buttons and arrow keys send key codes
  to `$00ff`; arrow-key codes are 37 (left), 38 (up), 39 (right), and 40
  (down). Printable keys, including WASD, are sent as their character codes.
  The emulator records the most recent key; game movement and other key
  behavior must be implemented by the assembly program. **Run** focuses the
  screen so keyboard input can be sent to a running program immediately.
- The CPU register panel displays the CPU's current state. Values are shown in
  hexadecimal. See [CPU registers](#cpu-registers) for details.
- **Monitor** displays a range of memory. Enter the start address and length
  as hexadecimal values.
- **Memory Map** opens a reference for the emulator's memory regions, screen
  pixel layout, seven-segment display, palette, and keyboard input codes. See
  the summary below.
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

- Define a named constant with `define` and use it as an immediate value or
  memory address, including zero-page indexed-indirect and indirect-indexed
  operands:

  ```asm
  define appleL $00
  define key $ff
      LDA key
      STA appleL
      STA (appleL,X)
      STA (appleL),Y
  ```

  Constants accept hexadecimal (`$`), binary (`%`), or decimal values from
  `0` to `$ffff`. Labels and constants share a namespace; indirect addressing
  requires the symbol value to fit in zero page (`$00`-`$ff`).

- Start a comment with `;`.
- `DCB` emits comma-separated decimal, hexadecimal, binary, or defined
  zero-page symbol bytes, for example `DCB $01,$02,3`.
- The `* = $address` form changes where code is assembled. The CPU reset entry
  point remains `$0600`, so code assembled elsewhere will need a jump from that
  address.

## CPU registers

The register panel updates as the program runs or when you select **Step** in
the debugger. Register values are hexadecimal; the `$` prefix indicates a
hexadecimal number. For example, `$2A` is decimal 42.

| Register | Size | What it does |
| --- | ---: | --- |
| **A** (Accumulator) | 8-bit | The main register for arithmetic, logic, and moving values. Instructions such as `LDA` load A, while `ADC`, `AND`, and `STA` use its value. |
| **X** (Index X) | 8-bit | An index or counter, commonly used to walk through arrays and indexed addresses. It is changed by instructions such as `LDX`, `INX`, and `DEX`. |
| **Y** (Index Y) | 8-bit | A second index or counter. It is often used for indexed memory access, including `(pointer),Y`. |
| **SP** (Stack Pointer) | 8-bit | Selects the current position in the stack page, `$0100-$01FF`. Stack instructions and subroutines change it. |
| **PC** (Program Counter) | 16-bit | Holds the address of the next instruction. It normally advances as instructions run and changes when the program jumps, branches, or calls a subroutine. Programs start at `$0600` by default. |
| **P** (Processor Status) | 8-bit | A bit field containing the CPU's status flags. The panel shows both the byte value and each flag separately. |

### Processor status flags

The flags are shown from most-significant to least-significant bit. A highlighted
flag is set (`1`); an unhighlighted flag is clear (`0`).

| Flag | Name | Meaning |
| --- | --- | --- |
| **N** | Negative | The last result has its high bit set (for an 8-bit value, it is in the range `$80-$FF`). |
| **V** | Overflow | A signed arithmetic operation overflowed its 8-bit range. |
| **-** | Unused | Reserved status bit; it is not a normal condition to test in a program. |
| **B** | Break | The break status bit, associated with the `BRK` instruction. |
| **D** | Decimal | Decimal arithmetic mode flag, controlled by `SED` and `CLD`. |
| **I** | Interrupt Disable | Interrupt-disable flag, controlled by `SEI` and `CLI`. |
| **Z** | Zero | The last result was zero. |
| **C** | Carry | Carry or borrow from arithmetic, or a bit shifted out by shift/rotate instructions. |

Many arithmetic, load, compare, and shift instructions update some of these
flags. Conditional branches such as `BEQ` and `BNE` use them to decide whether
to branch. For example, `BEQ` branches when **Z** is set, while `BNE` branches
when **Z** is clear. Use **Debugger** and **Step** to watch the register and
flag values change one instruction at a time.

## Emulator memory map

| Address range | Purpose |
| --- | --- |
| `$0000-$00DF` | Zero page: general-purpose data and pointers. |
| `$00E0-$00EF` | 16-digit seven-segment display, one hexadecimal digit per address. |
| `$00F0-$00FD` | Zero page: general-purpose data and pointers. |
| `$00FE` | A new pseudo-random byte is generated for each instruction. |
| `$00FF` | The most recently pressed key's code. Printable keys use their character code; arrow keys use the codes below. |
| `$0100-$01FF` | Stack page used by stack operations and subroutines. |
| `$0200-$05FF` | 32-by-32 screen: one byte per pixel, stored left-to-right and top-to-bottom. |
| `$0600` onward | Program code is assembled here by default. |

The seven-segment display shows 16 hexadecimal digits, from left to right.
Each address from `$00E0` through `$00EF` controls one digit; the low four bits
of a written byte select the digit (`$0`-`$F`). For example:

```asm
LDA #$0A
STA $00E0 ; show A in the leftmost digit
LDA #$05
STA $00E1 ; show 5 in the next digit
```

The included **Seven-segment display** sample writes `0123456789ABCDEF` to
the display. **Seven-segment counter** increments the accumulator and shows
its hexadecimal byte value in the first two digits; choose a low execution
rate to follow it. **Display byte in A** loads `$A5` into A and displays the
two hexadecimal nibbles. Change the immediate value in its `LDA` instruction
to try another byte.

For a screen pixel at column `x` and row `y` (each from 0 to 31), write its
colour value to `$0200 + (y * 32) + x`. The low four bits select the colour:

| Value | Colour | Value | Colour |
| --- | --- | --- | --- |
| `$0` | Black | `$8` | Orange |
| `$1` | White | `$9` | Brown |
| `$2` | Red | `$A` | Light red |
| `$3` | Cyan | `$B` | Dark grey |
| `$4` | Purple | `$C` | Grey |
| `$5` | Green | `$D` | Light green |
| `$6` | Blue | `$E` | Light blue |
| `$7` | Yellow | `$F` | Light grey |

Arrow-key input is written to `$00FF` as follows:

| Key | Decimal code | Hex code |
| --- | ---: | --- |
| Left | 37 | `$25` |
| Up | 38 | `$26` |
| Right | 39 | `$27` |
| Down | 40 | `$28` |

## Credits and license

This version is adapted from [skilldrick/6502js](https://github.com/skilldrick/6502js).
See [LICENSE](./LICENSE) for the applicable license terms.
