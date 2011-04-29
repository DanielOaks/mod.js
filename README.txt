
Effects implemented:

0xy: Arpeggio
1xx: Pitch slide up (portamento)
2xx: Pitch slide down
3xx: Portamento to note [slightly buggy]
5xy: Portamento to note with volume slide [untested]
9xx Sample offset
Axy: Volume slide
Cxx: Set note volume
Dxx Pattern break
Fxx: Set BPM
Exy Subcommands:
	E1x Fine portamento up
	E2x Fine portamento down
	E5x Set note fine-tune [untested]
	E9x Re-trigger note
	EAx Fine volume slide up
	EBx Fine volume slide down
	ECx Note cut
	EDx Note delay


In progress:

4xy Vibrato
6xy Vibrato with volume slide
8xx Set note panning position
Bxx Jump to order [buggy]
Exy Subcommands:
	E6x Pattern loop
	EEx Pattern delay


Not implemented:

7xy Tremolo
Exy Subcommands:
	E0x Amiga LED Filter toggle
	E3x Glissando control
	E4x Vibrato control
	E7x Tremolo control
	E8x Set note panning position
	EFx Funk it!

http://www.milkytracker.org/docs/MilkyTracker.html#effects

==========================================================

TODO:

	- Implement additional effects. Try to pass the Ode to Protracker test :)
	- Wean off dynamicaudio.js (eventually)
	