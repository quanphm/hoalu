let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
	if (!ctx) {
		ctx = new AudioContext();
	}
	return ctx;
}

// Warm up the OS audio hardware on the very first user gesture.
// This runs before any real sound is triggered, so the hardware pipeline
// is already initialised and "hot" when playBuffer() is first called.
function warmUp() {
	const c = getCtx();
	if (c.state === "suspended") {
		c.resume();
	}
	document.removeEventListener("pointerdown", warmUp, true);
	document.removeEventListener("keydown", warmUp, true);
}

// Capture phase (true) → fires before React synthetic handlers,
// ensuring warm-up happens as early as possible on first interaction.
document.addEventListener("pointerdown", warmUp, true);
document.addEventListener("keydown", warmUp, true);

// Fetch and fully decode a sound file into a raw PCM AudioBuffer.
// Decoding happens once at module load time — play() has zero decode work to do.
async function loadSound(url: string): Promise<AudioBuffer> {
	const c = getCtx();
	const res = await fetch(url);
	const arrayBuffer = await res.arrayBuffer();
	return c.decodeAudioData(arrayBuffer);
}

// Play a pre-decoded AudioBuffer immediately.
// Because the buffer is already raw PCM and the hardware is already warm,
// playback starts instantly with no glitch.
function playBuffer(buffer: AudioBuffer): void {
	const c = getCtx();

	if (c.state === "suspended") {
		c.resume();
	}

	const gain = c.createGain();
	// gain.gain.value = 0.5;

	const source = c.createBufferSource();
	source.buffer = buffer;
	source.connect(gain);
	gain.connect(c.destination);
	source.start(0);
}

const dropBuffer = loadSound("/sounds/drop.ogg");
const confirmBuffer = loadSound("/sounds/confirm.mp3");

export const playDropSound = () => dropBuffer.then(playBuffer).catch(() => void 0);
export const playConfirmSound = () => confirmBuffer.then(playBuffer).catch(() => void 0);
