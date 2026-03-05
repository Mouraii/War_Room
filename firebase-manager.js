// --- CONFIGURATION FIREBASE ---
// Remplacez ces valeurs par celles de votre console Firebase
const firebaseConfig = {

};

// Initialisation de Firebase (sera fait quand les scripts SDK sont chargés)
let db;
let auth;

function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.error("Firebase SDK non chargé.");
        return;
    }
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.database();
    auth = firebase.auth();
    
    // Authentification anonyme pour simplifier (permet d'écrire sans login complexe)
    auth.signInAnonymously().catch((error) => {
        console.error("Erreur Auth Firebase:", error);
    });
}

// --- FONCTIONS D'EXPORT ---

async function exportCrisisToFirebase(data) {
    if (!db) initFirebase();
    
    const crisisId = prompt("Donnez un nom unique pour cette sauvegarde (ex: session-mars-2026) :", "sauvegarde-" + Date.now());
    if (!crisisId) return;

    // Pause de la crise (si la fonction existe dans le contexte global)
    if (typeof pauseCrisisTimer === 'function') {
        pauseCrisisTimer(); 
    }

    const exportData = {
        metadata: {
            savedAt: new Date().toISOString(),
            user: "DoctoLibre Admin"
        },
        state: data // Contient journal, actions, status, etc.
    };

    try {
        await db.ref('crises/' + crisisId).set(exportData);
        alert(`✅ Crise sauvegardée avec succès sous l'ID : ${crisisId}`);
        return crisisId;
    } catch (error) {
        console.error("Erreur sauvegarde:", error);
        alert("❌ Erreur lors de la sauvegarde : " + error.message);
    }
}

// --- FONCTIONS D'IMPORT ---

async function importCrisisFromFirebase() {
    if (!db) initFirebase();

    const crisisId = prompt("Entrez l'ID de la sauvegarde à charger :");
    if (!crisisId) return;

    try {
        const snapshot = await db.ref('crises/' + crisisId).once('value');
        const data = snapshot.val();

        if (!data) {
            alert("⚠️ Aucune sauvegarde trouvée avec cet ID.");
            return null;
        }

        if (confirm(`Charger la sauvegarde du ${new Date(data.metadata.savedAt).toLocaleString()} ? \n⚠️ Cela écrasera les données actuelles.`)) {
            return data.state;
        }
    } catch (error) {
        console.error("Erreur chargement:", error);
        alert("❌ Erreur lors du chargement : " + error.message);
        return null;
    }
    return null;
}

// Exposer les fonctions globalement
window.initFirebase = initFirebase;
window.exportCrisisToFirebase = exportCrisisToFirebase;
window.importCrisisFromFirebase = importCrisisFromFirebase;
