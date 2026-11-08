function createCalculatorSample(base) {
  var lines = [
    "; 8-bit " + base + " calculator",
    "; Enter digits, + - * /, then =. Press C or Enter to clear.",
    "define inputKey $f8",
    "define current $f9",
    "define firstValue $fa",
    "define operation $fb",
    "define digit $fc",
    "define remainder $fd",
    "define temp $e8",
    "define hundreds $e9",
    "define tens $ea",
    "start:",
    "LDA #$00",
    "STA current",
    "STA firstValue",
    "STA operation",
    "STA inputKey",
    "JSR displayValue",
    "main:",
    "LDA $ff",
    "BEQ main",
    "STA inputKey",
    "LDA #$00",
    "STA $ff",
    "LDA inputKey",
    "CMP #$0D",
    "BNE notEnter",
    "JMP clearCalculator",
    "notEnter:",
    "CMP #$43",
    "BNE notUpperClear",
    "JMP clearCalculator",
    "notUpperClear:",
    "CMP #$63",
    "BNE checkAdd",
    "JMP clearCalculator",
    "checkAdd:",
    "CMP #$2B",
    "BNE checkSubtract",
    "LDA #$2B",
    "JMP setOperation",
    "checkSubtract:",
    "CMP #$2D",
    "BNE checkMultiply",
    "LDA #$2D",
    "JMP setOperation",
    "checkMultiply:",
    "CMP #$2A",
    "BNE checkDivide",
    "LDA #$2A",
    "JMP setOperation",
    "checkDivide:",
    "CMP #$2F",
    "BNE checkEquals",
    "LDA #$2F",
    "JMP setOperation",
    "checkEquals:",
    "CMP #$3D",
    "BNE readDigit",
    "JMP calculate",
    "readDigit:"
  ];

  if (base === "hexadecimal") {
    lines = lines.concat([
      "LDA inputKey",
      "CMP #$30",
      "BCC invalidDigit",
      "CMP #$3A",
      "BCC decimalDigit",
      "CMP #$41",
      "BCC checkLowerHex",
      "CMP #$47",
      "BCC upperHexDigit",
      "checkLowerHex:",
      "CMP #$61",
      "BCC invalidDigit",
      "CMP #$67",
      "BCS invalidDigit",
      "SEC",
      "SBC #$57",
      "JMP digitReady",
      "upperHexDigit:",
      "SEC",
      "SBC #$37",
      "JMP digitReady",
      "decimalDigit:",
      "SEC",
      "SBC #$30",
      "JMP digitReady",
      "invalidDigit:",
      "JMP main"
    ]);
  } else if (base === "decimal") {
    lines = lines.concat([
      "LDA inputKey",
      "CMP #$30",
      "BCC invalidDigit",
      "CMP #$3A",
      "BCS invalidDigit",
      "SEC",
      "SBC #$30",
      "JMP digitReady",
      "invalidDigit:",
      "JMP main"
    ]);
  } else {
    lines = lines.concat([
      "LDA inputKey",
      "CMP #$30",
      "BEQ zeroDigit",
      "CMP #$31",
      "BNE invalidDigit",
      "LDA #$01",
      "JMP digitReady",
      "zeroDigit:",
      "LDA #$00",
      "JMP digitReady",
      "invalidDigit:",
      "JMP main"
    ]);
  }

  lines = lines.concat([
    "digitReady:",
    "STA digit",
    "LDA current"
  ]);
  if (base === "binary") {
    lines.push("ASL");
  } else if (base === "decimal") {
    lines = lines.concat([
      "ASL",
      "STA temp",
      "ASL",
      "ASL",
      "CLC",
      "ADC temp"
    ]);
  } else {
    lines = lines.concat(["ASL", "ASL", "ASL", "ASL"]);
  }
  lines = lines.concat([
    "CLC",
    "ADC digit",
    "STA current",
    "JSR displayValue",
    "JMP main",
    "setOperation:",
    "STA operation",
    "LDA current",
    "STA firstValue",
    "LDA #$00",
    "STA current",
    "JSR displayValue",
    "JMP main",
    "calculate:",
    "LDA operation",
    "BEQ calculationDone",
    "CMP #$2B",
    "BNE checkSubtractOperation",
    "CLC",
    "LDA firstValue",
    "ADC current",
    "STA current",
    "JMP calculationDone",
    "checkSubtractOperation:",
    "CMP #$2D",
    "BNE checkMultiplyOperation",
    "SEC",
    "LDA firstValue",
    "SBC current",
    "STA current",
    "JMP calculationDone",
    "checkMultiplyOperation:",
    "CMP #$2A",
    "BNE divideOperation",
    "LDA #$00",
    "STA digit",
    "LDY current",
    "multiplyLoop:",
    "CPY #$00",
    "BEQ multiplyDone",
    "CLC",
    "LDA digit",
    "ADC firstValue",
    "STA digit",
    "DEY",
    "JMP multiplyLoop",
    "multiplyDone:",
    "LDA digit",
    "STA current",
    "JMP calculationDone",
    "divideOperation:",
    "LDA current",
    "BEQ divideByZero",
    "LDY #$00",
    "LDA firstValue",
    "divideLoop:",
    "CMP current",
    "BCC divideDone",
    "SEC",
    "SBC current",
    "INY",
    "JMP divideLoop",
    "divideDone:",
    "STY current",
    "JMP calculationDone",
    "divideByZero:",
    "LDA #$00",
    "STA current",
    "calculationDone:",
    "LDA #$00",
    "STA operation",
    "JSR displayValue",
    "JMP main",
    "clearCalculator:",
    "LDA #$00",
    "STA current",
    "STA firstValue",
    "STA operation",
    "JSR displayValue",
    "JMP main",
    "displayValue:",
    "LDA #$00",
    "LDX #$00",
    "clearDisplay:",
    "STA $00E0,X",
    "INX",
    "CPX #$08",
    "BNE clearDisplay"
  ]);

  if (base === "hexadecimal") {
    lines = lines.concat([
      "LDA current",
      "STA $00E7"
    ]);
  } else if (base === "decimal") {
    lines = lines.concat([
      "LDA current",
      "STA remainder",
      "LDA #$00",
      "STA hundreds",
      "STA tens",
      "hundredsLoop:",
      "LDA remainder",
      "CMP #100",
      "BCC tensStart",
      "SEC",
      "SBC #100",
      "STA remainder",
      "INC hundreds",
      "JMP hundredsLoop",
      "tensStart:",
      "LDA remainder",
      "CMP #10",
      "BCC decimalDisplay",
      "SEC",
      "SBC #10",
      "STA remainder",
      "INC tens",
      "JMP tensStart",
      "decimalDisplay:",
      "LDA hundreds",
      "STA $00E6",
      "LDA tens",
      "ASL",
      "ASL",
      "ASL",
      "ASL",
      "ORA remainder",
      "STA $00E7"
    ]);
  } else {
    lines = lines.concat([
      "LDA current",
      "LSR",
      "LSR",
      "LSR",
      "LSR",
      "ASL",
      "TAX",
      "LDA binaryPairs,X",
      "STA $00E4",
      "INX",
      "LDA binaryPairs,X",
      "STA $00E5",
      "LDA current",
      "AND #$0F",
      "ASL",
      "TAX",
      "LDA binaryPairs,X",
      "STA $00E6",
      "INX",
      "LDA binaryPairs,X",
      "STA $00E7"
    ]);
  }

  lines.push("RTS");
  if (base === "binary") {
    lines = lines.concat([
      "binaryPairs:",
      "DCB $00,$00,$00,$01,$00,$10,$00,$11",
      "DCB $01,$00,$01,$01,$01,$10,$01,$11",
      "DCB $10,$00,$10,$01,$10,$10,$10,$11",
      "DCB $11,$00,$11,$01,$11,$10,$11,$11"
    ]);
  }

  return lines.join("\n");
}

