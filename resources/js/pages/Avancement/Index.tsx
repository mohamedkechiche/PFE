import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, History, Search, XCircle } from 'lucide-react';
import moment from 'moment';
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
    Date_effet: Date;
    Date_Prochain_Av: Date | null;
}

interface Personnel {
    ID: number;
    Mle: string;
    Nom: string;
    Prenom: string;
    NomPrenom: string;
    Date_Sortie_Etab: Date | null;
    Date_N: Date | null;
    avancement?: Avancement | null;
    historiqueAvancements?: Avancement[];
}

interface Sanction {
    ID: number;
    Mle: string;
    Sanction: string;
    D_Debut: Date;
    Duree: string;
    D_Fin: Date | null;
    Motif: string | null;
    Ref: string;
    Date_ref: Date | null;
}
interface Salaire {
    ID: number;
    cat: string | null;
    s_cat: string | null;
    inddiff1: number | null;
    inddiff2: number | null;
    inddiff3: number | null;
    inddiff4: number | null;
    inddiff5: number | null;
    inddiff6: number | null;
    inddiff7: number | null;
    inddiff8: number | null;
    inddiff9: number | null;
    inddiff10: number | null;
    inddiff11: number | null;
    inddiff12: number | null;
    inddiff13: number | null;
    inddiff14: number | null;
    inddiff15: number | null;
    inddiff16: number | null;
    inddiff17: number | null;
    inddiff18: number | null;
    inddiff19: number | null;
    inddiff20: number | null;
    inddiff21: number | null;
    inddiff22: number | null;
    inddiff23: number | null;
    inddiff24: number | null;
    inddiff25: number | null;
    inddiff26: number | null;
    inddiff27: number | null;
    inddiff28: number | null;
    inddiff29: number | null;
    inddiff30: number | null;
    inddiff31: number | null;
    inddiff32: number | null;
    inddiff33: number | null;
    inddiff34: number | null;
    inddiff35: number | null;
    inddiff36: number | null;
    inddiff37: number | null;
    inddiff38: number | null;
    inddiff39: number | null;
    inddiff40: number | null;
    th1: number | null;
    th2: number | null;
    th3: number | null;
    th4: number | null;
    th5: number | null;
    th6: number | null;
    th7: number | null;
    th8: number | null;
    th9: number | null;
    th10: number | null;
    th11: number | null;
    th12: number | null;
    th13: number | null;
    th14: number | null;
    th15: number | null;
    th16: number | null;
    th17: number | null;
    th18: number | null;
    th19: number | null;
    th20: number | null;
    th21: number | null;
    th22: number | null;
    th23: number | null;
    th24: number | null;
    th25: number | null;
    th26: number | null;
    th27: number | null;
    th28: number | null;
    th29: number | null;
    th30: number | null;
    th31: number | null;
    th32: number | null;
    th33: number | null;
    th34: number | null;
    th35: number | null;
    th36: number | null;
    th37: number | null;
    th38: number | null;
    th39: number | null;
    th40: number | null;
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
    allSanctions: Sanction[];
    grilleSalaire: Salaire[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Avancement',
        href: '/avancement',
    },
];

