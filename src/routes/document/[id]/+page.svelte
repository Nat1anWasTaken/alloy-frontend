<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { PageData } from './$types';
	import * as Y from 'yjs';
	import { WebsocketProvider } from 'y-websocket';
	import { yCollab } from 'y-codemirror.next';
	import { EditorState } from '@codemirror/state';
	import { EditorView } from '@codemirror/view';
	import { markdown } from '@codemirror/lang-markdown';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { basicSetup } from 'codemirror';
	import { PUBLIC_YWS_BASE_URL } from '$env/static/public';

	export let data: PageData;

	const baseUrl = PUBLIC_YWS_BASE_URL;
	const docId = data.docId;
	const username = data.name;
	// Give the editor a sensible minimum height so it fills the container immediately
	const editorHeightTheme = EditorView.theme({
		'&': { minHeight: '70vh' },
		'.cm-scroller': { minHeight: '70vh' }
	});

	let users: { clientId: number; name?: string; color?: string }[] = [];
	let editorHost: HTMLDivElement;

	let provider: WebsocketProvider | undefined;
	let view: EditorView | undefined;
	let ydoc: Y.Doc | undefined;
	let awarenessCleanup: (() => void) | undefined;

	const randomColor = () => {
		const h = Math.floor(Math.random() * 360);
		return `hsl(${h}, 80%, 70%)`;
	};

	onMount(() => {
		if (!baseUrl) {
			console.error('Missing PUBLIC_YWS_BASE_URL env var');
			return;
		}

		ydoc = new Y.Doc();
		const yText = ydoc.getText('content');

		provider = new WebsocketProvider(`${baseUrl}/ws/${docId}`, docId, ydoc);

		const awareness = provider.awareness;
		awareness.setLocalStateField('user', { name: username, color: randomColor() });

		const clearCursorAwareness = () => {
			awareness.setLocalStateField('cursor', null);
		};

		const updateUsers = () => {
			const list = Array.from(awareness.getStates().entries()).map(([clientId, state]) => ({
				clientId,
				name: state.user?.name,
				color: state.user?.color
			}));
			users = list;
		};

		awareness.on('change', updateUsers);
		updateUsers();

		// Keep awareness in sync with the current selection so collaborators
		// can see live cursors and highlights.
		const selectionAwareness = EditorView.updateListener.of((update) => {
			if (!update.selectionSet && !update.focusChanged) return;
			const hasFocus = update.view.hasFocus && update.view.dom.ownerDocument.hasFocus();
			const sel = hasFocus ? update.state.selection.main : null;

			if (sel) {
				awareness.setLocalStateField('cursor', {
					anchor: Y.createRelativePositionFromTypeIndex(yText, sel.anchor),
					head: Y.createRelativePositionFromTypeIndex(yText, sel.head)
				});
			} else {
				clearCursorAwareness();
			}
		});

		const state = EditorState.create({
			extensions: [
				basicSetup,
				markdown(),
				oneDark,
				editorHeightTheme,
				selectionAwareness,
				yCollab(yText, awareness)
			]
		});

		view = new EditorView({
			state,
			parent: editorHost
		});

		awarenessCleanup = () => {
			clearCursorAwareness();
			awareness.off('change', updateUsers);
		};

		return () => {
			awarenessCleanup?.();
			view?.destroy();
			provider?.destroy();
			ydoc?.destroy();
		};
	});

	onDestroy(() => {
		awarenessCleanup?.();
		view?.destroy();
		provider?.destroy();
		ydoc?.destroy();
	});
</script>

{#if !baseUrl}
	<section class="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
		<div class="rounded-xl border border-red-400/30 bg-red-950/40 px-6 py-5">
			<p class="font-semibold text-red-200">PUBLIC_YWS_BASE_URL is not set.</p>
			<p class="text-sm text-red-100/80">
				Set it in your environment and reload to connect to the Y-WebSocket server.
			</p>
		</div>
	</section>
{:else}
	<section class="min-h-screen bg-slate-950 text-slate-100">
		<div class="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
			<header class="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p class="text-xs uppercase tracking-[0.25em] text-sky-300/80">Document</p>
					<h1 class="text-2xl font-bold text-white">{docId}</h1>
					<p class="text-sm text-slate-400">Signed in as {username}</p>
				</div>
				<div class="flex items-center gap-3">
					<div
						class="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-3 py-1.5 text-sm text-slate-200"
						title="Active collaborators"
					>
						<span class="text-slate-400">Users</span>
						<div class="flex -space-x-2">
							{#each users as user (user.clientId)}
								<div
									class="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-xs font-semibold text-slate-900"
									style={`background:${user.color ?? '#a5f3fc'}`}
									title={user.name ?? 'Anonymous'}
								>
									{user.name ? user.name.slice(0, 2).toUpperCase() : '?'}
								</div>
							{/each}
						</div>
					</div>
				</div>
			</header>

			<div class="rounded-2xl border border-white/10 bg-slate-900/70 p-3 shadow-xl shadow-black/30">
				<div
					class="min-h-[70vh] overflow-hidden rounded-xl border border-white/5 bg-slate-950/80"
					bind:this={editorHost}
				></div>
			</div>
		</div>
	</section>
{/if}
