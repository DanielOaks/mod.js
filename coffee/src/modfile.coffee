ModFile = (mod) ->
  trimNulls = (str) ->
    str.replace /\x00+$/, ""
  getWord = (str, pos) ->
    (str.charCodeAt(pos) << 8) + str.charCodeAt(pos + 1)
  @data = mod
  @samples = []
  @sampleData = []
  @positions = []
  @patternCount = 0
  @patterns = []
  @title = trimNulls(mod.substr(0, 20))
  @sampleCount = 31
  i = 0

  while i < @sampleCount
    sampleInfo = mod.substr(20 + i * 30, 30)
    sampleName = trimNulls(sampleInfo.substr(0, 22))
    @samples[i] =
      length: getWord(sampleInfo, 22) * 2
      finetune: sampleInfo.charCodeAt(24)
      volume: sampleInfo.charCodeAt(25)
      repeatOffset: getWord(sampleInfo, 26) * 2
      repeatLength: getWord(sampleInfo, 28) * 2
    i++
  @positionCount = mod.charCodeAt(950)
  @positionLoopPoint = mod.charCodeAt(951)
  i = 0

  while i < 128
    @positions[i] = mod.charCodeAt(952 + i)
    @patternCount = @positions[i] + 1  if @positions[i] >= @patternCount
    i++
  identifier = mod.substr(1080, 4)
  @channelCount = channelCountByIdentifier[identifier]
  @channelCount = 4  unless @channelCount
  patternOffset = 1084
  pat = 0

  while pat < @patternCount
    @patterns[pat] = []
    row = 0

    while row < 64
      @patterns[pat][row] = []
      chan = 0

      while chan < @channelCount
        b0 = mod.charCodeAt(patternOffset)
        b1 = mod.charCodeAt(patternOffset + 1)
        b2 = mod.charCodeAt(patternOffset + 2)
        b3 = mod.charCodeAt(patternOffset + 3)
        eff = b2 & 0x0f
        @patterns[pat][row][chan] =
          sample: (b0 & 0xf0) | (b2 >> 4)
          period: ((b0 & 0x0f) << 8) | b1
          effect: eff
          effectParameter: b3

        if eff is 0x0E
          @patterns[pat][row][chan].extEffect = (b3 & 0xF0) >> 4
          @patterns[pat][row][chan].extEffectParameter = (b3 & 0x0F)
        patternOffset += 4
        chan++
      row++
    pat++
  sampleOffset = patternOffset
  s = 0

  while s < @sampleCount
    @samples[s].startOffset = sampleOffset
    @sampleData[s] = new Uint8Array(@samples[s].length, "uint8")
    i = 0
    o = sampleOffset
    e = sampleOffset + @samples[s].length

    while o < e
      @sampleData[s][i] = mod.charCodeAt(o)
      i++
      o++
    sampleOffset += @samples[s].length
    s++
channelCountByIdentifier =
  "TDZ1": 1
  "1CHN": 1
  "TDZ2": 2
  "2CHN": 2
  "TDZ3": 3
  "3CHN": 3
  "M.K.": 4
  "FLT4": 4
  "M!K!": 4
  "4CHN": 4
  "TDZ4": 4
  "5CHN": 5
  "TDZ5": 5
  "6CHN": 6
  "TDZ6": 6
  "7CHN": 7
  "TDZ7": 7
  "8CHN": 8
  "TDZ8": 8
  "OCTA": 8
  "CD81": 8
  "9CHN": 9
  "TDZ9": 9
  "10CH": 10
  "11CH": 11
  "12CH": 12
  "13CH": 13
  "14CH": 14
  "15CH": 15
  "16CH": 16
  "17CH": 17
  "18CH": 18
  "19CH": 19
  "20CH": 20
  "21CH": 21
  "22CH": 22
  "23CH": 23
  "24CH": 24
  "25CH": 25
  "26CH": 26
  "27CH": 27
  "28CH": 28
  "29CH": 29
  "30CH": 30
  "31CH": 31
  "32CH": 32
