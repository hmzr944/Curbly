import LegalLayout from '@/Layouts/LegalLayout';

export default function Confidentialite() {
    return (
        <LegalLayout title="Politique de confidentialité" lastUpdated="18 mars 2026">
            <p>
                Margexa, édité par [PLACEHOLDER — Raison sociale], est responsable du traitement des données personnelles collectées via la plateforme <strong>Margexa.io</strong>.
                Nous nous engageons à protéger votre vie privée et à traiter vos données conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679) et à la loi Informatique et Libertés.
            </p>

            <h2>1. Données collectées et finalités</h2>

            <h3>1.1 Compte utilisateur</h3>
            <ul>
                <li><strong>Données :</strong> nom, prénom, adresse e-mail, mot de passe (haché)</li>
                <li><strong>Base légale :</strong> exécution du contrat (Art. 6.1.b RGPD)</li>
                <li><strong>Finalité :</strong> création et gestion de votre compte, authentification</li>
            </ul>

            <h3>1.2 Organisation et facturation</h3>
            <ul>
                <li><strong>Données :</strong> raison sociale, secteur d'activité, taille d'équipe, données de facturation (via Stripe)</li>
                <li><strong>Base légale :</strong> exécution du contrat (Art. 6.1.b) et obligation légale (Art. 6.1.c)</li>
                <li><strong>Finalité :</strong> gestion de l'abonnement, facturation, conformité fiscale</li>
            </ul>

            <h3>1.3 Données d'utilisation du service</h3>
            <ul>
                <li><strong>Données :</strong> dépenses IA, modèles utilisés, projets, scénarios de simulation, règles de contrôle</li>
                <li><strong>Base légale :</strong> exécution du contrat (Art. 6.1.b)</li>
                <li><strong>Finalité :</strong> fourniture des fonctionnalités de la plateforme Margexa</li>
            </ul>

            <h3>1.4 Audit public (sans compte)</h3>
            <ul>
                <li><strong>Données :</strong> e-mail professionnel, nom de l'entreprise, nom du contact, téléphone (optionnel), dépense IA estimée</li>
                <li><strong>Base légale :</strong> consentement (Art. 6.1.a RGPD)</li>
                <li><strong>Finalité :</strong> génération du rapport d'audit, suivi commercial éventuel</li>
                <li><strong>Durée :</strong> 90 jours, puis suppression automatique</li>
            </ul>

            <h3>1.5 Formulaire de contact</h3>
            <ul>
                <li><strong>Données :</strong> nom, e-mail, message, adresse IP (logs serveur), User-Agent</li>
                <li><strong>Base légale :</strong> intérêt légitime (Art. 6.1.f) — répondre aux demandes entrantes</li>
                <li><strong>Durée :</strong> 3 ans à compter de la dernière interaction</li>
            </ul>

            <h3>1.6 Logs techniques</h3>
            <ul>
                <li><strong>Données :</strong> adresses IP, User-Agent, horodatage des requêtes</li>
                <li><strong>Base légale :</strong> obligation légale et intérêt légitime (sécurité)</li>
                <li><strong>Durée :</strong> 12 mois</li>
            </ul>

            <h2>2. Sous-traitants et transferts de données</h2>
            <p>Pour fournir le service, nous faisons appel aux prestataires suivants :</p>
            <ul>
                <li>
                    <strong>Stripe Inc.</strong> (paiements) — États-Unis.
                    Transfert encadré par les Clauses Contractuelles Types (CCT) de la Commission européenne.
                    <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer"> Politique de confidentialité Stripe</a>.
                </li>
                <li>
                    <strong>OpenAI LLC</strong> — Traitement IA des simulations et audits.
                    Données anonymisées ou pseudonymisées avant transmission. CCT applicables.
                </li>
                <li>
                    <strong>Anthropic PBC</strong> — Traitement IA (modèles Claude). CCT applicables.
                </li>
                <li>
                    <strong>Google LLC</strong> — Traitement IA (modèles Gemini). CCT applicables.
                </li>
                <li>
                    <strong>Mistral AI SAS</strong> — Traitement IA (modèles Mistral), société française.
                </li>
                <li>
                    <strong>[PLACEHOLDER — Hébergeur]</strong> — Infrastructure et hébergement. [PLACEHOLDER — localisation des serveurs].
                </li>
            </ul>
            <p>
                Aucune donnée personnelle n'est vendue à des tiers.
            </p>

            <h2>3. Durées de conservation</h2>
            <ul>
                <li>Données de compte : durée de l'abonnement + 3 ans après résiliation</li>
                <li>Données de facturation : 10 ans (obligation légale)</li>
                <li>Audits publics : 90 jours</li>
                <li>Messages de contact : 3 ans</li>
                <li>Logs techniques : 12 mois</li>
            </ul>

            <h2>4. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
                <li><strong>Droit d'accès</strong> (Art. 15) — obtenir une copie de vos données</li>
                <li><strong>Droit de rectification</strong> (Art. 16) — corriger des données inexactes</li>
                <li><strong>Droit à l'effacement</strong> (Art. 17) — demander la suppression de vos données</li>
                <li><strong>Droit à la limitation</strong> (Art. 18) — restreindre le traitement</li>
                <li><strong>Droit à la portabilité</strong> (Art. 20) — recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition</strong> (Art. 21) — s'opposer au traitement fondé sur l'intérêt légitime</li>
                <li><strong>Droit de retirer le consentement</strong> (Art. 7.3) — à tout moment, sans rétroactivité</li>
            </ul>
            <p>
                Pour exercer ces droits, contactez-nous via notre <a href="/contact">formulaire de contact</a> ou à l'adresse e-mail : <a href="mailto:[PLACEHOLDER]">[PLACEHOLDER — dpo@Margexa.io ou email dédié]</a>.
                Nous répondrons dans un délai de 30 jours. En cas de réponse insatisfaisante, vous pouvez saisir la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>.
            </p>

            <h2 id="cookies">5. Cookies</h2>
            <p>Le site utilise les catégories de cookies suivantes :</p>
            <ul>
                <li>
                    <strong>Cookies strictement nécessaires :</strong> session Laravel (authentification, CSRF), préférences d'interface.
                    Ces cookies ne peuvent pas être refusés car ils sont indispensables au fonctionnement du service.
                </li>
                <li>
                    <strong>Cookies Stripe :</strong> nécessaires au traitement sécurisé des paiements lors du passage en caisse.
                </li>
            </ul>
            <p>
                Nous n'utilisons pas de cookies de tracking publicitaire ou d'analyse comportementale.
                Si cela venait à changer, un bandeau de consentement conforme sera mis en place.
            </p>

            <h2>6. Sécurité</h2>
            <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées : chiffrement HTTPS (TLS), hachage des mots de passe (bcrypt), cloisonnement des données par organisation, contrôles d'accès internes.
            </p>

            <h2>7. Modifications de la présente politique</h2>
            <p>
                Nous nous réservons le droit de modifier cette politique à tout moment. La date de dernière mise à jour figure en haut de cette page. En cas de modification substantielle, nous vous en informerons par e-mail ou via une notification dans l'application.
            </p>
        </LegalLayout>
    );
}
