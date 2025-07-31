import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Link } from '@radix-ui/react-navigation-menu';
import { CheckCircle2, Download, Plus, Trash2, XCircle, FilePlus } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';

import * as XLSX from 'xlsx';
import { Document, Page, pdf, StyleSheet, Text, View, PDFViewer } from '@react-pdf/renderer';



// Adapter l'interface
interface decisionsByMonth {
    month: string; // ex: '2024-06'
    total: number;
}

interface Props {
    decisions: {
        data: Decision[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    decisionsByMonth: {
        data: decisionsByMonth[];
    };
    filters: {
        search: string;
        filter: string;
        pages: string;
        annee: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Décision',
        href: '/decision',
    },
];

const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 12, fontFamily: 'Times-Roman' },
    title: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', marginVertical: 20 },
    objet: { textAlign: 'left', marginBottom: 10, textDecoration: 'underline', fontWeight: 'bold' },
    section: { marginBottom: 10, textAlign: 'justify' },
    section1: { marginBottom: 10, textAlign: 'center', textDecoration: 'underline', fontWeight: 'bold' },
    article: { marginVertical: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    signature: { marginTop: 40, textAlign: 'right' },
});

export default function AvancementIndex({ decisions, decisionsByMonth, filters, flash }: Props) {
    console.log('tableauavancements', decisions.data);
    const [isOpen, setIsOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [confirmDeleteDate, setConfirmDeleteDate] = useState<Date | string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [selectedDateEffet, setSelectedDateEffet] = useState<Date | null>(null);
    const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false);
    const [selectedMonthAvancements, setSelectedMonthAvancements] = useState<Decision[]>([]);
    const [selectedPDF, setSelectedPDF] = useState<Decision | null>(null);
    const [showAllPDFs, setShowAllPDFs] = useState(false);
    const pdfPreviewRef = useRef<HTMLDivElement>(null);
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
    const filteredDetails = decisions.data.filter(
        (item) =>
            item.date &&
            selectedDateEffet &&
            new Date(item.date).getFullYear() === new Date(selectedDateEffet).getFullYear() &&
            new Date(item.date).getMonth() === new Date(selectedDateEffet).getMonth(),
    );

    const generatePDFPage = (a: Decision) => (
        <Page key={a.id} size="A4" style={styles.page}>
            <Text>
                Ref : {' '.repeat(30)} M’saken, le {'____/____/____'}
            </Text>
            <Text style={styles.title}>DÉCISION</Text>
            <Text style={styles.objet}>
                Objet : <Text style={styles.section}>{a.objet || ''}</Text>
            </Text>
            <Text style={styles.section1}>Le Directeur Général de la S.T.I.P ;</Text>
            <Text style={styles.section}>{a.Tav || ''}</Text>
            <Text style={styles.section}>{a.Trh || ''}</Text>
            <Text style={styles.section1}>DÉCIDE</Text>
            <Text style={styles.section}>
                ARTICLE PREMIER : Monsieur {a.NomPrenom} Mle {a.Mle}
            </Text>
            <Text style={styles.section}>Qualification: {a.Qualification || '_________________'}</Text>
            <Text style={styles.section}>Bénéficie d’un avancement réglementaire d’échelon.</Text>
            <Text style={styles.section}>
                ARTICLE DEUX : La présente décision annule et remplace toute autre décision antérieure relative au même objet.
            </Text>
            <Text style={styles.signature}>LE DIRECTEUR GÉNÉRAL{'\n'}Khemis BABA</Text>
        </Page>
    );

    const handleGeneratePDF = async (a: Decision) => {
        const PDFDocument = <Document>{generatePDFPage(a)}</Document>;
        const blob = await pdf(PDFDocument).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Decision_${a.Mle}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                    {decisionsByMonth.data.length > 0 ? (
                        decisionsByMonth.data.map((list, index) => {
                            // Filtrer les personnels pour ce mois
                            const personnelsForMonth = decisions.data.filter(
                                (item) =>
                                    item.date &&
                                    item.date.slice(0, 7) === list.month // compare 'YYYY-MM'
                            );

                            return (
                                <Card
                                    key={index}
                                    className="hover:bg-accent/50 cursor-pointer transition-colors"
                                    onClick={() => {
                                        setSelectedDateEffet(list.month + '-01');
                                        setSelectedMonthAvancements(personnelsForMonth);
                                        setIsDecisionDialogOpen(true);
                                    }}
                                >
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-lg font-medium">
                                            {/* Afficher le mois en français */}
                                            {new Date(list.month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            {/* Actions éventuelles */}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                {list.total} personnel{list.total > 1 ? 's' : ''} pour ce mois
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="text-muted-foreground col-span-full text-center">Aucune donnée trouvée.</div>
                    )}
                </div>

                {/* Supprime le Dialog de création de décision et remplace-le par ce bloc juste après la grid des cards */}
                {selectedDateEffet && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">
                            PDFs des décisions pour le mois :{' '}
                            <b>{new Date(selectedDateEffet).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</b>
                        </h2>
                        <div className="flex gap-4 mb-4">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowAllPDFs(true);
                                    setSelectedPDF(null);
                                    setTimeout(() => {
                                        pdfPreviewRef.current?.scrollIntoView({ behavior: 'smooth' });
                                    }, 100);
                                }}
                                disabled={selectedMonthAvancements.length === 0}
                            >
                                Voir tous les PDFs
                            </Button>
                            {showAllPDFs && (
                                <Button variant="outline" onClick={() => setShowAllPDFs(false)}>
                                    Fermer l’aperçu de tous les PDFs
                                </Button>
                            )}
                        </div>
                        <ul className="space-y-4">
                            {selectedMonthAvancements.length === 0 && <li>Aucun avancement pour ce mois.</li>}
                            {selectedMonthAvancements.map((a) => (
                                <li key={a.id} className="flex flex-col gap-2 border rounded p-2">
                                    <div>
                                        <b>{a.NomPrenom}</b> (Mle: {a.Mle}) - {a.Qualification}
                                    </div>
                                    <button
                                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 w-fit"
                                        onClick={() => {
                                            setShowAllPDFs(false);
                                            setSelectedPDF(null);
                                            setTimeout(() => {
                                                setSelectedPDF(a);
                                                pdfPreviewRef.current?.scrollIntoView({ behavior: 'smooth' });
                                            }, 100);
                                        }}
                                        type="button"
                                    >
                                        Voir le PDF
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {/* Preview PDF */}
                        <div ref={pdfPreviewRef} />

                        {selectedPDF && !showAllPDFs && (
                            <div className="flex flex-col items-end">
                                <Button variant="outline" onClick={() => setSelectedPDF(null)}>Fermer l’aperçu PDF</Button>
                                <div className="my-4 w-full h-[80vh]">
                                    <PDFViewer
                                        key={selectedPDF.id}
                                        width="100%"
                                        height="100%"
                                    >
                                        <Document>
                                            {generatePDFPage(selectedPDF)}
                                        </Document>
                                    </PDFViewer>
                                </div>
                            </div>
                        )}

                        {showAllPDFs && (
                            <div className="flex flex-col items-end">
                                <div className="my-4 w-full h-[80vh]">
                                    <PDFViewer
                                        key={selectedDateEffet?.toString() + '-all'}
                                        width="100%"
                                        height="100%"
                                    >
                                        <Document>
                                            {selectedMonthAvancements.map(a => generatePDFPage(a))}
                                        </Document>
                                    </PDFViewer>
                                </div>
                            </div>
                        )}
                    </div>
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
            </div>
        </AppLayout>
    );
}
