var ASSEMBLY_SAMPLES = {
  "screen-colour": {
    filename: "screen-colour.asm",
    code: "; Paint the first screen pixel red\nLDA #$02\nSTA $0200\nBRK"
  },
  "keyboard-input": {
    filename: "keyboard-input.asm",
    code: "; Read the latest key and use it as the first pixel's colour\n" +
      "define key $ff\n" +
      "define pixel $0200\n" +
      "loop:\n" +
      "LDA key\n" +
      "STA pixel\n" +
      "JMP loop"
  },
  "label-loop": {
    filename: "label-loop.asm",
    code: "; Use a label to jump to a named instruction\n" +
      "start:\n" +
      "LDA #$05\n" +
      "STA $0200\n" +
      "JMP finish\n" +
      "finish:\n" +
      "BRK"
  },
  "seven-segment": {
    filename: "seven-segment.asm",
    code: "; Show hexadecimal digits 0-F from left to right\n" +
      "LDX #$00\n" +
      "loop:\n" +
      "LDA digits,X\n" +
      "STA $00E0,X\n" +
      "INX\n" +
      "CPX #$08\n" +
      "BNE loop\n" +
      "BRK\n" +
      "digits:\n" +
      "DCB $01,$23,$45,$67,$89,$ab,$cd,$ef"
  },
  "seven-segment-counter": {
    filename: "seven-segment-counter.asm",
    code: "; Count up in the accumulator and display the byte as two hex digits\n" +
      "LDA #$00\n" +
      "counter:\n" +
      "CLC\n" +
      "ADC #$01\n" +
      "STA $00E0\n" +
      "JMP counter"
  },
  "seven-segment-clock": {
    filename: "seven-segment-clock.asm",
    code: "; 24-hour HHMMSS clock. Use the 1 MHz execution rate for close to real time.\n" +
      "define hourTens $f0\n" +
      "define hourOnes $f1\n" +
      "define minuteTens $f2\n" +
      "define minuteOnes $f3\n" +
      "define secondTens $f4\n" +
      "define secondOnes $f5\n" +
      "define delayCount $f6\n" +
      "start:\n" +
      "LDA #$00\n" +
      "STA hourTens\n" +
      "STA hourOnes\n" +
      "STA minuteTens\n" +
      "STA minuteOnes\n" +
      "STA secondTens\n" +
      "STA secondOnes\n" +
      "JSR drawTime\n" +
      "clock:\n" +
      "JSR waitSecond\n" +
      "INC secondOnes\n" +
      "LDA secondOnes\n" +
      "CMP #$0A\n" +
      "BNE showTime\n" +
      "LDA #$00\n" +
      "STA secondOnes\n" +
      "INC secondTens\n" +
      "LDA secondTens\n" +
      "CMP #$06\n" +
      "BNE showTime\n" +
      "LDA #$00\n" +
      "STA secondTens\n" +
      "INC minuteOnes\n" +
      "LDA minuteOnes\n" +
      "CMP #$0A\n" +
      "BNE showTime\n" +
      "LDA #$00\n" +
      "STA minuteOnes\n" +
      "INC minuteTens\n" +
      "LDA minuteTens\n" +
      "CMP #$06\n" +
      "BNE showTime\n" +
      "LDA #$00\n" +
      "STA minuteTens\n" +
      "INC hourOnes\n" +
      "LDA hourOnes\n" +
      "CMP #$0A\n" +
      "BNE showTime\n" +
      "LDA #$00\n" +
      "STA hourOnes\n" +
      "INC hourTens\n" +
      "LDA hourTens\n" +
      "CMP #$02\n" +
      "BNE showTime\n" +
      "LDA hourOnes\n" +
      "CMP #$04\n" +
      "BNE showTime\n" +
      "LDA #$00\n" +
      "STA hourTens\n" +
      "STA hourOnes\n" +
      "showTime:\n" +
      "JSR drawTime\n" +
      "JMP clock\n" +
      "drawTime:\n" +
      "LDA hourTens\n" +
      "ASL\n" +
      "ASL\n" +
      "ASL\n" +
      "ASL\n" +
      "ORA hourOnes\n" +
      "STA $00E0\n" +
      "LDA minuteTens\n" +
      "ASL\n" +
      "ASL\n" +
      "ASL\n" +
      "ASL\n" +
      "ORA minuteOnes\n" +
      "STA $00E1\n" +
      "LDA secondTens\n" +
      "ASL\n" +
      "ASL\n" +
      "ASL\n" +
      "ASL\n" +
      "ORA secondOnes\n" +
      "STA $00E2\n" +
      "RTS\n" +
      "waitSecond:\n" +
      "LDA #$08\n" +
      "STA delayCount\n" +
      "waitBlock:\n" +
      "LDY #$00\n" +
      "waitOuter:\n" +
      "LDX #$00\n" +
      "waitInner:\n" +
      "DEX\n" +
      "BNE waitInner\n" +
      "DEY\n" +
      "BNE waitOuter\n" +
      "DEC delayCount\n" +
      "BNE waitBlock\n" +
      "RTS"
  },
  "seven-segment-stopwatch": {
    filename: "seven-segment-stopwatch.asm",
    code: "; HHMMSS stopwatch: S starts, P pauses, and R resets (use lowercase keys).\n" +
      "; Use the 1 MHz execution rate for close to real time.\n" +
      "define hourTens $f0\n" +
      "define hourOnes $f1\n" +
      "define minuteTens $f2\n" +
      "define minuteOnes $f3\n" +
      "define secondTens $f4\n" +
      "define secondOnes $f5\n" +
      "define running $f6\n" +
      "define delayCount $f7\n" +
      "start:\n" +
      "LDA #$00\n" +
      "STA hourTens\n" +
      "STA hourOnes\n" +
      "STA minuteTens\n" +
      "STA minuteOnes\n" +
      "STA secondTens\n" +
      "STA secondOnes\n" +
      "STA running\n" +
      "LDA #$00\n" +
      "JSR drawTime\n" +
      "main:\n" +
      "JSR checkKey\n" +
      "LDA running\n" +
      "BEQ main\n" +
      "JSR waitSecond\n" +
      "JSR checkKey\n" +
      "LDA running\n" +
      "BEQ main\n" +
      "JSR incrementTime\n" +
      "JSR drawTime\n" +
      "JMP main\n" +
      "checkKey:\n" +
      "LDA $00FF\n" +
      "CMP #$73\n" +
      "BEQ startWatch\n" +
      "CMP #$70\n" +
      "BEQ pauseWatch\n" +
      "CMP #$72\n" +
      "BEQ resetWatch\n" +
      "RTS\n" +
      "startWatch:\n" +
      "LDA #$01\n" +
      "STA running\n" +
      "LDA #$00\n" +
      "STA $00FF\n" +
      "RTS\n" +
      "pauseWatch:\n" +
      "LDA #$00\n" +
      "STA running\n" +
      "STA $00FF\n" +
      "RTS\n" +
      "resetWatch:\n" +
      "LDA #$00\n" +
      "STA hourTens\n" +
      "STA hourOnes\n" +
      "STA minuteTens\n" +
      "STA minuteOnes\n" +
      "STA secondTens\n" +
      "STA secondOnes\n" +
      "STA running\n" +
      "STA $00FF\n" +
      "JSR drawTime\n" +
      "RTS\n" +
      "incrementTime:\n" +
      "INC secondOnes\n" +
      "LDA secondOnes\n" +
      "CMP #$0A\n" +
      "BNE incrementDone\n" +
      "LDA #$00\n" +
      "STA secondOnes\n" +
      "INC secondTens\n" +
      "LDA secondTens\n" +
      "CMP #$06\n" +
      "BNE incrementDone\n" +
      "LDA #$00\n" +
      "STA secondTens\n" +
      "INC minuteOnes\n" +
      "LDA minuteOnes\n" +
      "CMP #$0A\n" +
      "BNE incrementDone\n" +
      "LDA #$00\n" +
      "STA minuteOnes\n" +
      "INC minuteTens\n" +
      "LDA minuteTens\n" +
      "CMP #$06\n" +
      "BNE incrementDone\n" +
      "LDA #$00\n" +
      "STA minuteTens\n" +
      "INC hourOnes\n" +
      "LDA hourOnes\n" +
      "CMP #$0A\n" +
      "BNE incrementDone\n" +
      "LDA #$00\n" +
      "STA hourOnes\n" +
      "INC hourTens\n" +
      "LDA hourTens\n" +
      "CMP #$0A\n" +
      "BNE incrementDone\n" +
      "LDA #$00\n" +
      "STA hourTens\n" +
      "incrementDone:\n" +
      "RTS\n" +
      "drawTime:\n" +
      "LDA hourTens\n" +
      "ASL\n" +
      "ASL\n" +
      "ASL\n" +
      "ASL\n" +
      "ORA hourOnes\n" +
      "STA $00E0\n" +
      "LDA minuteTens\n" +
      "ASL\n" +
      "ASL\n" +
      "ASL\n" +
      "ASL\n" +
      "ORA minuteOnes\n" +
      "STA $00E1\n" +
      "LDA secondTens\n" +
      "ASL\n" +
      "ASL\n" +
      "ASL\n" +
      "ASL\n" +
      "ORA secondOnes\n" +
      "STA $00E2\n" +
      "RTS\n" +
      "waitSecond:\n" +
      "LDA #$08\n" +
      "STA delayCount\n" +
      "waitBlock:\n" +
      "LDY #$00\n" +
      "waitOuter:\n" +
      "LDX #$00\n" +
      "waitInner:\n" +
      "DEX\n" +
      "BNE waitInner\n" +
      "DEY\n" +
      "BNE waitOuter\n" +
      "DEC delayCount\n" +
      "BNE waitBlock\n" +
      "RTS"
  },
  "seven-segment-register": {
    filename: "seven-segment-register.asm",
    code: "; Display a byte as two hexadecimal digits\n" +
      "; Change #$A5 to another byte value to experiment\n" +
      "LDA #$A5\n" +
      "STA $00E0\n" +
      "BRK"
  }
};
