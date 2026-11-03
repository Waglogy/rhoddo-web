import { api } from '@/lib/api';
import { CategoriesClient, type CategoryRow } from './CategoriesClient';

export default async function CategoriesPage() {
  const { categories } = await api<{ categories: CategoryRow[] }>('/admin/categories');

  return (
    <div>
      <div className="label">In the app</div>
      <h1 className="font-display text-4xl text-ink">Categories</h1>
      <p className="mt-1 text-sm text-mute">
        The &quot;Browse by mood&quot; cards in the app. Hosts choose from these when creating an event.
      </p>
      <CategoriesClient categories={categories} />
    </div>
  );
}
