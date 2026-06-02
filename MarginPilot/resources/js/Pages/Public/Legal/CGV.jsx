import LegalLayout from '@/Layouts/LegalLayout';

export default function CGV() {
    return (
        <LegalLayout title="Conditions Générales de Vente" lastUpdated="18 mars 2026">
            <p>
                Les présentes Conditions Générales de Vente (CGV) régissent les relations commerciales entre [PLACEHOLDER — Raison sociale], ci-après « Margexa », et tout professionnel souscrivant à un abonnement payant sur la plateforme <strong>Margexa.io</strong>.
            </p>
            <p>
                Les présentes CGV s'appliquent exclusivement aux relations B2B (entre professionnels). Elles prévalent sur toute autre condition générale de l'acheteur.
            </p>

            <h2>1. Offres et tarifs</h2>
            <p>
                Margexa propose plusieurs formules d'abonnement détaillées sur la page <a href="/pricing">Pricing</a>. Les prix sont exprimés en euros hors taxes (HT). La TVA applicable est celle en vigueur au jour de la facturation.
            </p>
            <p>
                Margexa se réserve le droit de modifier ses tarifs à tout moment. Les abonnements en cours ne sont pas affectés par une modification tarifaire jusqu'au prochain renouvellement, sous réserve d'un préavis de 30 jours.
            </p>

            <h2>2. Souscription et formation du contrat</h2>
            <p>
                La souscription s'effectue en ligne via la plateforme. Le contrat est formé à la réception de la confirmation de paiement par Stripe et de l'e-mail de confirmation d'abonnement envoyé par Margexa.
            </p>
            <p>
                L'accès aux fonctionnalités payantes est activé immédiatement après la validation du paiement.
            </p>

            <h2>3. Facturation et paiement</h2>
            <p>
                Les abonnements sont facturés selon la périodicité choisie (mensuelle ou annuelle) par prélèvement automatique via <strong>Stripe</strong>. La facturation est effectuée en début de période.
            </p>
            <p>
                En cas d'échec de paiement, Margexa se réserve le droit de suspendre l'accès au service après notification et un délai de grâce de 7 jours.
            </p>
            <p>
                Les factures sont disponibles dans l'espace client et accessibles via le portail Stripe.
            </p>

            <h2>4. Droit de rétractation</h2>
            <p>
                Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contrats de fourniture d'un service numérique dont l'exécution a commencé avec l'accord du professionnel avant l'expiration du délai de rétractation.
            </p>
            <p>
                En tant que service B2B avec accès immédiat activé dès la souscription, <strong>aucun droit de rétractation n'est applicable</strong>. Nous vous encourageons à utiliser la période d'essai gratuite disponible avant tout engagement payant.
            </p>

            <h2>5. Résiliation</h2>
            <p>
                L'abonnement peut être résilié à tout moment depuis le portail de gestion disponible dans les paramètres du compte (« Gérer mon abonnement »). La résiliation prend effet à la fin de la période de facturation en cours — aucun remboursement au prorata n'est effectué pour la période restante.
            </p>
            <p>
                En cas de résiliation, les données de l'organisation sont conservées 30 jours puis supprimées, conformément à notre <a href="/legal/confidentialite">Politique de confidentialité</a>.
            </p>

            <h2>6. Offres sur mesure (Enterprise)</h2>
            <p>
                Les offres Enterprise font l'objet d'un devis et d'un contrat spécifique. Pour toute demande, contactez-nous via le <a href="/contact">formulaire de contact</a>. Les présentes CGV s'appliquent à titre subsidiaire en l'absence de stipulations contraires dans le contrat spécifique.
            </p>

            <h2>7. Garanties et niveaux de service</h2>
            <p>
                Margexa s'engage à déployer des efforts raisonnables pour assurer la disponibilité du service. Les engagements de niveau de service (SLA) spécifiques font l'objet de clauses dédiées dans les contrats Enterprise.
            </p>
            <p>
                Pour les abonnements standards, aucun SLA contractuel n'est garanti. Margexa s'engage néanmoins à traiter les incidents dans les meilleurs délais.
            </p>

            <h2>8. Responsabilité</h2>
            <p>
                La responsabilité de Margexa au titre des présentes CGV est limitée aux dommages directs et ne saurait excéder le montant des sommes versées par le client au cours des 12 derniers mois. Margexa ne saurait être tenu responsable des dommages indirects, notamment perte de chiffre d'affaires, perte de données ou perte d'opportunité.
            </p>

            <h2>9. Force majeure</h2>
            <p>
                Margexa ne sera pas tenu responsable de tout retard ou inexécution résultant d'un cas de force majeure au sens de l'article 1218 du Code civil.
            </p>

            <h2>10. Loi applicable et litiges</h2>
            <p>
                Les présentes CGV sont soumises au droit français. En cas de litige, les parties s'engagent à chercher une solution amiable dans un délai de 30 jours. À défaut, les tribunaux compétents du ressort de [PLACEHOLDER — siège social] seront seuls compétents.
            </p>

            <h2>11. Contact</h2>
            <p>
                Pour toute question relative aux présentes CGV ou à votre abonnement, contactez-nous via notre <a href="/contact">formulaire de contact</a>.
            </p>
        </LegalLayout>
    );
}
