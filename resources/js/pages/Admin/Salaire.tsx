import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Inertia } from '@inertiajs/inertia';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'AdminSalairepage', href: '/dashboard' },
];

type SalaireType = {
    id: number;
    cat?: string;
    s_cat?: string;
    [key: string]: any;
};

export default function Salaire() {
    const salaires = ((usePage().props as any).salaires ?? []) as SalaireType[];
    const [showAll, setShowAll] = useState(false);
    const [checkedRows, setCheckedRows] = useState<number[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [editingSalaire, setEditingSalaire] = useState<SalaireType | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [errors, setErrors] = useState<{[key: string]: boolean}>({});

    useEffect(() => {
        if (editingSalaire) {
            setFormData(editingSalaire);
            setErrors({});
        }
    }, [editingSalaire]);

    // Colonnes principales à afficher par défaut
    const mainColumns = [
        { key: 'cat', label: 'Catégorie' },
        { key: 's_cat', label: 'Sous-catégorie' },
        { key: 'inddiff1', label: 'IndDiff1' },
        { key: 'inddiff2', label: 'IndDiff2' },
        { key: 'inddiff3', label: 'IndDiff3' },
        { key: 'th1', label: 'TH1' },
        { key: 'th2', label: 'TH2' },
        { key: 'th3', label: 'TH3' },
    ];

    const handleCheck = (id: number) => {
        setCheckedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const handleEdit = (salaire: any) => {
        setEditingSalaire(salaire);
        setIsOpen(true);
    };

    const handleInputChange = (key: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [key]: value
        }));
        setErrors((prev) => ({
            ...prev,
            [key]: value === '' || Number(value) <= 0
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: {[key: string]: boolean} = {};
        for (let i = 1; i <= 40; i++) {
            const indKey = `inddiff${i}`;
            const thKey = `th${i}`;
            if (formData[indKey] === '' || Number(formData[indKey]) <= 0) newErrors[indKey] = true;
            if (formData[thKey] === '' || Number(formData[thKey]) <= 0) newErrors[thKey] = true;
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0 && editingSalaire) {
            Inertia.put(
                route('admin.salaire.update', editingSalaire.id),
                formData,
                {
                    onSuccess: () => setIsOpen(false),
                    onError: () => alert('Erreur lors de la modification !')
                }
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Salaires" />
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">Liste des salaires</h1>
                <button
                    className="mb-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => setShowAll((v) => !v)}
                >
                    {showAll ? 'Afficher moins' : 'Afficher tout'}
                </button>
                <div className="rounded-md border text-xs">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom">
                            <thead className="[&_tr]:border-b">
                                <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                    <th className="h-10 px-1 text-left align-middle font-medium">Sélection</th>
                                    {mainColumns.map(col => (
                                        <th key={col.key} className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">{col.label}</th>
                                    ))}
                                    <th className="h-10 px-1 text-left align-middle font-medium">Modifier</th>
                                    {showAll && Array.from({ length: 40 }, (_, i) => (
                                        <th key={`inddiff${i + 1}`} className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">{`IndDiff${i + 1}`}</th>
                                    ))}
                                    {showAll && Array.from({ length: 40 }, (_, i) => (
                                        <th key={`th${i + 1}`} className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">{`TH${i + 1}`}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {salaires.map((salaire) => (
                                    <tr key={salaire.id} className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                        <td className="p-1 align-middle">
                                            <input
                                                type="checkbox"
                                                checked={checkedRows.includes(salaire.id)}
                                                onChange={() => handleCheck(salaire.id)}
                                            />
                                        </td>
                                        {mainColumns.map(col => (
                                            <td key={col.key} className="max-w-[60px] truncate p-1 align-middle">
                                                {salaire[col.key] ?? '-'}
                                            </td>
                                        ))}
                                        <td className="p-1 align-middle">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(salaire)}
                                                className="hover:bg-primary/10 hover:text-primary h-6 w-6"
                                                title="Modifier"
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                        </td>
                                        {showAll && checkedRows.includes(salaire.id) && Array.from({ length: 40 }, (_, i) => (
                                            <td key={`inddiff${i + 1}`} className="p-1 align-middle">
                                                {salaire[`inddiff${i + 1}`]?.toLocaleString() ?? '-'}
                                            </td>
                                        ))}
                                        {showAll && checkedRows.includes(salaire.id) && Array.from({ length: 40 }, (_, i) => (
                                            <td key={`th${i + 1}`} className="p-1 align-middle">
                                                {salaire[`th${i + 1}`]?.toLocaleString() ?? '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {salaires.length === 0 && (
                                    <tr>
                                        <td colSpan={showAll ? 75 : mainColumns.length + 1} className="text-muted-foreground p-2 text-center">
                                            Aucun résultat
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="max-w-full w-full min-w-[1100px]">
                        <DialogHeader>
                            <DialogTitle>Modifier le salaire</DialogTitle>
                        </DialogHeader>
                        {editingSalaire && (
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label>Catégorie</label>
                                    <input
                                        type="text"
                                        value={formData.cat ?? ''}
                                        readOnly
                                        className="w-full border rounded px-2 py-1 text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label>Sous-catégorie</label>
                                    <input
                                        type="text"
                                        value={formData.s_cat ?? ''}
                                        readOnly
                                        className="w-full border rounded px-2 py-1 text-xs"
                                    />
                                </div>
                                {/* Champs IndDiff */}
                                <div className="grid grid-cols-12 gap-2 mt-4">
                                    {Array.from({ length: 40 }, (_, i) => (
                                        <div key={`inddiff${i + 1}`}>
                                            <label className="text-xs">{`IndDiff${i + 1}`}</label>
                                            <input
                                                type="number"
                                                value={formData[`inddiff${i + 1}`] ?? ''}
                                                onChange={e => handleInputChange(`inddiff${i + 1}`, e.target.value)}
                                                className={`w-full border rounded px-2 py-1 text-xs ${errors[`inddiff${i + 1}`] ? 'border-red-500' : ''}`}

                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                                {/* Champs TH */}
                                <div className="grid grid-cols-12 gap-2 mt-4">
                                    {Array.from({ length: 40 }, (_, i) => (
                                        <div key={`th${i + 1}`}>
                                            <label className="text-xs">{`TH${i + 1}`}</label>
                                            <input
                                                type="number"
                                                value={formData[`th${i + 1}`] ?? ''}
                                                onChange={e => handleInputChange(`th${i + 1}`, e.target.value)}
                                                className={`w-full border rounded px-2 py-1 text-xs ${errors[`th${i + 1}`] ? 'border-red-500' : ''}`}

                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-primary hover:bg-primary/90 w-full text-white shadow-lg"
                                    >
                                        Enregistrer
                                    </Button>
                                </div>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
