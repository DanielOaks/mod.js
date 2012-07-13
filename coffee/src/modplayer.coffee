# ModPeriodTable[ft][n] = the period to use for note number n at finetune value ft.
# Finetune values are in twos-complement, i.e. [0,1,2,3,4,5,6,7,-8,-7,-6,-5,-4,-3,-2,-1]
# The first table is used to generate a reverse lookup table, to find out the note number
# for a period given in the MOD file.

ModPeriodTable = [
	[1712, 1616, 1524, 1440, 1356, 1280, 1208, 1140, 1076, 1016, 960 , 906,
	 856 , 808 , 762 , 720 , 678 , 640 , 604 , 570 , 538 , 508 , 480 , 453,
	 428 , 404 , 381 , 360 , 339 , 320 , 302 , 285 , 269 , 254 , 240 , 226,
	 214 , 202 , 190 , 180 , 170 , 160 , 151 , 143 , 135 , 127 , 120 , 113,
	 107 , 101 , 95  , 90  , 85  , 80  , 75  , 71  , 67  , 63  , 60  , 56 ],
	[1700, 1604, 1514, 1430, 1348, 1274, 1202, 1134, 1070, 1010, 954 , 900,
	 850 , 802 , 757 , 715 , 674 , 637 , 601 , 567 , 535 , 505 , 477 , 450,
	 425 , 401 , 379 , 357 , 337 , 318 , 300 , 284 , 268 , 253 , 239 , 225,
	 213 , 201 , 189 , 179 , 169 , 159 , 150 , 142 , 134 , 126 , 119 , 113,
	 106 , 100 , 94  , 89  , 84  , 79  , 75  , 71  , 67  , 63  , 59  , 56 ],
	[1688, 1592, 1504, 1418, 1340, 1264, 1194, 1126, 1064, 1004, 948 , 894,
	 844 , 796 , 752 , 709 , 670 , 632 , 597 , 563 , 532 , 502 , 474 , 447,
	 422 , 398 , 376 , 355 , 335 , 316 , 298 , 282 , 266 , 251 , 237 , 224,
	 211 , 199 , 188 , 177 , 167 , 158 , 149 , 141 , 133 , 125 , 118 , 112,
	 105 , 99  , 94  , 88  , 83  , 79  , 74  , 70  , 66  , 62  , 59  , 56 ],
	[1676, 1582, 1492, 1408, 1330, 1256, 1184, 1118, 1056, 996 , 940 , 888,
	 838 , 791 , 746 , 704 , 665 , 628 , 592 , 559 , 528 , 498 , 470 , 444,
	 419 , 395 , 373 , 352 , 332 , 314 , 296 , 280 , 264 , 249 , 235 , 222,
	 209 , 198 , 187 , 176 , 166 , 157 , 148 , 140 , 132 , 125 , 118 , 111,
	 104 , 99  , 93  , 88  , 83  , 78  , 74  , 70  , 66  , 62  , 59  , 55 ],
	[1664, 1570, 1482, 1398, 1320, 1246, 1176, 1110, 1048, 990 , 934 , 882,
	 832 , 785 , 741 , 699 , 660 , 623 , 588 , 555 , 524 , 495 , 467 , 441,
	 416 , 392 , 370 , 350 , 330 , 312 , 294 , 278 , 262 , 247 , 233 , 220,
	 208 , 196 , 185 , 175 , 165 , 156 , 147 , 139 , 131 , 124 , 117 , 110,
	 104 , 98  , 92  , 87  , 82  , 78  , 73  , 69  , 65  , 62  , 58  , 55 ],
	[1652, 1558, 1472, 1388, 1310, 1238, 1168, 1102, 1040, 982 , 926 , 874,
	 826 , 779 , 736 , 694 , 655 , 619 , 584 , 551 , 520 , 491 , 463 , 437,
	 413 , 390 , 368 , 347 , 328 , 309 , 292 , 276 , 260 , 245 , 232 , 219,
	 206 , 195 , 184 , 174 , 164 , 155 , 146 , 138 , 130 , 123 , 116 , 109,
	 103 , 97  , 92  , 87  , 82  , 77  , 73  , 69  , 65  , 61  , 58  , 54 ],
	[1640, 1548, 1460, 1378, 1302, 1228, 1160, 1094, 1032, 974 , 920 , 868,
	 820 , 774 , 730 , 689 , 651 , 614 , 580 , 547 , 516 , 487 , 460 , 434,
	 410 , 387 , 365 , 345 , 325 , 307 , 290 , 274 , 258 , 244 , 230 , 217,
	 205 , 193 , 183 , 172 , 163 , 154 , 145 , 137 , 129 , 122 , 115 , 109,
	 102 , 96  , 91  , 86  , 81  , 77  , 72  , 68  , 64  , 61  , 57  , 54 ],
	[1628, 1536, 1450, 1368, 1292, 1220, 1150, 1086, 1026, 968 , 914 , 862,
	 814 , 768 , 725 , 684 , 646 , 610 , 575 , 543 , 513 , 484 , 457 , 431,
	 407 , 384 , 363 , 342 , 323 , 305 , 288 , 272 , 256 , 242 , 228 , 216,
	 204 , 192 , 181 , 171 , 161 , 152 , 144 , 136 , 128 , 121 , 114 , 108,
	 102 , 96  , 90  , 85  , 80  , 76  , 72  , 68  , 64  , 60  , 57  , 54 ],
	[1814, 1712, 1616, 1524, 1440, 1356, 1280, 1208, 1140, 1076, 1016, 960,
	 907 , 856 , 808 , 762 , 720 , 678 , 640 , 604 , 570 , 538 , 508 , 480,
	 453 , 428 , 404 , 381 , 360 , 339 , 320 , 302 , 285 , 269 , 254 , 240,
	 226 , 214 , 202 , 190 , 180 , 170 , 160 , 151 , 143 , 135 , 127 , 120,
	 113 , 107 , 101 , 95  , 90  , 85  , 80  , 75  , 71  , 67  , 63  , 60 ],
	[1800, 1700, 1604, 1514, 1430, 1350, 1272, 1202, 1134, 1070, 1010, 954,
	 900 , 850 , 802 , 757 , 715 , 675 , 636 , 601 , 567 , 535 , 505 , 477,
	 450 , 425 , 401 , 379 , 357 , 337 , 318 , 300 , 284 , 268 , 253 , 238,
	 225 , 212 , 200 , 189 , 179 , 169 , 159 , 150 , 142 , 134 , 126 , 119,
	 112 , 106 , 100 , 94  , 89  , 84  , 79  , 75  , 71  , 67  , 63  , 59 ],
	[1788, 1688, 1592, 1504, 1418, 1340, 1264, 1194, 1126, 1064, 1004, 948,
	 894 , 844 , 796 , 752 , 709 , 670 , 632 , 597 , 563 , 532 , 502 , 474,
	 447 , 422 , 398 , 376 , 355 , 335 , 316 , 298 , 282 , 266 , 251 , 237,
	 223 , 211 , 199 , 188 , 177 , 167 , 158 , 149 , 141 , 133 , 125 , 118,
	 111 , 105 , 99  , 94  , 88  , 83  , 79  , 74  , 70  , 66  , 62  , 59 ],
	[1774, 1676, 1582, 1492, 1408, 1330, 1256, 1184, 1118, 1056, 996 , 940,
	 887 , 838 , 791 , 746 , 704 , 665 , 628 , 592 , 559 , 528 , 498 , 470,
	 444 , 419 , 395 , 373 , 352 , 332 , 314 , 296 , 280 , 264 , 249 , 235,
	 222 , 209 , 198 , 187 , 176 , 166 , 157 , 148 , 140 , 132 , 125 , 118,
	 111 , 104 , 99  , 93  , 88  , 83  , 78  , 74  , 70  , 66  , 62  , 59 ],
	[1762, 1664, 1570, 1482, 1398, 1320, 1246, 1176, 1110, 1048, 988 , 934,
	 881 , 832 , 785 , 741 , 699 , 660 , 623 , 588 , 555 , 524 , 494 , 467,
	 441 , 416 , 392 , 370 , 350 , 330 , 312 , 294 , 278 , 262 , 247 , 233,
	 220 , 208 , 196 , 185 , 175 , 165 , 156 , 147 , 139 , 131 , 123 , 117,
	 110 , 104 , 98  , 92  , 87  , 82  , 78  , 73  , 69  , 65  , 61  , 58 ],
	[1750, 1652, 1558, 1472, 1388, 1310, 1238, 1168, 1102, 1040, 982 , 926,
	 875 , 826 , 779 , 736 , 694 , 655 , 619 , 584 , 551 , 520 , 491 , 463,
	 437 , 413 , 390 , 368 , 347 , 328 , 309 , 292 , 276 , 260 , 245 , 232,
	 219 , 206 , 195 , 184 , 174 , 164 , 155 , 146 , 138 , 130 , 123 , 116,
	 109 , 103 , 97  , 92  , 87  , 82  , 77  , 73  , 69  , 65  , 61  , 58 ],
	[1736, 1640, 1548, 1460, 1378, 1302, 1228, 1160, 1094, 1032, 974 , 920,
	 868 , 820 , 774 , 730 , 689 , 651 , 614 , 580 , 547 , 516 , 487 , 460,
	 434 , 410 , 387 , 365 , 345 , 325 , 307 , 290 , 274 , 258 , 244 , 230,
	 217 , 205 , 193 , 183 , 172 , 163 , 154 , 145 , 137 , 129 , 122 , 115,
	 108 , 102 , 96  , 91  , 86  , 81  , 77  , 72  , 68  , 64  , 61  , 57 ],
	[1724, 1628, 1536, 1450, 1368, 1292, 1220, 1150, 1086, 1026, 968 , 914,
	 862 , 814 , 768 , 725 , 684 , 646 , 610 , 575 , 543 , 513 , 484 , 457,
	 431 , 407 , 384 , 363 , 342 , 323 , 305 , 288 , 272 , 256 , 242 , 228,
	 216 , 203 , 192 , 181 , 171 , 161 , 152 , 144 , 136 , 128 , 121 , 114,
	 108 , 101 , 96  , 90  , 85  , 80  , 76  , 72  , 68  , 64  , 60  , 57 ]]
	 
