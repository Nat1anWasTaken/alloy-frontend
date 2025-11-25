import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params, url }) => {
	const name = url.searchParams.get('name');

	if (!name) {
		throw redirect(302, '/');
	}

	return {
		docId: params.id,
		name
	};
};
