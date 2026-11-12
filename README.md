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
- `c-compiler.js` — compiler for the small, browser-based C teaching subset.
- `samples.js` — bundled sample programs.
- `samples/` — example assembly files, including the Snake game and
  Doom-inspired shooter.
- `style.css` — styling for the classroom-themed interface.
- `logo.png` — University of Gibraltar branding.

## Run the emulator

1. Clone or download this repository.
2. Serve the folder from a local web server for the most reliable browser
   experience:

   ```bash
   cd 6502-unigib
   python -m http.server 8000
   ```

   Then open <http://localhost:8000/> in a modern browser.
3. You can also open `index.html` directly in a browser, though a local web
   server is recommended for smoother behaviour and compatibility.
4. Choose **6502 assembly** or **C (8-bit teaching subset)** as the source
language. For C, select **Compile C to assembly**, inspect the output, then
select **Assemble**.
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

## A short guided tutorial

These short exercises build on one another using the editor and emulator. For
each exercise, replace the editor contents with the code, select **Assemble**,
then select **Run**. Use **Reset** before assembling another exercise. When a
program ends with `BRK`, inspect the CPU registers or use **Monitor** to check
the memory address named in the instructions.

### 1. Load and store a value

```asm
LDA #$2A
STA $00D0
BRK
```

`LDA` loads the value `$2A` into the accumulator (**A**). The `#` means the
operand is the value itself. `STA` writes A to memory address `$00D0`.
After running, A and memory `$00D0` should both contain `$2A`. Without `#`,
`LDA $00D0` would load the value stored at that address instead.

### 2. Add values

```asm
LDA #$05
CLC
ADC #$03
STA $00D0
BRK
```

`CLC` clears the carry flag before `ADC` adds `$03` to A. The result, `$08`,
is stored at `$00D0`. Try changing the two values and check the result in
**Monitor**. Values are bytes, so results cannot exceed `$FF` without wrapping;
the carry flag can indicate that an addition overflowed.

### 3. Repeat instructions to draw a line

```asm
LDX #$00
LDA #$02
paintRow:
STA $0200,X
INX
CPX #$20
BNE paintRow
BRK
```

The screen begins at `$0200`; the first 32 addresses are its top row.
`STA $0200,X` writes the red colour value (`$02`) at the address `$0200 + X`.
`INX` advances to the next pixel. `CPX` compares X with `$20`, and `BNE`
branches back to `paintRow` while they differ. Once the loop finishes, the
top row is red. Change the colour value or use a different starting address
to experiment.

### 4. Show a byte on the LED display

```asm
LDA #$2A
STA $00E7
BRK
```

Each display address controls two hexadecimal digits. `$00E7` is the
rightmost pair, so this shows `2A`. The byte is shown in hexadecimal; decimal
42 is `$2A`, not the BCD value `$42`. Try `$42` to compare how a byte and its
packed BCD representation look.

### 5. Read a key

```asm
waitKey:
LDA $00FF
BEQ waitKey
STA $00E7
LDA #$00
STA $00FF
JMP waitKey
```

`$00FF` contains the most recent key code. This program waits while it is zero,
then displays the code in the rightmost LED pair and clears the key location
before waiting again. Assemble and run it, click the emulated screen, and press
a key. The program intentionally loops rather than ending with `BRK`; select
**Stop** to halt it.

Try extending these exercises: draw a different shape, show the key code in
more than one display pair, or use the **Automatic LED counter**, **Automatic
BCD counter**, and **Automatic binary counter** samples to compare number
representations.

## Basic controls

- **Assemble** checks the source and loads the program into simulated memory.
  Programs start at address `$0600` by default.
- Use **Samples** and **Load Sample** to put a built-in example in the editor.
  Assembly samples are grouped separately from the C examples. The C samples
  include screen colour, labels and loops, and a seven-segment counter; each
  has a corresponding assembly example for comparing the two source forms.
  Other samples demonstrate keyboard input, labels and loops, and the
  seven-segment display, including a counter, clock, stopwatch,
  byte-value display, keyboard-to-LED display, the Doom-inspired shooting
  gallery, and binary, decimal, and
  hexadecimal calculators. The calculator samples accept digits and `+`, `-`,
  `*`, `/`, `=` from the keyboard; press **C** or **Enter** to clear. In
  **Keyboard to LED display**, each key's code appears as a hexadecimal byte;
  the display wraps after eight keys, and **Enter** clears it. To try the Snake
  program, select
  **Open ASM**, choose
  `samples/snake.asm`, then assemble and run it. Steer Snake with the arrow
  keys or on-screen arrow buttons. To try the Doom-inspired shooting gallery,
  select **Doom corridor shooter** from the Samples menu, assemble, and run;
  click the emulated screen, then press **Up** to fire. The floor has
  bright perspective stripes and the demon flashes when hit. Press lowercase
  **r** to reset the score shown on the rightmost LED pair. You can also open
  `samples/doom-shooter.asm` directly.
- **Open ASM** opens a local `.asm`, `.s`, `.6502`, or `.txt` file in the
  editor. **Save ASM** downloads the current source as an assembly file.
  Replacing non-empty editor contents asks for confirmation.
- The editor displays line numbers and syntax highlighting. When debugging,
  the current instruction's source line is highlighted and scrolled into view.
  Click a line number to toggle a breakpoint, including before assembling;
  **Run** pauses before executing marked instruction or label lines. Click
  **Run** again to continue to the next breakpoint.
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
- **Guide** opens this README, formatted as a guide on GitHub, in a new tab.
- **Notes** shows the emulator's memory map and screen colour values.

## C-to-6502 demonstration

