import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { Link } from '@radix-ui/react-navigation-menu';
import { CheckCircle2, Download, Plus, Trash2, XCircle, FilePlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';

interface TableauAvancement {
    id: number;
    Mle: string;
    NomPrenom: string;
    Qualification?: string | null;
    Categorie?: string | null;
    Sous_Categorie?: string | null;
    Echellon?: string | null;
    SBase?: number | null;
    TH?: number | null;
    Ind_differentiel?: number | null;
    Date_effet?: Date | string | null;
    Observation?: string | null;
    NCategorie?: string | null;
    NSous_Categorie?: string | null;
    NEchellon?: string | null;
    NSBase?: number | null;
    NTH?: number | null;
    NInd_differentiel?: number | null;
    NDate_effet?: Date | string | null;
    Note?: string | null;
    created_at?: Date | string;
    updated_at?: Date | string;
}
interface Tableauavancementsmonth {
    NDate_effet: string; // <-- string, pas Date
}

interface Props {
    tableauavancements: {
        data: TableauAvancement[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    tableauavancementsmonth: {
        data: Tableauavancementsmonth[];
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
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Historique',
        href: '/historique',
    },
];

export default function AvancementIndex({ tableauavancements, tableauavancementsmonth, filters, flash }: Props) {
    console.log('tableauavancements', tableauavancements.data);
    console.log('tableauavancementsmonth', tableauavancementsmonth.data);
    const [isOpen, setIsOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [confirmDeleteDate, setConfirmDeleteDate] = useState<Date | string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [selectedDateEffet, setSelectedDateEffet] = useState<Date | null>(null);
    const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false);
    const isFirstRender = useRef(true);

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

    const handleDeleteByDate = (dateEffet: string) => {
        setConfirmDeleteDate(dateEffet);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (confirmDeleteDate !== null) {
            // On envoie bien le format YYYY-MM
            destroy(route('avancement.destroyByDate', { date_effet: confirmDeleteDate }), {
                onSuccess: () => {
                    setToastMessage('Suppression réussie');
                    setToastType('success');
                    setShowToast(true);
                },
                onFinish: () => {
                    setIsDeleteDialogOpen(false);
                    setConfirmDeleteDate(null);
                },
            });
        }
    };

    // Fonction pour filtrer les données selon la date sélectionnée
    const filteredDetails = tableauavancements.data.filter(
        (item) =>
            item.NDate_effet &&
            selectedDateEffet &&
            new Date(item.NDate_effet).getFullYear() === new Date(selectedDateEffet).getFullYear() &&
            new Date(item.NDate_effet).getMonth() === new Date(selectedDateEffet).getMonth(),
    );

    // Exporter les données filtrées en Excel
    const handleExportExcel = (dateEffet: string) => {
        // Filtrer les données pour la date sélectionnée
        const rows = tableauavancements.data.filter(
            (item) =>
                item.NDate_effet &&
                new Date(item.NDate_effet).getFullYear() === new Date(dateEffet).getFullYear() &&
                new Date(item.NDate_effet).getMonth() === new Date(dateEffet).getMonth(),
        );

        if (rows.length === 0) return;

        // Ordre des colonnes identique à l'affichage des tableaux
        const data = rows.map((item) => ({
            Mle: item.Mle,
            NomPrenom: item.NomPrenom,
            // Ancienne Situation
            Categorie: item.Categorie,
            Sous_Categorie: item.Sous_Categorie,
            Echellon: item.Echellon,
            SBase_TH: item.TH ?? item.SBase,
            Ind_differentiel: item.Ind_differentiel,
            Date_effet: item.Date_effet ? new Date(item.Date_effet).toLocaleDateString('fr-FR') : '',
            // Nouvelle Situation
            NCategorie: item.NCategorie,
            NSous_Categorie: item.NSous_Categorie,
            NEchellon: item.NEchellon,
            NSBase_NTH: item.NTH ?? item.NSBase,
            NInd_differentiel: item.NInd_differentiel,
            NDate_effet: item.NDate_effet ? new Date(item.NDate_effet).toLocaleDateString('fr-FR') : '',
            // Observation
            Note: item.Note,
            Observation: item.Observation,
        }));

        // Définir l'ordre des colonnes explicitement
        const columnsOrder = [
            'Mle',
            'NomPrenom',
            'Categorie',
            'Sous_Categorie',
            'Echellon',
            'SBase_TH',
            'Ind_differentiel',
            'Date_effet',
            'NCategorie',
            'NSous_Categorie',
            'NEchellon',
            'NSBase_NTH',
            'NInd_differentiel',
            'NDate_effet',
            'Note',
            'Observation',
        ];

        const ws = XLSX.utils.json_to_sheet(data, { header: columnsOrder });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Avancements');
        XLSX.writeFile(wb, `avancements_${dateEffet}.xlsx`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Personnels" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
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
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Avancement
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[625px]">
                            <DialogHeader>
                                <DialogTitle className="text-xl">Edit Avancement</DialogTitle>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tableauavancementsmonth.data.length > 0 ? (
                        tableauavancementsmonth.data.map((list) => {
                            // Filtrer les personnels pour ce mois
                            const personnelsForMonth = tableauavancements.data.filter(
                                (item) =>
                                    item.NDate_effet &&
                                    new Date(item.NDate_effet).getFullYear() === new Date(list.NDate_effet).getFullYear() &&
                                    new Date(item.NDate_effet).getMonth() === new Date(list.NDate_effet).getMonth(),
                            );
                            const countNormaux = personnelsForMonth.filter((p) => !p.Observation || !p.Observation.includes('57')).length;
                            const count57 = personnelsForMonth.filter((p) => p.Observation && p.Observation.includes('57')).length;

                            return (
                                <Card
                                    key={list.NDate_effet}
                                    className="hover:bg-accent/50 cursor-pointer transition-colors"
                                    onClick={() => setSelectedDateEffet(list.NDate_effet)}
                                >
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-lg font-medium">
                                            {list.NDate_effet
                                                ? new Date(list.NDate_effet + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                                                : 'No description'}
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleExportExcel(list.NDate_effet);
                                                }}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteByDate(list.NDate_effet);
                                                }}
                                                className="text-destructive hover:text-destructive/90"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.visit(`/decision/create?date_effet=${list.NDate_effet}`);
                                                }}
                                                title="Créer une décision"
                                            >
                                                <FilePlus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div>
                                            {(() => {
                                                const countNormaux = personnelsForMonth.filter(
                                                    (p) =>
                                                        (!p.Observation || p.Observation === null) &&
                                                        (!p.Observation || !p.Observation.includes('57')),
                                                ).length;
                                                const countRetard = personnelsForMonth.filter(
                                                    (p) => p.Observation && !p.Observation.includes('57'),
                                                ).length;
                                                const count57 = personnelsForMonth.filter(
                                                    (p) => p.Observation && p.Observation.includes('57'),
                                                ).length;
                                                return (
                                                    <div className="mt-2 flex gap-4">
                                                        {countNormaux > 0 && (
                                                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                                                Av normaux : <b className="ml-1">{countNormaux}</b>
                                                            </span>
                                                        )}
                                                        {countRetard > 0 && (
                                                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                                                                Av retard : <b className="ml-1">{countRetard}</b>
                                                            </span>
                                                        )}
                                                        {count57 > 0 && (
                                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                                                AV 57 ans : <b className="ml-1">{count57}</b>
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="text-muted-foreground col-span-full text-center">Aucune donnée trouvée.</div>
                    )}
                </div>

                {/* Affichage du tableau détail si une Card est sélectionnée */}
                {selectedDateEffet && (
                    <>
                        {/* Tableau Horraire */}
                        {filteredDetails.filter((p) => p.TH != null && (!p.Observation || !p.Observation.includes('57'))).length > 0 && (
                            <div className="mb-8 rounded-md border">
                                <h1 className="p-4 text-lg font-semibold">Horraire</h1>
                                <table className="w-full caption-bottom">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <th rowSpan={2} className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">
                                                Mle
                                            </th>
                                            <th rowSpan={2} className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">
                                                Nom
                                            </th>
                                            <th
                                                colSpan={6}
                                                className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium"
                                            >
                                                ANCIENNE SITUATION
                                            </th>
                                            <th
                                                colSpan={6}
                                                className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium"
                                            >
                                                NOUVELLE SITUATION
                                            </th>
                                            <th colSpan={2} className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">
                                                Observation
                                            </th>
                                        </tr>
                                        <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <th className="text-muted-foreground font-mediumm h-10 border-l border-gray-200 px-1 text-center align-middle">
                                                Cat.
                                            </th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">S.Cat</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ech.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">SBase/TH</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ind.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Effet</th>
                                            <th className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle">
                                                Cat.
                                            </th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">S.Cat</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ech.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">SBase/TH</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ind.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Effet</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Note</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Observation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {filteredDetails
                                            .filter((p) => p.TH != null && (!p.Observation || !p.Observation.includes('57')))
                                            .map((personnel) => (
                                                <tr
                                                    key={personnel.id}
                                                    className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                                                >
                                                    <td className="sticky left-0 bg-white p-1 align-middle font-medium">{personnel.Mle}</td>
                                                    <td className="sticky left-12 bg-white p-1 align-middle font-medium">{personnel.NomPrenom}</td>
                                                    {/* Ancienne Situation */}
                                                    <td className="max-w-[60px] truncate border-l border-gray-200 p-1 align-middle">
                                                        {personnel.Categorie || '-'}
                                                    </td>
                                                    <td className="max-w-[60px] truncate p-1 align-middle">{personnel.Sous_Categorie || '-'}</td>
                                                    <td className="max-w-[40px] truncate p-1 align-middle">{personnel.Echellon || '-'}</td>
                                                    <td className="p-1 align-middle">{personnel.TH ?? personnel.SBase ?? '-'}</td>
                                                    <td className="p-1 align-middle">{personnel.Ind_differentiel ?? '-'}</td>
                                                    <td className="p-1 align-middle whitespace-nowrap">
                                                        {personnel.Date_effet ? new Date(personnel.Date_effet).toLocaleDateString('fr-FR') : '-'}
                                                    </td>
                                                    {/* Nouvelle Situation */}
                                                    <td className="max-w-[60px] truncate border-l border-gray-200 p-1 align-middle">
                                                        {personnel.NCategorie || '-'}
                                                    </td>
                                                    <td className="max-w-[60px] truncate p-1 align-middle">{personnel.NSous_Categorie || '-'}</td>
                                                    <td className="max-w-[40px] truncate p-1 align-middle">{personnel.NEchellon || '-'}</td>
                                                    <td className="p-1 align-middle">{personnel.NTH ?? personnel.NSBase ?? '-'}</td>
                                                    <td className="p-1 align-middle">{personnel.NInd_differentiel ?? '-'}</td>
                                                    <td className="p-1 align-middle whitespace-nowrap">
                                                        {personnel.NDate_effet ? new Date(personnel.NDate_effet).toLocaleDateString('fr-FR') : '-'}
                                                    </td>
                                                    {/* Observation */}
                                                    <td className="p-1 align-middle">{personnel.Note || '-'}</td>
                                                    <td className="p-1 align-middle">{personnel.Observation || '-'}</td>
                                                </tr>
                                            ))}
                                        {filteredDetails.filter((p) => p.TH != null).length === 0 && (
                                            <tr>
                                                <td colSpan={16} className="text-muted-foreground py-4 text-center">
                                                    Aucun résultat
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Tableau Mensuel */}
                        {filteredDetails.filter((p) => p.SBase != null && (!p.Observation || !p.Observation.includes('57'))).length > 0 && (
                            <div className="mb-8 rounded-md border">
                                <h1 className="p-4 text-lg font-semibold">Mensuel</h1>
                                <table className="w-full caption-bottom">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <th rowSpan={2} className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">
                                                Mle
                                            </th>
                                            <th rowSpan={2} className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">
                                                Nom
                                            </th>
                                            <th
                                                colSpan={6}
                                                className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium"
                                            >
                                                ANCIENNE SITUATION
                                            </th>
                                            <th
                                                colSpan={6}
                                                className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium"
                                            >
                                                NOUVELLE SITUATION
                                            </th>
                                            <th colSpan={2} className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">
                                                Observation
                                            </th>
                                        </tr>
                                        <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <th className="text-muted-foreground font-mediumm h-10 border-l border-gray-200 px-1 text-center align-middle">
                                                Cat.
                                            </th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">S.Cat</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ech.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">SBase/TH</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ind.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Effet</th>
                                            <th className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle">
                                                Cat.
                                            </th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">S.Cat</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ech.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">SBase/TH</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ind.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Effet</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Note</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Observation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {filteredDetails
                                            .filter((p) => p.SBase != null && (!p.Observation || !p.Observation.includes('57')))
                                            .map((personnel) => (
                                                <tr
                                                    key={personnel.id}
                                                    className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                                                >
                                                    <td className="sticky left-0 bg-white p-1 align-middle font-medium">{personnel.Mle}</td>
                                                    <td className="sticky left-12 bg-white p-1 align-middle font-medium">{personnel.NomPrenom}</td>
                                                    {/* Ancienne Situation */}
                                                    <td className="max-w-[60px] truncate border-l border-gray-200 p-1 align-middle">
                                                        {personnel.Categorie || '-'}
                                                    </td>
                                                    <td className="max-w-[60px] truncate p-1 align-middle">{personnel.Sous_Categorie || '-'}</td>
                                                    <td className="max-w-[40px] truncate p-1 align-middle">{personnel.Echellon || '-'}</td>
                                                    <td className="p-1 align-middle">{personnel.TH ?? personnel.SBase ?? '-'}</td>
                                                    <td className="p-1 align-middle">{personnel.Ind_differentiel ?? '-'}</td>
                                                    <td className="p-1 align-middle whitespace-nowrap">
                                                        {personnel.Date_effet ? new Date(personnel.Date_effet).toLocaleDateString('fr-FR') : '-'}
                                                    </td>
                                                    {/* Nouvelle Situation */}
                                                    <td className="max-w-[60px] truncate border-l border-gray-200 p-1 align-middle">
                                                        {personnel.NCategorie || '-'}
                                                    </td>
                                                    <td className="max-w-[60px] truncate p-1 align-middle">{personnel.NSous_Categorie || '-'}</td>
                                                    <td className="max-w-[40px] truncate p-1 align-middle">{personnel.NEchellon || '-'}</td>
                                                    <td className="p-1 align-middle">{personnel.NTH ?? personnel.NSBase ?? '-'}</td>
                                                    <td className="p-1 align-middle">{personnel.NInd_differentiel ?? '-'}</td>
                                                    <td className="p-1 align-middle whitespace-nowrap">
                                                        {personnel.NDate_effet ? new Date(personnel.NDate_effet).toLocaleDateString('fr-FR') : '-'}
                                                    </td>
                                                    {/* Observation */}
                                                    <td className="p-1 align-middle">{personnel.Note || '-'}</td>
                                                    <td className="p-1 align-middle">{personnel.Observation || '-'}</td>
                                                </tr>
                                            ))}
                                        {filteredDetails.filter((p) => p.SBase != null).length === 0 && (
                                            <tr>
                                                <td colSpan={16} className="text-muted-foreground py-4 text-center">
                                                    Aucun résultat
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Tableau 57 ANS AVANCEMENT EXCEPTIONNEL */}
                        {filteredDetails.filter((p) => p.Observation && p.Observation.includes('57')).length > 0 && (
                            <div className="mb-8 rounded-md border">
                                <h1 className="p-4 text-lg font-semibold">57 ANS AVANCEMENT EXCEPTIONNEL</h1>
                                <table className="w-full caption-bottom">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <th rowSpan={2} className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">
                                                Mle
                                            </th>
                                            <th rowSpan={2} className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">
                                                Nom
                                            </th>
                                            <th
                                                colSpan={6}
                                                className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium"
                                            >
                                                ANCIENNE SITUATION
                                            </th>
                                            <th
                                                colSpan={6}
                                                className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium"
                                            >
                                                NOUVELLE SITUATION
                                            </th>
                                            <th colSpan={2} className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">
                                                Observation
                                            </th>
                                        </tr>
                                        <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <th className="text-muted-foreground font-mediumm h-10 border-l border-gray-200 px-1 text-center align-middle">
                                                Cat.
                                            </th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">S.Cat</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ech.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">SBase/TH</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ind.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Effet</th>
                                            <th className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle">
                                                Cat.
                                            </th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">S.Cat</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ech.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">SBase/TH</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ind.</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Effet</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Observation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {filteredDetails
                                            .filter((p) => p.Observation && p.Observation.includes('57'))
                                            .map((personnel) => (
                                                <tr
                                                    key={personnel.id}
                                                    className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                                                >
                                                    <td className="sticky left-0 bg-white p-1 align-middle font-medium">{personnel.Mle}</td>
                                                    <td className="sticky left-12 bg-white p-1 align-middle font-medium">{personnel.NomPrenom}</td>
                                                    {/* Ancienne Situation */}
                                                    <td className="max-w-[60px] truncate border-l border-gray-200 p-1 align-middle">
                                                        {personnel.Categorie || '-'}
                                                    </td>
                                                    <td className="max-w-[60px] truncate p-1 align-middle">{personnel.Sous_Categorie || '-'}</td>
                                                    <td className="max-w-[40px] truncate p-1 align-middle">{personnel.Echellon || '-'}</td>
                                                    <td className="p-1 align-middle">{personnel.TH ?? personnel.SBase ?? '-'}</td>
                                                    <td className="p-1 align-middle">{personnel.Ind_differentiel ?? '-'}</td>
                                                    <td className="p-1 align-middle whitespace-nowrap">
                                                        {personnel.Date_effet ? new Date(personnel.Date_effet).toLocaleDateString('fr-FR') : '-'}
                                                    </td>
                                                    {/* Nouvelle Situation */}
                                                    <td className="max-w-[60px] truncate border-l border-gray-200 p-1 align-middle">
                                                        {personnel.NCategorie || '-'}
                                                    </td>
                                                    <td className="max-w-[60px] truncate p-1 align-middle">{personnel.NSous_Categorie || '-'}</td>
                                                    <td className="max-w-[40px] truncate p-1 align-middle">{personnel.NEchellon || '-'}</td>
                                                    <td className="p-1 align-middle">{personnel.NTH ?? personnel.NSBase ?? '-'}</td>
                                                    <td className="p-1 align-middle">{personnel.NInd_differentiel ?? '-'}</td>
                                                    <td className="p-1 align-middle whitespace-nowrap">
                                                        {personnel.NDate_effet ? new Date(personnel.NDate_effet).toLocaleDateString('fr-FR') : '-'}
                                                    </td>
                                                    {/* Observation */}
                                                    <td className="p-1 align-middle">{personnel.Observation || '-'}</td>
                                                </tr>
                                            ))}
                                        {filteredDetails.filter((p) => p.Observation && p.Observation.includes('57')).length === 0 && (
                                            <tr>
                                                <td colSpan={14} className="text-muted-foreground py-4 text-center">
                                                    Aucun résultat
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* Dialog de suppression inchangé */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmer la suppression</DialogTitle>
                        </DialogHeader>
                        <div className="mb-4">
                            Êtes-vous sûr de vouloir supprimer tous les avancements de la date&nbsp;
                            <b>{confirmDeleteDate && new Date(confirmDeleteDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</b>
                            &nbsp;?
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Annuler
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Supprimer
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Dialog de création de décision */}
                <Dialog open={isDecisionDialogOpen} onOpenChange={setIsDecisionDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Créer une décision</DialogTitle>
                        </DialogHeader>
                        {/* Placez ici votre formulaire ou contenu de création de décision */}
                        <div>
                            <p>Formulaire de création de décision pour le mois : <b>{selectedDateEffet && new Date(selectedDateEffet).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</b></p>
                            {/* ...formulaire... */}
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setIsDecisionDialogOpen(false)}>
                                Annuler
                            </Button>
                            <Button variant="default" onClick={() => setIsDecisionDialogOpen(false)}>
                                Valider
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
