; Doom-inspired 32x32 shooting gallery. Click the screen, then press Up to fire.
; Press lowercase R to reset the score. The target flashes when you shoot.
; This is a small pixel-art demo for the emulator, not the original Doom game.
define score $f8
define key $f9

start:
  ldx #$00
  lda #$0b
clearScreen:
  sta $0200,x
  sta $0300,x
  sta $0400,x
  sta $0500,x
  inx
  bne clearScreen

; Fill the ceiling and floor with brown.
  ldx #$00
  lda #$09
drawCeiling:
  sta $0200,x
  sta $0220,x
  sta $0240,x
  sta $0260,x
  inx
  cpx #$20
  bne drawCeiling

  ldx #$00
  lda #$09
drawFloor:
  sta $04a0,x
  sta $04c0,x
  sta $04e0,x
  sta $0500,x
  sta $0520,x
  sta $0540,x
  sta $0560,x
  sta $0580,x
  sta $05a0,x
  sta $05c0,x
  sta $05e0,x
  inx
  cpx #$20
  bne drawFloor

; Add bright stripes and rails to make the floor look like it recedes.
  lda #$08
  ldx #$00
drawFloorStripes:
  sta $04e0,x
  sta $0520,x
  sta $0560,x
  sta $05a0,x
  sta $05e0,x
  inx
  cpx #$20
  bne drawFloorStripes
  ldy #$00
  ldx #$0a
drawFloorRails:
  lda #$07
  sta $04af,y
  sta $04b0,y
  tya
  clc
  adc #$20
  tay
  dex
  bne drawFloorRails

; Draw the doorway sides and lintel.
  ldx #$08
  ldy #$00
drawDoorSides:
  lda #$0c
  sta $0264,y
  sta $027b,y
  tya
  clc
  adc #$20
  tay
  dex
  bne drawDoorSides
  lda #$0c
  ldx #$04
drawLintel:
  sta $02c0,x
  inx
  cpx #$1c
  bne drawLintel

; Pixel-art demon: head, shoulders, body, and legs.
  ldx #$08
  lda #$02
drawDemonHead:
  sta $032c,x
  sta $034c,x
  dex
  bne drawDemonHead
  ldx #$0c
drawDemonShoulders:
  sta $036a,x
  sta $038a,x
  sta $03aa,x
  dex
  bne drawDemonShoulders
  ldx #$08
drawDemonBody:
  sta $03ac,x
  sta $03cc,x
  dex
  bne drawDemonBody
  ldx #$04
drawDemonLegs:
  sta $03ed,x
  sta $03f1,x
  sta $040d,x
  sta $0411,x
  dex
  bne drawDemonLegs

; Draw the player's weapon at the bottom of the screen.
  lda #$0c
  ldx #$08
drawGunBarrel:
  sta $054c,x
  sta $056c,x
  dex
  bne drawGunBarrel
  ldx #$10
drawGunBody:
  sta $0588,x
  sta $05a8,x
  dex
  bne drawGunBody
  ldx #$18
drawGunBase:
  sta $05c4,x
  sta $05e4,x
  dex
  bne drawGunBase

; Bright eyes and the aiming point.
  lda #$07
  sta $036d
  sta $0372
  lda #$01
  sta $0390
  sta $038f
  sta $0391
  sta $0370
  sta $03b0
  lda #$00
  sta score
  sta $00e7

main:
  lda $00ff
  beq main
  sta key
  lda #$00
  sta $00ff
  lda key
  cmp #$26
  beq fire
  cmp #$72
  beq resetScore
  jmp main

fire:
  inc score
  lda score
  sta $00e7
  lda #$07
  sta $0390
  sta $038f
  sta $0391
  sta $0370
  sta $03b0
  lda #$08
  sta $054f
  sta $0550
  sta $056f
  sta $0570
  lda #$0a
  ldx #$0c
flashTarget:
  sta $036a,x
  sta $038a,x
  sta $03aa,x
  dex
  bne flashTarget
  jmp main

resetScore:
  lda #$00
  sta score
  sta $00e7
  jmp main
