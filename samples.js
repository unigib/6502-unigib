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
      "CPX #$10\n" +
      "BNE loop\n" +
      "BRK\n" +
      "digits:\n" +
      "DCB $0,$1,$2,$3,$4,$5,$6,$7,$8,$9,$a,$b,$c,$d,$e,$f"
  },
  "seven-segment-counter": {
    filename: "seven-segment-counter.asm",
    code: "; Count up in the accumulator and display its byte as two hex digits\n" +
      "LDA #$00\n" +
      "counter:\n" +
      "CLC\n" +
      "ADC #$01\n" +
      "TAX\n" +
      "AND #$F0\n" +
      "LSR\n" +
      "LSR\n" +
      "LSR\n" +
      "LSR\n" +
      "STA $00E0\n" +
      "TXA\n" +
      "AND #$0F\n" +
      "STA $00E1\n" +
      "JMP counter"
  },
  "seven-segment-register": {
    filename: "seven-segment-register.asm",
    code: "; Display the byte loaded into A as two hexadecimal digits\n" +
      "; Change #$A5 to another byte value to experiment\n" +
      "LDA #$A5\n" +
      "TAX\n" +
      "AND #$F0\n" +
      "LSR\n" +
      "LSR\n" +
      "LSR\n" +
      "LSR\n" +
      "STA $00E0\n" +
      "TXA\n" +
      "AND #$0F\n" +
      "STA $00E1\n" +
      "BRK"
  }
};
