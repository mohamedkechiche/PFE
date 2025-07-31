import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Document, Page, pdf, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useState } from 'react';
interface Decision {
    id: number;
    Mle: string;
    NomPrenom: string;
    Qualification?: string | null;
    objet?: string | null;
    date: string;
    Trh?: string | null;
    Tav?: string | null;
    created_at?: string;
    updated_at?: string;
}
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
interface Avancement {
    id: number;
    Mle: string;
    NomPrenom: string;
    date: Date | string | null;
    Qualification?: string | null;
    Observation?: string | null;
}

export default function DecisionCreate({ lastDecisions = {} }: { lastDecisions: Record<string, Decision> }) {
    const { props } = usePage();
    let dateEffet = props.date_effet as string;
    // Forcer le jour à 01 si dateEffet existe et est au format AAAA-MM ou AAAA-MM-JJ
    if (dateEffet) {
        const [year, month] = dateEffet.split('-');
        dateEffet = `${year}-${month}-01`;
    }

    // Initialiser formData avec les dernières décisions
    const avancements = (props.avancements as Avancement[]) || [];
    const initialFormData = avancements.reduce((acc, a) => {
        const last = lastDecisions[a.Mle];
        if (last) {
            acc[a.id] = {
                objet: last.objet || '',
                trh: last.Trh || '',
                tav: last.Tav || '',
            };
        }
        return acc;
    }, {} as { [id: number]: { objet: string; trh: string; tav: string } });

    const [formData, setFormData] = useState<{ [id: number]: { objet: string; trh: string; tav: string } }>(initialFormData);

    const avNormaux = avancements.filter((a) => !a.Observation || !a.Observation.includes('57'));
    const av57 = avancements.filter((a) => a.Observation && a.Observation.includes('57'));

    const handleChange = (id: number, field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    };

    const styles = StyleSheet.create({
        page: { padding: 40, fontSize: 12, fontFamily: 'Times-Roman' },
        title: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', marginVertical: 20 },
        objet: { textAlign: 'left', marginBottom: 10, textDecoration: 'underline', fontWeight: 'bold' },
        section: { marginBottom: 10, textAlign: 'justify' },
        section1: { marginBottom: 10, textAlign: 'center', textDecoration: 'underline', fontWeight: 'bold' },
        article: { marginVertical: 10, fontWeight: 'bold', textTransform: 'uppercase' },
        signature: { marginTop: 40, textAlign: 'right' },
    });

    // Tableau de situation:
    const PDFSituationTable = (personnel: TableauAvancement) => (
        <View style={{ marginVertical: 10, borderWidth: 1, borderColor: '#ccc' }}>
            <View style={{ flexDirection: 'row', backgroundColor: '#eee', alignItems: 'center' }}>
                <Text style={{ flex: 3.2, padding: 3, fontSize: 8, textAlign: 'center', lineHeight: 1.2 }}>ANCIENNE SITUATION</Text>
                <Text style={{ flex: 3.2, padding: 3, fontSize: 8, textAlign: 'center', lineHeight: 1.2 }}>NOUVELLE SITUATION</Text>
            </View>

            <View style={{ flexDirection: 'row', backgroundColor: '#f7f7f7', alignItems: 'center' }}>
                <Text style={{ flex: 0.53, padding: 2, fontSize: 8, borderLeftWidth: 1, borderColor: '#ccc', textAlign: 'center' }}>Cat.</Text>
                <Text style={{ flex: 0.53, padding: 2, fontSize: 8, textAlign: 'center' }}>S.Cat</Text>
                <Text style={{ flex: 0.53, padding: 2, fontSize: 8, textAlign: 'center' }}>Ech.</Text>
                <Text style={{ flex: 0.7, padding: 2, fontSize: 8, textAlign: 'center' }}>SBase/TH</Text>
                <Text style={{ flex: 0.7, padding: 2, fontSize: 8, textAlign: 'center' }}>Ind.</Text>
                <Text style={{ flex: 0.7, padding: 2, fontSize: 8, textAlign: 'center' }}>Effet</Text>
                <Text style={{ flex: 0.53, padding: 2, fontSize: 8, borderLeftWidth: 1, borderColor: '#ccc', textAlign: 'center' }}>Cat.</Text>
                <Text style={{ flex: 0.53, padding: 2, fontSize: 8, textAlign: 'center' }}>S.Cat</Text>
                <Text style={{ flex: 0.53, padding: 2, fontSize: 8, textAlign: 'center' }}>Ech.</Text>
                <Text style={{ flex: 0.7, padding: 2, fontSize: 8, textAlign: 'center' }}>SBase/TH</Text>
                <Text style={{ flex: 0.7, padding: 2, fontSize: 8, textAlign: 'center' }}>Ind.</Text>
                <Text style={{ flex: 0.7, padding: 2, fontSize: 8, textAlign: 'center' }}>Effet</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ flex: 0.53, padding: 2, fontSize: 8, borderLeftWidth: 1, borderColor: '#ccc', textAlign: 'center', lineHeight: 1.2 }}>
                    {personnel.Categorie || '-'}
                </Text>
                <Text style={{ flex: 0.53, padding: 2, fontSize: 8, textAlign: 'center', lineHeight: 1.2 }}>{personnel.Sous_Categorie || '-'}</Text>
                <Text style={{ flex: 0.53, padding: 2, fontSize: 8, textAlign: 'center', lineHeight: 1.2 }}>{personnel.Echellon || '-'}</Text>
                <Text style={{ flex: 0.7, padding: 2, fontSize: 8, textAlign: 'center', lineHeight: 1.2 }}>
                    {personnel.TH ?? personnel.SBase ?? '-'}
                </Text>
                <Text style={{ flex: 0.7, padding: 2, fontSize: 8, textAlign: 'center', lineHeight: 1.2 }}>{personnel.Ind_differentiel ?? '-'}</Text>
                <Text style={{ flex: 0.7, padding: 2, fontSize: 8, textAlign: 'center', lineHeight: 1.2 }}>
                    {personnel.Date_effet ? new Date(personnel.Date_effet).toLocaleDateString('fr-FR') : '-'}
                </Text>

                <Text style={{ flex: 0.53, padding: 2, fontSize: 8, borderLeftWidth: 1, borderColor: '#ccc', textAlign: 'center', lineHeight: 1.2 }}>
                    {personnel.NCategorie || '-'}
                </Text>
                <Text style={{ flex: 0.53, padding: 2, fontSize: 8, textAlign: 'center', lineHeight: 1.2 }}>{personnel.NSous_Categorie || '-'}</Text>
                <Text style={{ flex: 0.53, padding: 2, fontSize: 8, textAlign: 'center', lineHeight: 1.2 }}>{personnel.NEchellon || '-'}</Text>
                <Text style={{ flex: 0.7, padding: 2, fontSize: 8, textAlign: 'center', lineHeight: 1.2 }}>
                    {personnel.NTH ?? personnel.NSBase ?? '-'}
                </Text>
                <Text style={{ flex: 0.7, padding: 2, fontSize: 8, textAlign: 'center', lineHeight: 1.2 }}>{personnel.NInd_differentiel ?? '-'}</Text>
                <Text style={{ flex: 0.7, padding: 2, fontSize: 8, textAlign: 'center', lineHeight: 1.2 }}>
                    {personnel.NDate_effet ? new Date(personnel.NDate_effet).toLocaleDateString('fr-FR') : '-'}
                </Text>
            </View>
        </View>
    );

    // Modifiez la fonction generatePDFPage pour inclure le tableau
    const generatePDFPage = (a: TableauAvancement, data: any) => (
        <Page key={a.id} size="A4" style={styles.page}>
            <Text>
                Ref : {' '.repeat(30)} M’saken, le {'____/____/____'}
            </Text>
            <Text style={styles.title}>DÉCISION</Text>
            <Text style={styles.objet}>
                Objet : <Text style={styles.section}>{data.objet}</Text>
            </Text>
            <Text style={styles.section1}>Le Directeur Général de la S.T.I.P ;</Text>
            <Text style={styles.section}>{data.tav}</Text>
            <Text style={styles.section}>{data.trh}</Text>

            <Text style={styles.section1}>DÉCIDE</Text>
            <Text style={styles.section}>
                ARTICLE PREMIER : Monsieur {a.NomPrenom} Mle {a.Mle}
            </Text>
            <Text style={styles.section}> Garde ou fonction:{a.Qualification || '_________________'} </Text>
            <Text style={styles.section}> bénéficie d’un avancement réglementaire d’échelon </Text>
            <Text style={styles.section}> conformément au tableau ci-dessous indiqué :</Text>
            {/* Ajout du tableau */}
            {PDFSituationTable(a)}
            <Text style={styles.section}>
                ARTICLE DEUX : La présente décision annule et remplace toute autre décision antérieure relative au même objet.
            </Text>
            <Text style={styles.signature}>LE DIRECTEUR GÉNÉRAL{'\n'}Khemis BABA</Text>
        </Page>
    );

    const handleGeneratePDF = async (a: Avancement) => {
        const data = formData[a.id] || {};
        const PDFDocument = <Document>{generatePDFPage(a, data)}</Document>;
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

    const handleGenerateAllPDFs = async () => {
        const allAvancements = [...avNormaux, ...av57];
        const PDFDocument = <Document>{allAvancements.map((a) => generatePDFPage(a, formData[a.id] || {}))}</Document>;

        const blob = await pdf(PDFDocument).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Decisions_${dateEffet}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Validation function
    const validateFields = (data: { objet?: string; trh?: string; tav?: string }) => {
        return data.objet && data.trh && data.tav;
    };

    // Modifiez handleSave pour ajouter la validation
    const handleSave = async (a: Avancement) => {
        const data = formData[a.id] || {};
        const errors = {
            objet: !data.objet,
            trh: !data.trh,
            tav: !data.tav,
        };
        setFieldErrors((prev) => ({ ...prev, [a.id]: errors }));

        if (errors.objet || errors.trh || errors.tav) {
            setToastMessage("Veuillez remplir tous les champs (Objet, Trh, Tav) avant d'enregistrer.");
            setToastType('error');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        const payload = {
            idav: a.id,
            Mle: a.Mle,
            NomPrenom: a.NomPrenom,
            date: dateEffet,
            Qualification: a.Qualification,
            objet: data.objet || '',
            Trh: data.trh || '',
            Tav: data.tav || '',
        };

        // Vérifier si une décision existe déjà pour ce Mle
        const last = lastDecisions[a.Mle];
        if (last) {
            // Update
            router.put(`/decision/${last.id}`, payload, {
                onSuccess: () => {
                    setToastMessage('Mise à jour réussie.');
                    setToastType('success');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                },
                onError: () => {
                    setToastMessage("Erreur lors de la mise à jour.");
                    setToastType('error');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                },
            });
        } else {
            // Create
            router.post('/decision', payload, {
                onSuccess: () => {
                    setToastMessage('Enregistrement réussi.');
                    setToastType('success');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                },
                onError: () => {
                    setToastMessage("Erreur lors de l'enregistrement.");
                    setToastType('error');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                },
            });
        }
    };

    // Modifiez handleSaveAll pour stopper si un champ est vide
    const handleSaveAll = async () => {
        const allAvancements = [...avNormaux, ...av57];
        let hasError = false;
        let newFieldErrors: { [id: number]: { objet?: boolean; trh?: boolean; tav?: boolean } } = {};

        for (const a of allAvancements) {
            const data = formData[a.id] || {};
            const errors = {
                objet: !data.objet,
                trh: !data.trh,
                tav: !data.tav,
            };
            newFieldErrors[a.id] = errors;
            if (errors.objet || errors.trh || errors.tav) {
                hasError = true;
            }
        }

        setFieldErrors((prev) => ({ ...prev, ...newFieldErrors }));

        if (hasError) {
            // Ne pas continuer si erreur
            return;
        }

        for (const a of allAvancements) {
            await handleSave(a);
        }
        setToastMessage('Tous les avancements ont été enregistrés avec succès.');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Ajoutez cet état pour les erreurs de champs
    const [fieldErrors, setFieldErrors] = useState<{ [id: number]: { objet?: boolean; trh?: boolean; tav?: boolean } }>({});

    // Modifiez renderAvancementForm pour afficher les erreurs sous chaque champ
    const renderAvancementForm = (a: Avancement, type: string) => (
        <li key={a.id} className="mb-4 flex flex-col gap-2 rounded border bg-gray-50 p-4">
            <div className="flex flex-wrap items-center gap-4">
                <span>
                    <b>{a.NomPrenom}</b> (Mle: {a.Mle}){' '}
                    <span className={type === '57' ? 'text-blue-600' : 'text-green-600'}>({type === '57' ? '57 ans' : 'Normal'})</span>
                </span>
                <span>
                    Qualification: <b>{a.Qualification || '-'}</b>
                </span>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium">Objet</label>
                    {/* <input type='hidden' name='id' value={id} /> */}
                    <input
                        type="text"
                        className={`w-full rounded border px-2 py-1 ${fieldErrors[a.id]?.objet ? 'border-red-500' : ''}`}
                        value={formData[a.id]?.objet || ''}
                        onChange={(e) => {
                            handleChange(a.id, 'objet', e.target.value);
                            setFieldErrors((prev) => ({
                                ...prev,
                                [a.id]: { ...prev[a.id], objet: false },
                            }));
                        }}
                        placeholder="Objet de la décision"
                    />
                    {fieldErrors[a.id]?.objet && <span className="text-xs text-red-600">Ce champ est requis.</span>}
                </div>
                <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium">Trh</label>
                    <textarea
                        className={`w-full rounded border px-2 py-1 ${fieldErrors[a.id]?.trh ? 'border-red-500' : ''}`}
                        value={formData[a.id]?.trh || ''}
                        onChange={(e) => {
                            handleChange(a.id, 'trh', e.target.value);
                            setFieldErrors((prev) => ({
                                ...prev,
                                [a.id]: { ...prev[a.id], trh: false },
                            }));
                        }}
                        placeholder="Texte RH"
                        rows={2}
                    />
                    {fieldErrors[a.id]?.trh && <span className="text-xs text-red-600">Ce champ est requis.</span>}
                </div>
                <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium">Tav</label>
                    <textarea
                        className={`w-full rounded border px-2 py-1 ${fieldErrors[a.id]?.tav ? 'border-red-500' : ''}`}
                        value={formData[a.id]?.tav || ''}
                        onChange={(e) => {
                            handleChange(a.id, 'tav', e.target.value);
                            setFieldErrors((prev) => ({
                                ...prev,
                                [a.id]: { ...prev[a.id], tav: false },
                            }));
                        }}
                        placeholder="Texte AV"
                        rows={2}
                    />
                    {fieldErrors[a.id]?.tav && <span className="text-xs text-red-600">Ce champ est requis.</span>}
                </div>
            </div>
            <div className="mt-2 flex justify-end">
                <button className="mr-2 rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700" type="button" onClick={() => handleSave(a)}>
                    Enregistrer
                </button>
                <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" onClick={() => handleGeneratePDF(a)} type="button">
                    Générer le modèle PDF
                </button>
            </div>
        </li>
    );

    return (
        <AppLayout>
            <Head title="Décisions" />
            {/* Toast d'enregistrement */}
            {showToast && (
                <div
                    className={`animate-fade-in fixed top-6 right-6 z-50 rounded px-4 py-2 text-white shadow-lg ${
                        toastType === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}
                >
                    {toastMessage}
                </div>
            )}
            <div className="from-background to-muted/20 flex h-full flex-1 flex-col gap-6 rounded-xl bg-gradient-to-br p-6">
                {/* Bouton retour vers Historique */}
                <div className="mb-2">
                    <Link
                        href="/historique"
                        className="inline-flex items-center rounded bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300"
                    >
                        ← Retour à l'historique
                    </Link>
                </div>
                <h1 className="mb-4 text-2xl font-bold">Modèles de Décision à remplir - {dateEffet}</h1>
                <div className="mb-4 flex flex-wrap justify-end gap-2">
                    <button className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700" onClick={handleGenerateAllPDFs} type="button">
                        Générer tous les PDF
                    </button>
                    <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" onClick={handleSaveAll} type="button">
                        Enregistrer tous
                    </button>
                </div>
                <ul className="space-y-4">
                    {avNormaux.map((a) => renderAvancementForm(a, 'normal'))}
                    {av57.map((a) => renderAvancementForm(a, '57'))}
                    {avNormaux.length + av57.length === 0 && <li className="text-gray-500">Aucun avancement pour ce mois.</li>}
                </ul>
            </div>
        </AppLayout>
    );
}
