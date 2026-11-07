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
  }
};