function createAutomaticLedCounterSample(base) {
  var countUp;
  var countDown;

  if (base === "bcd") {
    countUp = [
      "LDX #$07",
      "bcdUpByte:",
      "LDA $00E0,X",
      "AND #$0F",
      "CLC",
      "ADC #$01",
      "CMP #$0A",
      "BCC bcdStoreLow",
      "LDA $00E0,X",
      "LSR",
      "LSR",
      "LSR",
      "LSR",
      "CLC",
      "ADC #$01",
      "CMP #$0A",
      "BCC bcdStoreHigh",
      "LDA #$00",
      "STA $00E0,X",
      "DEX",
      "BPL bcdUpByte",
      "JMP main",
      "bcdStoreHigh:",
      "ASL",
      "ASL",
      "ASL",
      "ASL",
      "STA $00E0,X",
      "JMP main",
      "bcdStoreLow:",
      "STA $fc",
      "LDA $00E0,X",
      "AND #$F0",
      "ORA $fc",
      "STA $00E0,X"
    ];
    countDown = [
      "LDX #$00",
      "bcdCheckZero:",
      "LDA $00E0,X",
      "BNE bcdDecrement",
      "INX",
      "CPX #$08",
      "BNE bcdCheckZero",
      "JMP stopAtZero",
      "bcdDecrement:",
      "LDX #$07",
      "bcdDownByte:",
      "LDA $00E0,X",
      "AND #$0F",
      "BEQ bcdBorrowLow",
      "SEC",
      "SBC #$01",
      "STA $fc",
      "LDA $00E0,X",
      "AND #$F0",
      "ORA $fc",
      "STA $00E0,X",
      "JMP main",
      "bcdBorrowLow:",
      "LDA $00E0,X",
      "LSR",
      "LSR",
      "LSR",
      "LSR",
      "BEQ bcdBorrowByte",
      "SEC",
      "SBC #$01",
      "ASL",
      "ASL",
      "ASL",
      "ASL",
      "ORA #$09",
      "STA $00E0,X",
      "JMP main",
      "bcdBorrowByte:",
      "LDA #$99",
      "STA $00E0,X",
      "DEX",
      "BPL bcdDownByte"
    ];
  } else if (base === "binary") {
    countUp = [
      "LDX #$07",
      "binaryUpByte:",
      "LDA $00E0,X",
      "AND #$0F",
      "BNE binaryCheckHigh",
      "LDA $00E0,X",
      "ORA #$01",
      "STA $00E0,X",
      "JMP main",
      "binaryCheckHigh:",
      "LDA $00E0,X",
      "AND #$F0",
      "STA $fc",
      "LDA $00E0,X",
      "LSR",
      "LSR",
      "LSR",
      "LSR",
      "BNE binaryCarryByte",
      "LDA $fc",
      "ORA #$10",
      "STA $00E0,X",
      "JMP main",
      "binaryCarryByte:",
      "LDA #$00",
      "STA $00E0,X",
      "DEX",
      "BPL binaryUpByte"
    ];
    countDown = [
      "LDX #$00",
      "binaryCheckZero:",
      "LDA $00E0,X",
      "BNE binaryDecrement",
      "INX",
      "CPX #$08",
      "BNE binaryCheckZero",
      "JMP stopAtZero",
      "binaryDecrement:",
      "LDX #$07",
      "binaryDownByte:",
      "LDA $00E0,X",
      "AND #$0F",
      "BNE binaryClearLow",
      "LDA $00E0,X",
      "LSR",
      "LSR",
      "LSR",
      "LSR",
      "BEQ binaryBorrowByte",
      "LDA #$01",
      "STA $00E0,X",
      "JMP main",
      "binaryBorrowByte:",
      "LDA #$11",
      "STA $00E0,X",
      "DEX",
      "BPL binaryDownByte",
      "JMP main",
      "binaryClearLow:",
      "LDA $00E0,X",
      "AND #$F0",
      "STA $00E0,X"
    ];
  } else {
    countUp = [
      "CLC",
      "LDX #$07",
      "LDA $00E0,X",
      "ADC #$01",
      "STA $00E0,X",
      "DEX",
      "hexUpBytes:",
      "LDA $00E0,X",
      "ADC #$00",
      "STA $00E0,X",
      "DEX",
      "BPL hexUpBytes"
    ];
    countDown = [
      "LDX #$00",
      "hexCheckZero:",
      "LDA $00E0,X",
      "BNE hexDecrement",
      "INX",
      "CPX #$08",
      "BNE hexCheckZero",
      "JMP stopAtZero",
      "hexDecrement:",
      "SEC",
      "LDX #$07",
      "LDA $00E0,X",
      "SBC #$01",
      "STA $00E0,X",
      "DEX",
      "hexDownBytes:",
      "LDA $00E0,X",
      "SBC #$00",
      "STA $00E0,X",
      "DEX",
      "BPL hexDownBytes"
    ];
  }

  var lines = [
    "; Up starts counting up; Down counts down to zero; Left resets to zero.",
    "; Change the delay value below to adjust the counting speed.",
    "define mode $f8",
    "define key $fb",
    "define delayCount $fa",
    "start:",
    "LDA #$00",
    "STA mode",
    "LDX #$00",
    "clearDisplay:",
    "STA $00E0,X",
    "INX",
    "CPX #$08",
    "BNE clearDisplay",
    "main:",
    "LDA $ff",
    "BEQ noKey",
    "STA key",
    "LDA #$00",
    "STA $ff",
    "LDA key",
    "CMP #$26",
    "BEQ startUp",
    "CMP #$28",
    "BEQ startDown",
    "CMP #$25",
    "BEQ resetCounter",
    "JMP main",
    "startUp:",
    "LDA #$01",
    "STA mode",
    "JMP main",
    "startDown:",
    "LDA #$02",
    "STA mode",
    "JMP main",
    "resetCounter:",
    "LDA #$00",
    "STA mode",
    "LDX #$00",
    "resetDisplay:",
    "STA $00E0,X",
    "INX",
    "CPX #$08",
    "BNE resetDisplay",
    "JMP main",
    "noKey:",
    "LDA mode",
    "BEQ main",
    "JSR waitCount",
    "LDA $ff",
    "BNE main",
    "LDA mode",
    "CMP #$01",
    "BNE countDown",
    "countUp:"
  ];

  lines = lines.concat(countUp, ["JMP main", "countDown:"], countDown, [
    "JMP main",
    "stopAtZero:",
    "LDA #$00",
    "STA mode",
    "JMP main",
    "waitCount:",
    "; Increase this immediate value to slow the counter; decrease it to speed up.",
    "LDA #$01",
    "STA delayCount",
    "waitBlock:",
    "LDA $ff",
    "BNE waitDone",
    "LDX #$00",
    "waitInner:",
    "DEX",
    "BNE waitInner",
    "DEC delayCount",
    "BNE waitBlock",
    "waitDone:",
    "RTS"
  ]);
  return lines.join("\n");
}

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
  "keyboard-led-display": {
    filename: "keyboard-led-display.asm",
    code: "; Display key codes as hexadecimal bytes, wrapping after eight keys.\n" +
      "; Press Enter to clear the display.\n" +
      "define key $ff\n" +
      "start:\n" +
      "LDX #$00\n" +
      "LDA #$00\n" +
      "initializeDisplay:\n" +
      "STA $00E0,X\n" +
      "INX\n" +
      "CPX #$08\n" +
      "BNE initializeDisplay\n" +
      "LDX #$00\n" +
      "main:\n" +
      "LDA key\n" +
      "BEQ main\n" +
      "CMP #$0D\n" +
      "BEQ clearKeys\n" +
      "STA $00E0,X\n" +
      "INX\n" +
      "CPX #$08\n" +
      "BNE acknowledgeKey\n" +
      "LDX #$00\n" +
      "acknowledgeKey:\n" +
      "LDA #$00\n" +
      "STA key\n" +
      "JMP main\n" +
      "clearKeys:\n" +
      "LDA #$00\n" +
      "STA key\n" +
      "LDX #$00\n" +
      "clearDisplay:\n" +
      "STA $00E0,X\n" +
      "INX\n" +
      "CPX #$08\n" +
      "BNE clearDisplay\n" +
      "LDX #$00\n" +
      "JMP main"
  },
  "calculator-binary": {
    filename: "calculator-binary.asm",
    code: createCalculatorSample("binary")
  },
  "calculator-decimal": {
    filename: "calculator-decimal.asm",
    code: createCalculatorSample("decimal")
  },
  "calculator-hexadecimal": {
    filename: "calculator-hexadecimal.asm",
    code: createCalculatorSample("hexadecimal")
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
  "seven-segment-count-up-down": {
    filename: "seven-segment-count-up-down.asm",
    code: "; Press + or Up to count up; press - or Down to count down.\n" +
      "; The byte wraps between $00 and $FF.\n" +
      "define key $f8\n" +
      "define counter $f9\n" +
      "start:\n" +
      "LDA #$00\n" +
      "STA counter\n" +
      "STA $00E7\n" +
      "main:\n" +
      "LDA $ff\n" +
      "BEQ main\n" +
      "STA key\n" +
      "LDA #$00\n" +
      "STA $ff\n" +
      "LDA key\n" +
      "CMP #$2B\n" +
      "BEQ countUp\n" +
      "CMP #$26\n" +
      "BEQ countUp\n" +
      "CMP #$2D\n" +
      "BEQ countDown\n" +
      "CMP #$28\n" +
      "BEQ countDown\n" +
      "JMP main\n" +
      "countUp:\n" +
      "INC counter\n" +
      "JMP showCount\n" +
      "countDown:\n" +
      "DEC counter\n" +
      "showCount:\n" +
      "LDA counter\n" +
      "STA $00E7\n" +
      "JMP main"
  },
  "seven-segment-auto-counter": {
    filename: "seven-segment-auto-counter.asm",
    code: createAutomaticLedCounterSample("hexadecimal")
  },
  "seven-segment-auto-counter-bcd": {
    filename: "seven-segment-auto-counter-bcd.asm",
    code: createAutomaticLedCounterSample("bcd")
  },
  "seven-segment-auto-counter-binary": {
    filename: "seven-segment-auto-counter-binary.asm",
    code: createAutomaticLedCounterSample("binary")
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
