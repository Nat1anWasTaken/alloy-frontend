<script lang="ts">
	import { goto } from '$app/navigation';

	let documentId = '';
	let username = '';

	const submit = () => {
		if (!documentId.trim() || !username.trim()) return;
		const id = encodeURIComponent(documentId.trim());
		const name = encodeURIComponent(username.trim());
		goto(`/document/${id}?name=${name}`);
	};
</script>

<section class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
	<div class="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
		<div
			class="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-10 shadow-2xl shadow-sky-900/30 backdrop-blur"
		>
			<div class="mb-8 space-y-2">
				<p class="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300/80">Realtime</p>
				<h1 class="text-3xl font-bold">Collaborative Doc</h1>
				<p class="text-slate-400">
					Enter a document ID and your username to start editing together.
				</p>
			</div>

			<form
				class="space-y-4"
				on:submit|preventDefault={submit}
				aria-label="Join or create a collaborative document"
			>
				<label class="block space-y-2">
					<span class="text-sm font-semibold text-slate-200">Document ID</span>
					<input
						class="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-base text-slate-50 shadow-inner shadow-slate-950/40 outline-none ring-0 transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20"
						name="documentId"
						placeholder="e.g. design-notes"
						bind:value={documentId}
						required
					/>
				</label>

				<label class="block space-y-2">
					<span class="text-sm font-semibold text-slate-200">Username</span>
					<input
						class="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-base text-slate-50 shadow-inner shadow-slate-950/40 outline-none ring-0 transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20"
						name="username"
						placeholder="e.g. nathan"
						bind:value={username}
						required
					/>
				</label>

				<button
					type="submit"
					class="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-400 via-indigo-500 to-violet-500 px-4 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-indigo-900/40 transition hover:translate-y-[-1px] hover:shadow-xl hover:shadow-indigo-900/50 focus:outline-none focus:ring-2 focus:ring-slate-50/50"
				>
					Enter Document
				</button>
			</form>

			<p class="mt-4 text-sm text-slate-400">
				Usernames are fixed for the session and shown on cursors.
			</p>
		</div>
	</div>
</section>
