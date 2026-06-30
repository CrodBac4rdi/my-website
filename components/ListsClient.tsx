'use client';

import { useState, useRef } from 'react';
import { Loader2, Plus, List, Trash2, Globe, Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/toast';
import { createListAction, deleteListAction } from '@/lib/actions/lists';

type CustomList = {
  id: string;
  name: string;
  description: string | null;
  is_public?: boolean;
};

export default function ListsClient({ initialLists }: { initialLists: CustomList[] }) {
  const [lists, setLists] = useState<CustomList[]>(initialLists);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const creatingRef = useRef(false);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || creatingRef.current) return;

    creatingRef.current = true;
    setCreating(true);
    try {
      const res = await createListAction({ name: newListName });
      if (res.ok) {
        setLists([res.data as CustomList, ...lists]);
        setNewListName('');
        toast.success('Liste erstellt.');
      } else {
        toast.error(res.error);
      }
    } finally {
      creatingRef.current = false;
      setCreating(false);
    }
  };

  const handleDelete = async (listId: string) => {
    if (!confirm('Möchtest du diese Liste wirklich löschen?')) return;
    const res = await deleteListAction(listId);
    if (res.ok) {
      setLists(lists.filter(l => l.id !== listId));
      toast.success('Liste gelöscht.');
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-12 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold flex items-center gap-4">
          <List className="text-primary-500" size={40} /> Meine Listen
        </h1>
      </div>

      <div className="bg-elev/50 border border-line p-8 rounded-3xl">
        <h3 className="text-lg font-bold mb-4 text-muted">Neue Liste erstellen</h3>
        <form onSubmit={handleCreateList} className="flex gap-4">
          <input
            type="text"
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
            placeholder="Name der Liste (z.B. Comfort-Animes)"
            className="flex-1 bg-black border border-line rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {creating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Erstellen
          </button>
        </form>
      </div>

      {lists.length === 0 ? (
        <p className="text-faint text-center py-10">
          Noch keine Listen. Erstelle deine erste oben.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map(list => (
            <div
              key={list.id}
              className="bg-elev border border-line rounded-3xl p-6 group hover:border-primary-500/50 transition-colors flex flex-col justify-between h-48"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold truncate">{list.name}</h3>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      list.is_public
                        ? 'bg-success/10 border-success/30 text-success'
                        : 'bg-surface-3 border-line text-faint'
                    }`}
                    title={list.is_public ? 'Öffentlich' : 'Privat'}
                  >
                    {list.is_public ? <Globe size={10} /> : <Lock size={10} />}
                  </span>
                </div>
                <p className="text-faint text-sm line-clamp-2">
                  {list.description || 'Keine Beschreibung'}
                </p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => handleDelete(list.id)}
                  className="text-faint hover:text-danger p-2 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <Link
                  href={`/lists/${list.id}`}
                  className="text-primary-400 font-bold text-sm hover:underline"
                >
                  Ansehen &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
