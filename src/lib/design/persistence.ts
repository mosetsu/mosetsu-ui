import { browser } from '$app/environment';
import type { SystemDesign } from '$lib/design/schema';

/**
 * Local persistence, backed by IndexedDB (async — writes do not block the main
 * thread, unlike sync localStorage).
 *
 * Two separate concerns share one object store:
 *   • DRAFT  (key `draft`)      — the live working canvas, autosaved for crash
 *                                  recovery. Never appears in the saved list.
 *   • SPECS  (key `spec:<id>`)  — explicit, named saves. Multiple may share a
 *                                  title; identity is the uuid.
 */

const DB_NAME = 'systemsage';
const DB_VERSION = 1;
const STORE = 'designs';

export const DRAFT_KEY = 'draft';
const SPEC_PREFIX = 'spec:';

export type SavedSpec = {
	id: string;
	name: string;
	updatedAt: number;
	nodeCount: number;
	design: SystemDesign;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
	if (!browser || !('indexedDB' in globalThis)) {
		return Promise.reject(new Error('IndexedDB unavailable'));
	}
	if (dbPromise) return dbPromise;
	dbPromise = new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) {
				db.createObjectStore(STORE, { keyPath: 'key' });
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
	return dbPromise;
}

type Row = { key: string; design: SystemDesign; updatedAt: number };

async function put(key: string, design: SystemDesign): Promise<void> {
	const db = await openDb();
	// Store a pure-JSON copy so nothing non-structured-cloneable (reactive
	// proxies, xyflow internals) can reach IndexedDB.
	const clean = JSON.parse(JSON.stringify(design)) as SystemDesign;
	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE, 'readwrite');
		tx.objectStore(STORE).put({ key, design: clean, updatedAt: Date.now() } satisfies Row);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

async function get(key: string): Promise<SystemDesign | null> {
	try {
		const db = await openDb();
		return await new Promise((resolve, reject) => {
			const tx = db.transaction(STORE, 'readonly');
			const req = tx.objectStore(STORE).get(key);
			req.onsuccess = () => resolve((req.result as Row | undefined)?.design ?? null);
			req.onerror = () => reject(req.error);
		});
	} catch {
		return null;
	}
}

async function del(key: string): Promise<void> {
	try {
		const db = await openDb();
		await new Promise<void>((resolve, reject) => {
			const tx = db.transaction(STORE, 'readwrite');
			tx.objectStore(STORE).delete(key);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} catch {
		// ignore
	}
}

async function getAll(): Promise<Row[]> {
	try {
		const db = await openDb();
		return await new Promise((resolve, reject) => {
			const tx = db.transaction(STORE, 'readonly');
			const req = tx.objectStore(STORE).getAll();
			req.onsuccess = () => resolve((req.result as Row[]) ?? []);
			req.onerror = () => reject(req.error);
		});
	} catch {
		return [];
	}
}

// ---- Draft (autosave / recovery) --------------------------------------
export const saveDraft = (design: SystemDesign) => put(DRAFT_KEY, design);
export const loadDraft = () => get(DRAFT_KEY);
export const clearDraft = () => del(DRAFT_KEY);

// ---- Specs (explicit named saves) -------------------------------------
export const saveSpec = (design: SystemDesign) => {
	if (!design.id) throw new Error('saveSpec requires design.id');
	return put(SPEC_PREFIX + design.id, design);
};
export const loadSpec = (id: string) => get(SPEC_PREFIX + id);
export const deleteSpec = (id: string) => del(SPEC_PREFIX + id);

export async function listSpecs(): Promise<SavedSpec[]> {
	const rows = await getAll();
	return rows
		.filter((r) => r.key.startsWith(SPEC_PREFIX))
		.map((r) => ({
			id: r.design.id ?? r.key.slice(SPEC_PREFIX.length),
			name: r.design.name ?? 'Untitled Spec',
			updatedAt: r.design.updatedAt ?? r.updatedAt,
			nodeCount: r.design.nodes?.length ?? 0,
			design: r.design
		}))
		.sort((a, b) => b.updatedAt - a.updatedAt);
}

// ---- Idle-scheduled, debounced draft autosaver ------------------------
const onIdle = (cb: () => void) => {
	if (typeof requestIdleCallback === 'function') requestIdleCallback(cb, { timeout: 1000 });
	else setTimeout(cb, 0);
};

/** Debounced draft autosaver — saves are async and scheduled during idle. */
export function createAutosaver(getDesign: () => SystemDesign, delay = 600) {
	let timer: ReturnType<typeof setTimeout> | null = null;
	const persist = () => void saveDraft(getDesign()).catch(() => {});
	return {
		schedule() {
			if (!browser) return;
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => onIdle(persist), delay);
		},
		flush() {
			if (!browser) return;
			if (timer) clearTimeout(timer);
			persist();
		}
	};
}
