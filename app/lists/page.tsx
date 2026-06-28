'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, List, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from '@/lib/toast';
import { createListAction, deleteListAction } from '@/lib/actions/lists';

export default function CustomListsPage() {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const creatingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    async function loadLists() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('custom_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setLists(data);
      setLoading(false);
    }
    loadLists();
  }, [router]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || creatingRef.current) return;

    creatingRef.current = true;
    setCreating(true);
    try {
      const res = await createListAction({ name: newListName });
      if (res.ok) {
        setLists([res.data, ...lists]);
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

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <Loader2 className="animate-spin text-blue-500" size={64} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-12 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black flex items-center gap-4">
          <List className="text-blue-500" size={40} /> Meine Listen
        </h1>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
        <h3 className="text-lg font-bold mb-4 text-slate-300">Neue Liste erstellen</h3>
        <form onSubmit={handleCreateList} className="flex gap-4">
          <input 
            type="text" 
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Name der Liste (z.B. Comfort-Animes)"
            className="flex-1 bg-black border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            required
          />
          <button 
            type="submit"
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {creating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Erstellen
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map(list => (
          <div key={list.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 group hover:border-blue-500/50 transition-colors flex flex-col justify-between h-48">
             <div>
               <h3 className="text-xl font-bold mb-2">{list.name}</h3>
               <p className="text-slate-500 text-sm line-clamp-2">{list.description || 'Keine Beschreibung'}</p>
             </div>
             <div className="flex items-center justify-between mt-4">
               <button 
                 onClick={() => handleDelete(list.id)}
                 className="text-slate-600 hover:text-red-400 p-2 transition-colors"
               >
                 <Trash2 size={18} />
               </button>
               {/* Detail page not yet implemented, but could be added later */}
               <Link href={`/lists/${list.id}`} className="text-blue-400 font-bold text-sm hover:underline">
                 Ansehen &rarr;
               </Link>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
