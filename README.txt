
Effects implemented:

0xy: Arpeggio
1xx: Pitch slide up (portamento)
2xx: Pitch slide down
3xx Portamento to note [slightly buggy]
Axy: Volume slide
Cxx: Set note volume
Fxx: Set BPM
Exy Subcommands:
	E1x Fine portamento up
	E2x Fine portamento down
	E5x Set note fine-tune [untested]
	EAx Fine volume slide up
	EBx Fine volume slide down
	ECx Note cut
	EDx Note delay


In progress:

5xy Portamento to note with volume slide
9xx Sample offset
Dxx Pattern break [buggy]
Bxx Jump to order [buggy]
Exy Subcommands:
	E6x Pattern loop
	E9x Re-trigger note



Not implemented:

4xy Vibrato
6xy Vibrato with volume slide
7xy Tremolo
8xx Set note panning position
Exy Subcommands:
	E0x Amiga LED Filter toggle
	E3x Glissando control
	E4x Vibrato control
	E7x Tremolo control
	E8x Set note panning position
	EEx Pattern delay
	EFx Funk it!

http://www.milkytracker.org/docs/MilkyTracker.html#effects

==========================================================

TODO:

	- Implement additional effects. Try to pass the Ode to Protracker test :)
	- Wean off dynamicaudio.js (eventually)
	