import LegalLayout from '@/Layouts/LegalLayout';

export default function CGU() {
    return (
        <LegalLayout title="Conditions Générales d'Utilisation" lastUpdated="18 mars 2026">
            <p>
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Margexa, accessible à l'adresse <strong>Margexa.io</strong>, éditée par [PLACEHOLDER — Raison sociale].
            </p>
            <p>
                En créant un compte ou en accédant au service, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.
            </p>

            <h2>1. Description du service</h2>
            <p>
                Margexa est une plateforme SaaS B2B permettant aux équipes utilisant des API d'intelligence artificielle de piloter, simuler et optimiser leurs coûts et marges IA. Les fonctionnalités incluent notamment :
            </p>
            <ul>
                <li>Le suivi et l'analyse des dépenses liées aux appels API IA</li>
                <li>La simulation de scénarios de modèles et de pricing</li>
                <li>La génération de règles de contrôle et d'alertes de marge</li>
                <li>La réalisation d'audits de marge IA (y compris en accès public)</li>
            </ul>

            <h2>2. Accès au service</h2>
            <p>
                L'accès au service requiert la création d'un compte utilisateur associé à une organisation. Vous devez être une personne physique majeure agissant dans un cadre professionnel ou être un représentant légal de la personne morale souscriptrice.
            </p>
            <p>
                Vous êtes responsable de la confidentialité de vos identifiants et de toute activité effectuée depuis votre compte. Vous vous engagez à nous notifier immédiatement de toute utilisation non autorisée.
            </p>

            <h2>3. Obligations de l'utilisateur</h2>
            <p>En utilisant Margexa, vous vous engagez à :</p>
            <ul>
                <li>Fournir des informations exactes et à les maintenir à jour</li>
                <li>Utiliser le service conformément à sa destination et aux lois applicables</li>
                <li>Ne pas tenter de contourner les mécanismes de sécurité de la plateforme</li>
                <li>Ne pas scraper, reproduire ou redistribuer les données ou l'interface du service</li>
                <li>Ne pas utiliser le service à des fins illicites, frauduleuses ou préjudiciables à des tiers</li>
                <li>Respecter les droits de propriété intellectuelle de Margexa</li>
            </ul>

            <h2>4. Compte organisation et droits d'accès</h2>
            <p>
                L'abonnement est souscrit au niveau de l'organisation. Le titulaire du compte organisation est responsable du respect des présentes CGU par l'ensemble des utilisateurs rattachés à cette organisation.
            </p>

            <h2>5. Disponibilité du service</h2>
            <p>
                Margexa s'efforce d'assurer la disponibilité du service 24h/24, 7j/7. Cependant, des interruptions peuvent survenir pour des raisons de maintenance, de mise à jour ou d'événements indépendants de notre volonté.
                Nous nous engageons à communiquer sur les maintenances planifiées dans un délai raisonnable.
            </p>

            <h2>6. Propriété intellectuelle</h2>
            <p>
                La plateforme Margexa, son interface, ses algorithmes, ses rapports générés et l'ensemble de ses composants sont la propriété exclusive de [PLACEHOLDER — Raison sociale]. Aucune licence n'est accordée sur ces éléments au-delà du droit d'utilisation du service dans le cadre de votre abonnement.
            </p>
            <p>
                Les données que vous importez ou saisissez dans la plateforme restent votre propriété. Vous nous accordez une licence limitée pour les traiter aux seules fins d'exécution du service.
            </p>

            <h2>7. Limitation de responsabilité</h2>
            <p>
                Les simulations, audits et recommandations fournis par Margexa sont à caractère indicatif. Ils ne constituent pas un conseil financier, comptable ou juridique.
                Margexa ne saurait être tenu responsable des décisions prises sur la base des informations fournies par la plateforme.
            </p>
            <p>
                En tout état de cause, la responsabilité de Margexa ne saurait excéder le montant des sommes effectivement versées par l'utilisateur au cours des 12 derniers mois précédant le fait générateur.
            </p>

            <h2>8. Suspension et résiliation</h2>
            <p>
                Margexa se réserve le droit de suspendre ou résilier un compte en cas de violation des présentes CGU, de non-paiement ou de comportement frauduleux, sans préavis ni indemnité.
            </p>
            <p>
                L'utilisateur peut résilier son abonnement à tout moment depuis les paramètres de son compte. La résiliation prend effet à l'échéance de la période en cours.
            </p>

            <h2>9. Modifications des CGU</h2>
            <p>
                Margexa se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par e-mail des modifications substantielles au moins 30 jours avant leur entrée en vigueur. La poursuite de l'utilisation du service après ce délai vaut acceptation des nouvelles conditions.
            </p>

            <h2>10. Droit applicable et juridiction</h2>
            <p>
                Les présentes CGU sont soumises au droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux compétents du ressort de [PLACEHOLDER — siège social] seront seuls compétents.
            </p>

            <h2>11. Contact</h2>
            <p>
                Pour toute question relative aux présentes CGU, contactez-nous via notre <a href="/contact">formulaire de contact</a>.
            </p>
        </LegalLayout>
    );
}
