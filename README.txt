Effects implemented:

0xy: Arpeggio
1xx: Pitch slide up (portamento)
2xx: Pitch slide down
Axy: Volume slide
Cxx: Set note volume
Fxx: Set BPM

Not implemented:

3xx Portamento to note
4xy Vibrato
5xy Portamento to note with volume slide
6xy Vibrato with volume slide
7xy Tremolo
8xx Set note panning position
9xx Sample offset
Bxx Jump to order
Dxx Pattern break
Exy Subcommands:
	E0x Amiga LED Filter toggle *
	E1x Fine portamento up
	E2x Fine portamento down
	E3x Glissando control **
	E4x Vibrato control **
	E5x Set note fine-tune
	E6x Pattern loop
	E7x Tremolo control **
	E8x Set note panning position ***
	E9x Re-trigger note
	EAx Fine volume slide up
	EBx Fine volume slide down
	ECx Note cut
	EDx Note delay
	EEx Pattern delay
	EFx Funk it! *

http://www.milkytracker.org/docs/MilkyTracker.html#effects

==========================================================

TODO:

	- Implement additional effects. Try to pass the Ode to Protracker test :)
	- Wean off dynamicaudio.js (eventually)
	