export default function AvancementIndex({
    personnels,
    count,
    countAvancementdepassee,
    filters,
    flash,
    HAvancements,
    allSanctions,
    grilleSalaire,
}: Props) {
    // console.log('Sanction', Sanction);
    const [isOpen, setIsOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Personnel | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [searchTerm, setSearchTerm] = useState('');
    const [completionFilter, setCompletionFilter] = useState<'all' | 'M' | 'H' | 'sans_avancement' | 'Avancement_depassee'>(
        filters.filter as 'all' | 'M' | 'H' | 'sans_avancement' | 'Avancement_depassee',
    );
    const [completionPage, setCompletionPage] = useState<'10000' | '10' | '20' | '50'>(filters.pages as '10000' | '10' | '20' | '50');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [historyMle, setHistoryMle] = useState<string>('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [dateFilter, setDateFilter] = useState<Date | null>(new Date());
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    const isFirstRender = useRef(true);

    const [step2Inputs, setStep2Inputs] = useState<{ [id: number]: { col1: number; col2: number; col3: number } }>(() =>
        Object.fromEntries(selectedIds.map((id) => [id, { col1: 0, col2: 0, col3: 20 }])),
    );

    const [sanctionsDialogOpen, setSanctionsDialogOpen] = useState(false);
    const [selectedDateProchainAv, setSelectedDateProchainAv] = useState<Date | null>(null);
    const [sanctionIndividuel, setSanctionIndividuel] = useState<Sanction[]>(allSanctions);

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

    // tabeau step 1 avec filtre date
    const visiblePersonnels = personnels.data.filter((personnel) => {
        const avDate = new Date(personnel.avancement?.Date_Prochain_Av ?? 0);
        const avDateStr = avDate.toISOString().slice(0, 10);
        const filterDateStr = dateFilter ? dateFilter.getFullYear() + '-' + (dateFilter.getMonth() + 1).toString().padStart(2, '0') + '-01' : '';
        // Si un filtre date est actif, il doit matcher
        if (dateFilter && avDateStr !== filterDateStr) {
            return false;
        }
        // Si un searchTerm est actif, il doit matcher
        if (searchTerm && !personnel.Mle.includes(searchTerm)) {
            return false;
        }
        return true;
    });

    const handleMassUpdate = async () => {
        await router.put(
            route('avancement.massUpdate'),
            {
                avancements: step2Results.map((personnel) => ({
                    id: personnel.Avancement?.id,
                    Mle: personnel.Avancement?.Mle ?? personnel.Mle,
                    NomPrenom: personnel.Avancement?.NomPrenom ?? personnel.Nom + ' ' + personnel.Prenom,
                    Qualification: personnel.Avancement?.Qualification,
                    Categorie: personnel.Avancement?.Categorie,
                    Sous_Categorie: personnel.Avancement?.Sous_Categorie,
                    Echellon: personnel.nouvelleEchellon,
                    SBase: personnel.nouveauTH ?? personnel.Avancement?.SBase,
                    TH: personnel.nouveauTH ?? personnel.Avancement?.TH,
                    Ind_differentiel: personnel.nouvelIndDiff ?? personnel.Avancement?.Ind_differentiel,
                    Date_Prochain_Av: moment(personnel.novelDateProchainAv).format('YYYY-MM-DD'),
                    Date_effet: moment(personnel.Avancement?.Date_effet).format('YYYY-MM-DD'),
                    Observation: personnel.Observation,
                })),
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            },
        );
    };

    const handleMassUpdate57ans = async () => {
        await router.put(
            route('avancement.massUpdate57ans'),
            {
                avancements: resultavancement57ans.map((personnel) => ({
                    id: personnel.Avancement?.id,
                    Mle: personnel.Avancement?.Mle ?? personnel.Mle,
                    NomPrenom: personnel.Avancement?.NomPrenom ?? personnel.Nom + ' ' + personnel.Prenom,
                    Qualification: personnel.Avancement?.Qualification,
                    Categorie: personnel.novelCategorie ?? personnel.Avancement?.Categorie,
                    Sous_Categorie: personnel.novelSousCategorie ?? personnel.Avancement?.Sous_Categorie,
                    Echellon: personnel.nouvelleEchellon,
                    SBase: personnel.nouveauTH ?? personnel.Avancement?.SBase,
                    TH: personnel.nouveauTH ?? personnel.Avancement?.TH,
                    Ind_differentiel: personnel.nouvelIndDiff ?? personnel.Avancement?.Ind_differentiel,
                    Date_Prochain_Av: moment(personnel.novelDateProchainAv).format('YYYY-MM-DD'),
                    Date_effet: moment(personnel.Avancement?.Date_effet).format('YYYY-MM-DD'),
                    Observation: personnel.Observation,
                })),
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            },
        );
    };

    const handleMassAdd = async () => {
        await router.post(
            route('avancement.massAdd'),
            {
                avancements: step2Results.map((personnel) => ({
                    Mle: personnel.Avancement?.Mle ?? personnel.Mle,
                    NomPrenom: personnel.Avancement?.NomPrenom ?? personnel.Nom + ' ' + personnel.Prenom,
                    Qualification: personnel.Avancement?.Qualification,
                    Categorie: personnel.Avancement?.Categorie,
                    Sous_Categorie: personnel.Avancement?.Sous_Categorie,
                    Echellon: personnel.Avancement?.Echellon,
                    SBase: personnel.Avancement?.SBase,
                    TH: personnel.Avancement?.TH,
                    Ind_differentiel: personnel.Avancement?.Ind_differentiel,
                    Date_effet: personnel.Avancement?.Date_effet,
                    NCategorie: personnel.Avancement?.Categorie,
                    NSous_Categorie: personnel.Avancement?.Sous_Categorie,
                    NEchellon: personnel.nouvelleEchellon,
                    NSBase: personnel.Avancement?.Sous_Categorie === null ? personnel.nouveauTH : null,
                    NTH: personnel.Avancement?.Sous_Categorie !== null ? personnel.nouveauTH : null,
                    NInd_differentiel: personnel.nouvelIndDiff,
                    NDate_effet: personnel.Avancement?.Date_Prochain_Av,
                    Note: personnel.col3,
                    Observation: personnel.Observation,
                    echNouveau_1: null,
                    nouveauTH_1: null,
                    nouvelIndDiff_1: null,
                })),
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            },
        );
    };

    const handleMassAdd57ans = async () => {
        await router.post(
            route('avancement.massAdd57ans'),
            {
                avancements: resultavancement57ans.map((personnel) => ({
                    id: null,
                    Mle: personnel.Avancement?.Mle,
                    NomPrenom: personnel.Nom + ' ' + personnel.Prenom,
                    Qualification: personnel.Avancement?.Qualification,
                    Categorie: personnel.Avancement?.Categorie,
                    Sous_Categorie: personnel.Avancement?.Sous_Categorie,
                    Echellon: personnel.Avancement?.Echellon,
                    SBase: personnel.Avancement?.SBase,
                    TH: personnel.Avancement?.TH,
                    Ind_differentiel: personnel.Avancement?.Ind_differentiel,
                    Date_effet: personnel.Avancement?.Date_effet,
                    Observation: 'avancement exceptionnel 57 ans',
                    NCategorie: personnel.novelCategorie ?? personnel.Avancement?.Categorie,
                    NSous_Categorie: personnel.novelSousCategorie ?? personnel.Avancement?.Sous_Categorie,
                    NEchellon: personnel.nouvelleEchellon,
                    NSBase: personnel.Avancement?.Sous_Categorie === null ? personnel.nouveauTH : null,
                    NTH: personnel.Avancement?.Sous_Categorie !== null ? personnel.nouveauTH : null,
                    NInd_differentiel: personnel.nouvelIndDiff ?? personnel.Avancement?.Ind_differentiel,
                    NDate_effet: dateFilter ? moment(dateFilter).set('date', moment(personnel.Date_N).date()).format('YYYY-MM-DD'): '-',
                    Note: 0,
                    echNouveau_1: personnel.nouvelleEchellon,
                    nouveauTH_1: personnel.nouveauTH,
                    nouvelIndDiff_1: personnel.nouvelIndDiff,
                })),
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            },
        );
    };

    const handleAllMassActions = async () => {
        try {
            await handleMassUpdate();
            await handleMassUpdate57ans();
            await handleMassAdd();
            await handleMassAdd57ans();
        } finally {
            setIsSaving(false);
        }
    };

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

    const handleShowSanctions = async (mle: string, dateProchainAv?: Date | null) => {
        setIsLoadingHistory(true);
        setSanctionsDialogOpen(true);
        setHistoryMle(mle);
        setSelectedDateProchainAv(dateProchainAv ?? null);
        if (dateProchainAv) {
            let date_18mois = moment(dateProchainAv).subtract(18, 'months');

            setSanctionIndividuel(
                allSanctions.filter(
                    (sanction: Sanction) => sanction.Mle === mle && sanction.D_Debut <= dateProchainAv && moment(sanction.D_Debut) >= date_18mois,
                ),
            );
        } else {
            setSanctionIndividuel([]);
        }
        setIsLoadingHistory(false);
    };

    const handleFilterChange = (value: 'all' | 'M' | 'H' | 'sans_avancement' | 'Avancement_depassee') => {
        setCompletionFilter(value);
        router.get(
            route('personnel.index'),
            {
                filter: value,
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
                updated[id] = prev[id] || { col1: 0, col2: 0, col3: 0 };
            });
            return updated;
        });
    }, [selectedIds]);

    const [results57anscount, setResults57anscount] = useState<number>(0);

    const results57ans = personnels.data.filter((personnel) => {
        if (!personnel.Date_N || !personnel.avancement) return false;
        const startDate = moment(dateFilter).startOf('month');
        const endDate = moment(dateFilter).endOf('month');
        const dateOf57 = moment(personnel.Date_N).add(57, 'years');
        return dateOf57.isBetween(startDate, endDate, 'day', '[]');
    });

    useEffect(() => {
        setResults57anscount(results57ans.length);
    }, [results57ans.length]);

    // Ajoute ce state pour stocker les résultats du tableau d'avancement 57 ans
    const [resultavancement57ans, setResultavancement57ans] = useState<any[]>([]);

    // Fonction pour collecter les inputs de l'étape 2
    const calculeavancement57ans = () => {
        if (results57ans.length === 0) {
            return false;
        }
        const results = results57ans.map((personnel) => {
            const av = personnel.avancement;
            // Trouver la grille correspondant à la catégorie/sous-catégorie
            const grille = grilleSalaire.find((g) => g.cat === av?.Categorie && g.s_cat === av?.Sous_Categorie);

            let echNouveau: number | string | undefined;
            let nouveauTH: number | string | null | undefined;
            let nouvelIndDiff: number | string | null | undefined;
            let novelCategorie: string | null | undefined;
            let novelSousCategorie: string | null | undefined;
            let novelDateProchainAv: string | null | undefined;
            let Observation: string | null | undefined = '';
            let echActuel = parseInt(av?.Echellon || '0', 10);
            let grilleNouvel: any | null = null;
            let echNouveau_1: number | string | undefined;
            let nouveauTH_1: number | string | null | undefined;
            let nouvelIndDiff_1: number | string | null | undefined;
            let novelDate_effet: Date | string;

            // Si catégorie est "5", "7" ou "12", on applique la règle spéciale +2ECH
            if (av?.Categorie === '5' || av?.Categorie === '7' || av?.Categorie === '12') {
                // Récupérer l'échelon actuel (ex: "10" pour "th10")
                echNouveau = echActuel + 2;
                echNouveau_1 = echActuel + 1;
                // Construire les clés dynamiquement
                const thKeyNouveau = `th${echNouveau}`;
                const indKeyNouveau = av?.Ind_differentiel ? `inddiff${echNouveau}` : '-';
                const thKeyNouveau_1 = `th${echNouveau_1}`;
                const indKeyNouveau_1 = av?.Ind_differentiel ? `inddiff${echNouveau_1}` : '-';

                // Valeurs NOUVELLE SITUATION
                nouveauTH = grille ? grille[thKeyNouveau as keyof Salaire] : '-';
                nouveauTH_1 = grille ? grille[thKeyNouveau_1 as keyof Salaire] : '-';
                nouvelIndDiff = grille ? grille[indKeyNouveau as keyof Salaire] : '-';
                nouvelIndDiff_1 = grille ? grille[indKeyNouveau_1 as keyof Salaire] : '-';
                novelCategorie = av?.Categorie;
                novelSousCategorie = av?.Sous_Categorie;
                // console.log(echNouveau_1);
            } else {
                // Si HORRAIRE
                if (av?.Sous_Categorie) {
                    novelCategorie = (parseInt(av?.Categorie || '0', 10) + 1).toString();

                    grilleNouvel = grilleSalaire.find((g) => {
                        // Extraire le dernier caractère numérique de Sous_Categorie
                        const currentNumber = av?.Sous_Categorie?.match(/\d+$/)?.[0] || '';
                        const grilleNumber = g.s_cat?.match(/\d+$/)?.[0] || '';
                        // Vérifier la catégorie et le même numéro de sous-catégorie
                        return g.cat === novelCategorie && currentNumber === grilleNumber;
                    });
                    // console.log('grilleSalaire', grilleSalaire);
                    // console.log('grilleNouvel', grilleNouvel);

                    const findNextTH = (currentTH: number | null | undefined, grille: Salaire): { value: number; index: number } => {
                        if (!currentTH) return { value: 0, index: 0 };
                        // Créer un tableau de toutes les valeurs TH avec leurs indices
                        const thValues = Array.from({ length: 40 }, (_, i) => ({
                            value: grille[`th${i + 1}` as keyof Salaire] as number | null,
                            index: i + 1,
                        }))
                            .filter((item): item is { value: number; index: number } => item.value !== null)
                            .sort((a, b) => a.value - b.value);

                        // Trouver la première valeur supérieure à currentTH
                        const nextItem = thValues.find((item) => item.value > currentTH);
                        return nextItem ? { value: nextItem.value, index: nextItem.index } : { value: 0, index: 0 };
                    };

                    // Utilisation:
                    const { value: nextSBase, index: nextSBaseIndex } = findNextTH(av?.TH, grilleNouvel);
                    const thKeyNouveau = `th${nextSBaseIndex + 1}`;
                    const thKeyNouveau_1 = `th${nextSBaseIndex}`;
                    const indKeyNouveau = av?.Ind_differentiel ? `inddiff${nextSBaseIndex + 1}` : '-';
                    const indKeyNouveau_1 = av?.Ind_differentiel ? `inddiff${nextSBaseIndex}` : '-';

                    // Valeurs NOUVELLE SITUATION
                    nouveauTH = grilleNouvel ? grilleNouvel[thKeyNouveau as keyof Salaire] : '-';
                    nouveauTH_1 = grilleNouvel ? grilleNouvel[thKeyNouveau_1 as keyof Salaire] : '-';
                    nouvelIndDiff = grilleNouvel && av?.Ind_differentiel ? grilleNouvel[indKeyNouveau as keyof Salaire] : '-';
                    nouvelIndDiff_1 = grilleNouvel && av?.Ind_differentiel ? grilleNouvel[indKeyNouveau_1 as keyof Salaire] : '-';
                    echNouveau = nextSBaseIndex + 1;
                    echNouveau_1 = nextSBaseIndex;
                    novelSousCategorie = grilleNouvel.s_cat;
                }
                // Si MENSUELLE
                else {
                    novelCategorie = (parseInt(av?.Categorie || '0', 10) + 1).toString();
                    grilleNouvel = grilleSalaire.find((g) => g.cat === novelCategorie && g.s_cat === av?.Sous_Categorie);

                    const findNextTH = (currentTH: number | null | undefined, grille: Salaire): { value: number; index: number } => {
                        if (!currentTH) return { value: 0, index: 0 };

                        // Créer un tableau de toutes les valeurs TH avec leurs indices
                        const thValues = Array.from({ length: 40 }, (_, i) => ({
                            value: grille[`th${i + 1}` as keyof Salaire] as number | null,
                            index: i + 1,
                        }))
                            .filter((item): item is { value: number; index: number } => item.value !== null)
                            .sort((a, b) => a.value - b.value);

                        // Trouver la première valeur supérieure à currentTH
                        const nextItem = thValues.find((item) => item.value > currentTH);
                        return nextItem ? { value: nextItem.value, index: nextItem.index } : { value: 0, index: 0 };
                    };

                    // Utilisation:
                    const { value: nextSBase, index: nextSBaseIndex } = findNextTH(av?.SBase, grilleNouvel);
                    const thKeyNouveau = `th${nextSBaseIndex + 1}`;
                    const thKeyNouveau_1 = `th${nextSBaseIndex}`;
                    const indKeyNouveau = av?.Ind_differentiel ? `inddiff${nextSBaseIndex + 1}` : '-';
                    const indKeyNouveau_1 = av?.Ind_differentiel ? `inddiff${nextSBaseIndex}` : '-';

                    // Valeurs NOUVELLE SITUATION
                    nouveauTH = grilleNouvel ? grilleNouvel[thKeyNouveau as keyof Salaire] : '-';
                    nouveauTH_1 = grilleNouvel ? grilleNouvel[thKeyNouveau_1 as keyof Salaire] : '-';
                    nouvelIndDiff = grilleNouvel && av?.Ind_differentiel ? grilleNouvel[indKeyNouveau as keyof Salaire] : '-';
                    nouvelIndDiff_1 = grilleNouvel && av?.Ind_differentiel ? grilleNouvel[indKeyNouveau_1 as keyof Salaire] : '-';
                    echNouveau = nextSBaseIndex + 1; // Mise à jour de l'échelon avec l'index trouvé
                    echNouveau_1 = nextSBaseIndex; // Mise à jour de l'échelon avec l'index trouvée
                };
            }

            return {
                personnelId: personnel.ID,
                Mle: personnel.Mle,
                Nom: personnel.Nom,
                Prenom: personnel.Prenom,
                DateProchainAv: av?.Date_Prochain_Av,
                Avancement: av,
                novelCategorie,
                novelSousCategorie,
                nouvelleEchellon: echNouveau,
                nouveauTH,
                nouvelIndDiff,
                novelDateProchainAv,
                Observation,
                nouvelIndDiff_1,
                nouveauTH_1,
                echNouveau_1,
                novelDate_effet:
                    dateFilter && personnel.Date_N ? moment(dateFilter).set('date', moment(personnel.Date_N).date()).format('YYYY-MM-DD') : '-',
            };
        });
        setResultavancement57ans(results);
        console.log('resultavancement57ans', results);
    };
    // Ajoute ce state pour stocker les résultats de l'étape 2 si besoin
    const [step2Results, setStep2Results] = useState<any[]>([]);

    // Fonction pour collecter les inputs de l'étape 2
    const calculeavancement_ech_normal = () => {
        const results = visiblePersonnels
            .filter((personnel) => selectedIds.includes(personnel.ID))
            .map((personnel) => {
                const av = personnel.avancement;
                // Trouver la grille correspondant à la catégorie/sous-catégorie
                const grille = grilleSalaire.find((g) => g.cat === av?.Categorie && g.s_cat === av?.Sous_Categorie);

                let echNouveau: number | string | undefined;
                let nouveauTH: number | string | null | undefined;
                let nouvelIndDiff: number | string | null | undefined;
                let novelDateProchainAv: string | null | undefined;
                let Observation: string | null | undefined = '';
                let declage_months: number = 0;

                // console.log(step2Inputs[personnel.ID]);
                if (step2Inputs[personnel.ID].col1 === 0 && step2Inputs[personnel.ID].col2 === 0 && step2Inputs[personnel.ID].col3 > 17) {
                    // Récupérer l'échelon actuel (ex: "10" pour "th10")
                    const echActuel = parseInt(av?.Echellon || '0', 10);
                    echNouveau = echActuel + 1;
                    // Construire les clés dynamiquement
                    const thKeyNouveau = `th${echNouveau}`;
                    const indKeyNouveau = av?.Ind_differentiel ? `inddiff${echNouveau}` : '-';
                    // Valeurs NOUVELLE SITUATION
                    nouveauTH = grille ? grille[thKeyNouveau as keyof Salaire] : '-';
                    nouvelIndDiff = grille ? grille[indKeyNouveau as keyof Salaire] : '-';
                    novelDateProchainAv = av ? moment(av.Date_Prochain_Av).add(18, 'months').toDate().toLocaleDateString('en') : '-';
                } else {
                    echNouveau = av?.Echellon;
                    nouveauTH = av?.TH;
                    nouvelIndDiff = av?.Ind_differentiel;
                    if (step2Inputs[personnel.ID].col1 > 0) {
                        declage_months += 3 * step2Inputs[personnel.ID].col1;
                        Observation += `Sanc¹= ${step2Inputs[personnel.ID].col1} ;`;
                    }

                    if (step2Inputs[personnel.ID].col2 > 0) {
                        declage_months += 6 * step2Inputs[personnel.ID].col2;
                        Observation += `Sanc²= ${step2Inputs[personnel.ID].col2} ;`;
                    }

                    if (step2Inputs[personnel.ID].col3 < 17) {
                        declage_months += 3;
                        Observation += `  Note= ${step2Inputs[personnel.ID].col3}<17 ;`;
                    }
                    novelDateProchainAv = av ? moment(av.Date_Prochain_Av).add(declage_months, 'months').toDate().toLocaleDateString('en') : '-';
                    // console.log('declage_months', declage_months);
                    // console.log('Observation', Observation);
                }
                return {
                    personnelId: personnel.ID,
                    Mle: personnel.Mle,
                    Nom: personnel.Nom,
                    Prenom: personnel.Prenom,
                    DateProchainAv: av?.Date_Prochain_Av,
                    Avancement: av,
                    ...step2Inputs[personnel.ID], // col1, col2, col3
                    nouvelleEchellon: echNouveau,
                    nouveauTH,
                    nouvelIndDiff,
                    novelDateProchainAv,
                    Observation,
                };
            });
        console.log('step2Results', results);
        setStep2Results(results);
    };

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

                    {results57anscount > 0 && (
                        <Button
                            className="border-blue-600 bg-blue-600 text-white"
                            onClick={() => {
                                reset();
                                setEditingTask(null);
                            }}
                        >
                            {
                                <span>
                                    Nombre d'effectif agé de 57ans : <i>{results57anscount}</i>
                                </span>
                            }
                        </Button>
                    )}
                </div>

                {/* etapes code */}
                <div className="mb-4">
                    <div className="mb-2 flex items-center justify-center">
                        {[1, 2, 3, 4].map((s, idx) => (
                            <div key={s} className="relative flex flex-1 items-center">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition duration-500 ease-in-out ${
                                        step > s
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : step === s
                                              ? 'border-blue-600 bg-white text-blue-600'
                                              : 'border-gray-300 bg-gray-100 text-gray-400'
                                    }`}
                                >
                                    {step > s ? (
                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        s
                                    )}
                                </div>
                                <div
                                    className={`absolute top-0 left-1/2 mt-12 w-24 -translate-x-1/2 text-center text-xs font-medium uppercase ${step >= s ? 'text-blue-600' : 'text-gray-400'}`}
                                >
                                    Étape {s}
                                </div>
                                {idx < 3 && (
                                    <div
                                        className={`mx-2 flex-auto border-t-2 transition duration-500 ease-in-out ${step > s ? 'border-blue-600' : 'border-gray-300'}`}
                                    ></div>
                                )}
                            </div>
                        ))}
                    </div>
                    <br />
                    <div className="flex justify-between">
                        <Button disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
                            Précédent
                        </Button>
                        {step === 4 ? (
                            <Button
                                className="bg-blue-500 text-white hover:bg-blue-600"
                                onClick={() => {
                                    handleAllMassActions();
                                    setIsSaving(true);
                                }}
                                disabled={isSaving}
                            >
                                Enregistrer
                            </Button>
                        ) : (
                            <Button
                                disabled={selectedIds.length === 0}
                                onClick={() => {
                                    if (step === 2) {
                                        calculeavancement_ech_normal();
                                    } else if (step === 3) {
                                        calculeavancement57ans();
                                    }
                                    setStep((s) => s + 1);
                                }}
                            >
                                Suivant
                            </Button>
                        )}
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
                            readOnly={step !== 1}
                        />
                    </div>
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                        <Input placeholder="Search Mle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <Button onClick={() => handleFilterChange('Avancement_depassee')} className="bg-yellow-500 text-white hover:bg-yellow-600">
                        {countAvancementdepassee}
                    </Button>
                    <Button onClick={handleExportExcel} className="bg-green-500 text-white hover:bg-green-600">
                        Exporter Excel
                    </Button>
                </div>

                <div className="rounded-md">
                    <div className="text-xs">
                        {/* Conditional rendering for table based on step */}
                        <div className="relative w-full overflow-auto">
                            {step === 1 ? (
                                // Tableau normal (étape 1)
                                <div className="mb-8 rounded-md border">
                                    <h1 className="p-4 text-lg font-semibold">
                                        Avancements du{' '}
                                        {dateFilter ? dateFilter.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'tous'}
                                    </h1>
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
                                                <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Mle</th>
                                                <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Nom</th>
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
                                                    History
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {visiblePersonnels.map((personnel) => (
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
                                                            {personnel.avancement?.Qualification &&
                                                                personnel.avancement?.Qualification.length > 10 && (
                                                                    <div className="absolute z-10 hidden max-h-40 w-64 overflow-auto rounded border bg-white p-2 shadow-lg group-hover:block">
                                                                        {personnel.avancement?.Qualification}
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </td>
                                                    <td className="max-w-[60px] truncate p-1 align-middle">
                                                        {personnel.avancement?.Categorie || '-'}
                                                    </td>
                                                    <td className="max-w-[60px] truncate p-1 align-middle">
                                                        {personnel.avancement?.Sous_Categorie || '-'}
                                                    </td>
                                                    <td className="max-w-[40px] truncate p-1 align-middle">
                                                        {personnel.avancement?.Echellon || '-'}
                                                    </td>
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
                                </div>
                            ) : step === 3 ? (
                                // Tableau normal (étape 3)
                                <div className="mb-8 rounded-md border">
                                    <h1 className="p-4 text-lg font-semibold">Tableau Avancement Normal (Ancien / Nouveau Situation)</h1>
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
                                                    {' '}
                                                    ANCIENNE SITUATION
                                                </th>
                                                <th
                                                    colSpan={6}
                                                    className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium"
                                                >
                                                    {' '}
                                                    NOUVELLE SITUATION
                                                </th>
                                                <th
                                                    colSpan={2}
                                                    className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium"
                                                >
                                                    Observation
                                                </th>
                                            </tr>
                                            <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                                <th className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium">
                                                    Cat.
                                                </th>
                                                <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">S.Cat</th>
                                                <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ech.</th>
                                                <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">SBase/TH</th>
                                                <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ind.</th>
                                                <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Effet</th>
                                                <th className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium">
                                                    Cat.
                                                </th>
                                                <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">S.Cat</th>
                                                <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ech.</th>
                                                <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">SBase/TH</th>
                                                <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ind.</th>
                                                <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Effet</th>
                                                <th className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium">
                                                    DateProchainAv
                                                </th>
                                                <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Remarque</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {step2Results.map((personnel) => {
                                                return (
                                                    <tr
                                                        key={personnel.Avancement?.id}
                                                        className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                                                    >
                                                        <td className="sticky left-0 bg-white p-1 align-middle font-medium">{personnel.Mle}</td>
                                                        <td className="sticky left-12 bg-white p-1 align-middle font-medium">
                                                            {personnel.Nom + ' ' + personnel.Prenom}
                                                        </td>
                                                        {/* ANCIENNE SITUATION */}
                                                        <td className="max-w-[60px] truncate border-l border-gray-200 p-1 align-middle">
                                                            {personnel.Avancement?.Categorie || '-'}
                                                        </td>
                                                        <td className="max-w-[60px] truncate p-1 align-middle">
                                                            {personnel.Avancement?.Sous_Categorie || '-'}
                                                        </td>
                                                        <td className="max-w-[40px] truncate p-1 align-middle">
                                                            {personnel.Avancement?.Echellon || '-'}
                                                        </td>
                                                        <td className="p-1 align-middle">
                                                            {personnel.Avancement?.TH || personnel.Avancement?.SBase}
                                                        </td>
                                                        <td className="p-1 align-middle">{personnel.Avancement?.Ind_differentiel ?? '-'}</td>
                                                        <td className="p-1 align-middle whitespace-nowrap">
                                                            {personnel.Avancement?.Date_effet
                                                                ? new Date(personnel.Avancement.Date_effet).toLocaleDateString('fr')
                                                                : '-'}
                                                        </td>
                                                        {/* NOUVELLE SITUATION */}
                                                        <td className="max-w-[60px] truncate border-l border-gray-200 p-1 align-middle">
                                                            {personnel.Avancement?.Categorie || '-'}
                                                        </td>
                                                        <td className="max-w-[60px] truncate p-1 align-middle">
                                                            {personnel.Avancement?.Sous_Categorie || '-'}
                                                        </td>
                                                        <td className="max-w-[40px] truncate p-1 align-middle">{personnel.nouvelleEchellon}</td>
                                                        <td className="p-1 align-middle">{personnel.nouveauTH ?? personnel.Avancement?.SBase}</td>
                                                        <td className="p-1 align-middle">{personnel.nouvelIndDiff ?? '-'}</td>
                                                        <td className="p-1 align-middle whitespace-nowrap">
                                                            {new Date(personnel.Avancement.Date_Prochain_Av).toLocaleDateString('fr')}
                                                        </td>
                                                        <td className="max-w-[60px] truncate border-l border-gray-200 p-1 align-middle">
                                                            {new Date(personnel.novelDateProchainAv).toLocaleDateString('fr')}
                                                        </td>
                                                        <td className="p-1 align-middle">{personnel.Observation}</td>
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
                                </div>
                            ) : step === 4 ? (
                                // Tableau normal (étape 3)

                                <>
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
                                                        {' '}
                                                        ANCIENNE SITUATION
                                                    </th>
                                                    <th
                                                        colSpan={6}
                                                        className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium"
                                                    >
                                                        {' '}
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
                                                    <th className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium">
                                                        Cat.
                                                    </th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">S.Cat</th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ech.</th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">SBase/TH</th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ind.</th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Effet</th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">
                                                        DateProchainAv
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="[&_tr:last-child]:border-0">
                                                {step2Results
                                                    .filter((personnel) => personnel.Avancement?.TH != null) // <-- Ajoutez ce filtre
                                                    .map((personnel) => {
                                                        return (
                                                            <tr
                                                                key={personnel.Avancement?.id}
                                                                className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                                                            >
                                                                <td className="sticky left-0 bg-white p-1 align-middle font-medium">
                                                                    {personnel.Mle}
                                                                </td>
                                                                <td className="sticky left-12 bg-white p-1 align-middle font-medium">
                                                                    {personnel.Nom + ' ' + personnel.Prenom}
                                                                </td>
                                                                {/* ANCIENNE SITUATION */}
                                                                <td className="max-w-[60px] truncate border-l border-gray-200 p-1 align-middle">
                                                                    {personnel.Avancement?.Categorie || '-'}
                                                                </td>
                                                                <td className="max-w-[60px] truncate p-1 align-middle">
                                                                    {personnel.Avancement?.Sous_Categorie || '-'}
                                                                </td>
                                                                <td className="max-w-[40px] truncate p-1 align-middle">
                                                                    {personnel.Avancement?.Echellon || '-'}
                                                                </td>
                                                                <td className="p-1 align-middle">
                                                                    {personnel.Avancement?.TH || personnel.Avancement?.SBase}
                                                                </td>
                                                                <td className="p-1 align-middle">{personnel.Avancement?.Ind_differentiel ?? '-'}</td>
                                                                <td className="p-1 align-middle whitespace-nowrap">
                                                                    {personnel.Avancement?.Date_effet
                                                                        ? new Date(personnel.Avancement.Date_effet).toLocaleDateString('fr')
                                                                        : '-'}
                                                                </td>
                                                                {/* NOUVELLE SITUATION */}
                                                                <td className="max-w-[60px] truncate border-l border-gray-200 p-1 align-middle">
                                                                    {personnel.Avancement?.Categorie || '-'}
                                                                </td>
                                                                <td className="max-w-[60px] truncate p-1 align-middle">
                                                                    {personnel.Avancement?.Sous_Categorie || '-'}
                                                                </td>
                                                                <td className="max-w-[40px] truncate p-1 align-middle">
                                                                    {personnel.nouvelleEchellon}
                                                                </td>
                                                                <td className="p-1 align-middle">
                                                                    {personnel.nouveauTH ?? personnel.Avancement?.SBase}
                                                                </td>
                                                                <td className="p-1 align-middle">{personnel.nouvelIndDiff ?? '-'}</td>
                                                                <td className="p-1 align-middle whitespace-nowrap">
                                                                    {new Date(personnel.Avancement.Date_Prochain_Av).toLocaleDateString('fr')}
                                                                </td>
                                                                <td className="p-1 align-middle">
                                                                    {new Date(personnel.novelDateProchainAv).toLocaleDateString('fr')}
                                                                </td>
                                                                <td className="p-1 align-middle">{personnel.Observation}</td>
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
                                    </div>
                                    <br />
                                    <br />
                                    <div className="my-8"></div>
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
                                                        {' '}
                                                        ANCIENNE SITUATION
                                                    </th>
                                                    <th
                                                        colSpan={6}
                                                        className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium"
                                                    >
                                                        {' '}
                                                        NOUVELLE SITUATION
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
                                                    <th className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium">
                                                        Cat.
                                                    </th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">S.Cat</th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ech.</th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">SBase/TH</th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ind.</th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Effet</th>
                                                </tr>
                                            </thead>
                                            <tbody className="[&_tr:last-child]:border-0">
                                                {step2Results
                                                    .filter((personnel) => personnel.Avancement?.SBase != null) // <-- Ajoutez ce filtre
                                                    .map((personnel) => {
                                                        return (
                                                            <tr
                                                                key={personnel.Avancement?.id}
                                                                className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                                                            >
                                                                <td className="sticky left-0 bg-white p-1 align-middle font-medium">
                                                                    {personnel.Mle}
                                                                </td>
                                                                <td className="sticky left-12 bg-white p-1 align-middle font-medium">
                                                                    {personnel.Nom + ' ' + personnel.Prenom}
                                                                </td>
                                                                {/* ANCIENNE SITUATION */}
                                                                <td className="max-w-[60px] truncate border-l border-gray-200 p-1 align-middle">
                                                                    {personnel.Avancement?.Categorie || '-'}
                                                                </td>
                                                                <td className="max-w-[60px] truncate p-1 align-middle">
                                                                    {personnel.Avancement?.Sous_Categorie || '-'}
                                                                </td>
                                                                <td className="max-w-[40px] truncate p-1 align-middle">
                                                                    {personnel.Avancement?.Echellon || '-'}
                                                                </td>
                                                                <td className="p-1 align-middle">
                                                                    {personnel.Avancement?.TH || personnel.Avancement?.SBase}
                                                                </td>
                                                                <td className="p-1 align-middle">{personnel.Avancement?.Ind_differentiel ?? '-'}</td>
                                                                <td className="p-1 align-middle whitespace-nowrap">
                                                                    {personnel.Avancement?.Date_effet
                                                                        ? new Date(personnel.Avancement.Date_effet).toLocaleDateString('fr')
                                                                        : '-'}
                                                                </td>
                                                                {/* NOUVELLE SITUATION */}
                                                                <td className="max-w-[60px] truncate border-l border-gray-200 p-1 align-middle">
                                                                    {personnel.Avancement?.Categorie || '-'}
                                                                </td>
                                                                <td className="max-w-[60px] truncate p-1 align-middle">
                                                                    {personnel.Avancement?.Sous_Categorie || '-'}
                                                                </td>
                                                                <td className="max-w-[40px] truncate p-1 align-middle">
                                                                    {personnel.nouvelleEchellon}
                                                                </td>
                                                                <td className="p-1 align-middle">
                                                                    {personnel.nouveauTH ?? personnel.Avancement?.SBase}
                                                                </td>
                                                                <td className="p-1 align-middle">{personnel.nouvelIndDiff ?? '-'}</td>
                                                                <td className="p-1 align-middle whitespace-nowrap">
                                                                    {new Date(personnel.Avancement.Date_Prochain_Av).toLocaleDateString('fr')}
                                                                </td>
                                                                <td className="p-1 align-middle">
                                                                    {new Date(personnel.novelDateProchainAv).toLocaleDateString('fr')}
                                                                </td>
                                                                <td className="p-1 align-middle">{personnel.Observation}</td>
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
                                    </div>
                                    <br />
                                    <br />
                                    <div className="my-8"></div>
                                    <div className="mb-8 rounded-md border">
                                        <h1 className="p-4 text-lg font-semibold">57َآٍ ANS AVANCEMENT EXCEPTIONNEL</h1>
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
                                                        {' '}
                                                        ANCIENNE SITUATION
                                                    </th>
                                                    <th
                                                        colSpan={6}
                                                        className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium"
                                                    >
                                                        {' '}
                                                        NOUVELLE SITUATION
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
                                                    <th className="text-muted-foreground h-10 border-l border-gray-200 px-1 text-center align-middle font-medium">
                                                        Cat.
                                                    </th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">S.Cat</th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ech.</th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">SBase/TH</th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Ind.</th>
                                                    <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Effet</th>
                                                </tr>
                                            </thead>
                                            <tbody className="[&_tr:last-child]:border-0">
                                                {resultavancement57ans.map((personnel) => {
                                                    return (
                                                        <>
                                                            <tr
                                                                key={personnel.Avancement?.id}
                                                                className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                                                            >
                                                                <td rowSpan={2} className="sticky left-0 bg-white p-1 align-middle font-medium">
                                                                    {personnel.Mle}
                                                                </td>
                                                                <td rowSpan={2} className="sticky left-12 bg-white p-1 align-middle font-medium">
                                                                    {personnel.Nom + ' ' + personnel.Prenom}
                                                                </td>
                                                                {/* ANCIENNE SITUATION */}
                                                                <td
                                                                    rowSpan={2}
                                                                    className="max-w-[60px] truncate border-l border-gray-200 p-1 align-middle"
                                                                >
                                                                    {personnel.Avancement?.Categorie || '-'}
                                                                </td>
                                                                <td rowSpan={2} className="max-w-[60px] truncate p-1 align-middle">
                                                                    {personnel.Avancement?.Sous_Categorie || '-'}
                                                                </td>
                                                                <td rowSpan={2} className="max-w-[40px] truncate p-1 align-middle">
                                                                    {personnel.Avancement?.Echellon || '-'}
                                                                </td>
                                                                <td rowSpan={2} className="p-1 align-middle">
                                                                    {personnel.Avancement?.TH || personnel.Avancement?.SBase}
                                                                </td>
                                                                <td rowSpan={2} className="p-1 align-middle">
                                                                    {personnel.Avancement?.Ind_differentiel ?? '-'}
                                                                </td>
                                                                <td rowSpan={2} className="p-1 align-middle whitespace-nowrap">
                                                                    {personnel.Avancement?.Date_effet
                                                                        ? new Date(personnel.Avancement.Date_effet).toLocaleDateString('fr')
                                                                        : '-'}
                                                                </td>
                                                                {/* NOUVELLE SITUATION - Première ligne */}
                                                                <td
                                                                    rowSpan={2}
                                                                    className="max-w-[60px] truncate border-l border-gray-200 p-1 align-middle"
                                                                >
                                                                    {personnel.novelCategorie || '-'}
                                                                </td>
                                                                <td rowSpan={2} className="max-w-[60px] truncate p-1 align-middle">
                                                                    {personnel.novelSousCategorie || personnel.Avancement?.Sous_Categorie || '-'}
                                                                </td>
                                                                <td className="max-w-[40px] truncate p-1 align-middle">
                                                                    {personnel.nouvelleEchellon}
                                                                </td>
                                                                <td className="p-1 align-middle">
                                                                    {personnel.nouveauTH ?? personnel.Avancement?.SBase}
                                                                </td>
                                                                <td className="p-1 align-middle">{personnel.nouvelIndDiff ?? '-'}</td>
                                                                {/* <td rowSpan={2}className="p-1 align-middle">{personnel.novelDate_effet ? new Date(personnel.novelDate_effet).toLocaleDateString('fr')    : '-'}</td> */}
                                                                <td rowSpan={2} className="p-1 align-middle">
                                                                    {/* {dateFilter ? new Date(dateFilter).toLocaleDateString('fr') : '-'} */}

                                                                    {personnel.novelDate_effet && personnel.novelDate_effet !== '-'
                                                                        ? new Date(personnel.novelDate_effet).toLocaleDateString('fr')
                                                                        : '-'}
                                                                </td>
                                                                <td rowSpan={2} className="p-1 align-middle">
                                                                    avancement exceptionnel 57 ans
                                                                </td>
                                                            </tr>

                                                            <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                                                {/* NOUVELLE SITUATION - Deuxième ligne */}
                                                                <td className="max-w-[40px] truncate bg-gray-50 p-1 align-middle">
                                                                    {personnel.echNouveau_1}
                                                                </td>
                                                                <td className="bg-gray-50 p-1 align-middle">
                                                                    {personnel.nouveauTH_1 ?? personnel.Avancement?.SBase}
                                                                </td>
                                                                <td className="bg-gray-50 p-1 align-middle">{personnel.nouvelIndDiff_1 ?? '-'}</td>
                                                                <td className="bg-gray-50 p-1 align-middle">{personnel.nouvelleEchellon_1 ?? '-'}</td>
                                                            </tr>
                                                        </>
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
                                    </div>
                                </>
                            ) : (
                                // Tableau personnalisé pour l'étape 2
                                <table className="w-full caption-bottom">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Mle</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Nom</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Sanctions 1er deg</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Sanctions</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Sanctions 2eme deg</th>
                                            <th className="text-muted-foreground h-10 px-1 text-left align-middle font-medium">Note</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {visiblePersonnels
                                            .filter((personnel) => selectedIds.includes(personnel.ID)) // <-- Ajoutez ce filtre
                                            .map((personnel) => {
                                                let date_18mois = moment(personnel.avancement?.Date_Prochain_Av).subtract(18, 'months');

                                                const sanctionsCount =
                                                    personnel.avancement && personnel.avancement.Date_Prochain_Av
                                                        ? allSanctions.filter(
                                                              (s) =>
                                                                  s.Mle === personnel.Mle &&
                                                                  personnel.avancement &&
                                                                  personnel.avancement.Date_Prochain_Av &&
                                                                  s.D_Debut <= personnel.avancement.Date_Prochain_Av &&
                                                                  moment(s.D_Debut) >= date_18mois,
                                                          ).length
                                                        : 0;
                                                return (
                                                    <tr
                                                        key={personnel.ID}
                                                        className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                                                    >
                                                        <td className="p-1 align-middle">{personnel.Mle}</td>
                                                        <td className="p-1 align-middle">{personnel.Nom + ' ' + personnel.Prenom}</td>

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
                                                                            col1: e.target.value === '' ? 0 : Number(e.target.value),
                                                                        },
                                                                    }))
                                                                }
                                                            />
                                                        </td>
                                                        <td className="p-1 align-middle">
                                                            <div className="flex items-center gap-0.5">
                                                                {sanctionsCount > 0 && (
                                                                    <Button
                                                                        onClick={() =>
                                                                            handleShowSanctions(personnel.Mle, personnel.avancement?.Date_Prochain_Av)
                                                                        }
                                                                        className="bg-red-500 text-white hover:bg-red-600"
                                                                    >
                                                                        {sanctionsCount}
                                                                    </Button>
                                                                )}
                                                            </div>
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
                                                                            col2: e.target.value === '' ? 0 : Number(e.target.value),
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
                                                                            col3: e.target.value === '' ? 0 : Number(e.target.value),
                                                                        },
                                                                    }))
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        {selectedIds.length === 0 && (
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
                            ) : sanctionIndividuel.length === 0 ? (
                                <div className="text-muted-foreground py-4 text-center">Aucune sanction trouvée pour ce matricule.</div>
                            ) : (
                                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                    {sanctionIndividuel.length}
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
                                            {sanctionIndividuel.map((item) => (
                                                <tr key={item.ID} className="border-b bg-white hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        {item.D_Debut ? new Date(item.D_Debut).toLocaleDateString('fr-FR') : '-'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.D_Fin ? new Date(item.D_Fin).toLocaleDateString('fr-FR') : '-'}
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