Choose **C (8-bit teaching subset)** to enter a small C-like program. The
built-in example shows the complete path: C source is translated into 6502
assembly, the existing assembler turns that into machine code, and the emulator
fetches, decodes, and executes the instructions. Compile first to inspect or
edit the generated assembly; then select **Assemble**, **Run**, or use the
debugger to step through the 6502 instructions. The **Samples** menu also has C
versions of **Screen colour**, **Labels and loops**, and **Seven-segment
counter**, alongside their assembly counterparts.

The subset supports one `void main(void)` or `int main(void)` function,
`unsigned char` local variables, byte-sized decimal or hexadecimal constants,
addition and subtraction, assignments and increment/decrement, `if`/`else`,
`while`, `return;` in `void main`, and a byte-valued `return expression;` in
`int main` (the value is left in the accumulator when execution stops).
Variables occupy zero-page addresses beginning at
`$10`. The `pixel(value)` and `led(value)` teaching intrinsics write a byte to
the first screen pixel at `$0200` and the first seven-segment display byte at
`$00E0`, respectively. Comparisons are unsigned byte comparisons between a
variable and a constant.

This is intentionally not a general C compiler: it does not support headers,
functions other than `main`, arrays, pointers, signed or multi-byte values,
multiplication/division, or arbitrary C expressions. Arithmetic is 8-bit and
wraps at 256. Unsupported syntax is reported in the message panel.

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
| `$00E0-$00E7` | 16-position seven-segment display: one byte per two adjacent hexadecimal digits. |
| `$00E8-$00EF` | Zero page: general-purpose data and pointers. |
| `$00F0-$00F5` | Clock/stopwatch digits: hour tens/ones, minute tens/ones, second tens/ones. |
| `$00F6` | Clock delay counter; stopwatch running flag. |
| `$00F7` | Stopwatch delay counter. |
| `$00F8-$00FD` | Zero page: general-purpose data and pointers. |
| `$00FE` | A new pseudo-random byte is generated for each instruction. |
| `$00FF` | The most recently pressed key's code. Printable keys use their character code; arrow keys use the codes below. |
| `$0100-$01FF` | Stack page used by stack operations and subroutines. |
| `$0200-$05FF` | 32-by-32 screen: one byte per pixel, stored left-to-right and top-to-bottom. |
| `$0600` onward | Program code is assembled here by default. |

### Seven-segment display

The display has 16 positions, from left to right. The eight addresses
`$00E0-$00E7` each control a pair of adjacent positions, showing the byte as
two hexadecimal digits. For example:

```asm
LDA #$FF
STA $00E0 ; show FF in the first two positions
LDA #$0F
STA $00E1 ; show 0F in the next two positions
```

### Samples

#### Keyboard to LED display

The **Keyboard to LED display** sample writes each key's code as a hexadecimal
byte. It advances through the eight display addresses and wraps to the
beginning; press **Enter** to clear the display.

#### Calculators

The **Binary calculator**, **Decimal calculator**, and **Hexadecimal
calculator** are interactive 8-bit calculators. Click the emulated screen to
focus keyboard input, then enter digits in the selected base, an operator, a
second value, and `=`. They support addition, subtraction, multiplication,
and integer division. Results wrap modulo 256; division by zero displays zero.
Hexadecimal digits `A-F` may be entered in either case. Press `C` or **Enter**
to clear.

#### Seven-segment display sample

The **Seven-segment display** sample writes `0123456789ABCDEF` to the display.

#### Seven-segment counter

The **Seven-segment counter** continuously increments the accumulator and
shows its hexadecimal byte value in the first two digits. Choose a low
execution rate to follow it.

#### Count up/down with LED

The **Count up/down with LED** sample uses **+** or **Up Arrow** to increment
and **-** or **Down Arrow** to decrement, displaying a hexadecimal byte in the
last two positions. It wraps between `$00` and `$FF`.

#### Automatic LED counter

The **Automatic LED counter** starts counting up with **Up Arrow** and counts
down toward zero with **Down Arrow**, stopping at zero. It uses all eight
display bytes (16 hexadecimal digits), carrying into the next byte. Press
**Left Arrow** to reset to zero and stop.

#### Automatic BCD counter

The **Automatic BCD counter** uses the same controls but stores packed decimal
digits, carrying from `09` to `10` and `99` to `0100`. Compare this with the
hexadecimal counter, which carries from `09` to `0A` and `FF` to `0100`.

#### Automatic binary counter

The **Automatic binary counter** uses the same controls to show a 16-bit
binary value using only `0` and `1` digits, from `0000000000000000` through
`1111111111111111`.

For all three automatic counters, change the `LDA #$01` delay value in
`waitCount` to adjust the speed: a larger value counts more slowly, and a
smaller value counts faster. Select a low execution rate if a counter runs too
quickly.

#### Clock and stopwatch

The **24-hour clock** displays `HHMMSS`; the **Stopwatch** displays elapsed
`HHMMSS`. Click the simulated screen and press lowercase **S** to start, **P**
to pause, or **R** to reset the stopwatch. The clock and stopwatch store the
digits at `$00F0-$00F5` and pack each pair into display bytes `$00E0-$00E2`.
The clock uses `$00F6` as its delay counter. The stopwatch uses `$00F6` as its
running flag and `$00F7` as its delay counter. Their software delays are
intended to approximate one second at the **1 MHz** execution rate; timing
varies with execution rate and browser scheduling.

#### Display byte in A

The **Display byte in A** sample loads `$A5` into A and displays its two
hexadecimal nibbles. Change the immediate value in its `LDA` instruction to
try another byte.

## Screen

The simulated screen is 32 by 32 pixels. Each pixel occupies one byte in the
range `$0200-$05FF`, stored left-to-right and then top-to-bottom. For a pixel
at column `x` and row `y` (each from 0 to 31), write its colour value to
`$0200 + (y * 32) + x`. The low four bits select the colour:

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