SineTable = [
	0,24,49,74,97,120,141,161,180,197,212,224,235,244,250,253,
	255,253,250,244,235,224,212,197,180,161,141,120,97,74,49,
	24,0,-24,-49,-74,-97,-120,-141,-161,-180,-197,-212,-224,
	-235,-244,-250,-253,-255,-253,-250,-244,-235,-224,-212,-197,
	-180,-161,-141,-120,-97,-74,-49,-24]

ModPeriodToNoteNumber = {}
i = 0

while i < ModPeriodTable[0].length
  ModPeriodToNoteNumber[ModPeriodTable[0][i]] = i
  i++

ModPlayer = (mod, rate) ->
  setBpm = (bpm) ->
    ticksPerFrame = Math.round(ticksPerSecond * 2.5 / bpm)


  ticksPerSecond = 7093789.2
  ticksPerFrame = undefined
  ticksPerOutputSample = Math.round(ticksPerSecond / rate)
  ticksSinceStartOfFrame = 0
  setBpm 125
  framesPerRow = 6
  currentFrame = 0
  currentPattern = undefined
  currentPosition = undefined
  currentRow = undefined
  exLoop = false
  exLoopStart = 0
  exLoopEnd = 0
  exLoopCount = 0
  doBreak = false
  breakPos = 0
  breakRow = 0
  delayRows = false
  channels = []
  chan = 0

  while chan < mod.channelCount
    channels[chan] =
      playing: false
      sample: mod.samples[0]
      finetune: 0
      volume: 0
      pan: 0x7F
      volumeDelta: 0
      periodDelta: 0
      fineVolumeDelta: 0
      finePeriodDelta: 0
      tonePortaTarget: 0
      tonePortaDelta: 0
      tonePortaVolStep: 0
      tonePortaActive: false
      cut: false
      delay: false
      arpeggioActive: false
    chan++


  loadRow = (rowNumber) ->
    currentRow = rowNumber
    currentFrame = 0
    doBreak = false
    breakPos = 0
    breakRow = 0
    chan = 0

    while chan < mod.channelCount
      channel = channels[chan]
      prevNote = channel.prevNote
      note = currentPattern[currentRow][chan]
      channel.sampleNum = 0  if channel.sampleNum is `undefined`
      if note.period isnt 0 or note.sample isnt 0
        channel.playing = true
        channel.samplePosition = 0
        channel.ticksSinceStartOfSample = 0
        unless note.sample is 0
          channel.sample = mod.samples[note.sample - 1]
          channel.sampleNum = note.sample - 1
          channel.volume = channel.sample.volume
          channel.finetune = channel.sample.finetune
        unless note.period is 0
          unless note.effect is 0x03
            channel.noteNumber = ModPeriodToNoteNumber[note.period]
            channel.ticksPerSample = ModPeriodTable[channel.finetune][channel.noteNumber] * 2
          else
            channel.noteNumber = ModPeriodToNoteNumber[prevNote.period]
            channel.ticksPerSample = ModPeriodTable[channel.finetune][channel.noteNumber] * 2
      channel.finePeriodDelta = 0
      channel.fineVolumeDelta = 0
      channel.cut = false
      channel.delay = false
      channel.retrigger = false
      channel.tonePortaActive = false
      if note.effect isnt 0 or note.effectParameter isnt 0
        channel.volumeDelta = 0
        channel.periodDelta = 0
        channel.arpeggioActive = false
        switch note.effect
          when 0x00
            channel.arpeggioActive = true
            channel.arpeggioNotes = [ channel.noteNumber, channel.noteNumber + (note.effectParameter >> 4), channel.noteNumber + (note.effectParameter & 0x0f) ]
            channel.arpeggioCounter = 0
          when 0x01
            channel.periodDelta = -note.effectParameter
          when 0x02
            channel.periodDelta = note.effectParameter
          when 0x03
            channel.tonePortaActive = true
            channel.tonePortaTarget = (if (note.period isnt 0) then note.period else channel.tonePortaTarget)
            dir = (if (channel.tonePortaTarget < prevNote.period) then -1 else 1)
            channel.tonePortaDelta = (note.effectParameter * dir)
            channel.tonePortaVolStep = (note.effectParameter * dir)
            channel.tonePortaDir = dir
          when 0x05
            channel.tonePortaActive = true
            if note.effectParameter & 0xf0
              channel.volumeDelta = note.effectParameter >> 4
            else
              channel.volumeDelta = -note.effectParameter
            channel.tonePortaDelta = channel.tonePortaVolStep
          when 0x09
            channel.samplePosition = 256 * note.effectParameter
          when 0x0A
            if note.effectParameter & 0xf0
              channel.volumeDelta = note.effectParameter >> 4
            else
              channel.volumeDelta = -note.effectParameter
          when 0x0B
            doBreak = true
            breakPos = note.effectParameter
            breakRow = 0
          when 0x0C
            if note.effectParameter > 64
              channel.volume = 64
            else
              channel.volume = note.effectParameter
          when 0x0D
            doBreak = true
            breakPos = currentPosition + 1
            breakRow = ((note.effectParameter & 0xF0) >> 4) * 10 + (note.effectParameter & 0x0F)
          when 0x0E
            switch note.extEffect
              when 0x01
                channel.finePeriodDelta = -note.extEffectParameter
              when 0x02
                channel.finePeriodDelta = note.extEffectParameter
              when 0x05
                channel.finetune = note.extEffectParameter
              when 0x09
                channel.retrigger = note.extEffectParameter
              when 0x0A
                channel.fineVolumeDelta = note.extEffectParameter
              when 0x0B
                channel.fineVolumeDelta = -note.extEffectParameter
              when 0x0C
                channel.cut = note.extEffectParameter
              when 0x0D
                channel.delay = note.extEffectParameter
              when 0x0E
                delayRows = note.extEffectParameter
              when 0x06
                if note.extEffectParameter is 0
                  exLoopStart = currentRow
                else
                  exLoopEnd = currentRow
                  unless exLoop
                    exLoop = true
                    exLoopCount = note.extEffectParameter
          when 0x0F
            newSpeed = (if (note.effectParameter is 0) then 1 else note.effectParameter)
            if newSpeed <= 32
              framesPerRow = newSpeed
            else
              setBpm newSpeed
      channel.prevNote = note  unless note.period is 0
      if channel.tonePortaActive is false
        channel.tonePortaDelta = 0
        channel.tonePortaTarget = 0
        channel.tonePortaVolStep = 0
      chan++
  loadPattern = (patternNumber) ->
    row = (if doBreak then breakRow else 0)
    currentPattern = mod.patterns[patternNumber]
    loadRow row
  loadPosition = (positionNumber) ->
    positionNumber = (if (positionNumber > mod.positionCount - 1) then 0 else positionNumber)
    currentPosition = positionNumber
    console.log("mod: " + mod)
    console.log("positions: " + mod.positions)
    console.log("currentPosition: " + currentPosition)
    console.log("[currentPosition]: " + mod.positions[currentPosition])
    loadPattern mod.positions[currentPosition]
  getNextPosition = ->
    if currentPosition + 1 >= mod.positionCount
      loadPosition mod.positionLoopPoint
    else
      loadPosition currentPosition + 1
  getNextRow = ->
    if doBreak
      breakPos = (if (breakPos >= mod.positionCount) then mod.positionLoopPoint else breakPos)
      loadPosition breakPos
    else if exLoop and currentRow is exLoopEnd and exLoopCount > 0
      loadRow exLoopStart
      exLoopCount--
    else
      if currentRow is 63
        getNextPosition()
      else
        loadRow currentRow + 1
    exLoop = false  if exLoopCount < 0
  doFrame = ->
    chan = 0

    while chan < mod.channelCount
      channel = channels[chan]
      finetune = channel.finetune
      if currentFrame is 0
        channel.ticksPerSample += channel.finePeriodDelta * 2
        channel.volume += channel.fineVolumeDelta
      channel.volume += channel.volumeDelta
      if channel.volume > 64
        channel.volume = 64
      else channel.volume = 0  if channel.volume < 0
      channel.volume = 0  if channel.cut isnt false and currentFrame >= channel.cut
      channel.volume = 0  if channel.delay isnt false and currentFrame <= channel.delay
      channel.samplePosition = 0  if channel.retrigger is 0 or currentFrame % channel.retrigger is 0  if channel.retrigger isnt false
      channel.ticksPerSample += channel.periodDelta * 2
      if channel.tonePortaActive
        channel.ticksPerSample += channel.tonePortaDelta * 2
        if channel.tonePortaDir is 1 and channel.ticksPerSample > channel.tonePortaTarget * 2
          channel.ticksPerSample = channel.tonePortaTarget * 2
        else channel.ticksPerSample = channel.tonePortaTarget * 2  if channel.tonePortaDir is -1 and channel.ticksPerSample < channel.tonePortaTarget * 2
      if channel.ticksPerSample > 4096
        channel.ticksPerSample = 4096
      else channel.ticksPerSample = 96  if channel.ticksPerSample < 96
      if channel.arpeggioActive
        channel.arpeggioCounter++
        noteNumber = channel.arpeggioNotes[channel.arpeggioCounter % 3]
        channel.ticksPerSample = ModPeriodTable[finetune][noteNumber] * 2
      chan++
    currentFrame++
    if currentFrame is framesPerRow
      currentFrame = 0
      if delayRows isnt false
        delayRows--
        delayRows = false  if delayRows < 0
      else
        getNextRow()
  
  loadPosition 0
  @getSamples = (sampleCount) ->
    samples = []
    i = 0
    while i < sampleCount
      ticksSinceStartOfFrame += ticksPerOutputSample
      while ticksSinceStartOfFrame >= ticksPerFrame
        doFrame()
        ticksSinceStartOfFrame -= ticksPerFrame
      leftOutputLevel = 0
      rightOutputLevel = 0
      chan = 0

      while chan < mod.channelCount
        channel = channels[chan]
        if channel.playing
          channel.ticksSinceStartOfSample += ticksPerOutputSample
          while channel.ticksSinceStartOfSample >= channel.ticksPerSample
            channel.samplePosition++
            if channel.sample.repeatLength > 2 and channel.samplePosition >= channel.sample.repeatOffset + channel.sample.repeatLength
              channel.samplePosition = channel.sample.repeatOffset
            else if channel.samplePosition >= channel.sample.length
              channel.playing = false
              break
            else
              channel.ticksSinceStartOfSample -= channel.ticksPerSample
          if channel.playing
            rawVol = mod.sampleData[channel.sampleNum][channel.samplePosition]
            vol = (((rawVol + 128) & 0xff) - 128) * channel.volume
            if chan & 3 is 0 or chan & 3 is 3
              leftOutputLevel += (vol + channel.pan) * 3
              rightOutputLevel += (vol + 0xFF - channel.pan)
            else
              leftOutputLevel += (vol + 0xFF - channel.pan)
              rightOutputLevel += (vol + channel.pan) * 3
        chan++
      samples[i] = leftOutputLevel / (128 * 128 * mod.channelCount)
      samples[i + 1] = rightOutputLevel / (128 * 128 * mod.channelCount)
      i += 2
    samples
  this

