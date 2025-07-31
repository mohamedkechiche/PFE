import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, History, Info, Pencil, Plus, Search, Trash2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';

interface Avancement {
    id: number;
    Mle: string;
    Qualification: string;
    Categorie: string | null;
    Sous_Categorie: string | null;
    Echellon: string;
    SBase: number | null;
    TH: number | null;
    Ind_differentiel: number | null;
    Observation: string | null;
    Date_effet: string;
    Date_Prochain_Av: string | null;
}

interface Personnel {
    ID: number;
    Mle: string;
    Nom: string;
    Prenom: string;
    NomPrenom: string;
    Date_Sortie_Etab: string | null;
    avancement?: Avancement | null;
    historiqueAvancements?: Avancement[];
}

interface Props {
    personnels: {
        data: Personnel[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search: string;
        filter: string;
        pages: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    count: number;
    countAvancementdepassee: number;
    HAvancements: Avancement[];
    Sanction: any[]; // ou le type correct si tu veux typer
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Avancement',
        href: '/avancement',
    },
];

export default function AvancementIndex({ personnels, count, countAvancementdepassee, filters, flash, HAvancements, Sanction }: Props) {
    // console.log('Sanction', Sanction);
    const [isOpen, setIsOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Personnel | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [completionFilter, setCompletionFilter] = useState<'all' | 'M' | 'H' | 'sans_avancement' | 'Avancement_depassee'>(
        filters.filter as 'all' | 'M' | 'H' | 'sans_avancement' | 'Avancement_depassee',
    );
    const [completionPage, setCompletionPage] = useState<'10000' | '10' | '20' | '50'>(filters.pages as '10000' | '10' | '20' | '50');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [historyMle, setHistoryMle] = useState<string>('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [dateFilter, setDateFilter] = useState<Date | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [step, setStep] = useState(1);
    const isFirstRender = useRef(true);

    const [step2Inputs, setStep2Inputs] = useState<{ [id: number]: { col1: string; col2: string; col3: string } }>(() =>
        Object.fromEntries(selectedIds.map((id) => [id, { col1: '', col2: '', col3: '' }])),
    );

    const [sanctionsDialogOpen, setSanctionsDialogOpen] = useState(false);
    const [selectedDateProchainAv, setSelectedDateProchainAv] = useState<string | null>(null);
    const [sanctions, setSanctions] = useState<any[]>([]);

    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setToastType('success');
            setShowToast(true);
        } else if (flash?.error) {
            setToastMessage(flash.error);
            setToastType('error');
            setShowToast(true);
        }
    }, [flash]);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const {
        data,
        setData,
        post,
        put,
        processing,
        reset,
        delete: destroy,
    } = useForm({
        Mle: '',
        NomPrenom: '',
        Categorie: '',
        Qualification: '',
        Sous_Categorie: '',
        Echellon: '',
        SBase: '',
        TH: '',
        Ind_differentiel: '',
        Observation: '',
        Date_effet: '',
        Date_Prochain_Av: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingTask) {
            put(route('avancement.update', editingTask.ID), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    setEditingTask(null);
                },
            });
        } else {
            post(route('avancement.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (personnel: Personnel) => {
        setEditingTask(personnel);
        setData({
            Mle: personnel.Mle,
            NomPrenom: personnel.NomPrenom || '',
            Categorie: personnel.avancement?.Categorie || '',
            Qualification: personnel.avancement?.Qualification || '',
            Sous_Categorie: personnel.avancement?.Sous_Categorie || '',
            Echellon: personnel.avancement?.Echellon || '',
            SBase:
                personnel.avancement?.SBase !== null && personnel.avancement?.SBase !== undefined
                    ? String(personnel.avancement?.SBase).replace(',', '.')
                    : '',
            TH: personnel.avancement?.TH !== null && personnel.avancement?.TH !== undefined ? String(personnel.avancement?.TH).replace(',', '.') : '',
            Ind_differentiel:
                personnel.avancement?.Ind_differentiel !== null && personnel.avancement?.Ind_differentiel !== undefined
                    ? String(personnel.avancement?.Ind_differentiel).replace(',', '.')
                    : '',
            Observation: personnel.avancement?.Observation || '',
            Date_effet: personnel.avancement?.Date_effet || '',
            Date_Prochain_Av: personnel.avancement?.Date_Prochain_Av || '',
        });
        setIsOpen(true);
    };

    const handleDelete = (personnelId: number) => {
        setDeleteId(personnelId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (deleteId !== null) {
            destroy(route('avancement.destroy', deleteId), {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setDeleteId(null);
                },
                onFinish: () => {
                    setDeleteDialogOpen(false);
                    setDeleteId(null);
                },
            });
        }
    };

    const handleShowHistory = async (mle: string) => {
        setIsLoadingHistory(true);
        setHistoryDialogOpen(true);
        setHistoryMle(mle);
        router.get(
            route('avancement.index'),
            {
                search: searchTerm,
                filter: completionFilter,
                pages: completionPage,
                HMle: mle,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
        setIsLoadingHistory(false);
    };

    const handleShowSanctions = async (mle: string, dateProchainAv?: string | null) => {
        setIsLoadingHistory(true);
        setSanctionsDialogOpen(true);
        setHistoryMle(mle);
        setSelectedDateProchainAv(dateProchainAv ?? null);
        router.get(
            route('avancement.index'),
            {
                search: searchTerm,
                filter: completionFilter,
                pages: completionPage,
                Smle: mle,
                Sdate: dateProchainAv,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
        setIsLoadingHistory(false);
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.get(
            route('avancement.index'),
            {
                search: searchTerm,
                filter: completionFilter,
                pages: completionPage,
                date: dateFilter ? `${dateFilter.getFullYear()}-${(dateFilter.getMonth() + 1).toString().padStart(2, '0')}` : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleFilterChange = (value: 'all' | 'M' | 'H' | 'sans_avancement' | 'Avancement_depassee') => {
        setCompletionFilter(value);
        router.get(
            route('avancement.index'),
            {
                search: searchTerm,
                filter: value,
                pages: completionPage,
                date: dateFilter ? `${dateFilter.getFullYear()}-${(dateFilter.getMonth() + 1).toString().padStart(2, '0')}` : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handlePagenbrChange = (value: '10000' | '10' | '20' | '50') => {
        setCompletionPage(value);
        router.get(
            route('avancement.index'),
            {
                search: searchTerm,
                filter: completionFilter,
                pages: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('avancement.index'),
            {
                page,
                search: searchTerm,
                filter: completionFilter,
                pages: completionPage,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleExportExcel = () => {
        const exportData = personnels.data.map((personnel) => ({
            Mle: personnel.Mle,
            NomPrenom: personnel.NomPrenom,
            Qualification: personnel.avancement?.Qualification,
            Categorie: personnel.avancement?.Categorie,
            Sous_Categorie: personnel.avancement?.Sous_Categorie,
            Echellon: personnel.avancement?.Echellon,
            SBase: personnel.avancement?.SBase,
            TH: personnel.avancement?.TH,
            Ind_differentiel: personnel.avancement?.Ind_differentiel,
            Observation: personnel.avancement?.Observation,
            Date_effet: personnel.avancement?.Date_effet,
            Date_Prochain_Av: personnel.avancement?.Date_Prochain_Av,
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Avancements');
        XLSX.writeFile(workbook, 'avancements.xlsx');
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        router.get(
            route('avancement.index'),
            {
                search: searchTerm,
                filter: completionFilter,
                pages: completionPage,
                date: dateFilter ? `${dateFilter.getFullYear()}-${(dateFilter.getMonth() + 1).toString().padStart(2, '0')}` : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, [dateFilter]);

    // Gestion sélection
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(personnels.data.map((p) => p.ID));
        } else {
            setSelectedIds([]);
        }
    };
    const handleSelectOne = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]));
    };

    // Mettez à jour step2Inputs si selectedIds change (pour garder la synchro)
    useEffect(() => {
        setStep2Inputs((prev) => {
            const updated: typeof prev = {};
            selectedIds.forEach((id) => {
                updated[id] = prev[id] || { col1: '', col2: '' };
            });
            return updated;
        });
    }, [selectedIds]);

    useEffect(() => {
        if (typeof Sanction !== 'undefined') {
            setSanctions(Sanction);
        }
    }, [Sanction]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Avancements" />
            <div className="from-background to-muted/20 flex h-full flex-1 flex-col gap-6 rounded-xl bg-gradient-to-br p-6">
                {showToast && (
                    <div
                        className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg ${
                            toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
                        } animate-in fade-in slide-in-from-top-5 text-white`}
                    >
                        {toastType === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                        <span>{toastMessage}</span>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Avancements</h1>
                        <p className="text-muted-foreground mt-1">Manage your Avancements and stay organized</p>
                    </div>

                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirmer la suppression</DialogTitle>
                            </DialogHeader>
                            <div>Voulez-vous vraiment supprimer cet avancement ?</div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                    Non
                                </Button>
                                <Button className="bg-destructive text-white" onClick={confirmDelete}>
                                    Oui, supprimer
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="bg-primary hover:bg-primary/90 text-white shadow-lg"
                                onClick={() => {
                                    reset();
                                    setEditingTask(null);
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                New Avancement
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[625px]">
                            <DialogHeader>
                                <DialogTitle className="text-xl">{editingTask ? 'Edit Avancement' : 'Create New Avancement'}</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Colonne 1 */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="Mle">Mle</Label>
                                            <Input
                                                id="Mle"
                                                value={data.Mle}
                                                onChange={(e) => setData('Mle', e.target.value)}
                                                required
                                                className="focus:ring-primary focus:ring-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="NomPrenom">NomPrenom</Label>
                                            <Input
                                                id="Nom & Prenom"
                                                value={data.NomPrenom}
                                                onChange={(e) => setData('NomPrenom', e.target.value)}
                                                className="focus:ring-primary focus:ring-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="Categorie">Categorie</Label>
                                            <Input
                                                id="Categorie"
                                                value={data.Categorie}
                                                onChange={(e) => setData('Categorie', e.target.value)}
                                                className="focus:ring-primary focus:ring-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="Qualification">Qualification</Label>
                                            <Input
                                                id="Qualification"
                                                value={data.Qualification}
                                                onChange={(e) => setData('Qualification', e.target.value)}
                                                className="focus:ring-primary focus:ring-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="Sous_Categorie">Sous Categorie</Label>
                                            <Input
                                                id="Sous_Categorie"
                                                value={data.Sous_Categorie}
                                                onChange={(e) => setData('Sous_Categorie', e.target.value)}
                                                className="focus:ring-primary focus:ring-2"
                                            />
                                        </div>
                                    </div>

                                    {/* Colonne 2 */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="Echellon">Echellon</Label>
                                            <Input
                                                id="Echellon"
                                                value={data.Echellon}
                                                onChange={(e) => setData('Echellon', e.target.value)}
                                                className="focus:ring-primary focus:ring-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="SBase">SBase</Label>
                                            <Input
                                                id="SBase"
                                                type="number"
                                                value={data.SBase}
                                                onChange={(e) => setData('SBase', e.target.value)}
                                                className="focus:ring-primary focus:ring-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="TH">TH</Label>
                                            <Input
                                                id="TH"
                                                type="number"
                                                value={data.TH}
                                                onChange={(e) => setData('TH', e.target.value)}
                                                className="focus:ring-primary focus:ring-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="Ind_differentiel">Indifferentiel</Label>
                                            <Input
                                                id="Ind_differentiel"
                                                type="number"
                                                value={data.Ind_differentiel}
                                                onChange={(e) => setData('Ind_differentiel', e.target.value)}
                                                className="focus:ring-primary focus:ring-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="Date_effet">Date effet</Label>
                                            <Input
                                                id="Date_effet"
                                                type="date"
                                                value={data.Date_effet}
                                                onChange={(e) => setData('Date_effet', e.target.value)}
                                                className="focus:ring-primary focus:ring-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="Date_Prochain_Av">Date Prochain Av</Label>
                                            <Input
                                                id="Date_Prochain_Av"
                                                type="date"
                                                value={data.Date_Prochain_Av}
                                                onChange={(e) => setData('Date_Prochain_Av', e.target.value)}
                                                className="focus:ring-primary focus:ring-2"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Champ Observation (pleine largeur) */}
                                <div className="space-y-2">
                                    <Label htmlFor="Observation">Observation</Label>
                                    <Textarea
                                        id="Observation"
                                        value={data.Observation}
                                        onChange={(e) => setData('Observation', e.target.value)}
                                        className="focus:ring-primary focus:ring-2"
                                    />
                                </div>

                                {/* Boutons */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsOpen(false);
                                            reset();
                                            setEditingTask(null);
                                        }}
                                        className="w-full"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-primary hover:bg-primary/90 w-full text-white shadow-lg"
                                    >
                                        {editingTask ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="mb-4">
                    <div className="mb-2 flex items-center justify-center gap-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${step >= s ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-gray-200 text-gray-500'}`}
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between">
                        <Button disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
                            Précédent
                        </Button>
                        <span>Étape {step} / 4</span>
                        <Button disabled={step === 4 || selectedIds.length === 0} onClick={() => setStep((s) => s + 1)}>
                            Suivant
                        </Button>
                    </div>
                </div>
                <div className="mb-4 flex gap-4">
                    <div>
                        <DatePicker
                            selected={dateFilter}
                            onChange={(date) => setDateFilter(date as Date | null)}
                            dateFormat="MM/yyyy"
                            showMonthYearPicker
                            placeholderText="Mois/Année"
                            className="rounded border px-2 py-1"
                            isClearable
                        />
                    </div>
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                        <Input placeholder="Search Mle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                    </form>
                    <Button onClick={() => handleFilterChange('Avancement_depassee')} className="bg-yellow-500 text-white hover:bg-yellow-600">
                        {countAvancementdepassee}
                    </Button>
                    <Button onClick={handleExportExcel} className="bg-green-500 text-white hover:bg-green-600">
                        Exporter Excel
                    </Button>
                </div>
                <div className="rounded-md border">
                    <div className="rounded-md border text-xs">
                        <div className="relative w-full overflow-auto">
                            {/* Conditional rendering for table based on step */}
                            {step !== 2 ? (
                                // Tableau normal (étape 1, 3, 4)
                                <table className="w-full caption-bottom">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <th className="h-10 px-1 text-left align-middle font-medium">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.length === personnels.data.length && personnels.data.length > 0}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th className="text-muted-foreground sticky left-0 h-10 bg-white px-1 text-left align-middle font-medium">
                                                ID
                                            </th>
                                            <th className="text-muted-foreground sticky left-0 h-10 bg-white px-1 text-left align-middle font-medium">
                                                Mle
                                            </th>
                                            <th className="text-muted-foreground sticky left-12 h-10 bg-white px-1 text-left align-middle font-medium">
                                                Nom
                                            </th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Qualif.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Cat.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">S.Cat</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ech.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">SBase</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">TH</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ind.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Obs.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Effet</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Proch.Av</th>
                                            <th className="text-muted-foreground sticky right-0 h-10 bg-white px-1 text-right align-middle font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {personnels.data.map((personnel) => (
                                            <tr
                                                key={personnel.avancement?.id}
                                                className={`hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors ${
                                                    !personnel.avancement?.id ? 'bg-red-50' : ''
                                                }`}
                                            >
                                                <td className="p-1 align-middle">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(personnel.ID)}
                                                        onChange={() => handleSelectOne(personnel.ID)}
                                                    />
                                                </td>
                                                <td className="sticky left-0 bg-white p-1 align-middle font-medium">{personnel.ID}</td>
                                                <td className="sticky left-0 bg-white p-1 align-middle font-medium">{personnel.Mle}</td>
                                                <td className="sticky left-12 bg-white p-1 align-middle font-medium">
                                                    {personnel.Nom + ' ' + personnel.Prenom}
                                                </td>
                                                <td className="max-w-[100px] p-1 align-middle">
                                                    <div className="group relative">
                                                        <span className="block w-full truncate">
                                                            {personnel.avancement?.Qualification
                                                                ? personnel.avancement?.Qualification.length > 10
                                                                    ? `${personnel.avancement?.Qualification.substring(0, 10)}...`
                                                                    : personnel.avancement?.Qualification
                                                                : '-'}
                                                        </span>
                                                        {personnel.avancement?.Qualification && personnel.avancement?.Qualification.length > 10 && (
                                                            <div className="absolute z-10 hidden max-h-40 w-64 overflow-auto rounded border bg-white p-2 shadow-lg group-hover:block">
                                                                {personnel.avancement?.Qualification}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="max-w-[60px] truncate p-1 align-middle">{personnel.avancement?.Categorie || '-'}</td>
                                                <td className="max-w-[60px] truncate p-1 align-middle">
                                                    {personnel.avancement?.Sous_Categorie || '-'}
                                                </td>
                                                <td className="max-w-[40px] truncate p-1 align-middle">{personnel.avancement?.Echellon || '-'}</td>
                                                <td className="p-1 align-middle">{personnel.avancement?.SBase?.toLocaleString() || '-'}</td>
                                                <td className="p-1 align-middle">{personnel.avancement?.TH?.toLocaleString() || '-'}</td>
                                                <td className="p-1 align-middle">
                                                    {personnel.avancement?.Ind_differentiel?.toLocaleString() || '-'}
                                                </td>
                                                <td className="max-w-[100px] p-1 align-middle">
                                                    {personnel.avancement?.Observation
                                                        ? personnel.avancement.Observation.length > 10
                                                            ? `${personnel.avancement.Observation.substring(0, 10)}...`
                                                            : personnel.avancement.Observation
                                                        : '-'}
                                                </td>
                                                <td className="p-1 align-middle whitespace-nowrap">
                                                    {personnel.avancement?.Date_effet
                                                        ? new Date(personnel.avancement.Date_effet).toLocaleDateString('fr')
                                                        : '-'}
                                                </td>
                                                <td className="p-1 align-middle whitespace-nowrap">
                                                    {personnel.avancement?.Date_Prochain_Av
                                                        ? new Date(personnel.avancement.Date_Prochain_Av).toLocaleDateString('fr')
                                                        : '-'}
                                                </td>
                                                <td className="sticky right-0 bg-white p-1 text-right align-middle">
                                                    <div className="flex justify-end gap-0.5">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleShowHistory(personnel.Mle)}
                                                            className="hover:bg-primary/10 hover:text-primary h-6 w-6"
                                                        >
                                                            <History className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(personnel)}
                                                            className="hover:bg-primary/10 hover:text-primary h-6 w-6"
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(personnel.ID)}
                                                            className="hover:bg-destructive/10 hover:text-destructive h-6 w-6"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {personnels.data.length === 0 && (
                                            <tr>
                                                <td colSpan={14} className="text-muted-foreground p-2 text-center">
                                                    Aucun résultat
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                // Tableau personnalisé pour l'étape 2
                                <table className="w-full caption-bottom">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            {/* <th className="h-10 px-1 text-left align-middle font-medium">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.length === personnels.data.length && personnels.data.length > 0}
                                                    onChange={handleSelectAll}
                                                />
                                            </th> */}
                                            <th className="text-muted-foreground sticky left-0 h-10 bg-white px-1 text-left align-middle font-medium">
                                                Mle
                                            </th>
                                            <th className="text-muted-foreground sticky left-12 h-10 bg-white px-1 text-left align-middle font-medium">
                                                Nom
                                            </th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Sanctions 1er deg</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Sanctions 2eme deg</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Note</th>
                                            <th className="text-muted-foreground sticky right-10 h-10 bg-white px-1 text-right align-middle font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {personnels.data.map((personnel) => {
                                            // Vérifie si ce personnel a une sanction dans la props Sanction
                                            const hasSanction = Array.isArray(Sanction)
                                                ? Sanction.some(
                                                    (s) =>
                                                        (s.mle && s.mle == personnel.Mle) ||
                                                        (s.Mle && s.Mle == personnel.Mle)
                                                )
                                                : false;
                                            return (
                                                <tr
                                                    key={personnel.ID}
                                                    className={`hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors ${
                                                        !personnel.avancement?.Categorie ? 'bg-red-50' : ''
                                                    }`}
                                                >
                                                    <td className="sticky left-0 bg-white p-1 align-middle font-medium">{personnel.Mle}</td>
                                                    <td className="sticky left-12 bg-white p-1 align-middle font-medium">
                                                        {personnel.Nom + ' ' + personnel.Prenom}
                                                    </td>
                                                    <td className="p-1 align-middle">
                                                        <input
                                                            type="number"
                                                            className="w-20 rounded border px-1 py-0.5"
                                                            value={step2Inputs[personnel.ID]?.col1 ?? ''}
                                                            onChange={(e) =>
                                                                setStep2Inputs((prev) => ({
                                                                    ...prev,
                                                                    [personnel.ID]: {
                                                                        ...prev[personnel.ID],
                                                                        col1: e.target.value,
                                                                    },
                                                                }))
                                                            }
                                                        />
                                                    </td>
                                                    <td className="p-1 align-middle">
                                                        <input
                                                            type="number"
                                                            className="w-20 rounded border px-1 py-0.5"
                                                            value={step2Inputs[personnel.ID]?.col2 ?? ''}
                                                            onChange={(e) =>
                                                                setStep2Inputs((prev) => ({
                                                                    ...prev,
                                                                    [personnel.ID]: {
                                                                        ...prev[personnel.ID],
                                                                        col2: e.target.value,
                                                                    },
                                                                }))
                                                            }
                                                        />
                                                    </td>
                                                    <td className="p-1 align-middle">
                                                        <input
                                                            type="number"
                                                            className="w-20 rounded border px-1 py-0.5"
                                                            value={step2Inputs[personnel.ID]?.col3 ?? ''}
                                                            onChange={(e) =>
                                                                setStep2Inputs((prev) => ({
                                                                    ...prev,
                                                                    [personnel.ID]: {
                                                                        ...prev[personnel.ID],
                                                                        col3: e.target.value,
                                                                    },
                                                                }))
                                                            }
                                                        />
                                                    </td>
                                                    <td className="sticky right-10 bg-white p-1 text-right align-middle">
                                                        <div className="flex justify-end gap-0.5">
                                                            {hasSanction && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleShowSanctions(personnel.Mle, personnel.avancement?.Date_Prochain_Av)}
                                                                    className="hover:bg-red-100 text-red-600 h-6 w-6"
                                                                >
                                                                    <Info className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {personnels.data.length === 0 && (
                                            <tr>
                                                <td colSpan={14} className="text-muted-foreground p-2 text-center">
                                                    Aucun résultat
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dialog pour l'historique */}
                <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
                    <DialogContent className="max-h-[50vh] overflow-y-auto sm:max-w-[1000px]">
                        <DialogHeader>
                            <DialogTitle>Historique d'avancement pour le matricule : {historyMle}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            {isLoadingHistory ? (
                                <div className="flex justify-center py-4">
                                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                                </div>
                            ) : HAvancements.length === 0 ? (
                                <div className="text-muted-foreground py-4 text-center">Aucun historique trouvé pour ce matricule.</div>
                            ) : (
                                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                    <table className="w-full text-left text-sm text-gray-500 rtl:text-right">
                                        <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                                            <tr>
                                                <th scope="col" className="px-6 py-3">
                                                    Date effet
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Qualification
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Catégorie
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Sous Catégorie
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Echelon
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    SBase
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    TH
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Ind. Différentiel
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Observation
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {HAvancements.filter((item) => item && item.Mle === historyMle) // Filtre par matricule
                                                .map((item) => (
                                                    <tr key={item.id} className="border-b bg-white hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {item.Date_effet ? new Date(item.Date_effet).toLocaleDateString('fr-FR') : '-'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {' '}
                                                            <div className="group relative">
                                                                <span className="block w-full truncate">
                                                                    {item.Qualification
                                                                        ? item.Qualification.length > 10
                                                                            ? `${item.Qualification.substring(0, 10)}...`
                                                                            : item.Qualification
                                                                        : '-'}
                                                                </span>
                                                                {item.Qualification && item.Qualification.length > 10 && (
                                                                    <div className="absolute z-10 hidden max-h-40 w-64 overflow-auto rounded border bg-white p-2 shadow-lg group-hover:block">
                                                                        {item.Qualification}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">{item.Categorie || '-'}</td>
                                                        <td className="px-6 py-4">{item.Sous_Categorie || '-'}</td>
                                                        <td className="px-6 py-4">{item.Echellon || '-'}</td>
                                                        <td className="px-6 py-4">{item.SBase?.toLocaleString() || '-'}</td>
                                                        <td className="px-6 py-4">{item.TH?.toLocaleString() || '-'}</td>
                                                        <td className="px-6 py-4">{item.Ind_differentiel?.toLocaleString() || '-'}</td>
                                                        <td className="max-w-xs truncate px-6 py-4" title={item.Observation || ''}>
                                                            {item.Observation || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Dialog pour les sanctions */}
                <Dialog open={sanctionsDialogOpen} onOpenChange={setSanctionsDialogOpen}>
                    <DialogContent className="max-h-[50vh] overflow-y-auto sm:max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle>Sanctions pour le matricule : {historyMle}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            {isLoadingHistory ? (
                                <div className="flex justify-center py-4">
                                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                                </div>
                            ) : Sanction.length === 0 ? (
                                <div className="text-muted-foreground py-4 text-center">Aucune sanction trouvée pour ce matricule.</div>
                            ) : (
                                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                    <table className="w-full text-left text-sm text-gray-500 rtl:text-right">
                                        <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                                            <tr>
                                                <th className="px-6 py-3">Date début</th>
                                                <th className="px-6 py-3">Date fin</th>
                                                <th className="px-6 py-3">Sanction</th>
                                                <th className="px-6 py-3">Motif</th>
                                                <th className="px-6 py-3">Référence</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Sanction.map((item) => (
                                                <tr key={item.id} className="border-b bg-white hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        {item.d_debut ? new Date(item.D_Debut).toLocaleDateString('fr-FR') : '-'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.d_fin ? new Date(item.D_Fin).toLocaleDateString('fr-FR') : '-'}
                                                    </td>
                                                    <td className="px-6 py-4">{item.Sanction || '-'}</td>
                                                    <td className="px-6 py-4">{item.Motif || '-'}</td>
                                                    <td className="px-6 py-4">{item.Ref || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
