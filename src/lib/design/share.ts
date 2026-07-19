import { parseDesign, type SystemDesign } from '$lib/design/schema';

/**
 * Backend-free sharing: a design is deflate-compressed and base64url-encoded
 * into the URL hash (`#d=…`). Anyone opening the link rehydrates the exact
 * system. Falls back to uncompressed encoding where CompressionStream is
 * unavailable (marked with a `u` prefix).
 */

const HASH_KEY = 'd';

// ---- base64url ---------------------------------------------------------
const toB64url = (bytes: Uint8Array): string => {
	let bin = '';
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromB64url = (str: string): Uint8Array => {
	const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
	const bin = atob(b64);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
};

// ---- deflate via CompressionStream (feature-detected) ------------------
const hasCompression = () => typeof CompressionStream !== 'undefined';

async function deflate(text: string): Promise<Uint8Array> {
	const input = new TextEncoder().encode(text);
	const cs = new CompressionStream('deflate-raw');
	const stream = new Response(input).body!.pipeThrough(cs);
	const buf = await new Response(stream).arrayBuffer();
	return new Uint8Array(buf);
}

async function inflate(bytes: Uint8Array): Promise<string> {
	const ds = new DecompressionStream('deflate-raw');
	const stream = new Response(bytes).body!.pipeThrough(ds);
	const buf = await new Response(stream).arrayBuffer();
	return new TextDecoder().decode(buf);
}

/** Encode a design into a compact token (prefix: `c` compressed, `u` plain). */
export async function encodeDesign(design: SystemDesign): Promise<string> {
	const json = JSON.stringify(design);
	if (hasCompression()) return 'c' + toB64url(await deflate(json));
	return 'u' + toB64url(new TextEncoder().encode(json));
}

/** Decode a token back into a validated design (or throws). */
export async function decodeDesign(token: string): Promise<SystemDesign> {
	const tag = token[0];
	const body = token.slice(1);
	let json: string;
	if (tag === 'c') json = await inflate(fromB64url(body));
	else if (tag === 'u') json = new TextDecoder().decode(fromB64url(body));
	else json = new TextDecoder().decode(fromB64url(token)); // legacy/no-tag
	const parsed = parseDesign(JSON.parse(json));
	if (!parsed.ok) throw new Error(parsed.error);
	return parsed.design;
}

/** Build a full shareable URL for the current design. */
export async function buildShareUrl(design: SystemDesign): Promise<string> {
	const token = await encodeDesign(design);
	const { origin, pathname } = window.location;
	return `${origin}${pathname}#${HASH_KEY}=${token}`;
}

/** Read a design from the current URL hash, if present. */
export async function readDesignFromHash(): Promise<SystemDesign | null> {
	const hash = window.location.hash.replace(/^#/, '');
	const params = new URLSearchParams(hash);
	const token = params.get(HASH_KEY);
	if (!token) return null;
	try {
		return await decodeDesign(token);
	} catch {
		return null;
	}
}

export function clearHash() {
	history.replaceState(null, '', window.location.pathname + window.location.search);
}

// ---- JSON file export / import ----------------------------------------
export function exportDesignFile(design: SystemDesign) {
	const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	const safeName = (design.name ?? 'system-design').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
	a.href = url;
	a.download = `${safeName}.json`;
	a.click();
	URL.revokeObjectURL(url);
}

export function importDesignFile(): Promise<SystemDesign> {
	return new Promise((resolve, reject) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json,.json';
		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file) return reject(new Error('No file selected'));
			try {
				const parsed = parseDesign(JSON.parse(await file.text()));
				if (!parsed.ok) return reject(new Error(parsed.error));
				resolve(parsed.design);
			} catch (e) {
				reject(e instanceof Error ? e : new Error('Invalid JSON'));
			}
		};
		input.click();
	});
}
