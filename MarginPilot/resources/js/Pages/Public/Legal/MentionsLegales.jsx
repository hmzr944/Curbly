import LegalLayout from '@/Layouts/LegalLayout';

export default function MentionsLegales() {
    return (
        <LegalLayout title="Mentions légales" lastUpdated="18 mars 2026">
            <h2>Éditeur du site</h2>
            <p>
                Le site <strong>Margexa.io</strong> est édité par :
            </p>
            <ul>
                <li><strong>Dénomination sociale :</strong> [PLACEHOLDER — Raison sociale]</li>
                <li><strong>Forme juridique :</strong> [PLACEHOLDER — SAS / SARL / etc.]</li>
                <li><strong>Capital social :</strong> [PLACEHOLDER — ex. 1 000 €]</li>
                <li><strong>Siège social :</strong> [PLACEHOLDER — adresse complète]</li>
                <li><strong>SIRET :</strong> [PLACEHOLDER — numéro SIRET]</li>
                <li><strong>N° TVA intracommunautaire :</strong> [PLACEHOLDER — FR…]</li>
                <li><strong>Directeur de la publication :</strong> [PLACEHOLDER — Nom Prénom]</li>
                <li><strong>Contact :</strong> <a href="/contact">formulaire de contact</a> ou <a href="mailto:[PLACEHOLDER]">[PLACEHOLDER — email]</a></li>
            </ul>

            <h2>Hébergement</h2>
            <p>
                Le site est hébergé par :
            </p>
            <ul>
                <li><strong>Hébergeur :</strong> [PLACEHOLDER — ex. OVH SAS / AWS / Hetzner]</li>
                <li><strong>Adresse :</strong> [PLACEHOLDER — adresse de l'hébergeur]</li>
                <li><strong>Site web :</strong> [PLACEHOLDER — URL de l'hébergeur]</li>
            </ul>

            <h2>Propriété intellectuelle</h2>
            <p>
                L'ensemble des éléments constituant le site Margexa (textes, graphismes, logiciels, photographies, images, sons, plans, noms, logos, marques, créations et œuvres protégeables diverses) sont la propriété exclusive de l'éditeur ou font l'objet d'une autorisation d'utilisation.
            </p>
            <p>
                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de l'éditeur.
            </p>

            <h2>Liens hypertextes</h2>
            <p>
                Le site peut contenir des liens vers des sites tiers. L'éditeur n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou leur disponibilité.
            </p>

            <h2>Limitation de responsabilité</h2>
            <p>
                L'éditeur s'efforce d'assurer au mieux l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, il ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition. L'éditeur se réserve le droit de corriger, à tout moment et sans préavis, le contenu de ce site.
            </p>

            <h2>Droit applicable</h2>
            <p>
                Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
            </p>

            <h2>Données personnelles</h2>
            <p>
                Pour toute information relative au traitement de vos données personnelles, veuillez consulter notre{' '}
                <a href="/legal/confidentialite">Politique de confidentialité</a>.
            </p>

            <h2>Cookies</h2>
            <p>
                Le site utilise des cookies techniques nécessaires à son fonctionnement. Pour plus d'informations, veuillez consulter notre{' '}
                <a href="/legal/confidentialite#cookies">Politique de confidentialité — section Cookies</a>.
            </p>

            <h2>Médiation</h2>
            <p>
                Conformément aux dispositions du Code de la consommation concernant le règlement amiable des litiges, Margexa s'engage à mettre en œuvre une procédure de médiation. Pour toute réclamation, contactez-nous en priorité via notre <a href="/contact">formulaire de contact</a>.
            </p>
        </LegalLayout>
    );
}
